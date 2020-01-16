import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import * as momentzone from 'moment-timezone';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../../service/app.api-service';
import { AppService } from '../../../../service/app.service';
import { AppUrl } from '../../../../service/app.url-service';
import { AuthService } from '../../../../service/app.service';

@Component({
  selector: 'app-aircrafts',
  templateUrl: './aircrafts.component.html',
  styleUrls: ['./aircrafts.component.scss']
})
export class AircraftsComponent implements OnInit {

  constructor(private services: ApiService, private AppUrl: AppUrl, private dialogRef: MatDialogRef<AircraftsComponent>, @Inject(MAT_DIALOG_DATA) public details: any, private auth: AuthService, private appService: AppService, private fb: FormBuilder, ) {
    this.dialogRef.disableClose = true;
  }
  // Initializing variables required for the page
  equipments: any;
  aircraft: any = {};
  textMask = [/[a-z,A-Z,0-9]/, /[a-z,A-Z,0-9]/, '-', /[a-z,A-Z,0-9]/, /[a-z,A-Z,0-9]/, /[a-z,A-Z,0-9]/];  // text-mask pattern for the time input field
  currentStation: any;
  sendData: any;

  @ViewChild('form') form: HTMLFormElement;

  profileForm = this.fb.group({
    eqpType: ['', [Validators.required]],
    registration: ['', [Validators.required]],
  });


  ngOnInit() {
    this.equipments = this.details.equipments;
    this.currentStation = {
      "id": this.auth.user.userAirportMappingList[0].id, "userId": this.auth.user.id, "code": this.auth.user.userAirportMappingList[0].code,
      "timezone": this.auth.user.airport.timezone
    }
    console.log(this.currentStation);
    if (this.details.mode === 'ADD') {
      this.aircraft = {}
    } else {
      this.aircraft.type = this.details.aircraft.typeId.id;
      this.aircraft.tailNumber = this.details.aircraft.tailNumber;
    }
  }
  // function to validate the pattern of the registration field
  registrationCodeChange() {
    let onlyNumeric = /^[0-9-]*$/g;
    let onlyAlphaNumeric = /^[a-zA-Z0-9-]*$/g;
    let isValidPattern = onlyAlphaNumeric.test(this.aircraft.tailNumber) && !onlyNumeric.test(this.aircraft.tailNumber);
    console.log("1", onlyAlphaNumeric.test(this.aircraft.tailNumber));
    console.log("2", !onlyNumeric.test(this.aircraft.tailNumber))

    if (!isValidPattern) {
      this.form.form.controls['registration'].setErrors({ 'pattern': true });
      console.log(isValidPattern);
    }
  }

  closeModal() {
    this.dialogRef.close();
  }
  // POST API call to Add New Aircraft registration
  addReg(data) {
    this.dialogRef.close('RELOAD');
    this.payload(data);
    this.services.create(this.AppUrl.geturlfunction('EQUIPMENT_SERVICE_CREATE'), this.sendData).subscribe(res => {
      console.log(res);
      if (res.status === true) {
        this.closeModal();
        this.appService.showToast('AIRCRAFT_CREATE', this.sendData.tailNumber, 'success');
        this.appService.action.next('REFRESH');
      } else {
        if (res.errorMessage.includes('duplicate') === true) {
          this.appService.showToast('AIRCRAFT_DUPLICATE', this.sendData.tailNumber, 'warning');
        } else {
          this.appService.showToast('APP_ERROR', '', 'warning');
        }
      }
    }, error => {
      this.appService.showToast('APP_ERROR', '', 'warning');
    });
  }
  // UPDATE API call to edit aircraft registration
  updateReg(data) {
    this.dialogRef.close('RELOAD');
    this.payload(data);
    this.sendData.id = this.details.aircraft.id;
    console.log(this.sendData);
    this.services.create(this.AppUrl.geturlfunction('EQUIPMENT_SERVICE_UPDATE'), this.sendData).subscribe(res => {
      console.log(res);
      if (res.status === true) {
        this.closeModal();
        this.appService.showToast('AIRCRAFT_UPDATE', this.sendData.tailNumber, 'success');
        this.appService.action.next('REFRESH');
      } else {
        if (res.errorMessage.includes('duplicate') === true) {
          this.appService.showToast('AIRCRAFT_DUPLICATE', this.sendData.tailNumber, 'warning');
        } else {
          this.appService.showToast('APP_ERROR', '', 'warning');
        }
      }
    }, error => {
      this.appService.showToast('APP_ERROR', '', 'warning');
    });

  }
  // function to form the data payload to be sent to the backend
  payload(data) {
    this.sendData = {
      "active": "Y",
      "createdBy": this.currentStation.userId,
      "createdAt": momentzone().tz(this.currentStation.timezone).unix() * 1000,
      "modifiedBy": this.currentStation.userId,
      "modifiedAt": momentzone().tz(this.currentStation.timezone).unix() * 1000,
      "id": '',
      "tailNumber": data.tailNumber.toUpperCase(),
      "typeId": {
        "active": "Y",
        "createdBy": this.currentStation.userId,
        "createdAt": momentzone().tz(this.currentStation.timezone).unix() * 1000,
        "modifiedBy": this.currentStation.userId,
        "modifiedAt": momentzone().tz(this.currentStation.timezone).unix() * 1000,
        "id": data.type,
        "type": "",
        "description": "",
        "equipmentMasterList": null,
        "flightSchedulesList": null,
        "taskScheduleMasterList": null
      },
      "flightSchedulesList": null
    }
  }

}
