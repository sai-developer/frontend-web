import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { AppUrl } from '../../../service/app.url-service';
import { ApiService } from '../../../service/app.api-service';
import * as moment from 'moment';
import * as mz from 'moment-timezone';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AppService, AuthService } from '../../../service/app.service';
import { MatTabChangeEvent } from '@angular/material';
import { MatExpansionPanel } from '@angular/material';
import { TaskAssignmentComponent } from '../task-assignment/task-assignment.component';
import { MatDialog } from "@angular/material";
import * as _ from 'underscore';
import { CommonData } from '../../../service/common-data';
import {
  IMqttMessage,
  IMqttServiceOptions,
  MqttService
} from 'ngx-mqtt';
declare let vis: any;

@Component({
  templateUrl: './bay_allocation.component.html',
  styleUrls: ['./bay_allocation.component.scss'],
  providers: [
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: [] },
  ]
})
export class BayAllocationComponent implements OnInit {
  load: Boolean = false;
  panelOpenState = false;
  bayList: any;
  todayFlightData: any = [];
  nextDayFlightData: any = [];
  fullFlightData: any = [];
  currentStation: any;
  todayState = 'TODAY';
  nextDayState = 'TOMORROW';
  state: any = '';
  zoneOffset: any;
  flight: any;
  message: string;
  flightList: any;
  constants: any;
  values: any;

  constructor(private dialogRef: MatDialogRef<BayAllocationComponent>, @Inject(MAT_DIALOG_DATA) public details: any, private services: ApiService, private appUrl: AppUrl, private auth: AuthService, private appService: AppService, private dialog: MatDialog, private mqttService: MqttService, private common: CommonData) {
    /// current station id, code and airport time zone 
    this.currentStation = {
      'id': this.auth.user.userAirportMappingList[0].id, 'code': this.auth.user.userAirportMappingList[0].code,
      "timezone": this.auth.user.airport.timezone
    }
    this.zoneOffset = this.auth.timeZone;
    this.state = this.todayState;
  }

  ngOnInit() {
    this.nextDayFlightData = [];
    this.todayFlightData = [];
    this.getFlightList('0');
    this.todayState = 'TODAY';
    this.listenSocket();
    this.constants = this.common;
    this.appService.search.next('FILTER');
  }

  ngOnDestroy() {
    this.appService.search.next(' ');
  }

  //getting bay list api &  get FlightTask Status SummaryByDate api for today and tomorrow
  getFlightList(value) {
    this.load = true;
    this.services.getAll(this.appUrl.geturlfunction('GET_BAY_BY_STATION') + this.currentStation.code).subscribe(bayRes => {
      if (value == 0) {
        this.state = this.todayState;
        this.services.getAll(this.appUrl.geturlfunction('FLIGHTS_BY_FROM_TO_UTC')).subscribe(todayRes => {
          this.bayList = bayRes.data;
          this.values = todayRes.tomorrowCount;
          for (let index = 0; index < this.bayList.length; index++) {
            this.bayList[index].list = [];
          }
          this.todayFlightData = this.appService.sortNumber(todayRes.data, 'standardArrivalTime');
          this.mapAllBay(this.bayList, this.todayFlightData, value);
        }, error => {
          console.log('error')
        });
      } else {
        this.state = this.nextDayState;
        for (let index = 0; index < this.bayList.length; index++) {
          this.bayList[index].list = [];
        }
        // Emptying the second day flight until mayfly/flight cron enabled
        this.services.getAll(this.appUrl.geturlfunction('FLIGHTS_BY_FROM_TO_UTC_NEXT_DAY')).subscribe(nextDayRes => {
          this.nextDayFlightData = this.appService.sortNumber(nextDayRes.data, 'standardArrivalTime');
          this.values = [];
          this.mapAllBay(this.bayList, this.nextDayFlightData, value);
        }, error => {
          this.load = false;
          console.log('error')
        });
      }
    }, error => {
      this.load = false;
      console.log('error')
    });
  }

  // toggling between today and tomorrow tab 
  onLinkClick(event) {
    this.getFlightList(event.index);
  }

  // assign task to particular user in task assignment page (TASK Assignment Model)
  assignTask(data: any) {
    this.dialog.open(TaskAssignmentComponent, {
      // this.dialog.open(TaskAssignmentComponent, {
      position: {
        top: '2vh',
        left: '2vh',
        right: '1vw'
      },
      maxHeight: '97vh',
      minHeight: '97vh',
      minWidth: '99vw',
      maxWidth: '99vw',
      panelClass: 'taskAssign',
      data: {
        mode: 'ADD',
        flightscheduleID: data.flightSchedulesId,
        // start: this.details.startWindow,
        // end: this.details.endWindow,
        flightdetails: data,
      },
      disableClose: true
    });
  }

  // dragData from today and tomorrow to drop location 
  onItemDrop(e: any, bay: any) {
    const flight = e.dragData;
    // drag data from today flights
    if (this.state === this.todayState) {
      this.todayFlightData = _(this.todayFlightData).filter(function (item) {
        return item.flightSchedulesId !== e.dragData.flightSchedulesId
      });
      // drag data from tomorrow flights
    } else {
      this.nextDayFlightData = _(this.nextDayFlightData).filter(function (item) {
        return item.flightSchedulesId !== e.dragData.flightSchedulesId
      });
    }
    for (let index = 0; index < this.bayList.length; index++) {
      if (this.bayList[index].id === bay.id) {
        this.bayList[index].list.push(flight);
      }
    }
    // flights allocatted to particular bay funtion
    this.mapBay(bay, e.dragData, 'allocate');
  }

  // on un allocate flight from bay then removing fligt details
  dropItem(bay, flight) {
    const position = _.findIndex(this.bayList, { id: bay.id });
    this.bayList[position].list = _(this.bayList[position].list).filter(function (item) {
      return item.flightSchedulesId !== flight.flightSchedulesId;
    });
    flight.bayCode = '';
    if (this.state === this.todayState) {
      this.todayFlightData.push(flight);
    } else {
      this.nextDayFlightData.push(flight);
    }
    this.mapBay({}, flight, 'un-allocate');
  }

  // allocating or de-allocating flights to particular bay
  mapBay(bay: any, flight: any, action: any) {
    // Need to create Class for this
    let bayObj = {};
    let fullBayObj = {};
    if (action === 'allocate') {
      bayObj = { 'id': bay.id };
      fullBayObj = _.where(this.bayList, { id: bay.id });
      fullBayObj = fullBayObj[0];
    } else {
      bayObj = {};
      fullBayObj = {};
    }
    // flight related data
    const data = {
      'id': flight.flightSchedulesId,
      'standardArrivalTime': flight.standardArrivalTime,
      'estimatedArrivalTime': flight.estimatedArrivalTime,
      'actualArrivalTime': flight.actualArrivalTime,
      'standardDepartureTime': flight.standardDepartureTime,
      'estimatedDepartureTime': flight.estimatedDepartureTime,
      'actualDepartureTime': { 'id': flight.actualDepartureTime },
      'equipmentId': { 'id': flight.equipmentId },
      'equipmentTypeId': { 'id': flight.equipmentTypeId },
      'taskScheduleId': { 'id': flight.taskScheduleId },
      'modifiedBy': 1,
      'active': 'Y',
      'etaChanged': false,
      'ataChanged': false,
      'etdChanged': false,
      'atdChanged': false,
      'ataWeb': false,
      'atdWeb': false,
      'bay_changed': true,
      'bayId': bayObj,
      'eta_flag': null,
      bayObj: fullBayObj
    };
    if (data.estimatedArrivalTime < mz().tz(this.currentStation.timezone).unix() * 1000) {
      data.eta_flag = false
    }
    this.services.create(this.appUrl.geturlfunction('FLIGHT_SCHEDULE_UPDATE'), data).subscribe(res => {
      // this.getFlightList(this.state);
      // for (let index = 0; index < this.bayList.length; index++) {
      //     if (this.bayList[index].bayId === bay.id) {
      //       // this.bayList[index].list.push(flight);
      //       console.log('Matched' + this.bayList[index].bayId + ' ' + bay.id);
      //     }
      //   }
    });
  }

  // pushing flights to particular bay and storing the detalis
  mapAllBay(bay: any, flight: any, value: any) {
    let flightArray = [];
    this.fullFlightData = flight;
    for (let index = 0; index < flight.length; index++) {
      const element = flight[index];
      let assigned = 0;
      for (let ind = 0; ind < bay.length; ind++) {
        const ele = bay[ind];
        if (ele.id === element.bayId) {
          bay[ind].list.push(element);
          assigned = 1;
        }
      }
      if (assigned === 0) {
        flightArray.push(element);
      }
    }
    this.bayList = this.appService.sortNumber(bay, 'bayCode');
    if (value == '0') {
      this.todayFlightData = flightArray;
    } else {
      this.nextDayFlightData = flightArray;
    }
    this.load = false;
    this.todayState = 'TODAY';
  }


  listenSocket() {
    /// MQTT topic for task assigned count
    let mqtttopicTaskcount = this.currentStation.code + this.appUrl.getMqttTopic('TASK_ASSIGN_COUNT');
    this.mqttService.observe(mqtttopicTaskcount, { qos: 0 }).subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
      let object = JSON.parse(this.message);
      this.setactualcount(object, this.todayFlightData)
      this.setactualcount(object,this.nextDayFlightData)
    })

    // MQTT topic for task completed count
    let taskComplete = this.currentStation.code + this.appUrl.getMqttTopic('TASK_COMPLETE');
    this.mqttService.observe(taskComplete, { qos: 1 }).subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
      let object = JSON.parse(this.message);
      this.setactualtiming(object, this.fullFlightData)
      this.setactualtiming(object, this.todayFlightData)
    })
  }

  // once MQTT done updating the actual taskcompleted task count
  setactualtiming(arr, object) {
    for (let index = 0; index < object.length; index++) {
      let element = object[index];
      if (arr.data) {
        if (element.flightSchedulesId == arr.data.flightSchedulesId && arr.data.taskActualEndTime != null) {
          element.taskCompletedCount = arr.data.taskCompletedCount;
        }
      }
    }
  }

  // once MQTT done updating the actual task assignment count.
  setactualcount(arr, object) {
    for (let index = 0; index < object.length; index++) {
      let element = object[index];
      if (arr.data) {
        if (element.flightSchedulesId == arr.data.flightSchId) {
          element.taskAssignedCount = arr.count;
        }
      }
    }
  }
}