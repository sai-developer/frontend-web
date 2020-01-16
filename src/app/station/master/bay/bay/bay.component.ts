import { Component, OnDestroy, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import * as momentzone from 'moment-timezone';
import { ApiService } from '../../../../service/app.api-service';
import { AppService } from '../../../../service/app.service';
import { AppUrl } from '../../../../service/app.url-service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../service/app.service';
import { CommonData } from '../../../../service/common-data';

@Component({
  templateUrl: './bay.component.html',
  styleUrls: ['./bay.component.scss']
})


export class BayComponent implements OnInit, OnDestroy {
  // Initializing variables requireed for the page
  bay: any = {};
  bayCopy: any = {};
  zone = 'Europe/Dublin';
  userId = 1;
  mode: any;
  currentStation: any;
  constants: any;
  bayType: any;
  @ViewChild('form') form: HTMLFormElement;
  // Custom validators for  Add/Edit form fields
  profileForm = this.fb.group({
    bayType: ['', [Validators.required]],
    bayCode: ['', [Validators.required]],
  });


  constructor(private services: ApiService, private AppUrl: AppUrl, private dialogRef: MatDialogRef<BayComponent>,
    @Inject(MAT_DIALOG_DATA) public details: any, private auth: AuthService,
    private appService: AppService, private fb: FormBuilder, private common: CommonData) {
    this.currentStation = {
      'id': this.auth.user.userAirportMappingList[0].id,
      'userId': this.auth.user.id, 'code': this.auth.user.userAirportMappingList[0].code
    }
    if (this.details.bay) {
      const bay = {
        id: this.details.bay.id,
        bayType: this.details.bay.bayType,
        bayCode: this.details.bay.bayCode,
        airportId: {
          id: ''
        }
      }
      this.touchTime(bay);
      this.bay = bay;
    }
    this.dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.constants = this.common;
    this.bayType = this.constants.bayType;
  }
  ngOnDestroy() {
    this.appService.addBtn.next(false);
  }

  // setData(data) {
  //   let bay_type = (this.bay.bayCode).toUpperCase();
  //   const bay = {
  //     id: this.bay.id,
  //     bayType: this.bay.bayType,
  //     bayCode: bay_type,
  //     airportId: {
  //       id: ''
  //     }
  //   }
  //   this.touchTime(bay);
  //   this.bay = bay;
  // }

  onSubmit() {
    this.addBay();
  }

  bayCodeChange() {
    let onlyAlpha = /^[a-zA-Z]*$/g;
    let onlyAlphaNumeric = /^[a-zA-Z0-9]*$/g;
    let isValidPattern = onlyAlphaNumeric.test(this.bay.bayCode) && !onlyAlpha.test(this.bay.bayCode);
    if (!isValidPattern) {
      this.form.form.controls['bayCode'].setErrors({ 'pattern': true });
    }
  }
  // POST call Function to Add a new bay
  addBay() {
    this.dialogRef.close('RELOAD');
    let bay_type = (this.bay.bayCode).toUpperCase();
    const bay = {
      id: this.bay.id,
      bayType: this.bay.bayType,
      bayCode: bay_type,
      airportId: {
        id: ''
      }
    }
    this.touchTime(bay);
    this.bay = bay;
    this.services.create(this.AppUrl.geturlfunction('BAY_NUMBER_CREATE'), bay).subscribe(res => {
      if (res.status === true) {
        this.closeModal();
        this.appService.showToast('BAY_CREATE', bay.bayCode, 'success');
        this.appService.action.next('REFRESH');
      } else {
        if (res.errorMessage.includes('duplicate') === true) {
          this.appService.showToast('BAY_DUPLICATE', bay.bayCode, 'warning');
        } else {
          this.appService.showToast('APP_ERROR', '', 'warning');
        }
      }
    }, error => {
      this.appService.showToast('APP_ERROR', '', 'warning');
    });
  }
// UPDATE call function to update existing bay details
  updateBay() {
    this.dialogRef.close('RELOAD');
    const bay = this.bay;
    this.touchTime(bay);
    this.services.create(this.AppUrl.geturlfunction('BAY_NUMBER_UPDATE'), bay).subscribe(res => {
      if (res.status === true) {
        this.closeModal();
        this.appService.showToast('BAY_UPDATE', bay.bayCode, 'success');
        this.appService.action.next('REFRESH');
      } else {
        if (res.errorMessage.includes('duplicate') === true) {
          this.appService.showToast('BAY_DUPLICATE', bay.bayCode, 'warning');
        } else {
          this.appService.showToast('APP_ERROR', '', 'warning');
        }
      }
    }, error => {
      this.appService.showToast('APP_ERROR', '', 'warning');
    });
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

  closeModal() {
    this.dialogRef.close();
  }
}
