import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import * as momentzone from 'moment-timezone';
import { ToastrService, GlobalConfig } from 'ngx-toastr';
import * as _ from 'underscore';
import { MatDialog } from "@angular/material";
import { ApiService } from 'app/service/app.api-service';
import { AppService, AuthService } from 'app/service/app.service';
import { AppUrl } from 'app/service/app.url-service';

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
  selector: 'app-daily-status',
  templateUrl: './daily-status.component.html',
  styleUrls: ['./daily-status.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class DailyStatusComponent implements OnInit {
  filter = {
    to: momentzone().tz(this.auth.user.airport.timezone).endOf('day'),
    from: momentzone().tz(this.auth.user.airport.timezone).startOf('day').subtract(6, 'days')
  };
  zoneOffset: any;
  currentStation: { "id": any; "code": any; "zone": any; };
  filterType = [{ value: "Arrival", id: 1 }, { value: "Departure", id: 2 }, { value: "Task Based", id: 3 }]
  flightType: any = [
    { 'id': 4, 'type': "All" },
    { 'id': 0, 'type': 'Base' },
    { 'id': 1, 'type': 'Transit' },
    { 'id': 2, 'type': 'Turnaround' },
    { 'id': 3, 'type': 'Terminating' }
  ];
  flightsList: any;
  fltLength: any;
  moment: any;
  filterSelected: any;
  taskList: any;
  taskSelected: any;
  today: any;
  maxDate: any;
  daysList: any;
  todayDate: any;
  filterFrom: any;
  filterTo: any;
  load: boolean;
  filterfrom: any;
  filterto: any;
  filterName: any;
  equipList: any;
  equipLists = [];
  tempList: any;
  equip: string;
  flexValue: number;
  flexValue1: number;
  flexValue2: number;
  flighttype: number;
  taskName: any;
  taskShow: boolean;
  taskTitle: any;
  stateSubscription: any;
  searchText: string;
  constructor(private viewContainerRef: ViewContainerRef, private appUrl: AppUrl, private services: ApiService, private appService: AppService, private toastr: ToastrService, private dialog: MatDialog, private auth: AuthService, fb: FormBuilder) {
    this.currentStation = { "id": this.auth.user.userAirportMappingList[0].id, "code": this.auth.user.userAirportMappingList[0].code, "zone": this.auth.user.airport.timezone }
    
    
    this.flexValue = 40;
    this.flexValue1 = 20;
    this.flexValue2 = 40;
  }


  ngOnInit() {
    this.today = momentzone().tz(this.currentStation.zone);
    this.todayDate = momentzone().tz(this.auth.user.airport.timezone).startOf('day').format('YYYY-MM-DD').toString();
    this.maxDate = momentzone().tz(this.currentStation.zone).startOf('day').subtract(30, 'days');
    this.filterSelected = 'Departure';
    this.zoneOffset = this.auth.timeZone;
    console.log("***********",this.currentStation.zone,this.auth)
    this.taskSelected = 0;
    this.equip = "All";
    this.flighttype = 4;
    this.getFlights("Departure");
    this.getTaskList();
    this.getEquipList();
    this.subscribeActions();
    this.taskShow = false;
  }

  //subsribe action for the search text from station  layout
  subscribeActions() {
    this.stateSubscription = this.appService.filter.subscribe((value) => {
      this.searchText = value;
    })
  }


  getFlights(value) {
    this.filterName = value;
    // this.equip = "All";
    // this.flighttype = 4;
    var url;
    if (value == "Arrival") {
      this.load = true;
      this.taskShow = false;
      this.taskSelected = 0;
      this.flexValue = 40;
      this.flexValue1 = 20;
      this.flexValue2 = 40;
      url = this.appUrl.geturlfunction('CONSOLIDATE_FLIGHT_ARRIVAL_VIEW') + 'station=' + this.currentStation.id + '&time_zone='+this.currentStation.zone+' &from=' + momentzone(this.filter.from).tz(this.currentStation.zone).unix() * 1000 + '&to=' + momentzone(this.filter.to).tz(this.currentStation.zone).unix() * 1000;
    }
    if (value == "Departure") {
      this.load = true;
      this.taskShow = false;
      this.taskSelected = 0;
      this.flexValue = 40;
      this.flexValue1 = 20;
      this.flexValue2 = 40;
      url = this.appUrl.geturlfunction('CONSOLIDATE_FLIGHT_DEPARTURE_VIEW') + 'station=' + this.currentStation.id + '&time_zone='+this.currentStation.zone+ '&from=' + momentzone(this.filter.from).tz(this.currentStation.zone).unix() * 1000 + '&to=' + momentzone(this.filter.to).tz(this.currentStation.zone).unix() * 1000;
    }
    if (value == "Task Based") {
      if (this.taskSelected != 0) {
        this.taskShow = true;
        this.load = true;
        this.taskName = this.taskTitle;
        this.flexValue = 80;
        this.flexValue1 = 10;
        this.flexValue2 = 10;
        url = this.appUrl.geturlfunction('CONSOLIDATE_TASK_VIEW') + 'station=' + this.currentStation.id + '&time_zone='+this.currentStation.zone+ '&task_id=' + this.taskSelected + '&from=' + momentzone(this.filter.from).tz(this.currentStation.zone).unix() * 1000 + '&to=' + momentzone(this.filter.to).tz(this.currentStation.zone).unix() * 1000;
      }
    }

    if (url) {
      this.services.getAll(url).subscribe(res => {
        this.flightsList = res.data;
        this.daysList = res.date_range;
        this.daysList.shift();  
        this.daysList = this.daysList.reverse();
        this.tempList = res.data;
        this.modifiedEquip(this.equip, this.flighttype); 
        console.log(this.daysList);
        this.load = false;
      })
    }
  }

  modifiedEquip(equip, type) {
    if (equip != "All" && type != 4) {
      this.flightsList = this.tempList.filter(
        flight => flight.e_type == equip && flight.flight_type == type);
    }

    if (equip != "All" && type == 4) {
      this.flightsList = this.tempList.filter(
        flight => flight.e_type == equip);
    }

    if (equip == "All" && type != 4) {
      this.flightsList = this.tempList.filter(
        flight => flight.flight_type == type);
    }

    if (equip == "All" && type == 4) {
      this.flightsList = this.tempList;
    }
  }


  getTaskList() {
    this.services.getAll(this.appUrl.geturlfunction('GET_TASK_MASTERLIST')).subscribe(res => {
      this.taskList = res.data;
      console.log(this.taskList)
    }, error => {
      console.log("error")
    });
  }


  getEquipList() {
    this.services.getAll(this.appUrl.geturlfunction('EQUIPMENT_TYPE_SERVICE')).subscribe(res => {
      this.equipList = res.data;
      for (let index = 0; index < this.equipList.length; index++) {
        const element = this.equipList[index];
        if (element.type) {
          this.equipLists.push(element.type)
        }
      }
      this.equipLists.unshift("All")
    }, error => {
      console.log("error")
    });
  }


  modifiedList(value) {
    console.log(value)
    for (let index = 0; index < this.taskList.length; index++) {
      const element = this.taskList[index];
      if (element.id == value) {
        this.taskTitle = element.name;
      }
    }
  }

  daterange(date, value) {
    if (value == 'from') {
      this.filter.from = momentzone(date.value).tz(this.auth.user.airport.timezone).startOf('day');
    }

    if (value == 'to') {
      this.filter.to = momentzone(date.value).tz(this.auth.user.airport.timezone).endOf('day');
    }

    if (moment(this.filter.from).isSame(this.filter.to, 'day')) {
      console.log("same")
      this.filter.from = momentzone(this.filter.to).tz(this.auth.user.airport.timezone).startOf('day').subtract(6, 'days');
    }

    if(momentzone(this.filter.to).diff(this.filter.from,'day') >= 20) 
    {
      console.log("greater")
      this.filter.from = momentzone(this.filter.to).tz(this.auth.user.airport.timezone).startOf('day').subtract(20, 'days');
    }

    if(momentzone(this.filter.to).diff(this.filter.from,'day') <= 1) 
    {
      console.log("lesser")
      this.filter.from = momentzone(this.filter.to).tz(this.auth.user.airport.timezone).startOf('day').subtract(6, 'days');
    }
    
  }
}
