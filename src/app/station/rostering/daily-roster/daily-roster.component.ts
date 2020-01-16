import { Component, OnInit, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import * as momentzone from 'moment-timezone';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ToastrService, GlobalConfig } from 'ngx-toastr';
import { AuthService, AppService } from '../../../service/app.service'
import { AppUrl } from "../../../service/app.url-service";
import { ApiService } from "../../../service/app.api-service";
import { MatDialog } from "@angular/material";
import { ToastComponent } from "../../../toast/toast.component";

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD MMM YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-daily-roster',
  templateUrl: './daily-roster.component.html',
  styleUrls: ['./daily-roster.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})

export class DailyRosterComponent implements OnInit {

  currentdate: any;
  st = 0;
  todaydate: any = momentzone().tz(this.auth.user.airport.timezone).startOf('day').format("DD MMM YY").toString();
  mindate: any = momentzone().tz(this.auth.user.airport.timezone).startOf('day').format('YYYY-MM-DD').toString();
  filter = {
    from: momentzone().tz(this.auth.user.airport.timezone).startOf('day'),
    to: momentzone().tz(this.auth.user.airport.timezone).endOf('day')
  };
  roster: any = {};
  employees = [];
  designations = [];
  currentStation: any;
  zoneOffset: any;
  shifts: any[] = [];
  shiftsId: any[] = [];
  shiftsAlias: any[] = [];
  shiftsByDesign: any[] = [];
  viewTemplate: boolean = false;
  NAShifts: any = [];
  toasterOptions: GlobalConfig;
  buttonDisabled = false;
  date: any;
  fromDate: any;
  disableLeftScroll: boolean;
  disableRightScroll: boolean;

  @ViewChild('widgetsContent', { read: ElementRef }) public widgetsContent: ElementRef<any>;
  noData: boolean;

  constructor(private _changeDetectionRef: ChangeDetectorRef, private services: ApiService, private appService: AppService, private AppUrl: AppUrl, private toastr: ToastrService, private dialog: MatDialog, private auth: AuthService) {
    // current station id, station code, location
    this.currentStation = { "id": this.auth.user.userAirportMappingList[0].id, "code": this.auth.user.userAirportMappingList[0].code }
    this.zoneOffset = this.auth.timeZone;
    this.toasterOptions = this.toastr.toastrConfig;
    this.date = this.mindate;
    this.fromDate = (this.filter.from).format('YYYY-MM-DD').toString();
    this.disableLeftScroll = false;
    this.disableRightScroll = false;
  }


  ngAfterViewChecked(): void {
    if (this.widgetsContent.nativeElement.scrollLeft === 0) {
      this.disableLeftScroll = true;
    }
    else {
      this.disableLeftScroll = false;
    }
    if (this.widgetsContent.nativeElement.offsetWidth === this.widgetsContent.nativeElement.scrollWidth - this.widgetsContent.nativeElement.scrollLeft) {
      this.disableRightScroll = true;
    }
    else {
      this.disableRightScroll = false;
    }
    this._changeDetectionRef.detectChanges();
  }

  ngOnInit() {
    this.noData = false;
    this.currentdate = this.todaydate;
    this.getShifts();
    this.getRosterView();
    this.appService.search.next('FILTER');
    if (this.mindate === (this.filter.from).format('YYYY-MM-DD').toString()) {
      this.buttonDisabled = false;
    } else {
      this.buttonDisabled = true;
    }
  }

  ngOnDestroy() {
    this.appService.search.next(' ');
  }

  // Each shift roster div scrolling to left 
  leftScroll() {
    this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft - 350), behavior: 'smooth' });
  }
  // Each shift roster div scrolling to right
  rightScroll() {
    this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft + 350), behavior: 'smooth' });
  }

  // function to drag user to particular shift and post call for roster create
  onItemDrop(e: any, shiftdeatils, id) {
    let staffname = e.dragData.name;
    let tem = e.dragData.dates[0].shift
    let roster = {
      overwrite: true,
      station: this.roster.station,
      dateFrom: this.roster.dateFrom,
      dateTo: this.roster.dateTo,
      shifts: []
    };
    if (e.dragData.dates[0].shift_id !== shiftdeatils.id) {
      for (let i = 0; i < this.shiftsByDesign.length; i++) {
        let empdetails = this.shiftsByDesign[i].employees;
        for (let index = 0; index < empdetails.length; index++) {
          let element = empdetails[index];
          if (e.dragData.designation == element.designation && e.dragData.user_id == element.user_id) {
            e.dragData.dates[0].start_time = shiftdeatils.start_time;
            e.dragData.dates[0].end_time = shiftdeatils.end_time;
            e.dragData.dates[0].shift = shiftdeatils.alias;
            e.dragData.dates[0].shift_id = shiftdeatils.id;
            // e.dragData.dates[0].active = 'Y';
            element = e.dragData;
            this.counterfunction(this.shifts, element.dates[0].shift, tem)
            this.counterfunction(this.NAShifts, element.dates[0].shift, tem)
          }
        }
        roster.shifts = roster.shifts.concat(this.shiftsByDesign[i].employees);
      }
      this.services.create(this.AppUrl.geturlfunction('ROSTER_CREATE'), { data: roster }).subscribe(res => {
        if (!res.status) {
          this.appService.toast('', 'Error occurred', 'error', 'error-mode');
          return;
        }
        this.appService.toast('', staffname + ' is succesfully assigned to the ' + shiftdeatils.name + ' shift', 'success', 'success-mode');

      }, error => {

      });
    }

  }

  // GET API for roster view with from and to date 
  getRosterView() {
    let url = this.AppUrl.geturlfunction('GET_ROSTER_VIEW') + 'fromDate=' + momentzone(this.filter.from).format("DD-MM-YYYY").toString() + '&toDate=' + momentzone(this.filter.to).format("DD-MM-YYYY").toString() + '&station=' + this.currentStation.code + '&userRole=' + this.auth.user.userRoleMasterList[0].id;
    this.services.getAll(url).subscribe(res => {
      this.roster = res.datass;
      this.setTemplate()
    }, error => {
      console.log("error")
    });
  }
  cdateValidate: boolean = false;

  // function for selecting date in footer  
  daterange(date, value) {
    if (value == 'to') {
      this.filter.from = momentzone(date).tz(this.auth.user.airport.timezone).startOf('day').add(1, 'days');
      this.filter.to = momentzone(date).tz(this.auth.user.airport.timezone).endOf('day').add(1, 'days');
    }
    if (value == 'from') {
      this.filter.from = momentzone(date.value).tz(this.auth.user.airport.timezone).startOf('day');
      this.filter.to = momentzone(date.value).tz(this.auth.user.airport.timezone).endOf('day');
    }
    if (value == 'oldstate') {
      this.filter.from = momentzone(date).tz(this.auth.user.airport.timezone).startOf('day').subtract(1, 'days');
      this.filter.to = momentzone(date).tz(this.auth.user.airport.timezone).endOf('day').subtract(1, 'days');
    }
    this.currentdate = momentzone(this.filter.from).tz(this.auth.user.airport.timezone).format("DD MMM YY").toString();
    this.cdateValidate = true;
    this.getShifts();
    this.getRosterView();

  }

  // GET API for shift with appropriate user
  getShifts() {
    this.shifts = [];
    this.NAShifts = [];
    this.services.getAll(this.AppUrl.geturlfunction('GET_SHIFTS_WITH_LEGEND') + this.currentStation.code).subscribe(res => {
      let d = res.data;
      this.shiftsId = [];
      this.shiftsAlias = [];
      for (let i = 0; i < d.length; i++) {
        this.shiftsId.push(d[i].id);
        this.shiftsAlias.push(d[i].alias)
        d[i].totalcount = 0;
        if (d[i].start_time == null && d[i].end_time == null) {
          this.NAShifts.push(d[i])
        }
        else {
          // if(d[i].start_time - d[i].start_time){
          //   d[i].sortnumber;
          // }
          d[i].disable = false;
          if (momentzone(this.filter.from).tz(this.auth.user.airport.timezone).startOf('day').toString() === momentzone().tz(this.auth.user.airport.timezone).startOf('day').toString()) {
            if (momentzone(d[i].start_time).tz(this.auth.user.airport.timezone).format('DD-MM-YYYY') === momentzone(d[i].end_time).tz(this.auth.user.airport.timezone).format('DD-MM-YYYY')) {
              let s = this.AppUrl.getHrsmintues(d[i].end_time, this.auth.user.airport.timezone);
              if (s !== '--:--') {
                if (s <= this.AppUrl.getHrsmintues(momentzone().tz(this.auth.user.airport.timezone).unix() * 1000, this.auth.user.airport.timezone)) {
                  d[i].disable = true;
                }
              }
            }
          }
          d[i].hhmm = momentzone(d[i].start_time).tz(this.auth.user.airport.timezone).format('HH:MM')
          this.shifts.push(d[i])
        }
      }
      // to filter out the inactive shifts
      let inAct = this.shifts.filter(
        inActive => inActive.disable == true);
      // to filter only the active shifts
      let act = this.shifts.filter(
        active => active.disable == false);
      act = this.appService.sortName(act,'hhmm');
      let finalArr = act.concat(inAct);
      this.shifts = finalArr;
      // this.shifts = this.appService.sortName(this.shifts, 'hhmm');
      console.log(this.shifts)
      console.log(this.NAShifts)
      this.NAShifts = this.appService.sortName(this.NAShifts, 'alias');
    }, error => {
      console.log("error")
    });
  }

  // function to group resource based on role
  setTemplate() {
    this.viewTemplate = true;
    this.shiftsByDesign = [];
    this.designations = [];
    for (let i = 0; i < this.roster.shifts.length; i++) {
      let shift = this.roster.shifts[i];
      shift.dates[0].active = 'Y';
      if (shift.dates[0].shift != '' && shift.dates[0].shift_id != '') {
        this.counterfunction(this.shifts, shift.dates[0].shift, '')
        this.counterfunction(this.NAShifts, shift.dates[0].shift, '')
      }
      let index = this.designations.indexOf(shift.designation);
      let bydesignation = (shift.designation === 'Duty Manager') ? 0 : (shift.designation === 'Ramp Officer') ? 1 : 2
      if (index === -1 && shift.dates[0].shift != '' && shift.dates[0].shift_id != '') {
        this.designations.push(shift.designation);
        this.shiftsByDesign.push({
          designation: shift.designation,
          employees: [shift],
          hide: false,
          priority: bydesignation,
          count: 0
        });
        continue;
      }
      if (shift.dates[0].shift !== '' && shift.dates[0].shift_id !== '') {
        this.shiftsByDesign[index].employees.push(shift);
      }
    }
    this.shiftsByDesign.sort(function (a, b) {
      return a.priority - b.priority;
    });
    if (this.shiftsByDesign.length == 0) {
      this.noData = true;
      // this.appService.toast('', 'Shift allocation not performed', 'error', 'error-mode');
      this.counterfunction(this.shifts, null, null)
      this.counterfunction(this.NAShifts, null, null)
    }
    else {
      this.noData = false;
    }
    this.cdateValidate = false

  }

  // function for calculating no of resource by shifts
  counterfunction(array, param, object) {

    for (let k = 0; k < array.length; k++) {
      var ele = array[k];
      if (param == ele.alias) {
        ele.totalcount++;
      }
      if (object == ele.alias) {
        ele.totalcount--;
      }
      if (param == null) {
        ele.totalcount = 0;
      }
      if (object == null) {
        ele.totalcount = 0;
      }

    }
  }
}
