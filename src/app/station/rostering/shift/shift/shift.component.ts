import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import * as moment from 'moment';
import * as momentzone from 'moment-timezone';
import { ApiService } from '../../../../service/app.api-service';
import { AppService } from '../../../../service/app.service';
import { AppUrl } from '../../../../service/app.url-service';
import { OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';
// import { OwlMomentDateTimeModule, OWL_MOMENT_DATE_TIME_ADAPTER_OPTIONS } from 'ng-pick-datetime-moment';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { AuthService } from '../../../../service/app.service';

export const MY_NATIVE_FORMATS = {
  fullPickerInput: { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false },
  datePickerInput: { year: 'numeric', month: 'numeric', day: 'numeric', hour12: false },
  timePickerInput: { hour: 'numeric', minute: 'numeric', hour12: false },
  monthYearLabel: { year: 'numeric', month: 'short' },
  dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
  monthYearA11yLabel: { year: 'numeric', month: 'long' }
};

@Component({
  templateUrl: './shift.component.html',
  styleUrls: ['./shift.component.scss'],
  providers: [
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS }
  ],
})


//modal box for the shifts
export class ShiftComponent implements OnInit {
  shift: any = {};
  zone: any;
  // stationId = 3;
  userId = 1;
  @ViewChild('form') form: HTMLFormElement;
  currentStation: any;
  zoneOffset: any;
  time = [/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/];
  
//Validators for the form
  profileForm = this.fb.group({
    sname: ['', [Validators.required, Validators.minLength(2)]],
    alias: ['', [Validators.required, Validators.maxLength(2), Validators.pattern("[A-Za-z0-9]+")]],
    startTime: ['', [Validators.required]],
    endTime: ['', [Validators.required]],
  });
  d: any;

  constructor(private dialogRef: MatDialogRef<ShiftComponent>, @Inject(MAT_DIALOG_DATA) public details: any, private auth: AuthService, private AppUrl: AppUrl, private services: ApiService, private appService: AppService, private fb: FormBuilder) {
    this.currentStation = { "id": this.auth.user.userAirportMappingList[0].id, "userId": this.auth.user.id, "code": this.auth.user.userAirportMappingList[0].code }
    this.zoneOffset = this.auth.timeZone;
    this.zone = this.auth.user.airport.timezone;
    if (this.details.shift) {
      const shift = {
        id: this.details.shift.id,
        name: this.details.shift.name,
        startTime: momentzone(this.details.shift.startTime).tz(this.zone).format('HH:mm'),
        endTime: momentzone(this.details.shift.endTime).tz(this.zone).format('HH:mm'),
        alias: this.details.shift.alias,
        airportId: {
          id: ''
        }
      }
      this.touchTime(shift);
      this.shift = shift;
    }
    this.dialogRef.disableClose = true;
  }

  ngOnInit() {
    
  }

  shiftNameChange() {
    let onlyNumeric = /^[0-9]*$/g;
    let onlyAlphaNumeric = /^[a-zA-Z0-9]*$/g;
    let isValidPattern = onlyAlphaNumeric.test(this.shift.name) && !onlyNumeric.test(this.shift.name);
    if (!isValidPattern) {
      this.form.form.controls['sname'].setErrors({ 'pattern': true });
    }
  }

  //time validation for input text for time
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

  //to clear the space and replace with 0
  checkZero(data: any, type: any) {
    console.log(data, type);
    if (type == 'mstart') {
      this.shift.startTime = data.replace(/_/g, '0');
    } else if (type == 'mend') {
      this.shift.endTime = data.replace(/_/g, '0');
    }
  }

//function call for the add shifts
  addShift() {
    this.dialogRef.close('RELOAD');
    // Checking if start and end time is equal
    let shiftname = (this.shift.name).toUpperCase();
    let shiftAlias = (this.shift.alias).toUpperCase();
    let end;
    let s = this.shift.startTime.split(":");
    let e = this.shift.endTime.split(":");
    let d = momentzone().tz(this.zone).startOf('day').format()


    if (this.shift.startTime === end) {
      this.shift.startTime = end;
    } else {
      if (momentzone.tz(moment(d).format("YYYY-MM-DD") + ' ' + s[0] + ':' + s[1], this.zone).unix() * 1000 >= momentzone.tz(moment(d).format("YYYY-MM-DD") + ' ' + e[0] + ':' + e[1], this.zone).unix() * 1000) {
        end = momentzone.tz(moment(d).format("YYYY-MM-DD") + ' ' + e[0] + ':' + e[1], this.zone).add(1, 'days').format()
      } else {
        end = momentzone.tz(moment(d).format("YYYY-MM-DD") + ' ' + e[0] + ':' + e[1], this.zone).format();
      }

      const shift = {
        name: shiftname,
        alias: shiftAlias,
        startTime: momentzone.tz(moment(d).format("YYYY-MM-DD") + ' ' + s[0] + ':' + s[1], this.zone).format(),
        endTime: end,
        airportId: {
          id: this.currentStation.id
        }
      }
      this.touchTime(shift);
      this.services.create(this.AppUrl.geturlfunction('SHIFT_SERVICE_CREATE'), shift).subscribe(res => {
        if (res.status === true) {
          this.closeModal();
          this.appService.showToast('SHIFT_CREATE', shift.name, 'success');
          this.appService.action.next('REFRESH');
        } else {
          if (res.errorMessage.includes('shift_not_same') === true) {
            this.appService.showToast('SHIFT_DUPLICATE', shift.name && shift.alias, 'warning');
          } else if (res.errorMessage.includes('shift_name_not_same') === true) {
            this.appService.showToast('SHIFT_DUPLICATE', shift.name, 'warning');
          } else if (res.errorMessage.includes('shift_alias_not_same') === true) {
            this.appService.showToast('SHIFT_DUPLICATE', shift.alias, 'warning');
          } else {
            this.appService.showToast('SHIFT_CREATED', shift.name, 'success');
          }
        }
      }, error => {
        this.appService.showToast('APP_ERROR', '', 'warning');
      });

    }
  }



  closeModal() {
    this.dialogRef.close();
  }

  touchTime(data: any) {
    const newData = data;
    newData.active = 'Y';
    newData.createdBy = this.userId;
    newData.createdAt = momentzone().tz(this.zone).unix();
    newData.modifiedBy = this.userId;
    newData.modifiedAt = momentzone().tz(this.zone).unix();
    newData.airportId.id = this.currentStation.id;
    return newData;
  }

  //function call for the update shifts
  updateShift() {
    this.dialogRef.close('RELOAD');
    let end;
    let s = this.shift.startTime.split(":");
    let e = this.shift.endTime.split(":");
    let d = momentzone().tz(this.zone).startOf('day').format()
    if (momentzone.tz(moment(d).format("YYYY-MM-DD") + ' ' + s[0] + ':' + s[1], this.zone).unix() * 1000 >= momentzone.tz(moment(d).format("YYYY-MM-DD") + ' ' + e[0] + ':' + e[1], this.zone).unix() * 1000) {
      end = momentzone.tz(moment(d).format("YYYY-MM-DD") + ' ' + e[0] + ':' + e[1], this.zone).add(1, 'days').format()
    } else {
      end = momentzone.tz(moment(d).format("YYYY-MM-DD") + ' ' + e[0] + ':' + e[1], this.zone).format();
    }
    const shift = {
      id: this.shift.id,
      name: this.shift.name,
      active: 'Y',
      alias: this.shift.alias,
      startTime: momentzone.tz(moment(d).format("YYYY-MM-DD") + ' ' + s[0] + ':' + s[1], this.zone).format(),
      endTime: end,
      airportId: {
        id: ''
      }
    }
    this.touchTime(shift);
    shift.active = 'Y';
    this.services.create(this.AppUrl.geturlfunction('SHIFT_SERVICE_UPDATE'), shift).subscribe(res => {
      if (res.status === true) {
        this.closeModal();
        this.appService.showToast('SHIFT_UPDATE', shift.name, 'success');
        this.appService.action.next('REFRESH');
      } else {
        if (res.errorMessage.includes('shift_not_same') === true) {
          this.appService.showToast('SHIFT_DUPLICATE', shift.name && shift.alias, 'warning');
        } else if (res.errorMessage.includes('shift_name_not_same') === true) {
          this.appService.showToast('SHIFT_DUPLICATE', shift.name, 'warning');
        } else if (res.errorMessage.includes('shift_alias_not_same') === true) {
          this.appService.showToast('SHIFT_DUPLICATE', shift.alias, 'warning');
        } else {
          this.appService.showToast('SHIFT_UPDATE', shift.name, 'success');
        }
      }
    }, error => {
      this.appService.showToast('APP_ERROR', '', 'warning');
    });
  }
}
