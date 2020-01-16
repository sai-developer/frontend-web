import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { AuthService, AppService } from '../../../service/app.service';
import { ActivatedRoute, Router } from "@angular/router";
import { AppUrl } from '../../../service/app.url-service';
import { ApiService } from '../../../service/app.api-service';
import * as momentzone from 'moment-timezone';
import {
  IMqttMessage,
  MqttModule,
  IMqttServiceOptions,
  MqttService
} from 'ngx-mqtt';

@Component({
  selector: 'app-gantt-chart-matrix',
  templateUrl: './gantt-chart-matrix.component.html',
  styleUrls: ['./gantt-chart-matrix.component.scss',
    '../gantt_chart/gantt-chart.component.scss']
})
export class GanttChartMatrixComponent implements OnInit {
  // Initialize variables required for the page
  testData: any = [];
  taskList: any = [];
  currentStation: any;
  zoneOffset: any;
  state: any;
  flightsList: any;
  start: any;
  end: any;
  flexValue: any;
  load: any;
  constructor(
    private appService: AppService,
    private router: Router,
    private appUrl: AppUrl,
    private services: ApiService,
    private auth: AuthService,
    private mqttService: MqttService) {
    this.currentStation = {
      "id": this.auth.user.userAirportMappingList[0].id,
      "code": this.auth.user.userAirportMappingList[0].code,
      "timezone": this.auth.user.airport.timezone
    };
    this.zoneOffset = this.auth.timeZone;
  }

  ngOnInit() {
    this.load = true;
    this.getTaskNames();
    this.getFlights();
    this.listenSocket();
    this.appService.search.next('FILTER');
  }

  ngOnDestroy() {
    this.appService.search.next(' ');
  }

  // function to initiate process of listening to MQTT
  listenSocket() {
    let taskComplete = this.currentStation.code + this.appUrl.getMqttTopic('TASK_COMPLETE');
    this.mqttService.observe(taskComplete, { qos: 0 }).subscribe((message: IMqttMessage) => {
      let data = message.payload.toString();
      let object = JSON.parse(data);
      console.log('this is the socket response', object);
      this.getTaskNames();
      this.getFlights();
    })
  }
  // to navigate to live-status
  backToLive() {
    this.router.navigate(['/station/flifo/live_status']);
  }
  // GET API to fetch list of tasks available
  getTaskNames() {
    this.services.getAll(this.appUrl.geturlfunction('GET_TASK_MASTERLIST')).subscribe(res => {
      this.taskList = res.data;
      this.taskList = this.appService.sortNumber(res.data, 'id');
      let count = this.taskList.length;
      console.log(this.taskList);
      let percent = 91 / count;
      this.flexValue = percent;
    });
  }
  fltLength: any;
  // GET API to fetch list of flights available for the day
  getFlights() {
    this.services.getAll(this.appUrl.geturlfunction('MATRIX_GET')).subscribe(res => {
      this.flightsList = res.data;
      this.fltLength = this.flightsList ? this.flightsList.length : 0;
      console.log(this.flightsList);
      this.timeCalc();
    })
  }

  // threshold/color calculation start
  timeCalc() {
    for (let i = 0; i < this.fltLength; i++) {
      var flt = this.flightsList[i];
      var task = this.flightsList[i].tasks;
      for (let j = 0; j < task.length; j++) {
        let ts = task[j];
        var stime, etime, actualStart, actualEnd, classname, tRef, contentdiv, contentdivs, leftcontent, startTimes, endTimes, pstime, petime, classnames;

        let obj = this.getStartEndTime(this.flightsList);
        let current_start_time = obj.ata ? obj.ata : obj.eta ? obj.eta : obj.sta;
        let current_end_time = obj.atd ? obj.atd : obj.etd ? obj.etd : obj.std;
        this.start = momentzone(current_start_time).tz(this.currentStation.timezone).toDate();
        this.end = momentzone(current_end_time).tz(this.currentStation.timezone).toDate();
        // section 1
        if (flt.standardArrivalTime) {
          actualStart = ts.standardArrivalTime;
        }
        if (flt.standardArrivalTime === null) {
          console.log('inside the actual start block');
          actualStart = momentzone(current_start_time).tz(this.currentStation.timezone).subtract(5, 'minutes').toDate();
        }
        if (flt.estimatedArrivalTime) {
          actualStart = flt.estimatedArrivalTime;
        }
        if (flt.actualArrivalTime) {
          actualStart = flt.actualArrivalTime;
        }
        if (flt.standardDepartureTime) {
          actualEnd = flt.standardDepartureTime;
        }
        if (flt.standardDepartureTime == null) {
          console.log('inside the actual end block')
          actualEnd = momentzone(current_end_time).tz(this.currentStation.timezone).subtract(5, 'minutes').toDate();
        }
        if (flt.estimatedDepartureTime) {
          actualEnd = flt.estimatedDepartureTime;
        }
        // section 2
        if (flt.standardArrivalTime) {
          startTimes = this.convertTimeFromValue(flt.standardArrivalTime, flt.standardDepartureTime, ts.arrivalDepartureType, ts.activityStartTime)
        }
        if (flt.standardArrivalTime === null) {
          startTimes = this.convertTimeFromValue(this.start, flt.standardDepartureTime, ts.arrivalDepartureType, ts.activityStartTime)
        }
        if (flt.estimatedArrivalTime) {
          let endvalue;
          endvalue = flt.estimatedDepartureTime;
          if (flt.estimatedDepartureTime == null) {
            endvalue = flt.standardDepartureTime
          }
          startTimes = this.convertTimeFromValue(flt.estimatedArrivalTime, endvalue, ts.arrivalDepartureType, ts.activityStartTime)
        }

        if (flt.actualArrivalTime && ts.taskName !== "Chocks on" && ts.taskName !== "Chocks off") {
          let endvalue;
          if (flt.actualDepartureTime == null || flt.actualDepartureTime) {
            endvalue = flt.estimatedDepartureTime
          }

          //incase of  etd was null
          if (ts.estimatedDepartureTime == null) {
            endvalue = ts.standardDepartureTime
          }

          startTimes = this.convertTimeFromValue(flt.actualArrivalTime, endvalue, ts.arrivalDepartureType, ts.activityStartTime)
        }
        if (flt.actualArrivalTime && ts.taskName == "Chocks on") {
          let endvalue;
          if (flt.actualDepartureTime == null || flt.actualDepartureTime) {
            endvalue = flt.estimatedDepartureTime
          }
          startTimes = this.convertTimeFromValue(flt.standardArrivalTime, endvalue, ts.arrivalDepartureType, ts.activityStartTime)
        }
        if (flt.standardDepartureTime) {
          endTimes = momentzone(startTimes).tz(this.currentStation.timezone).add(ts.taskDuration, 'minutes').toDate()
        }
        if (flt.estimatedDepartureTime) {
          endTimes = momentzone(startTimes).tz(this.currentStation.timezone).add(ts.taskDuration, 'minutes').toDate()
        }
        if (flt.actualDepartureTime && ts.taskName !== "Chocks on" && ts.taskName !== "Chocks off") {
          endTimes = momentzone(startTimes).tz(this.currentStation.timezone).add(ts.taskDuration, 'minutes').toDate()
        }

        if (flt.standardDepartureTime == null && flt.estimatedDepartureTime == null && flt.actualDepartureTime == null) {
          endTimes = momentzone(startTimes).tz(this.currentStation.timezone).add(ts.taskDuration, 'minutes').toDate()
        }
        // section 3
        let ethold, sthold;
        if (momentzone(startTimes).isSame(endTimes)) {
          sthold = momentzone(startTimes).add(30, 'seconds').toDate()
          ethold = momentzone(endTimes).add(30, 'seconds').toDate()
        } else {
          let d = ts.taskDuration * 0.1
          sthold = momentzone(startTimes).add(d, 'minutes').toDate()
          ethold = momentzone(endTimes).add(d, 'minutes').toDate()
        }
        if (ts.taskActualStartTime && ts.taskActualEndTime) {
          stime = momentzone(ts.taskActualStartTime).tz(this.currentStation.timezone).toDate();
          etime = momentzone(ts.taskActualEndTime).tz(this.currentStation.timezone).toDate();
          ts.state = 'plan';
          if (momentzone(etime).diff(endTimes) <= 0) {
            classname = 'save';
            ts.state = classname
          }
          if (momentzone(etime).diff(endTimes) > 0 && momentzone(etime).diff(ethold) <= 0) {
            classname = 'warning';
            ts.state = classname
          }
          if (momentzone(etime).diff(ethold) > 0) {
            classname = 'delay';
            ts.state = classname
          }
          if (ts.taskSkipped == 1) {
            ts.state = 'skipped'
          }
          if (ts.taskActualEndTime && ts.taskActualStartTime) {
            ts.complete = true
          }
        }
        if (ts.taskActualStartTime && ts.taskActualEndTime == null) {
          if (ts.arrivalDepartureType == 1) {
            var planS = momentzone(actualStart).tz(this.currentStation.timezone).add(ts.activityStartTime, 'minutes').toDate();
            var planE = momentzone(planS).tz(this.currentStation.timezone).add(ts.taskDuration, 'minutes').toDate();
          }
          if (ts.arrivalDepartureType == 0) {
            var planS = momentzone(actualEnd).tz(this.currentStation.timezone).subtract(ts.activityStartTime, 'minutes').toDate();
            var planE = momentzone(planS).tz(this.currentStation.timezone).add(ts.taskDuration, 'minutes').toDate();
          }
          let actualTask = momentzone(ts.taskActualStartTime).tz(this.currentStation.timezone).toDate();
          if (actualTask < planS) {
            classname = 'save';
            ts.state = classname
          }
          if (planS < actualTask < sthold) {
            classname = 'save';
            ts.state = classname
          }
          else if (sthold < actualTask < planE) {
            classname = 'warning';
            ts.state = classname
          }
          if (actualTask > planE) {
            classname = 'delay';
            ts.state = classname
          }
        }
      }
    }
    this.load = false;
  }
  convertTimeFromValue(value, actualEnd, scheduleType, Timing): any {
    let stnTiming = momentzone(value).tz(this.currentStation.timezone).toDate()
    let depTiming = momentzone(actualEnd).tz(this.currentStation.timezone).toDate()
    let addedMins;
    if (scheduleType == 0) {
      stnTiming = momentzone(depTiming).tz(this.currentStation.timezone).subtract(Timing, 'minutes').toDate()
      1
    } else if (scheduleType == 1) {
      stnTiming = momentzone(stnTiming).tz(this.currentStation.timezone).add(Timing, 'minutes').toDate()

    }
    return stnTiming;
  }
  getStartEndTime(flightData) {
    let obj = {
      sta: flightData.standardArrivalTime,
      std: flightData.standardDepartureTime,
      eta: flightData.estimatedArrivalTime,
      etd: flightData.estimatedDepartureTime,
      ata: flightData.actualArrivalTime,
      atd: flightData.actualDepartureTime
    }
    if (flightData.flightType == 0 || flightData.flightType == 3) {
      if (obj.sta == null) {
        obj.sta = momentzone(obj.std).tz(this.currentStation.timezone).subtract(60, 'minutes').unix() * 1000;
      }
      if (obj.std == null) {
        obj.std = momentzone(obj.sta).tz(this.currentStation.timezone).add(60, 'minutes').unix() * 1000;
      }
      if (obj.eta == null) {
        obj.eta = momentzone(obj.etd).tz(this.currentStation.timezone).subtract(60, 'minutes').unix() * 1000;
      }
      if (obj.etd == null) {
        obj.etd = momentzone(obj.eta).tz(this.currentStation.timezone).add(60, 'minutes').unix() * 1000;
      }
      if (obj.ata == null) {
        obj.ata = momentzone(obj.atd).tz(this.currentStation.timezone).subtract(60, 'minutes').unix() * 1000;
      }
      if (obj.atd == null) {
        obj.atd = momentzone(obj.ata).tz(this.currentStation.timezone).add(60, 'minutes').unix() * 1000;
      }
    }
    return obj
  }
}
