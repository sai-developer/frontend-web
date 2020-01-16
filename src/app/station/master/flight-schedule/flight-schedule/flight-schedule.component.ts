import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import * as momentzone from 'moment-timezone';
import * as moment from 'moment';
import { ApiService } from '../../../../service/app.api-service';
import { AppService, AuthService } from '../../../../service/app.service';
import { AppUrl } from '../../../../service/app.url-service';
import { ToastrService, GlobalConfig } from 'ngx-toastr';
import { ToastComponent } from '../../../../toast/toast.component';
import { FormControl, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core'
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { AddFlight } from './flight-schedule-add.class';
import { add } from 'ngx-bootstrap/chronos/moment/add-subtract';
import { CommonData } from '../../../../service/common-data';

// Inbuild Formats/Options for the Material date picker
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
  selector: 'flight-schedule',
  templateUrl: './flight-schedule.component.html',
  styleUrls: ['./flight-schedule.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})

export class flightScheduleComponent implements OnInit {
  addFlight = new AddFlight({});
  toasterOptions: GlobalConfig;
  currentStation: any;
  airports: any;
  equipments: any;
  flightTypes = [];
  defaultCode: any = this.common.defaultCode;
  depValid: Boolean = false;
  arrValidation: Boolean = true;
  depNumber: Boolean = false;
  depValidation: Boolean = true;
  timeDiff: Boolean = false;
  sta: any;
  std: any;
  d: any;
  effMin: any;
  minToday: any = momentzone().tz(this.details.currentStation.zone);
  // Initialize array for days of the week
  days: any = [
    { id: 1, name: 'S', flag: false },
    { id: 2, name: 'M', flag: false },
    { id: 4, name: 'T', flag: false },
    { id: 8, name: 'W', flag: false },
    { id: 16, name: 'T', flag: false },
    { id: 32, name: 'F', flag: false },
    { id: 64, name: 'S', flag: false },
  ];
  selDays = [];
  time = [/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/]; // text-mask pattern for the time input field
  constructor(private dialogRef: MatDialogRef<flightScheduleComponent>, @Inject(MAT_DIALOG_DATA) public details: any, private services: ApiService, private auth: AuthService, private appUrl: AppUrl, private appService: AppService, private toastr: ToastrService, private common: CommonData) {
    this.toasterOptions = this.toastr.toastrConfig;
    this.currentStation = { "id": this.auth.user.userAirportMappingList[0].id, "userId": this.auth.user.id, "code": this.auth.user.userAirportMappingList[0].code }
    this.dialogRef.disableClose = true;
  }
  ngOnInit() {
    this.flightTypes = this.common.flightType;
    this.airports = this.details.airports;
    this.equipments = this.details.equipments;
    // condition to check if the Dialog box was called from ADD or EDIT
    if (this.details.mode === 'ADD') {
      // Dialog was called from ADD
    } else {
      // Dialog was called from EDIT
      if (this.details.flight.viewdepFlightNumber) {
        this.details.flight.depFlightNumber = this.details.flight.viewdepFlightNumber.substring(2);
        if (this.details.flight.flightType === 1) {
          this.depNumber = true;
        } else {
          this.depNumber = false;
        }
      }
      if (this.details.flight.viewarrivalFlightNumber) {
        this.details.flight.arrFlightNumber = this.details.flight.viewarrivalFlightNumber.substring(2);
      }
      // Creating/Assigning data to the two way binded fields to prefill the edit Dialog box
      this.addFlight.id = this.details.flight.id;
      this.addFlight.depFlightNumber = this.details.flight.depFlightNumber;
      this.addFlight.standardArrivalTime = this.details.flight.standardArrivalTime ? (momentzone(this.details.flight.standardArrivalTime).tz(this.details.currentStation.zone).format('HH:mm')) : '';
      this.addFlight.standardDepartureTime = this.details.flight.standardDepartureTime ? (momentzone(this.details.flight.standardDepartureTime).tz(this.details.currentStation.zone).format('HH:mm')) : '';
      this.addFlight.effectiveFrom = momentzone(this.details.flight.effectiveFrom).tz(this.details.currentStation.zone);
      this.addFlight.effectiveTo = momentzone(this.details.flight.effectiveTo).tz(this.details.currentStation.zone);
      this.addFlight.origin.id = this.details.flight.origin.id;
      this.addFlight.station = this.details.flight.station;
      this.addFlight.destination.id = this.details.flight.destination.id;
      this.addFlight.frequency = this.details.flight.frequency;
      this.addFlight.equipmentTypeId.id = this.details.flight.equipmentTypeId.id;
      this.addFlight.flightType = this.details.flight.flightType;
      this.addFlight.arrFlightNumber = this.details.flight.arrFlightNumber;
      this.addFlight.flightFrequencyModified = this.details.flight.flightFrequencyModified
      this.days = this.details.flight.freqModified;
      this.selDays = this.details.flight.freqModified;
    }
    this.d = momentzone().tz(this.details.currentStation.zone).startOf('day').format(); // Time stamp of the current day based on user timeZone
    this.effMin = this.d;
  }
  // funtion called when the effective from field is touched
  minDate(date) {
    this.addFlight.effectiveTo = '';
    this.effMin = date;
  }
  // Function called to check time input is in 24hr format
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
  // function to close Dialog box
  closeModal() {
    this.dialogRef.close();
  }
  // function to replace empty spaces in the time field with '0'
  checkZero(data: any, type: any) {
    if (type == 'sta') {
      this.addFlight.standardArrivalTime = data.replace(/_/g, '0');
    } else if (type == 'std') {
      this.addFlight.standardDepartureTime = data.replace(/_/g, '0');
    }
  }
  // funtion called when ADD Form is submitted for API call
  add(data: any) {
    this.dialogRef.close('RELOAD');
    this.addFlight.station = this.details.currentStation.id;
    // condition to check the flight type and remove irrelevant fields
    if (data.flightType === 0) {
      // remove arrival related fields for Base flight
      delete this.addFlight.origin;
      delete this.addFlight.standardArrivalTime;
      delete this.addFlight.arrFlightNumber;
      let sd = data.standardDepartureTime ? data.standardDepartureTime.split(':') : '';
      this.addFlight.standardDepartureTime = momentzone(this.d).tz(this.details.currentStation.zone).add(sd[0], 'hours').add(sd[1], 'minutes').unix() * 1000;
      this.addFlight.depFlightNumber = data.depFlightNumber ? (this.defaultCode + data.depFlightNumber) : '';
    } else if (data.flightType === 3) {
      // remove departure related fields for Terminating flight
      delete this.addFlight.destination;
      delete this.addFlight.standardDepartureTime;
      delete this.addFlight.depFlightNumber;
      let sa = data.standardArrivalTime ? data.standardArrivalTime.split(':') : '';
      this.addFlight.standardArrivalTime = momentzone(this.d).tz(this.details.currentStation.zone).add(sa[0], 'hours').add(sa[1], 'minutes').unix() * 1000;
      this.addFlight.arrFlightNumber = data.arrFlightNumber ? (this.defaultCode + data.arrFlightNumber) : '';
    } else {
      // Else case for Transit/Turnaround flights
      this.addFlight.arrFlightNumber = data.arrFlightNumber ? (this.defaultCode + data.arrFlightNumber) : '';
      this.addFlight.depFlightNumber = data.depFlightNumber ? (this.defaultCode + data.depFlightNumber) : '';
      let sa = data.standardArrivalTime ? data.standardArrivalTime.split(':') : '';
      let sd = data.standardDepartureTime ? data.standardDepartureTime.split(':') : '';
      this.addFlight.standardArrivalTime = momentzone(this.d).tz(this.details.currentStation.zone).add(sa[0], 'hours').add(sa[1], 'minutes').unix() * 1000;
      this.addFlight.standardDepartureTime = momentzone(this.d).tz(this.details.currentStation.zone).add(sd[0], 'hours').add(sd[1], 'minutes').unix() * 1000;
      if ((this.timeDiff) && (this.addFlight.standardArrivalTime)) {
        this.addFlight.standardDepartureTime = this.addFlight.standardDepartureTime + 86400000;
      }
    }
    this.addFlight.effectiveFrom = momentzone(data.effectiveFrom).tz(this.details.currentStation.zone).startOf('day').unix() * 1000;
    this.addFlight.effectiveTo = momentzone(data.effectiveTo).tz(this.details.currentStation.zone).endOf('day').unix() * 1000;
    this.addFlight.frequency = (this.freq ? this.freq : data.frequency);
    // Post call to insert new flight 
    if (this.details.mode == 'ADD') {
      this.services.create(this.appUrl.geturlfunction('FLIGHT_SCHEDULE_DETAILS_CREATE'), this.addFlight).subscribe(res => {
        if (res.status === true) {

          if (this.addFlight.flightType == 0 || this.addFlight.flightType == 1 || this.addFlight.flightType == 2) {
            this.appService.showToast('FLIGHT_CREATE', this.addFlight.depFlightNumber, 'success');

          }
          else if (this.addFlight.flightType == 3) {
            this.appService.showToast('FLIGHT_CREATE', this.addFlight.arrFlightNumber, 'success');

          }

        }
        else {
          if (res.errorMessage.includes('Record already exists') || res.errorMessage.includes('duplicate') === true) {
            this.appService.showToast('FLIGHT_DUPLICATE', '', 'warning');
          }
        }
      }, error => {
        this.appService.showToast('APP_ERROR', '', 'warning');
      });
    }
    else if (this.details.mode == 'EDIT') {
      this.services.create(this.appUrl.geturlfunction('FLIGHT_SCHEDULE_DETAILS_UPDATE'), this.addFlight).subscribe(res => {
        if (res.status === true) {
          if (this.addFlight.flightType == 0 || this.addFlight.flightType == 1 || this.addFlight.flightType == 2) {
            this.appService.showToast('FLIGHT_UPDATE', this.addFlight.depFlightNumber, 'success');
          }
          else if (this.addFlight.flightType == 3) {
            this.appService.showToast('FLIGHT_UPDATE', this.addFlight.arrFlightNumber, 'success');
          }
        }
        else {
          if (res.errorMessage.includes('Record already exists') || res.errorMessage.includes('duplicate') === true) {
            this.appService.showToast('FLIGHT_DUPLICATE', '', 'warning');
          }
        }
      }, error => {
        this.appService.showToast('APP_ERROR', '', 'warning');
      });
    }
  }
  //  function to check the prepopulating of flight number based on the flight type
  checkDepFlight() {
    let depFlight = this.addFlight.depFlightNumber ? this.addFlight.depFlightNumber : '';
    let arrFlight = this.addFlight.arrFlightNumber ? this.addFlight.arrFlightNumber : '';
    if (arrFlight && depFlight) {
      if (this.addFlight.flightType === 2 && (depFlight === arrFlight)) {
        this.depValid = true;
      } else {
        this.depValid = false;
      }
    }
  }
  // function to check the input format of the arrival flight number
  prepopulateflightnumber(type: any, number: any) {
    for (let i = 0; i < number.length; i++) {
      if (i < number.length - 1) {
        if (isNaN(number.charAt(i)) == true) {
          this.arrValidation = false;
          break;
        } else {
          this.arrValidation = true;
        }
      } else {
      }
    }
    if (type === 1) {
      this.depNumber = true;
      this.addFlight.depFlightNumber = number;
    }
  }
  // function to check the input format of the departure flight number
  depflightnumber(number: any) {
    this.depValidation = true;
    for (let i = 0; i < number.length; i++) {
      if (i < number.length - 1) {
        if (isNaN(number.charAt(i)) == true) {
          this.depValidation = false;
          break;
        } else {
          this.depValidation = true;
        }
      } else {
      }
    }
  }
  // function to compare arrival and departure time to predict next day overlap
  checkTime() {
    this.timeDiff = false;
    if (this.addFlight.flightType === 1 || this.addFlight.flightType === 2) {
      let sa = this.addFlight.standardArrivalTime ? this.addFlight.standardArrivalTime.split(':') : '00:00';
      let sd = this.addFlight.standardDepartureTime ? this.addFlight.standardDepartureTime.split(':') : '00:00';
      this.sta = momentzone(this.d).tz(this.details.currentStation.zone).add(sa[0], 'hours').add(sa[1], 'minutes').unix() * 1000;
      this.std = momentzone(this.d).tz(this.details.currentStation.zone).add(sd[0], 'hours').add(sd[1], 'minutes').unix() * 1000;
      if ((this.addFlight.standardDepartureTime) && (this.sta >= this.std)) {
        this.timeDiff = true;
      }
    } else {
      this.timeDiff = false;
    }
  }
  freq: any;
  freqSet: Boolean = false;
  // function called to form the array for freqency of flights
  onChange(data) {
    this.selDays = [];
    for (let i = 0; i < data.length; i++) {
      this.freqSet = true;
      if (data[i].flag == true) {
        this.selDays.push(data[i].id)
        this.freq = 0;
      }
    }
    for (let i = 0; i < this.selDays.length; i++) {
      this.freq += this.selDays[i];
    }
  }
}
