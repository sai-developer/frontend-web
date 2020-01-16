import { Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { AppUrl } from '../service/app.url-service';
import { ApiService } from '../service/app.api-service';
import * as moment from 'moment';
import { AppService, AuthService } from "../service/app.service";
import { TemflightColor } from "../service/app.pipe";
import { FSCGanttChartComponent } from './fsc-ganntchart.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { MatDialog } from '@angular/material';
import * as mz from 'moment-timezone';

import {
  IMqttMessage,
  MqttModule,
  IMqttServiceOptions,
  MqttService
} from 'ngx-mqtt';

declare let vis: any;

@Component({
  selector: 'app-flight-status',
  templateUrl: './flight-status.component.html',
  styleUrls: ['./flight-status.component.scss'],
  providers: [TemflightColor]
})

export class FlightStatusComponent implements OnInit, OnDestroy {

  clikMessage = '';
  actionSubscription: any;

  // Shared chart options
  globalChartOptions: any = {
    responsive: true,
    cutoutPercentage: 70,
    legend: {
      display: false,
      position: 'bottom'
    }

  };
  todayFlights: any = [];
  todayCountOfFlights = {
    totalFlights: 0,
    onGround: 0,
    inAirFlights: 0
  }
  minValue = 0;
  maxValue = 5;
  fscDetails: any;
  // Doughnut chart options
  doughnutChartColors: any[] = [{
    backgroundColor: ['#6cc920', '#e94e2a']
  }];
  doughnutChartLabels: string[] = ['ON TIME PERFORMANCE', 'REPORTABLE DELAY'];
  doughnutChartData: number[] = [91, 9];
  doughnutChartType = 'doughnut';
  doughnutOptions: any = Object.assign({
    elements: {
      arc: {
        borderWidth: 0
      }
    }
  }, this.globalChartOptions);
  checkdata = false;
  zoneOffset: any;
  message: any;
  timeline: any;
  flightstatus: any[] = [];
  stateSubscription: any;
  load: Boolean = false;
  currentStation: { "id": any; "code": any; "timezone": any; };
  constructor(private services: ApiService, private dialog: MatDialog, private appService: AppService, private auth: AuthService, private flycolor: TemflightColor, private AppUrl: AppUrl, private mqttService: MqttService) {
    this.zoneOffset = this.auth.timeZone,
      this.currentStation = {
        "id": this.auth.user.userAirportMappingList[0].id,
        "code": this.auth.user.userAirportMappingList[0].code,
        "timezone": this.auth.user.airport.timezone
      };
  }

  schedules: any = {
    groups: [],
    items: []
  };

  ngOnInit() {
    this.getFSCDashboardDetails('all');
    this.appService.uploadBtn.next(true);
    this.getFlightStatusByFSC();
    this.appService.uploadBtn.next(true);
    this.listenSocket();
    this.subscribeActions();
    this.appService.search.next('FILTER');
    console.log(this.zoneOffset)
  }
  //function call for event subscription from station layout
  subscribeActions() {
    this.actionSubscription = this.appService.action.subscribe((action) => {
      if (action === 'REFRESH') {
        this.getFSCDashboardDetails('all');
        this.appService.uploadBtn.next(true);
        this.getFlightStatusByFSC()
        this.appService.uploadBtn.next(true);
      }
    });

    //subscription call to clear the timeline after mayfly  upload
    this.stateSubscription = this.appService.clear.subscribe((action) => {
      if (action == 'CLEAR') {
        this.clearTimeline();
      }
    })
  }

  //function  call to destroy event subscription
  ngOnDestroy() {
    this.appService.uploadBtn.next(false);
    this.appService.search.next(' ');
  }
  //api response call for the fsc otp percentage
  getFSCDashboardDetails(value) {
    this.services.getAll(this.AppUrl.geturlfunction('FSC_BY_ALL') + value).subscribe(res => {
      this.fscDetails = res.data;
      this.fscDetails.delay_percentage = Math.round(this.fscDetails.delay_percentage);
      this.fscDetails.ontime_percentage = Math.round(this.fscDetails.ontime_percentage);
      if (this.fscDetails !== null) {
        this.checkdata = true;
      }
    }, error => {
      console.log('error')
    });
  }

  //api response call for the total number of flights
  getFlightStatusByFSC() {
    this.load = true;
    this.services.getAll(this.AppUrl.geturlfunction('FLIGHT_STATUS_V2')).subscribe(res => {
      this.todayCountOfFlights = res.flightDetails;
      this.todayFlights = res.data;
      this.createGroups()
    }, error => {
      console.log('error')
    });
  }


  //subscription call for the mqtt topics (chocks off)
  listenSocket() {
    let taskComplete = "+" + this.AppUrl.getMqttTopic('TASK_COMPLETE');
    console.log(taskComplete);
    this.mqttService.observe(taskComplete, { qos: 1 }).subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
      let object = JSON.parse(this.message);
      console.log(object);
      if (object.data.taskName == "Chocks off") {
        this.getFSCDashboardDetails("all");
      }
    }
      , error => {
        console.log('error')
      });
  }


  clearTimeline() {
    window.location.reload();
  }

  //gantt chart code
  createGroups() {

    for (var index = 0; index < this.todayFlights.length; index++) {
      var element = this.todayFlights[index];
      if (element.regNumber !== null) {
        this.schedules.groups.push({
          id: element.id,
          content: '<div class="i-flight-detail">' +
            '<div class="fs-acc-icon inline-block" "arrange" ><img src="assets/images/tail.png"></div>' +
            '<div class="fs-tail-no inline-block" "arrange">' + element.regNumber + '<br><span>' + element.eqpType + '</span></div>' +
            '<div class="fs-route-info m-r-50 inline-block" (click)="callTest()">' +
            '<span class="fs-cur-route">' + element.crossedRoutes + '</span>' +
            '<span class="fs-tot-route"> /' + element.totalRoutes + '</span>' +
            '<br>' +
            '<span class="fs-routes">ROUTES</span>' +
            '</div>'
        })
        console.log(element);
        for (var j = 0; j < element.flightBystation.length; j++) {
          var element1 = element.flightBystation[j];
          let flightClr = this.flycolor.transform(element1);
          var element2 = element.flightBystation[j + 1];
          let current_start_time;
          let current_end_time;
          let dummy_start_time;
          let dummy_end_time;
          //console.log("regNumberEle2",element.regNumber);
          if (element2 !== undefined) {
            dummy_end_time = (element2.ata) ? element2.ata : (element2.eta) ? element2.eta : element2.sta;
          }
          current_start_time = (element1.ata) ? element1.ata : (element1.eta) ? element1.eta : element1.sta;
          current_end_time = (element1.atd) ? element1.atd : (element1.etd) ? element1.etd : element1.std;

          if (element2 !== undefined) {
            dummy_end_time = (element2.ata) ? element2.ata : (element2.eta) ? element2.eta : element2.sta;
          }
          current_start_time = (element1.ata) ? element1.ata : (element1.eta) ? element1.eta : element1.sta;
          current_end_time = (element1.atd) ? element1.atd : (element1.etd) ? element1.etd : element1.std;
          if (element1.depFlightNumber !== null) {
            dummy_start_time = current_end_time;
          }
          if (element1.flightType == 3) {
            element1.depFlightNumber = element1.arrFlightNumber
          }
          let flightArrivalColor = 'dot-left-' + flightClr.arrColor + ''
          let flightDepColor = 'dot-right-' + flightClr.depColor + ''
          if(element1.completedTask == null){
            element1.completedTask = 0
          }
          if(element1.totalTask == null){
            element1.totalTask = 0
          }
          this.schedules.items.push({
            id: element1.id,
            group: element.id,
            // start:new Date(),
            flightdetails: element1,
            start: moment(current_start_time).toDate(),
            end: moment(current_end_time).toDate(),
            // end: date.setHours(date.getHours() + 2 + Math.floor(Math.random()*4)),
            content: '<div class="fs-location inline-block"><span class=' + flightArrivalColor + '></span>' + element1.code + '<span class=' + flightDepColor + '></span><br><span class="task-count">' + element1.completedTask + '/' + element1.totalTask + '</span></div>',
            className: element1.colorForTask
          },
            {
              id: '_' + Math.random().toString(36).substr(2, 9),
              group: element.id,
              // start:new Date(),
              start: moment(dummy_start_time).toDate(),
              end: moment(dummy_end_time).toDate(),
              // end: date.setHours(date.getHours() + 2 + Math.floor(Math.random()*4)),
              content: '<div class="fs-dummy inline-block">' +
                '<span class="link">' +
                // '<mat-icon class="mat-icon material-icons" role="img" aria-hidden="true">flight_takeoff</mat-icon><br>'+
                '<span class="flt-no">' + element1.depFlightNumber + '</span></div>' +
                '</span>',
              className: 'transparent'
            }
          )
        }
      }
    }
    console.log(this.schedules)
    this.createTimeline();
    this.load = false;
  }


  // specify options
  options = {
    stack: false,
    // verticalScroll: true,
    // zoomKey: 'ctrlkey',
    // moveable: true,
    // maxHeight: 200,
    start: moment().startOf('day').toDate(),
    end: moment().endOf('day').toDate(),
    min: (moment().startOf('day').subtract(1, 'days').toDate()),
    max: moment().endOf('day').add(1, 'days').toDate(),
    editable: false,
    moment: function (date) {
      return date
    },
    zoomMin: (1000 * 60 * 15),
    zoomMax: (1000 * 60 * 30 * 24),
    margin: {
      item: 15, // minimal margin between items
      axis: 5   // minimal margin between items and the axis
    },
    orientation: 'top'
  };

  createTimeline() {
    // create a Timeline
    const _self = this;
    setTimeout(function () {
      let container = document.getElementById('mytimeline');
      _self.options.moment = function (date) {
        return vis.moment(date).utcOffset(_self.zoneOffset);
      };
      _self.timeline = new vis.Timeline(container, null, _self.options);
      var tc = mz(localStorage.getItem('userTime')).tz(_self.currentStation.timezone).unix() * 1000;
      _self.timeline.setCurrentTime(tc);
      _self.timeline.setGroups(_self.schedules.groups);
      _self.timeline.setItems(_self.schedules.items);
      //console.log("schedulesItem",_self.schedules.items);
      // _self.timeline.on('select', function (event) {
      //   let start = this.itemsData._data[event.items].start,
      //     end = this.itemsData._data[event.items].end,
      //     id = this.itemsData._data[event.items].id,
      //     flightDet = this.itemsData._data[event.items].flightdetails
      //   console.log(flightDet)
      //   if (flightDet !== undefined) {
      //     _self.ganttChart(id, start, end, flightDet);
      //   }
      // });

    }, 100)
  }

  ganttChart(id, st, en, flightsdet) {
    console.log(id)
    console.log(st)
    console.log(en)
    console.log(flightsdet)
    if (this.dialog.openDialogs.length == 0) {
      this.dialog.open(FSCGanttChartComponent, {
        position: {
          top: '50px'
        },
        maxHeight: '90vh',
        minHeight: '90vh',
        minWidth: '98vw',
        panelClass: 'ganttChart',
        data: {
          mode: 'ADD',
          flightscheduleID: id,
          start: st,
          end: en,
          flightdetails: flightsdet,
          id: id
        }
      })
    }
  }


}
