import { Component, OnInit, Inject } from '@angular/core';
import { AppUrl } from '../../../../service/app.url-service';
import { ApiService } from '../../../../service/app.api-service';
import { AppService } from "../../../../service/app.service";
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { MatDialog } from "@angular/material";
import { MatTableDataSource } from '@angular/material';
import * as moment from 'moment';
import { OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';
import { AuthService } from '../../../../service/app.service';
import {ExcelService} from '../../../../service/excel-service';
// import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import * as momentzone from 'moment-timezone';
import { EditSummaryComponent } from './edit-summary/edit-summary.component';

export const MY_NATIVE_FORMATS = {
    fullPickerInput: { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false },
    datePickerInput: { year: 'numeric', month: 'numeric', day: 'numeric', hour12: false },
    timePickerInput: { hour: 'numeric', minute: 'numeric', hour12: false },
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
};

@Component({
    selector: 'app-summary',
    templateUrl: './summary.component.html',
    styleUrls: ['./summary.component.scss'],
    providers: [
        { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS },
    ],
})

//summary component main  page
export class SummaryComponent implements OnInit {
    displayedColumns: string[] = ['taskName', 'name', 'plannedStartTime', 'plannedEndTime', 'taskActualStartTime', 'taskActualEndTime', 'taskModifiedStartTime', 'taskModifiedEndTime', 'taskDelayNumericCode', 'taskDelayAlphabeticCode', 'taskDelayCodeDescription', 'taskDelayReason'];
    dataSource: MatTableDataSource<''>;
    taskList: any;
    varianceStartFrom: any;
    varianceEndFrom: any;
    currentStation: any;
    zoneOffset: any;
    zone: any;
    state: any = 'VIEW'
    time = [/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/];
    editId: any;
    taskData: any;
    constructor(private services: ApiService, private appService: AppService, private appUrl: AppUrl, private dialogRef: MatDialogRef<SummaryComponent>, @Inject(MAT_DIALOG_DATA) public details: any, private auth: AuthService, private dialog: MatDialog,private excelService:ExcelService) {
        this.currentStation = { "id": this.auth.user.userAirportMappingList[0].id, "userId": this.auth.user.id, "code": this.auth.user.userAirportMappingList[0].code }
        this.zoneOffset = this.auth.timeZone;
        this.zone = this.auth.user.airport.timezone;
    }

    ngOnInit() {
        this.taskData = this.details.taskData;
        this.getTaskSummary();
        this.state = 'VIEW';
         }

    //api  call for getting task summary details
    getTaskSummary() {
        this.services.getAll(this.appUrl.geturlfunction('TASKSCHEDULE_SERVICES') + this.details.flightId).subscribe(res => {
            this.taskList = res.data;
            this.taskList = this.appService.sortNumber(res.data, 'taskSequenceNumber');
            this.calculating(this.taskList)
            for (let i = 0; i < this.taskList.length; i++) {
                this.taskList[i].modStart = (this.taskList[i].taskModifiedStartTime ? (momentzone(this.taskList[i].taskModifiedStartTime).tz(this.zone).format('HH:mm')) : '');
                this.taskList[i].modEnd = (this.taskList[i].taskModifiedEndTime ? (momentzone(this.taskList[i].taskModifiedEndTime).tz(this.zone).format('HH:mm')) : '');
            }
            this.dataSource = new MatTableDataSource(this.taskList);
        }, error => {
            console.log('error');
        })
    }
    //function for calculating planned end time and start time
    calculating(data) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].arrivalDepartureType == 1) {
                let calTime;
                if (data[i].actualArrivalTime != null && data[i].taskName !== "Chocks on") {
                    calTime = data[i].actualArrivalTime;
                } else if (data[i].estimatedArrivalTime != null && data[i].taskName !== "Chocks on") {
                    calTime = data[i].estimatedDepartureTime
                } else {
                    calTime = data[i].standardArrivalTime;
                }
                let du = data[i].activityStartTime * 60 * 1000;
                let s = ((calTime + data[i].activityStartTime * 60 * 1000))
                data[i].plannedStartTime = s;
                console.log(data[i].taskName, calTime, du, s)
                // if(data[i].taskDuration)
                data[i].plannedEndTime = ((data[i].plannedStartTime + data[i].taskDuration * 60 * 1000))
            } else {
                let calTime;
                if (data[i].estimatedDepartureTime != null) {
                    calTime = data[i].estimatedDepartureTime
                } else {
                    calTime = data[i].standardDepartureTime;
                }
                let s1 = ((calTime - data[i].activityStartTime * 60 * 1000))
                data[i].plannedStartTime = s1;
                data[i].plannedEndTime = ((data[i].plannedStartTime + data[i].taskDuration * 60 * 1000))
            }
            // for calculating variance
            if (data[i].taskModifiedStartTime || data[i].taskActualStartTime) {
                if (data[i].taskModifiedStartTime) { this.varianceStartFrom = data[i].taskModifiedStartTime; }
                if (data[i].taskActualStartTime && (data[i].taskModifiedStartTime == null)) {
                this.varianceStartFrom = data[i].taskActualStartTime;
                }
                // data[i].varianceStartTime = (this.varianceStartFrom - data[i].plannedStartTime);
                data[i].varianceStartTime = moment.utc(Math.abs(this.varianceStartFrom - data[i].plannedStartTime)).format('HH:mm');
            } else {
                data[i].varianceStartTime = '-'
            }
            if (data[i].taskModifiedEndTime || data[i].taskActualEndTime) {
                if (data[i].taskModifiedEndTime) { this.varianceEndFrom = data[i].taskModifiedEndTime; }
                if (data[i].taskActualEndTime && (data[i].taskModifiedEndTime == null)) { this.varianceEndFrom = data[i].taskActualEndTime; }
                data[i].varianceEndTime = moment.utc(Math.abs(this.varianceEndFrom - data[i].plannedEndTime)).format('HH:mm');
                // data[i].varianceEndTime = (this.varianceEndFrom - data[i].plannedEndTime);
            } else {
                data[i].varianceEndTime = '-'
            }
        }
    }

    //to  change the state to edit after changing values
    editAction(row: any) {
        this.state = 'EDIT';
        this.editId = row.taskId;
    }
    //Export task summary report as excel
    exportAsXLSX():void {
    console.log(this.taskList,"list")
    let report:any=[];
    for(let i=0;i<this.taskList.length;i++){
        report.push({
            "ARR FLT NO":this.taskList[i].arrFlightNumber != null ? this.taskList[i].arrFlightNumber:'-',
            "DEP FLT NO":this.taskList[i].depFlightNumber != null ? this.taskList[i].depFlightNumber:'-',
            "STA":(this.taskList[i].standardArrivalTime != null ? moment(this.taskList[i].standardArrivalTime).format('HH:mm'):'-'),
            "ETA":(this.taskList[i].estimatedArrivalTime != null ? moment(this.taskList[i].estimatedArrivalTime).format('HH:mm'):'-'),
            "ATA":(this.taskList[i].actualArrivalTime != null ? moment(this.taskList[i].actualArrivalTime).format('HH:mm'):'-'),
            "STD":(this.taskList[i].standardDepartureTime != null ? moment(this.taskList[i].standardDepartureTime).format('HH:mm'):'-'),
            "ETD":(this.taskList[i].estimatedDepartureTime != null ? moment(this.taskList[i].estimatedDepartureTime).format('HH:mm'):'-'),
            "ATD":(this.taskList[i].actualDepartureTime != null ? moment(this.taskList[i].actualDepartureTime).format('HH:mm'):'-'),
            "TASK NAME":this.taskList[i].taskName,
            "STAFF":this.taskList[i].name,
            "PLANNED START":(this.taskList[i].plannedStartTime != null ? moment(this.taskList[i].plannedStartTime).format('HH:mm'):'-'),
            "PLANNED END":(this.taskList[i].plannedEndTime !=null ? moment(this.taskList[i].plannedEndTime).format('HH:mm'):'-'),
            "ACTUAL START":(this.taskList[i].taskActualStartTime !=null ? moment(this.taskList[i].taskActualStartTime).format('HH:mm'):'-'),
            "ACTUAL END":(this.taskList[i].taskActualEndTime !=null ? moment(this.taskList[i].taskActualEndTime).format('HH:mm'):''),
            "MODIFIED START":(this.taskList[i].taskModifiedStartTime !=null ? moment(this.taskList[i].taskModifiedStartTime).format('HH:mm'):'-'),
            "MODIFIED END":(this.taskList[i].taskModifiedEndTime !=null ? moment(this.taskList[i].taskModifiedEndTime).format('HH:mm'):'-'),
            "DELAY CODE":this.taskList[i].taskDelayNumericCode != null ? this.taskList[i].taskDelayNumericCode.trim() +this.taskList[i].taskDelayAlphabeticCode.trim()+ this.taskList[i].taskDelayCodeDescription:'-',
            "SKIPPED":(this.taskList[i].taskSkipped==true?'Y':'-')
    })
    }
        this.excelService.exportAsExcelFile(report, 'TASK SUMMARY');
      }

    //modal box call for edit
    edit(data: any) {
        const modalRef = this.dialog.open(EditSummaryComponent, {
            position: {
                // right: '0',
            },
            // minHeight: '50vh',
            width: '550px',
            panelClass: 'modelOpen',
            // maxHeight: '50vh',
            height: '315px',
            data: {
                data: data,
            },

        });
        modalRef.afterClosed().subscribe(result => {
        });
    }
    close() {
        this.dialogRef.close();
    }
}
