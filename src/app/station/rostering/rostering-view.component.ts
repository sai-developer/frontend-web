import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import * as momentzone from 'moment-timezone';
import { ToastrService, GlobalConfig } from 'ngx-toastr';
import { AuthService, AppService } from '../../service/app.service'
import * as _ from 'underscore';
import { AppUrl } from "../../service/app.url-service";
import { ApiService } from "../../service/app.api-service";
import { ToastComponent } from "../../toast/toast.component";
import { AlertComponent } from "../../alert/alert.component";
import { MatDialog } from "@angular/material";
import { ShiftDialogComponent } from "./shift-dialog/shift-dialog";

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
  templateUrl: './rostering-view.component.html',
  styleUrls: ['./rostering.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})

export class RosteringViewComponent implements OnInit {
  // initiallization of variable required for the page
  load: boolean = false;
  employees = [];
  designations = [];
  canSelect = false;
  filter = {
    from: momentzone().tz(this.auth.user.airport.timezone).startOf('day'),
    toshow: momentzone().tz(this.auth.user.airport.timezone).startOf('day').add(13, 'days'),
    to: momentzone().tz(this.auth.user.airport.timezone).endOf('day').add(13, 'days')
  };

  shifts: any[] = [];
  shiftsId: any[] = [];
  shiftsAlias: any[] = [];
  curShift: string = '';
  today: any = momentzone().tz(this.auth.user.airport.timezone);

  days: number[] = [];
  roster: any = {};
  shiftsByDesign: any[] = [];
  processing: boolean = false;
  viewTemplate: boolean = false;
  options: FormGroup;
  dragOver: boolean;
  currentdays: any;
  toasterOptions: GlobalConfig;
  submitFlag: boolean = false;
  currentStation: any;
  zoneOffset: any
  staffListLength: any;
  todayDate: any = momentzone().tz(this.auth.user.airport.timezone).startOf('day').format('YYYY-MM-DD').toString();
  maxDateValue = momentzone().tz(this.auth.user.airport.timezone).endOf('day').add(13, 'days');
  searchText: string;
  stateSubscription: any;
  activeState: boolean;
  time = [1, 2, 3];
  scheduleDays: { "date": string; "count": number; }[];
  scrollObject: any;
  // Vertical scroll listner for schedule density
  @ViewChild('widgetsContent', { read: ElementRef }) public widgetsContent: ElementRef<any>;
  scrollUp: boolean;
  scrollDown: boolean;
  shiftdetails: any[] = [];
  selectedCell: any = -1;
  shiftADisplay: any;
  selectedDay: any;
  selectedEmp: any;
  fadeHighlight: boolean;
  timer: any;
  preventSimpleClick: boolean = false;



  constructor(private viewContainerRef: ViewContainerRef, private services: ApiService, private appService: AppService, private AppUrl: AppUrl, private toastr: ToastrService, private dialog: MatDialog, private auth: AuthService, fb: FormBuilder) {
    this.toasterOptions = this.toastr.toastrConfig;
    this.currentStation = { "id": this.auth.user.userAirportMappingList[0].id, "code": this.auth.user.userAirportMappingList[0].code, "zone": this.auth.user.airport.timezone }
    this.zoneOffset = this.auth.timeZone;
    this.options = fb.group({
      floatLabel: 'never',
    });
  }


  ngOnInit() {
    this.getShifts();
    this.getRosterView();
    this.subscribeActions();
    this.activeState = true;
    this.scrollUp = true;
  }

  //subscribe action for clearing the searchtext
  subscribeActions() {
    this.stateSubscription = this.appService.filter.subscribe((value) => {
      this.searchText = value;
    })
  }

  appendOptions(clickedDay, emp): any {
    this.timer = 0;
    this.preventSimpleClick = false;
    const delay = 250;
    this.timer = setTimeout(() => {
      if (!this.preventSimpleClick) {
        this.fadeHighlight = false;
        this.selectedCell = clickedDay;
        this.selectedEmp = emp;
        if (this.dialog.openDialogs.length == 0) {
          const dialogRef = this.dialog.open(ShiftDialogComponent, {
            minWidth: '300px',
            maxWidth: '300px',
            panelClass: 'ls-modal',
            backdropClass: 'trans-backdrop',
            data: {
              shiftDetails: this.shifts,
              dayDetails: clickedDay,
            },

          });

          dialogRef.afterClosed().subscribe(result => {
            console.log('after the modal is closed', result);
            if (result != null) {
              this.submitFlag = true;
              this.selectedCell.alias = result.alias;
              this.selectedCell.shift = result.alias;
              this.selectedCell.name = result.name;
              this.selectedCell.shift_id = result.shift_id;
              //  this.selectedCell.start_time = result.start_time;
              // this.selectedCell.end_time = result.end_time;
              this.changeShift(this.selectedCell, 'choose', this.selectedEmp);
              this.fadeHighlight = true;
            }
          })
          dialogRef.backdropClick().subscribe(result => {
            this.fadeHighlight = true;
          });
        }
      }
    }, delay);
  }

  // function call to open schedule density pop up
  selectDensity() {
    // this.activeState = false;
    let url = this.AppUrl.geturlfunction('GET_SCHEDULE_DENSITY') + 'from=' + momentzone(this.filter.from).tz(this.currentStation.zone).unix() * 1000 + '&to=' +
      momentzone(this.filter.to).tz(this.currentStation.zone).unix() * 1000 + '&station=' + this.currentStation.code;
    this.services.getAll(url).subscribe(res => {
      let shiftData = res.data;
      for (let index = 0; index < shiftData.length; index++) {
        const element = shiftData[index];
        shiftData[index].time = momentzone(element.start_time).tz(this.auth.user.airport.timezone).format('HH:MM')
      }
      this.scheduleDays = this.appService.sortName(shiftData, 'time');
    }, error => {
      console.log("error")
    });
  }

  // function call for custom scroll (Up)
  upScroll() {
    if (this.widgetsContent.nativeElement.scrollTop <= 52) {
      this.scrollUp = true;
      this.scrollDown = false;
      this.widgetsContent.nativeElement.scrollTop = 0;
    }
    else {
      this.scrollUp = false;
      this.scrollDown = false;
    }
    this.widgetsContent.nativeElement.scrollTop -= 52;
  }

  // function call for custom scroll (Down)
  downScroll() {
    if (this.widgetsContent.nativeElement.scrollHeight <= this.widgetsContent.nativeElement.clientHeight + this.widgetsContent.nativeElement.scrollTop + 52) {
      this.scrollDown = true;
      this.scrollUp = false;
    }
    else {
      this.scrollDown = false;
      this.scrollUp = false;
    }
    this.widgetsContent.nativeElement.scrollTop += 52;

  }

  // function call to dismiss schedule density
  selectRoster() {
    this.activeState = true;
  }

  // GET API to fetch resource and roster details 
  getRosterView() {
    this.load = true;
    let url = this.AppUrl.geturlfunction('GET_ROSTER_VIEW') + 'fromDate=' + momentzone(this.filter.from).format("DD-MM-YYYY").toString() + '&toDate=' + momentzone(this.filter.to).format("DD-MM-YYYY").toString() + '&station=' + this.currentStation.code + '&userRole=' + this.auth.user.userRoleMasterList[0].id;
    this.services.getAll(url).subscribe(res => {
      this.roster = res.datass;
      this.staffListLength = this.roster.shifts.length;
      this.setTemplate();
    }, error => {
      this.load = false;
    });
  }

  // GET API to fetch list of shift available
  getShifts() {
    this.services.getAll(this.AppUrl.geturlfunction('GET_SHIFTS_WITH_LEGEND') + this.currentStation.code).subscribe(res => {
      let shiftData = res.data;
      for (let index = 0; index < shiftData.length; index++) {
        const element = shiftData[index];
        shiftData[index].time = momentzone(element.start_time).tz(this.auth.user.airport.timezone).format('HH:MM')
      }
      shiftData = this.appService.sortName(shiftData, 'time');
      this.shifts = shiftData;
      this.shiftsId = [];
      this.shiftsAlias = [];
      for (let i = 0; i < this.shifts.length; i++) {
        this.shiftsId.push(this.shifts[i].id);
        this.shiftsAlias.push(this.shifts[i].alias)
      }
    }, error => {
      console.log("error")
    });
  }

  // function call to select From and To range (DATE)
  daterange(date, value) {
    if (value == 'from') {
      this.filter.from = momentzone(date.value).tz(this.auth.user.airport.timezone).startOf('day');
      this.filter.to = momentzone(date.value).tz(this.auth.user.airport.timezone).endOf('day').add(13, 'days')
      this.filter.toshow = momentzone(date.value).tz(this.auth.user.airport.timezone).endOf('day').add(13, 'days');
      this.maxDateValue = this.filter.toshow;
      this.getRosterView();
      this.selectDensity();
    }

    if (value == 'to') {
      this.filter.to = momentzone(date.value).tz(this.auth.user.airport.timezone)
      this.getRosterView();
      this.selectDensity();
    }
    if (this.filter.from == this.filter.to) {
      this.maxDateValue = momentzone(this.filter.from).tz(this.auth.user.airport.timezone).endOf('day').add(13, 'days')
    }
  }

  // default mouse event for drag and select (Click Down)
  mouseDown(day) {
    if (day.shift_id) {
      this.canSelect = true;
      day.selected = true;
      this.curShift = day.shift_id
    }
  }

  // default mouse event for drag and select (Mouse Up)
  mouseUp() {
    if (!this.curShift) {
      return;
    }
    for (let i = 0; i < this.shiftsByDesign.length; i++) {
      let designation = this.shiftsByDesign[i];
      for (let j = 0; j < designation.employees.length; j++) {
        let employee = designation.employees[j];
        for (let l = 0; l < employee.dates.length; l++) {
          employee.dates[l].selected = false;
        }
      }
    }
    this.canSelect = false;
    this.curShift = '';
    this.submitFlag = true;
  }

  // default mouse event for drag and select (Mouse Over)
  mouseOver(day, emp) {
    if (this.canSelect) {
      day.selected = true;
      day.shift_id = this.curShift;
      this.changeShift(day, 'choose', emp);
    }
  }

  checkuseraction(param) {
    this.services.getAll(this.AppUrl.geturlfunction('CHECKUSERACTION') + param).subscribe(res => {
      console.log(res)
      if (res.task_count > 0) {
        // this.showToast('',"Shift cannot be assigned since he is already in working shift",'error', 'error-mode')
      }
    }, error => {
      console.log("error")
    });
  }

  dbl(day, emp): void {
    this.preventSimpleClick = true;
    clearTimeout(this.timer);
    if (day.alias) { // to check cell contains shift
      console.log(day.alias);
      //this.changeShift(day, 'dblClicked', emp);
      const shiftName: string = day.name;
      day.shift_id = ''
      day.alias = '';
      day.name = '';
      day.shift = '';
      day.start_time = '';
      day.end_time = '';

      this.changefun(day, emp, shiftName);
      //console.log(day, 'dblClicked', emp);
    }
  }

  changeShift(day, param, emp) {
    let value = this.shiftsId.indexOf(parseInt(day.shift_id));
    if (value > -1) {
      day.shift_id = this.shifts[value].id;
      day.start_time = this.shifts[value].start_time;
      day.end_time = this.shifts[value].end_time;
      day.name = this.shifts[value].name;
      day.alias = this.shifts[value].alias;
      day.shift = this.shifts[value].alias
      console.log('current day', day)
      //day.shift = 'GN';
      // (day.alias === "LE" || day.alias === "HO" || day.alias === "OF")
      day.active = 'Y'
      // if (day.alias === "LE" || day.alias === "HO" || day.alias === "OF") {
      //   day.color = 'red';
      // } else if (day.alias === "MI" || day.alias === "TR" || day.alias === "CO") {
      //   day.color = 'amber';
      // } else {
      //   day.color = 'green';
      // }
      if(day.start_time){
        day.color = 'green';
      } else{
        day.color = 'amber';
      }
      day.selectedflag = true;

      if (emp !== "") {
        if (param == 'choose') {

          if (momentzone().tz(this.auth.user.airport.timezone).startOf('day').format('YYYY-MM-DD').toString() === day.date) {
            let s = this.AppUrl.getHrsmintues(day.start_time, this.auth.user.airport.timezone);
            let e = this.AppUrl.getHrsmintues(day.end_time, this.auth.user.airport.timezone);
            let v = this.AppUrl.getHrsmintues(momentzone().tz(this.auth.user.airport.timezone).unix() * 1000, this.auth.user.airport.timezone);
            console.log(this.AppUrl.getHrsmintues(momentzone().tz(this.auth.user.airport.timezone).unix() * 1000, this.auth.user.airport.timezone));
            console.log("S", s);
            console.log("e", e);
            let r = (this.AppUrl.getHrsmintues(momentzone().tz(this.auth.user.airport.timezone).unix() * 1000, this.auth.user.airport.timezone)) - (this.AppUrl.getHrsmintues(day.end_time, this.auth.user.airport.timezone));
            console.log("R", r);
            if (s !== '--:--' && e !== '--:--') {
              if (momentzone(day.start_time).tz(this.auth.user.airport.timezone).format('YYYY-MM-DD') === momentzone(day.end_time).tz(this.auth.user.airport.timezone).format('YYYY-MM-DD')) {
                if (s <= this.AppUrl.getHrsmintues(momentzone().tz(this.auth.user.airport.timezone).unix() * 1000, this.auth.user.airport.timezone) && e <= this.AppUrl.getHrsmintues(momentzone().tz(this.auth.user.airport.timezone).unix() * 1000, this.auth.user.airport.timezone)) {
                  console.log(e <= (this.AppUrl.getHrsmintues(momentzone().tz(this.auth.user.airport.timezone).unix() * 1000, this.auth.user.airport.timezone)));
                  if (e <= (this.AppUrl.getHrsmintues(momentzone().tz(this.auth.user.airport.timezone).unix() * 1000, this.auth.user.airport.timezone))) {
                    const x = 1;
                  }


                  //const t=e - (this.AppUrl.getHrsmintues(momentzone().tz(this.auth.user.airport.timezone).unix() * 1000, this.auth.user.airport.timezone))+ x ;
                  const t = ((e - this.AppUrl.getHrsmintues(momentzone().tz(this.auth.user.airport.timezone).unix() * 1000, this.auth.user.airport.timezone)));
                  console.log("T", t)
                  // const y= t + x;
                  console.log("checking", s <= this.AppUrl.getHrsmintues(momentzone().tz(this.auth.user.airport.timezone).unix() * 1000, this.auth.user.airport.timezone) && e <= this.AppUrl.getHrsmintues(momentzone().tz(this.auth.user.airport.timezone).unix() * 1000, this.auth.user.airport.timezone));
                  this.showToast('', "Shift cannot be assigned since time exceeded", 'error', 'error-mode')
                  day.alias = "",
                    day.color = "",
                    day.end_time = "",
                    day.shift = "",
                    day.shift_id = "",
                    day.start_time = ""
                  day.selectedflag = false;
                }
              }
            }
          }
        }
        let d = [];
        d.push(day)
        this.shiftdetails.push({
          name: emp.name,
          user_id: emp.user_id,
          designation: emp.designation,
          dates: d
        })

        //

        // for (let index = 0; index < this.shiftdetails.length; index++) {
        //   let element = this.shiftdetails[index];
        //               if(element.user_id === emp.user_id && element.dates[0].date === d[0].date){
        //                 console.log(element)
        //                 element.shiftdetails[index]           
        //               }
        // }
        //   let uniqusers = _.uniq(this.shiftdetails, function(x) {
        //     console.log(x)
        //     return x.user_id && x.dates[0].date;
        // });
        let uniqusers = this.shiftdetails.filter(function (a) {
          if (a.dates[0].date) {
            var key = a.user_id + '|' + a.dates[0].date;
            if (!this[key]) {
              this[key] = true;
              return true;
            }
          }
        }, Object.create(null));
        this.shiftdetails = uniqusers;

      }
    }
    if (param == 'chooses') {
      if (momentzone().tz(this.auth.user.airport.timezone).startOf('day').format('YYYY-MM-DD').toString() === day.date && day.start_time !== null) {
        if (momentzone(day.start_time).tz(this.auth.user.airport.timezone).format('DD-MM-YYYY') === momentzone(day.end_time).tz(this.auth.user.airport.timezone).format('DD-MM-YYYY')) {
          let s = this.AppUrl.getHrsmintues(day.end_time, this.auth.user.airport.timezone);
          // console.log(this.AppUrl.getHrsmintues(momentzone().tz(this.auth.user.airport.timezone).unix()*1000,this.auth.user.airport.timezone));
          if (s !== '--:--') {
            if (s <= this.AppUrl.getHrsmintues(momentzone().tz(this.auth.user.airport.timezone).unix() * 1000, this.auth.user.airport.timezone)) {
              day.disable = true;
            }
          }
        }
      }
    }

    // if (day.shift_id == '') {
    //   day.alias = '';
    //   day.color = '';
    //   day.end_time = '';
    //   day.start_time = '';
    //   day.name = '';
    //   day.selectedflag = true;
    //   let d = [];
    //   if (day.selectedflag) {
    //     d.push(day)
    //   }

    //   this.shiftdetails.push({
    //     name: emp.name,
    //     user_id: emp.user_id,
    //     designation: emp.designation,
    //     dates: d
    //   })
    // }
  }

  changefun(day, emp, shiftName) {
    this.submitFlag = true;
    if (day.shift_id == '') {
      let s = this.shifts.filter(x => {
        return x.name == shiftName
      })
      day.active = 'N'
      day.shift_id = s[0].id
      let d = [];

      d.push(day)

      this.shiftdetails.push({
        name: emp.name,
        user_id: emp.user_id,
        designation: emp.designation,
        dates: d
      })
      let uniqusers = this.shiftdetails.filter(function (a) {
        if (a.dates[0].date) {
          var key = a.user_id + '|' + a.dates[0].date;
          if (!this[key]) {
            this[key] = true;
            return true;
          }
        }
      }, Object.create(null));
      this.shiftdetails = uniqusers;
    }
  }

  // function to group resource based on roles
  setTemplate() {
    this.viewTemplate = true;
    this.shiftsByDesign = [];
    this.designations = [];
    //console.log(this.roster)
    for (let i = 0; i < this.roster.shifts.length; i++) {
      let shift = this.roster.shifts[i];
      // console.log(shift)
      let index = this.designations.indexOf(shift.designation);
      //this.checkuseraction(shift.user_id)
      for (let j = 0; j < shift.dates.length; j++) {
        this.changeShift(shift.dates[j], 'chooses', '');
      }

      if (index === -1) {
        this.designations.push(shift.designation);
        let bydesignation = (shift.designation === 'Duty Manager') ? 0 : (shift.designation === 'Ramp Officer') ? 1 : 2
        this.shiftsByDesign.push({
          designation: shift.designation,
          employees: [shift],
          hide: false,
          priority: bydesignation
        });
        continue;
      }
      this.shiftsByDesign[index].employees.push(shift);
    }


    this.shiftsByDesign.sort(function (a, b) {
      return a.priority - b.priority;
    });

    // Sorting shift users by name
    const shiftsByDesignUL = [];
    for (let index = 0; index < this.shiftsByDesign.length; index++) {
      const element = this.shiftsByDesign[index];
      element.employees = this.appService.sortName(element.employees, 'name');
      shiftsByDesignUL.push(element);
    }
    this.shiftsByDesign = shiftsByDesignUL;
    console.log(this.shiftsByDesign[0].employees[0].dates)
    this.load = false;
  }

  // function for update/overwrite roster 
  isExistsRostering() {
    this.processing = true;
    let roster = {
      station: this.roster.station,
      dateFrom: this.roster.dateFrom,
      dateTo: this.roster.dateTo
    };

    this.services.create(this.AppUrl.geturlfunction('ROSTER_IS_EXIST'), { data: roster }).subscribe(res => {
      this.processing = false;
      if (!res.status) {
        this.showToast('', 'Error occurred', 'error', 'error-mode');
        this.load = false;
        return;
      }
      if (res.data.length > 0) {
        this.doAlert();
        return;
      }


      this.save(false);
    }, error => {
      this.processing = false;
    });
  }

  //  function to open alert dialog while changing existing shift
  doAlert() {
    console.log("LENGTH ==>", this.dialog.openDialogs.length);
    if (this.dialog.openDialogs.length > 0) {
      return;
    }
    console.log('DIALOG OPENED');
    let dialogRef = this.dialog.open(AlertComponent, {
      width: '500px',
      // minHeight: '200px',
      panelClass: 'modelOpen',
      data: {
        text: {
          main: 'Roster already exists',
          sub: 'Do you want to overwrite?'
        },
        ok: 'OVERWRITE',
        cancel: 'CANCEL'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.save(true);
      }
    });
  }

  // post call for saving roster details
  save(overwrite) {
    this.load = true;
    let roster = {
      overwrite: overwrite,
      station: this.roster.station,
      dateFrom: this.roster.dateFrom,
      dateTo: this.roster.dateTo,
      shifts: this.shiftdetails
    };
    this.services.create(this.AppUrl.geturlfunction('ROSTER_CREATE'), { data: roster }).subscribe(res => {
      console.log(res)
      if (!res.status) {
        this.showToast('', 'Error occurred', 'error', 'error-mode');
        this.load = false;
        return;
      }
      this.submitFlag = false;
      this.shiftdetails = [];
      this.getRosterView();
      this.showToast('', 'Rostering has been updated successfully', 'success', 'success-mode');
    }, error => {
      this.load = false;
      console.log(error);
    });
  }

  showToast(title, msg, type = '', tClass = '') {
    this.toasterOptions.toastComponent = ToastComponent;
    this.toasterOptions.toastClass = tClass;
    this.toasterOptions.positionClass = 'toast-bottom-full-width';
    this.toasterOptions.closeButton = true;
    this.toasterOptions.extendedTimeOut = 3000;
    this.toasterOptions.maxOpened = 1;
    this.toasterOptions.autoDismiss = true;
    this.toastr.show(title, msg, this.toasterOptions, type);
  }
  stateChange(data:any){
    if(data = 'den'){
      this.activeState = false;
    }else {
      this.activeState = true;
    }
  }

}
