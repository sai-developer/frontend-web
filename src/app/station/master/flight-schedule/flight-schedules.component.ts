import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppUrl } from '../../../service/app.url-service';
import { ApiService } from '../../../service/app.api-service';
import { AppService, AuthService } from "../../../service/app.service";
import { MatDialog } from "@angular/material";
import { flightScheduleComponent } from "./flight-schedule/flight-schedule.component";
import { AlertComponent } from '../../../alert/alert.component';
import * as momentzone from 'moment-timezone';
import { ToastrService, GlobalConfig } from 'ngx-toastr';
import { ToastComponent } from '../../../toast/toast.component';
import { FlightScheduleDetails } from './flight-schedule/flight-schedule-details';

import { EquipmentList } from '../../../station/master/tasks/task/aircraft-master.class';
import { CommonData } from '../../../service/common-data';


@Component({
  templateUrl: './flight-schedules.component.html',
  styleUrls: ['./flight-schedules.component.scss']
})

export class flightSchedulesComponent implements OnInit, OnDestroy {
  // initialization of days of the week for the frequency of flights drop down
  days: any = [
    { id: "127", name: 'daily', flag: '' },
    { id: "1", name: 'S', flag: '' },
    { id: "2", name: 'M', flag: '' },
    { id: "4", name: 'T', flag: '' },
    { id: "8", name: 'W', flag: '' },
    { id: "16", name: 'T', flag: '' },
    { id: "32", name: 'F', flag: '' },
    { id: "64", name: 'S', flag: '' },
  ];
  // Initialization of variables requireed for the page
  freqInNum: number[];
  viewType: any = this.appService.getcookie('userView') ? this.appService.getcookie('userView') : 'LIST_VIEW'
  flightInfos: FlightScheduleDetails[] = [];
  actionSubscription: any;
  toasterOptions: GlobalConfig;
  currentStation: any;
  airportList: any;
  role: any;
  testFreq: any[] = [];
  frequency: number;
  selectedData: FlightScheduleDetails[];
  selectdata: any[] = [];
  load: Boolean = false;
  equipments: EquipmentList[] = [];
  zoneOffset: any;
  constants: any;
  stateSubscription: any;
  searchText: string;
  constructor(private services: ApiService, private AppUrl: AppUrl, private appService: AppService, private auth: AuthService, private dialog: MatDialog, private toastr: ToastrService, private common: CommonData) {
    this.currentStation = {
      "id": this.auth.user.userAirportMappingList[0].id, "userId": this.auth.user.id, "code": this.auth.user.userAirportMappingList[0].code,
      "zone": this.auth.user.airport.timezone
    }
    this.zoneOffset = this.auth.timeZone,
      this.toasterOptions = this.toastr.toastrConfig;
  }

  ngOnInit() {
    this.constants = this.common;
    this.getFlightList();
    this.appService.addBtn.next(true);
    this.subscribeActions();
    this.getEquipmentList();
    this.getAirportList();
    this.appService.state.next('REFRESH');

  }
  ngOnDestroy() {
    this.actionSubscription.unsubscribe();
  }
  // function to subscribe events and functions required for this page from the Station layout
  subscribeActions() {
    this.actionSubscription = this.appService.action.subscribe((action) => {
      if (action === 'ADD') {
        this.add();
      } else if (action === 'REFRESH') {
        this.getFlightList();
      }
      if (action === 'GRID_VIEW' || action === 'LIST_VIEW') {
        this.viewType = action;
      }
    });

    this.stateSubscription = this.appService.filter.subscribe((value) => {
      this.searchText = value;
    })

  }
  // funciton to open Add New Flight Dialog box
  add() {
    const dialogRef = this.dialog.open(flightScheduleComponent, {
      position: {
        right: '0'
      },
      width: '600px',
      panelClass: 'modelOpen',
      data: {
        mode: 'ADD',
        Role: this.role,
        airports: this.airportList,
        equipments: this.equipments,
        currentStation: this.currentStation
      }
    });
    // the return response after the Add New flight Daialog box is closed
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        console.log(result)
        this.getFlightList();
      }
    });
  }

  // funciton to open Edit Flight Dialog box
  edit(flight) {
    console.log(flight);
    const dialogRef = this.dialog.open(flightScheduleComponent, {
      position: {
      },
      width: '600px',
      panelClass: 'modelOpen',
      data: {
        mode: 'EDIT',
        flight: flight,
        airports: this.airportList,
        equipments: this.equipments,
        currentStation: this.currentStation,
      }
    });
    // the return response after the Edit flight Daialog box is closed
    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (result !== undefined) {
        this.getFlightList();
      }
    });
  }

  // API call to get the list of Flights for the current station by passing the station id as a request param (GET API)
  getFlightList() {
    this.load = true;
    this.services.getById(this.AppUrl.geturlfunction('GET_FLIGHT_SCHEDULE_DETAILS'), this.currentStation.id).subscribe(res => {
      if (res.status) {
        this.flightInfos = FlightScheduleDetails.set(res.data);
        for (let i = 0; i < this.flightInfos.length; i++) {
          this.flightInfos[i].standardArrivalTimeSort = this.flightInfos[i].standardArrivalTime ? parseInt(momentzone(this.flightInfos[i].standardArrivalTime).tz(this.currentStation.zone).format('HHmm')) : 0;
        }
        this.selectedData = this.appService.sortNumber(this.flightInfos, 'standardArrivalTimeSort');
        this.selectdata = res.data;
        this.load = false;
      }
      else {
        this.load = false;
      }
    }, error => {
      this.load = false;
    });

  }

  // API call to get the list of Equipments available (GET API)
  getEquipmentList() {
    this.services.getAll(this.AppUrl.geturlfunction('EQUIPMENT_TYPE_SERVICE')).subscribe(res => {
      let equipment = new EquipmentList({});
      console.log(res.data)
      this.equipments = equipment.set(res.data);
    }, error => { });
  }
  // API call to get the list of all the Airports handeled (GET API)
  getAirportList() {
    this.services.getAll(this.AppUrl.geturlfunction('AIRPORT_SERVICE')).subscribe(res => {
      let t = this.appService.sortName(res.data, 'code');
      this.airportList = t.filter(arr =>
        arr.id !== this.currentStation.id)
    }, error => { });

  }
  // funciton to open Delete confirmation  dialog box
  delete(data: any) {
    console.log(data);
    if (this.dialog.openDialogs.length > 0) {
      return;
    }
    console.log('DIALOG OPENED');
    const dialogRef = this.dialog.open(AlertComponent, {
      width: '500px',
      panelClass: 'modelOpen',
      data: {
        text: {
          sub: 'Do you wish to delete this Flight?'
        },
        ok: 'YES',
        cancel: 'NO'
      }
    });
    // return response of the delete dialog box is passed as a param for the next function
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.deleteflights(data);
      }
    });
  }
  // based on delete confirmation the API call is made
  deleteflights(data: any) {
    if (data.flightType == 0) {
      delete data.arrFlightNumber;
      delete data.standardArrivalTime;
      delete data.origin
    } else if (data.flightType == 3) {
      delete data.depFlightNumber;
      delete data.standardDepartureTime;
      delete data.destination
    }
    const flights = data;
    delete flights.flightFrequencyModified;
    flights.station = this.currentStation.id;
    console.log('before touch time',flights)
    this.touchTime(flights);
    flights.active = 'N';
    console.log('after touch time',flights);
    this.services.create(this.AppUrl.geturlfunction('FLIGHT_SCHEDULE_DETAILS_UPDATE'), flights).subscribe(res => {
      if (res.status === true) {
        this.getFlightList();
        if(flights.flightType == 0 || flights.flightType == 1  || flights.flightType == 2)
        {
          this.appService.showToast('FLIGHT_DELETE',flights.depFlightNumber  , 'success'); 
        }
        else if(flights.flightType == 3)
        {
          this.appService.showToast('FLIGHT_DELETE',flights.arrFlightNumber  , 'success');

        }
       
      } else {
        if (res.errorMessage.includes('duplicate') === true) {
          this.appService.toast('', 'Record already exists', 'warning', 'warning-mode');
        } else {
          this.appService.toast('', res.errorMessage, 'error', 'error-mode');
        }
      }
    }, error => {
      this.appService.toast('', 'Server Error', 'error', 'error-mode');
    });
  }

  touchTime(data: any) {
    const newData = data;
    newData.active = 'Y';
    newData.createdBy = this.currentStation.userId;
    newData.createdAt = momentzone().tz(this.currentStation.zone).unix();
    newData.modifiedBy = this.currentStation.userId;
    newData.modifiedAt = momentzone().tz(this.currentStation.zone).unix();
    return newData;
  }
}