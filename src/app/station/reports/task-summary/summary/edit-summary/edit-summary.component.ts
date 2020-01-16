import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { MatDialog } from '@angular/material';
import { AppService, AuthService } from '../../../../../service/app.service'
import { AppUrl } from '../../../../../service/app.url-service';
import { ApiService } from '../../../../../service/app.api-service';
import * as moment from 'moment';
import * as momentzone from 'moment-timezone';

@Component({
  selector: 'edit-summary',
  templateUrl: './edit-summary.component.html',
  styleUrls: ['./edit-summary.component.scss'],
})

//edit summary modal box
export class EditSummaryComponent implements OnInit {
  summary: any;
  currentStation: any;
  zoneOffset: any;
  zone: any;
  time = [/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/];
  d: any;
  constructor(private dialogRef: MatDialogRef<EditSummaryComponent>, @Inject(MAT_DIALOG_DATA) public details: any, private auth: AuthService, private dialog: MatDialog,
    private services: ApiService, private appUrl: AppUrl, private appService: AppService) {
    this.currentStation = { "id": this.auth.user.userAirportMappingList[0].id, "userId": this.auth.user.id, "code": this.auth.user.userAirportMappingList[0].code }
    this.zoneOffset = this.auth.timeZone;
    this.zone = this.auth.user.airport.timezone;
    this.dialogRef.disableClose=true;
    }

  ngOnInit() {
    this.summary = this.details.data;
    console.log(this.summary);
    this.d = momentzone().tz(this.zone).startOf('day').format();
  }

  //to convert the input text to time param in timepicker
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

  //to check  and replace spaces with zero  in  time input
  checkZero(data: any, type: any) {
    console.log(data, type);
    if (type == 'mstart') {
      this.summary.modStart = data.replace(/_/g, '0');
    } else if (type == 'mend') {
      this.summary.modEnd = data.replace(/_/g, '0');
    }
  }
  mstart: any;
  mend: any;
  updateList: any;
  url: any

  //update call while submitting the edited inputs
  update(postData) {
    if(postData.taskDuration == 0){
      postData.modEnd = postData.modStart;
    }
    if (postData.modStart) {
//      console.log('inside start')
      let ms = postData.modStart.split(':')
      this.mstart = momentzone(this.d).tz(this.zone).add(ms[0], 'hours').add(ms[1], 'minutes').unix() * 1000;
    } else { }
    if (postData.modEnd) {
  //    console.log('inside end')
      let me = postData.modEnd.split(':')
      this.mend = momentzone(this.d).tz(this.zone).add(me[0], 'hours').add(me[1], 'minutes').unix() * 1000;
    } else { }
    if (postData.taskStatusId) {
      this.url = 'TASK_STATUS_UPDATE'
    }
    else {
      this.url = 'TASK_STATUS_CREATE'
    }
    console.log(postData.taskStatusId);
    this.updateList = {
      "id": postData.taskStatusId,
      "resourceMappingId": {
        "id": postData.resourceMappingId
      },
      "mStartTime": this.mstart || '',
      "mEndTime": this.mend || '',
      "delayReason": null,
      "active": "Y",
      "skipped": postData.taskSkipped,
      "aStartTime": postData.taskActualStartTime,
      "aEndTime": postData.taskActualEndTime,
      "modifiedBy": this.currentStation.id,
      "createdBy": this.currentStation.id
    }
    console.log(this.url)
    this.dialogRef.close();
    this.services.create(this.appUrl.geturlfunction(this.url), this.updateList).subscribe(res => {
      if (res.status === true) {
        this.summary.taskModifiedStartTime = this.updateList.mStartTime ? this.updateList.mStartTime : '';
        this.summary.taskModifiedEndTime = this.updateList.mEndTime ? this.updateList.mEndTime : '';
        this.summary.modStart = (this.summary.taskModifiedStartTime ? (momentzone(this.summary.taskModifiedStartTime).tz(this.zone).format('HH:mm')) : '');
        this.summary.modEnd = (this.summary.taskModifiedEndTime ? (momentzone(this.summary.taskModifiedEndTime).tz(this.zone).format('HH:mm')) : '');
        this.appService.showToast('SUMMARY_UPDATE', '', 'success');
        // this.router.navigate(['/station/flifo/bay']);
      }
    }, error => {
      this.appService.showToast('APP_ERROR', '', 'warning');
    });
  }
}