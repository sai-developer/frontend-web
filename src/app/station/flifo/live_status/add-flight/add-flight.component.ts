import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';
import { ApiService } from '../../../../service/app.api-service';
import { AppUrl } from '../../../../service/app.url-service';
import { AppService, AuthService } from '../../../../service/app.service';
import * as moment from 'moment';
import * as momentzone from 'moment-timezone';
import { Router } from '@angular/router';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StyleDirective } from '@angular/flex-layout';
import { CommonData } from '../../../../service/common-data';

export const MY_NATIVE_FORMATS = {
  fullPickerInput: { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false },
  datePickerInput: { year: 'numeric', month: 'numeric', day: 'numeric', hour12: false },
  timePickerInput: { hour: 'numeric', minute: 'numeric', hour12: false },
  monthYearLabel: { year: 'numeric', month: 'short' },
  dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
  monthYearA11yLabel: { year: 'numeric', month: 'long' },
};

@Component({
  selector: 'app-add-flight',
  templateUrl: './add-flight.component.html',
  styleUrls: ['./add-flight.component.scss'],
  providers: [
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS },
  ],
})

export class AddFlightComponent implements OnInit {
  // initiallization of variable required for the page
  eqpList: any;
  airports: any;
  bays: any;
  postList: any;
  defaultCode: any = this.common.defaultCode;
  depNumber: Boolean = false;
  arrValidation: Boolean = true;
  depValidation: Boolean = true;
  date: any;
  time = [/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/];
  constants: any;
  depValid: Boolean = false;
  timeDiff: Boolean = false;
  sta: any;
  std: any;

  constructor(private dialogRef: MatDialogRef<AddFlightComponent>, @Inject(MAT_DIALOG_DATA) public details: any, private services: ApiService,
    private appUrl: AppUrl, private appService: AppService, private router: Router, private common: CommonData) { }

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
  ngOnInit() {
    this.constants = this.common;
    this.eqpList = this.details.eqpList;
    this.airports = this.details.airports;
    this.bays = this.details.bays;
    this.postList = {
      active: 'Y',
      createdBy: this.details.currentStation.userId,
      createdAt: momentzone().tz(this.details.currentStation.timezone).unix() * 1000,
      modifiedBy: this.details.currentStation.userId,
      modifiedAt: momentzone().tz(this.details.currentStation.timezone).unix() * 1000,
      date: momentzone().tz(this.details.currentStation.timezone).startOf('day').unix() * 1000,
      id: '',
      origin: {
        id: ''
      },
      arrFlightNumber: '',
      standardArrivalTime: '',
      estimatedArrivalTime: '',
      station: {
        id: this.details.currentStation.id,
      },
      destination: {
        id: '',
      },
      depFlightNumber: '',
      standardDepartureTime: '',
      estimatedDepartureTime: '',
      equipmentTypeId: {
        id: '',
      },
      flightType: null
    };
    this.date = momentzone().tz(this.details.currentStation.timezone).startOf('day').format();
  }

  // function to replace empty spaces in time field with zero
  checkZero(data: any, type: any) {
    if (type == 'sta') {
      this.postList.standardArrivalTime = data.replace(/_/g, '0');
    } else if (type == 'std') {
      this.postList.standardDepartureTime = data.replace(/_/g, '0');
    }
  }

  // adding flight based on flight types & GET API call to add flights
  addFlight(data: any) {
    this.dialogRef.close();
    if (data.flightType === 0) {
      let sd = data.standardDepartureTime.split(':');
      this.postList.standardDepartureTime = momentzone(this.date).tz(this.details.currentStation.timezone).add(sd[0], 'hours').add(sd[1], 'minutes').unix() * 1000;
      delete this.postList.origin;
      delete this.postList.standardArrivalTime;
      delete this.postList.estimatedArrivalTime;
      delete this.postList.arrFlightNumber;
      this.postList.depFlightNumber = this.defaultCode + this.postList.depFlightNumber;
      this.postList.standardDepartureTime = ((momentzone(data.standardDepartureTime).tz(this.details.currentStation.timezone).unix()) * 1000);
      this.postList.estimatedDepartureTime = this.postList.standardDepartureTime;
    } else if (data.flightType === 3) {
      let sa = data.standardArrivalTime.split(':');
      this.postList.standardArrivalTime = momentzone(this.date).tz(this.details.currentStation.timezone).add(sa[0], 'hours').add(sa[1], 'minutes').unix() * 1000;
      console.log(this.postList.standardArrivalTime);
      delete this.postList.destination;
      delete this.postList.standardDepartureTime;
      delete this.postList.estimatedDepartureTime;
      delete this.postList.depFlightNumber;
      this.postList.arrFlightNumber = this.defaultCode + this.postList.arrFlightNumber;
      this.postList.estimatedArrivalTime = this.postList.standardArrivalTime;
    } else {
      let sa = data.standardArrivalTime.split(':');
      let sd = data.standardDepartureTime.split(':');
      this.postList.standardDepartureTime = momentzone(this.date).tz(this.details.currentStation.timezone).add(sd[0], 'hours').add(sd[1], 'minutes').unix() * 1000;
      this.postList.standardArrivalTime = momentzone(this.date).tz(this.details.currentStation.timezone).add(sa[0], 'hours').add(sa[1], 'minutes').unix() * 1000;
      this.postList.arrFlightNumber = this.defaultCode + this.postList.arrFlightNumber;
      this.postList.depFlightNumber = this.defaultCode + this.postList.depFlightNumber;
      this.postList.standardArrivalTime = ((momentzone(data.standardArrivalTime).tz(this.details.currentStation.timezone).unix()) * 1000);
      this.postList.estimatedArrivalTime = this.postList.standardArrivalTime;
      this.postList.standardDepartureTime = ((momentzone(data.standardDepartureTime).tz(this.details.currentStation.timezone).unix()) * 1000);
      this.postList.estimatedDepartureTime = this.postList.standardDepartureTime;
    }
    if (this.timeDiff) {
      this.postList.standardDepartureTime = this.postList.standardDepartureTime + 86400000;
      this.postList.estimatedDepartureTime = this.postList.estimatedDepartureTime + 86400000;
    }
    this.services.create(this.appUrl.geturlfunction('ADD_TODAY_FLIGHT'), this.postList).subscribe(res => {
      if (res.status === true) {1
        // if(flights.flightType == 0 || flights.flightType == 1  || flights.flightType == 2)
        if(this.postList.flightType == 0  || this.postList.flightType ==1  || this.postList.flightType == 2)
        {
        this.appService.showToast('FLIGHT_CREATE', this.postList.depFlightNumber , 'success');
        }
        else if(this.postList.flightType == 3)
        {
          this.appService.showToast('FLIGHT_CREATE', this.postList.arrFlightNumber , 'success');
        }
        this.router.navigate(['/station/flifo/bay']);
      }
      else {
        if (res.errorMessage.includes('duplicate') === true) {
          this.appService.showToast('FLIGHT_DUPLICATE','','warning');
        }
      }
      console.log(res);
    }, error => {
      this.appService.showToast('APP_ERROR', '', 'warning');
    });
  }

  // function called on every key is pressed on flight number input field to chech for validation
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
      this.postList.depFlightNumber = number;
    }
  }

  // function called on every flighttype select input field changes 
  fltTypeChange(fltType: any) {
    if (fltType !== 1) {
      this.depNumber = false;
      this.postList.depFlightNumber = '';
    } else {
      this.depNumber = true;
      this.postList.depFlightNumber = '';
      this.postList.arrFlightNumber = '';
    }
  }

  // function called on every key is pressed on flight number input field to chech for validation
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
  
  // function call to check where arr flignt number and departure flight number are same or different (transit and turnaround)
  checkDepFlight() {
    let depFlight = this.postList.depFlightNumber ? this.postList.depFlightNumber : '';
    let arrFlight = this.postList.arrFlightNumber ? this.postList.arrFlightNumber : '';
    if (arrFlight && depFlight) {
      if (this.postList.flightType === 2 && (depFlight === arrFlight)) {
        this.depValid = true;
      } else {
        this.depValid = false;
      }
    }
  }

  // function to compare arriaval and departure to predict next day overlap
  checkTime() {
    this.timeDiff = false;
    if (this.postList.flightType === 1 || this.postList.flightType === 2) {
      let sa = this.postList.standardArrivalTime ? this.postList.standardArrivalTime.split(':') : '00:00';
      let sd = this.postList.standardDepartureTime ? this.postList.standardDepartureTime.split(':') : '00:00';
      this.sta = momentzone(this.date).tz(this.details.currentStation.timezone).add(sa[0], 'hours').add(sa[1], 'minutes').unix() * 1000;
      this.std = momentzone(this.date).tz(this.details.currentStation.timezone).add(sd[0], 'hours').add(sd[1], 'minutes').unix() * 1000;
      if (this.sta >= this.std) {
        this.timeDiff = true;
      }
    } else {
      this.timeDiff = false;
    }
  }
}
