import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { MatDialog } from '@angular/material';
import { AppService, AuthService } from '../../../../service/app.service'
import { TaskAssignmentComponent } from '../../task-assignment/task-assignment.component';
import { CriticalPathComponent } from '../../critical-path/critical-path-v2-component';
import * as mz from 'moment-timezone';
import { AppUrl } from '../../../../service/app.url-service';
import { ApiService } from '../../../../service/app.api-service';
import { OWL_DATE_TIME_FORMATS, DateTimeAdapter, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import * as moment from 'moment';
import * as _ from 'underscore';
import * as momentzone from 'moment-timezone';
import { addToViewTree } from '@angular/core/src/render3/instructions';
import { addListener } from 'cluster';
import { Router } from '@angular/router';
import {
  IMqttMessage,
  MqttModule,
  IMqttServiceOptions,
  MqttService
} from 'ngx-mqtt';

export const MY_NATIVE_FORMATS = {
  fullPickerInput: { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false },
  datePickerInput: { year: 'numeric', month: 'numeric', day: 'numeric', hour12: false },
  timePickerInput: { hour: 'numeric', minute: 'numeric', hour12: false },
  monthYearLabel: { year: 'numeric', month: 'short' },
  dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
  monthYearA11yLabel: { year: 'numeric', month: 'long' },
};

@Component({
  selector: 'flight_status',
  templateUrl: './flight_status.component.html',
  styleUrls: ['./flight_status.component.scss'],
  providers: [
    { provide: OWL_DATE_TIME_LOCALE, useValue: 'fr' },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS }
  ],
})

export class FlightStatusComponent implements OnInit {
  flight: any;
  currentStation: any;
  zoneOffset: any;
  btnState: any;
  tailNumber: any[] = [];
  updateList: any = {};
  bays: any = {};
  day: any;
  etaMod: any;
  etdMod: any
  ataMod: any;
  atdMod: any;
  tailPrev: any;
  tailNew: any;
  time = [/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/];
  d: any;
  disableAta = false;
  disableAtd = false;
  EtimeDiff: Boolean = false;
  AtimeDiff: Boolean = false;
  disableOption: Boolean = false;
  equipmentChange: boolean;
  equipid: any;
  prevBayCode: any;
  prevBayId: any;
  prevBayType: any;
  currentBayCode: any;
  currentBayType: any;
  flights: any;
  flightcount: any;
  etaCopy: any;
  etdCopy: any;
  ataCopy: any;
  atdCopy: any;
  etaPrev: any;
  etaNext: any;
  etdPrev: any;
  etdNext: any;
  ataNext: any;
  ataPrev: any;
  bayChange: any;
  cancelStatus: any;
  eqpId: any;

  constructor(private router: Router, private dialogRef: MatDialogRef<FlightStatusComponent>, @Inject(MAT_DIALOG_DATA) public details: any, private auth: AuthService, private dialog: MatDialog,
    private services: ApiService, private appUrl: AppUrl, dateTimeAdapter: DateTimeAdapter<any>, private appService: AppService, private mqttService: MqttService) {
    dateTimeAdapter.setLocale('fr');
    this.currentStation = {
      "id": this.auth.user.userAirportMappingList[0].id, "code": this.auth.user.userAirportMappingList[0].code,
      "timezone": this.auth.user.airport.timezone, "userId": this.auth.user.id
    },
      this.zoneOffset = this.auth.timeZone
    this.dialogRef.disableClose = false;
    this.flight = this.details.flightDetails
    this.flight.standardArrivalTime = this.getTime(this.flight.standardArrivalTime)
    this.flight.estimatedArrivalTime = this.getTime(this.flight.estimatedArrivalTime)
    this.flight.actualArrivalTime = this.getTime(this.flight.actualArrivalTime)
    this.flight.standardDepartureTime = this.getTime(this.flight.standardDepartureTime)
    this.flight.estimatedDepartureTime = this.getTime(this.flight.estimatedDepartureTime)
    this.flight.actualDepartureTime = this.getTime(this.flight.actualDepartureTime)
    this.tailPrev = this.flight.equipmentId;
    this.eqpId = this.flight.equipmentTypeId;

    this.cancelStatus = null;
  }

  ngOnInit() {
    this.etaCopy = (this.flight.estimatedArrivalTime ? (momentzone(this.flight.estimatedArrivalTime).tz(this.currentStation.timezone).format('HH:mm')) : '');
    this.etdCopy = (this.flight.estimatedDepartureTime ? (momentzone(this.flight.estimatedDepartureTime).tz(this.currentStation.timezone).format('HH:mm')) : '');
    this.ataCopy = (this.flight.actualArrivalTime ? (momentzone(this.flight.actualArrivalTime).tz(this.currentStation.timezone).format('HH:mm')) : '');
    this.atdCopy = (this.flight.actualDepartureTime ? (momentzone(this.flight.estimatedArrivalTime).tz(this.currentStation.timezone).format('HH:mm')) : '');
    this.btnState = this.details.btnState;
    this.getTailNumber();
    this.bays = this.appService.sortNumber(this.details.bays, 'bayCode');
    this.d = momentzone().tz(this.currentStation.timezone).startOf('day').format();
    this.cancelStatus = this.flight.flight_status;
    if (this.flight.taskAssignedCount == 0) {
      this.disableAta = true;
      this.disableAtd = true;
    }
    if (this.flight.actualDepartureTime) {
      this.disableOption = true;
      this.details.action = false;
    }
    if ((this.flight.actualArrivalTime) && (this.flight.flightType == 3)) {
      this.disableOption = true;
      this.details.action = false;
    }
    if ((!this.flight.actualArrivalTime) && (this.flight.flightType != 0)) {
      this.disableAtd = true;
    }
    this.bayChange = this.flight.bayId;
    this.equipid = this.flight.equipmentId;
    // console.log(this.equipid);
    this.prevBayCode = this.flight.bayCode;
    this.prevBayId = this.flight.bayId;
    this.prevBayType = this.flight.bayType;
  }

  // function call to check time duration from 00 to 23 hrs
  timeCheck(params) {
    if (params == '0_:__') {
      this.time[1] = /[0-9]/;
    }
    if (params == '1_:__') {
      this.time[1] = /[0-9]/;
    }
    if (params == '2_:__') {
      this.time[1] = /[0-3]/;
    }
  }

  // function to replace empty spaces in time field with zero
  checkZero(data: any, type: any) {
    if (type == 'eta') {
      this.etaCopy = data.replace(/_/g, '0');
    } else if (type == 'etd') {
      this.etdCopy = data.replace(/_/g, '0');
    } else if (type == 'ata') {
      this.ataCopy = data.replace(/_/g, '0');
    } else if (type == 'atd') {
      this.atdCopy = data.replace(/_/g, '0');
    }
  }

  // function to convert timestamp format
  getTime(value) {
    if (value) {
      let time = mz(value).utcOffset(this.zoneOffset);
      return time;
    } else {
      return null;
    }

  }

  criticalpath() {
    // console.log(this.details.flightID, this.details.startWindow, this.details.endWindow, JSON.stringify(this.details.flightDetails))
    this.dialog.open(CriticalPathComponent, {
      position: {
        top: '2vh',
        left: '2vh',
        // right: '2vw',
        // bottom: '2vw'
      },
      maxHeight: '98vh',
      minHeight: '98vh',
      minWidth: '98vw',
      maxWidth: '98vw',
      panelClass: 'criticalpath',
      data: {
        mode: 'ADD',
        flightscheduleID: this.details.flightID,
        start: this.details.startWindow,
        end: this.details.endWindow,
        flightdetails: this.details.flightDetails,
      }
    })

  }
  // function call to open task assignment diaog box
  taskAssign() {
    this.dialog.open(TaskAssignmentComponent, {
      position: {
        top: '2vh',
        left: '2vh',
        right: '1vw'
      },
      maxHeight: '96vh',
      minHeight: '96vh',
      minWidth: '99vw',
      maxWidth: '99vw',
      panelClass: 'taskAssign',
      data: {
        mode: 'ADD',
        flightscheduleID: this.details.flightID,
        start: this.details.startWindow,
        end: this.details.endWindow,
        flightdetails: this.details.flightDetails,
      }
    })
  }

  // GET API call 
  getFullFlights() {
    this.services.getAll(this.appUrl.geturlfunction('FLIGHTS_BY_FROM_TO')).subscribe(res => {
      this.flights = res.data;
      this.flightcount = this.flights.filter(
        flight => flight.flightSchedulesId == this.updateList.id);
      const mqttDataCount = { 'count': this.flightcount[0].taskCompletedCount, 'flightSchId': this.flightcount[0].flightSchedulesId };
      const chocks_count = this.currentStation.code + this.appUrl.getMqttTopic("CHOCKS_COUNT");
      this.mqttService.unsafePublish(chocks_count, JSON.stringify(mqttDataCount), { qos: 0, retain: true });
    })
  }

  // function call to navigate to gantt chart page
  ganttChart() {
    // this.router.navigate(['/station/flifo/gantt_chart/', this.details.flightID]); // navigation for the v1 gantt chart
    this.router.navigate(['/station/flifo/gantt_chart_v2/', this.details.flightID]); //navigation for the v2 gantt chart
  }
  // on click outside model - close 
  closeModal() {
    this.dialogRef.close();
  }

  // function call to edit flight time details and on save send a response about the updated flight time details
  editFlight() {
    this.etaPrev = (this.flight.estimatedArrivalTime ? (momentzone(this.flight.estimatedArrivalTime).tz(this.currentStation.timezone).format()) : '');
    this.etdPrev = (this.flight.estimatedDepartureTime ? (momentzone(this.flight.estimatedDepartureTime).tz(this.currentStation.timezone).format()) : '');
    if (this.btnState === 'EDIT') {
      this.btnState = 'SAVE';
      this.etaCopy = (this.flight.estimatedArrivalTime ? (momentzone(this.flight.estimatedArrivalTime).tz(this.currentStation.timezone).format('HH:mm')) : '');
      this.etdCopy = (this.flight.estimatedDepartureTime ? (momentzone(this.flight.estimatedDepartureTime).tz(this.currentStation.timezone).format('HH:mm')) : '');
      this.ataCopy = (this.flight.actualArrivalTime ? (momentzone(this.flight.actualArrivalTime).tz(this.currentStation.timezone).format('HH:mm')) : '');
      this.atdCopy = (this.flight.actualDepartureTime ? (momentzone(this.flight.estimatedArrivalTime).tz(this.currentStation.timezone).format('HH:mm')) : '');

      if (this.ataCopy) {
        this.disableAta = true;
      }

    } else {
      // in case of update
      this.details.action = true;
      if (this.ataCopy) {
        this.disableAta = true;
      } else if (this.atdCopy) {
        this.disableAtd = true;
      }
      let ea = (this.etaCopy ? this.etaCopy.split(':') : '');
      let ed = (this.etdCopy ? this.etdCopy.split(':') : '');
      let aa = (this.ataCopy ? this.ataCopy.split(':') : '');
      let ad = (this.atdCopy ? this.atdCopy.split(':') : '');
      this.etaNext = (this.etaCopy ? ((momentzone(this.d).tz(this.currentStation.timezone).add(ea[0], 'hours').add(ea[1], 'minutes').format())) : null),
        this.etdNext = (this.etdCopy ? ((momentzone(this.d).tz(this.currentStation.timezone).add(ed[0], 'hours').add(ed[1], 'minutes').format())) : null)
      for (let index = 0; index < this.bays.length; index++) {
        if (this.flight.bayId == this.bays[index].id) {
          this.currentBayCode = this.bays[index].bayCode;
          this.currentBayType = this.bays[index].bayType;
        }
      }
      this.updateList = {
        "id": this.flight.flightSchedulesId,
        "estimatedArrivalTime": (this.etaCopy ? ((momentzone(this.d).tz(this.currentStation.timezone).add(ea[0], 'hours').add(ea[1], 'minutes').unix() * 1000)) : null),
        "estimatedDepartureTime": (this.etdCopy ? ((momentzone(this.d).tz(this.currentStation.timezone).add(ed[0], 'hours').add(ed[1], 'minutes').unix() * 1000)) : null),
        "actualArrivalTime": (this.ataCopy ? ((momentzone(this.d).tz(this.currentStation.timezone).add(aa[0], 'hours').add(aa[1], 'minutes').unix() * 1000)) : null),
        "actualDepartureTime": (this.atdCopy ? ((momentzone(this.d).tz(this.currentStation.timezone).add(ad[0], 'hours').add(ad[1], 'minutes').unix() * 1000)) : null),
        "taskScheduleId": {
          "id": (this.flight.taskScheduleId ? this.flight.taskScheduleId : null)
        },
        "bayId": {
          "id": (this.flight.bayId ? this.flight.bayId : null)
        },
        "equipmentId": {
          "id": (this.flight.equipmentId ? this.flight.equipmentId : null)
        },
        "equipmentTypeId": {
          "id": (this.flight.equipmentTypeId ? this.flight.equipmentTypeId : null)
        },
        "modifiedBy": 1,
        "active": "Y",
        "etaChanged": false,
        "ataChanged": false,
        "etdChanged": false,
        "atdChanged": false,
        "eta_flag": null,
        "ataWeb": false,
        "atdWeb": false,
        "bay_changed": false,
        "flight_status": this.cancelStatus,
        "airport": this.currentStation.code,
        "from": momentzone().tz(this.currentStation.timezone).startOf('day').unix() * 1000,
        "to": momentzone().tz(this.currentStation.timezone).endOf('day').unix() * 1000,
        "station": this.currentStation.id,
        "bayObj": {
          "id": (this.flight.bayId ? this.flight.bayId : null),
          "bayCode": this.currentBayCode,
          "bayType": this.currentBayType,
          "airportId": {
            "id": this.currentStation.id,
          }
        },
        "previous_bay": {
          "id": this.prevBayId,
          "bayCode": this.prevBayCode,
          "bayType": this.prevBayType,
          "airportId": {
            "id": this.currentStation.id,
          }
        },
      }
      if ((this.tailPrev !== null) || (this.updateList.equipmentId)) {
        for (let i = 0; i < this.tailNumber.length; i++) {
          if (this.tailNumber[i].id == this.flight.equipmentId) {
            this.updateList.newTail = this.tailNumber[i].tail_number;
          }
        }
      }
      if ((this.updateList.actualArrivalTime && !this.flight.actualArrivalTime) && (this.flight.flightType != 0)) {
        this.updateList.ataChanged = true;
        this.updateList.ataweb = true;
      }
      if ((this.updateList.actualDepartureTime && !this.flight.actualDepartureTime) && (this.flight.flightType != 3)) {
        this.updateList.atdChanged = true;
        this.updateList.atdweb = true;
        this.updateList.ataChanged = false;
        this.updateList.ataweb = false;
      }
      if ((!moment(this.etdNext).isSame(this.etdPrev))) {
        this.updateList.etdChanged = true;
      }
      if ((!moment(this.etaNext).isSame(this.etaPrev))) {
        this.updateList.etaChanged = true;
      }
      if (this.updateList.bayId.id != this.bayChange) {
        this.updateList.bay_changed = true;
      }
      if (this.updateList.equipmentId.id != this.equipid) {
        this.equipmentChange = true;
      }

      if ((this.EtimeDiff) && (this.updateList.estimatedArrivalTime)) {
        this.updateList.estimatedDepartureTime = this.updateList.estimatedDepartureTime + 86400000;
      }
      if ((this.AtimeDiff) && (this.updateList.actualArrivalTime)) {
        this.updateList.actualDepartureTime = this.updateList.actualDepartureTime + 86400000;
      }
      if (this.updateList.estimatedArrivalTime < momentzone().tz(this.currentStation.timezone).unix() * 1000) {
        this.updateList.eta_flag = false
      }
      this.btnState = 'EDIT';
      this.services.create(this.appUrl.geturlfunction('UPDATE_TODAY_FLIGHT'), this.updateList).subscribe(res => {
        if (res.status === true) {
          delete this.updateList.flight_status;

          let etaMessage = {
            "id": this.flight.flightSchedulesId,
            "estimatedArrivalTime": (this.etaCopy ? ((momentzone(this.d).tz(this.currentStation.timezone).add(ea[0], 'hours').add(ea[1], 'minutes').unix() * 1000)) : null),
            "estimatedDepartureTime": (this.etdCopy ? ((momentzone(this.d).tz(this.currentStation.timezone).add(ed[0], 'hours').add(ed[1], 'minutes').unix() * 1000)) : null),
            "newTail": this.updateList.newTail,
            "bayObj": {
              "id": (this.flight.bayId ? this.flight.bayId : null),
              "bayCode": this.currentBayCode,
              "bayType": this.currentBayType,
              "airportId": {
                "id": this.currentStation.id,
              }
            }
          }

          let bayMessage = {
            "id": this.flight.flightSchedulesId,
            "bayId": {
              "id": (this.flight.bayId ? this.flight.bayId : null)
            },
            "bayObj": {
              "id": (this.flight.bayId ? this.flight.bayId : null),
              "bayCode": this.currentBayCode,
              "bayType": this.currentBayType,
              "airportId": {
                "id": this.currentStation.id,
              }
            },
            "previous_bay": {
              "id": this.prevBayId,
              "bayCode": this.prevBayCode,
              "bayType": this.prevBayType,
              "airportId": {
                "id": this.currentStation.id,
              }
            }
          }

          // console.log(JSON.stringify(etaMessage))
          // console.log(JSON.stringify(bayMessage))

          if (this.flight.flightType == 0) {
            if ((!moment(this.etdNext).isSame(this.etdPrev)) || (this.equipmentChange == true)) {
              const eta_etdchange = this.currentStation.code + this.appUrl.getMqttTopic("ETA_ETD_CHANGE");
              this.mqttService.unsafePublish(eta_etdchange, JSON.stringify(etaMessage), { qos: 0, retain: true });
              this.equipmentChange = false;
            }
          } else if (this.flight.flightType == 3) {
            if ((!moment(this.etaNext).isSame(this.etaPrev)) || (this.equipmentChange == true)) {
              const eta_etdchange = this.currentStation.code + this.appUrl.getMqttTopic("ETA_ETD_CHANGE");
              this.mqttService.unsafePublish(eta_etdchange, JSON.stringify(etaMessage), { qos: 0, retain: true });
              this.equipmentChange = false;
            }
          } else {
            if (((!moment(this.etaNext).isSame(this.etaPrev)) || (!moment(this.etdNext).isSame(this.etdPrev))) || (this.equipmentChange == true)) {
              const eta_etdchange = this.currentStation.code + this.appUrl.getMqttTopic("ETA_ETD_CHANGE");
              this.mqttService.unsafePublish(eta_etdchange, JSON.stringify(etaMessage), { qos: 0, retain: true });
              this.equipmentChange = false;
            }
          }

          if (!this.flight.actualArrivalTime && this.flight.flightType != 0 && this.ataCopy) {
            // console.log("ata publish")
            this.getFullFlights();
            this.listenSocket('ata');
          }
          if (!this.flight.actualDepartureTime && this.flight.flightType != 3 && this.atdCopy) {
            // console.log("atd publish")
            this.getFullFlights();
            this.listenSocket('atd');
          }

          if (this.updateList.bayId.id != this.bayChange) {
            let message = {
              "data": bayMessage,
              "status": true
            }
            const bay_change = this.currentStation.code + this.appUrl.getMqttTopic("BAY_CHANGE_NOTIFY");
            this.mqttService.unsafePublish(bay_change, JSON.stringify(message), { qos: 1, retain: true });
            // console.log(bay_change + " bay change topic published")
          }

          this.appService.showToast('FLIGHT_UPDATE', '', 'success');
        }
      }, error => {
        this.appService.showToast('APP_ERROR', '', 'warning');
      });
      this.dialogRef.close(this.updateList.bay_changed);
    }
  }
  // function call for MQTT subscription 
  listenSocket(value) {
    if (value === "ata") {
      if (this.updateList.actualArrivalTime) {
        let message = {
          "flightSchedulesId": this.updateList.id,
          "userId": this.currentStation.userId,
          "actualStartTime": this.updateList.actualArrivalTime
        }
        const web_chockson = this.currentStation.code + this.appUrl.getMqttTopic("WEB_CHOCKS_ON");
        this.mqttService.unsafePublish(web_chockson, JSON.stringify(message), { qos: 0, retain: true });
        // console.log("ata publish")
      }
    }
    else {
      if (this.updateList.actualDepartureTime) {
        let message = {
          "flightSchedulesId": this.updateList.id,
          "userId": this.currentStation.userId,
          "actualEndTime": this.updateList.actualDepartureTime
        }
        const web_chocksoff = this.currentStation.code + this.appUrl.getMqttTopic("WEB_CHOCKS_OFF");
        this.mqttService.unsafePublish(web_chocksoff, JSON.stringify(message), { qos: 0, retain: true });
        // console.log("atd publish")
      }
    }
  }

  // API call to get the registration number
  getTailNumber() {
    // this.services.getAll(this.appUrl.geturlfunction('EQUIPMENT_SERVICE')).subscribe(res => {
    //   this.tailNumber = res.data;
    //   console.log('list of tail numbers', this.tailNumber);
    //   this.tailNumber = this.appService.sortName(this.tailNumber, 'tailNumber');
    // });
    // console.log(this.tailPrev);
    this.services.getAll(this.appUrl.geturlfunction('REG_BY_EQP') + this.eqpId).subscribe(res => {
      // console.log(res.data);
      this.tailNumber = res.data ? res.data : [];
      // console.log('list of tail numbers', this.tailNumber);
      // this.tailNumber = this.appService.sortName(this.tailNumber, 'tailNumber');
    });
  }

  // function to compare arriaval and departure to predict next day overlap
  checkTime(arr, dep, type) {
    if (this.flight.flightType === 1 || this.flight.flightType === 2) {
      if (type == 'etd') {
        this.EtimeDiff = false;
        let ea = (this.etaCopy ? this.etaCopy.split(':') : '');
        let ed = (this.etdCopy ? this.etdCopy.split(':') : '');
        let aa = (this.ataCopy ? this.ataCopy.split(':') : '');
        let ata = momentzone(this.d).tz(this.currentStation.timezone).add(aa[0], 'hours').add(aa[1], 'minutes').unix() * 1000;
        let eta = momentzone(this.d).tz(this.currentStation.timezone).add(ea[0], 'hours').add(ea[1], 'minutes').unix() * 1000;
        let etd = momentzone(this.d).tz(this.currentStation.timezone).add(ed[0], 'hours').add(ed[1], 'minutes').unix() * 1000;
        let value = ata ? ata : eta;
        if (value > etd) {
          this.EtimeDiff = true;
        } else {
          this.EtimeDiff = false;
        }
      } else if (type == 'atd' && this.atdCopy) {
        this.AtimeDiff = false;
        let aa = (this.ataCopy ? this.ataCopy.split(':') : '');
        let ad = (this.atdCopy ? this.atdCopy.split(':') : '');
        let ata = momentzone(this.d).tz(this.currentStation.timezone).add(aa[0], 'hours').add(aa[1], 'minutes').unix() * 1000;
        let atd = momentzone(this.d).tz(this.currentStation.timezone).add(ad[0], 'hours').add(ad[1], 'minutes').unix() * 1000;
        if (ata > atd) {
          this.AtimeDiff = true;
        } else {
          this.AtimeDiff = false;
        }
      }
    }
  }
}
