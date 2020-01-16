import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { ApiService } from '../../../../service/app.api-service';
import { AppUrl } from '../../../../service/app.url-service';
import { DelayTask } from './delayTask-mapping-class';
import { Delays } from "./delay-codes-class";
import { AppService, AuthService } from '../../../../service/app.service';
import { ToastrService, GlobalConfig } from 'ngx-toastr';
import { ToastComponent } from '../../../../toast/toast.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'delay-mapping',
    templateUrl: './delay-mapping.component.html',
    styleUrls: ['./delay-mapping.component.scss']
})

export class DelayMappingComponent implements OnInit {
    // initialize variables required for the page
    dependencyTasks: any = [];
    nonAssignedTasks: any[] = [];
    fullTasks: any[] = [];
    manipulatedDelayTask: any[] = [];
    updateButton: boolean;
    currentDT: DelayTask;
    delayTasks: DelayTask[] = [];
    delayCodes: Delays[] = [];
    bind: any;
    nextDrop: any[] = [];
    nextDropVal: any;
    defaultDT: any;
    selectedDelays: any[] = [];
    serachBydelay: any;
    copyDependencyTasks: any;
    tasksID: number[] = [];
    currentStation: any;
    taskdelayDetails: any;
    toasterOptions: GlobalConfig;


    constructor(private dialogRef: MatDialogRef<DelayMappingComponent>, @Inject(MAT_DIALOG_DATA) public details: any, private services: ApiService, private appService: AppService, private AppUrl: AppUrl, private toastr: ToastrService, private auth: AuthService, private fb: FormBuilder) {
        this.currentStation = { "id": this.auth.user.userAirportMappingList[0].id, "userId": this.auth.user.id, "code": this.auth.user.userAirportMappingList[0].code }
        this.toasterOptions = this.toastr.toastrConfig;
        this.dialogRef.disableClose = true;
    }

    ngOnInit() {
        this.getTaskNames();
        this.fullTasks = this.details.list;
        this.nonAssignedTasks = this.details.nonAssigned
        this.getDelayTaskMap();
        this.currentDT = new DelayTask;
        if (this.details.mode === "ADD") {
            // do nothing in the case of Add
        }
        else {
            this.parseTaskDetails();
        }
        this.setTasks();
    }

    parseTaskDetails() {
        this.taskdelayDetails = this.details.taskDetails;
        this.currentDT.task_id = this.taskdelayDetails[0].task_id
        this.currentDT.task_name = this.taskdelayDetails[0].task_name
        this.tasksID = [];
        for (let i = 0; i < this.taskdelayDetails.length; i++) {
            this.tasksID.push(this.taskdelayDetails[i].delay_code_id);
            if (this.taskdelayDetails[i].is_default == 1) {
                this.defaultDT = this.taskdelayDetails[i].delay_code_id
            }
            this.nextDrop.push({
                id: this.taskdelayDetails[i].delay_code_id,
                code: this.taskdelayDetails[i].delay_numeric_code + '(' + this.taskdelayDetails[i].delay_alphabetic_code + ')'
            })
            this.nextDropVal = this.nextDrop.length;

        }
    }
    // funciton to assign received tasks list of tasks from previous page
    getTaskNames() {
        this.fullTasks = this.details.list;
    }
    // GET API to fetch list of tasks with delay codes
    getDelayTaskMap() {
        this.services.getAll(this.AppUrl.geturlfunction('DELAY_TASK_MAPPING')).subscribe(res => {
            if (res.status) {
                this.delayTasks = DelayTask.set(res.data);
                let tmpObj = this.groupBy(this.delayTasks, 'task_name');
                this.manipulatedDelayTask = [];
                for (let field in tmpObj) {
                    this.manipulatedDelayTask.push(tmpObj[field]);
                }
            } else {
                this.delayTasks = [];
                console.log('in the master else');
            }
        },
            error => {
                this.delayTasks = [];
            });
    }
    // funcion to group delay codes based on tasks
    groupBy(iarr, ikey) {
        return iarr.reduce((a, b) => {
            (a[b[ikey]] = a[b[ikey]] || []).push(b);
            return a;
        }, {})
    }
    // funion to filter out the list of un-assigned and assigned tasks
    findNonAssignedTasks() {
        let uniqueAllTasks = [];
        let uniqueAssingedTasks = [];
        let nonAssignedTasks = [];
        for (let i = 0; i < this.fullTasks.length; i++) {
            if (uniqueAllTasks.indexOf(this.fullTasks[i].id) === -1) {
                uniqueAllTasks.push(this.fullTasks[i].id);
            }
        }
        for (let i = 0; i < this.manipulatedDelayTask.length; i++) {
            if (uniqueAssingedTasks.indexOf(this.manipulatedDelayTask[i][0].task_id) === -1) {
                uniqueAssingedTasks.push(this.manipulatedDelayTask[i][0].task_id);
            }
        }
        for (let i = 0; i < uniqueAllTasks.length; i++) {
            if (uniqueAssingedTasks.indexOf(uniqueAllTasks[i]) === -1 || (this.updateButton && this.currentDT.task_id === uniqueAllTasks[i])) {
                nonAssignedTasks.push(this.fullTasks[i]);
            }
        }
    }
    // function to form the delay code to show on UI
    setTasks() {
        this.services.getAll(this.AppUrl.geturlfunction('DELAY_CODES')).subscribe(res => {
            if (res.data) {
                this.delayCodes = Delays.set(res.data);
                // this.delayCodes = this.appService.sortNumber(this.delayCodes, 'delay_numeric_code');
                let ar = [];
                for (let i = 0; i <= this.delayCodes.length - 1; i++) {
                    // this.bind = ('0' + this.delayCodes[i].delay_numeric_code).slice(-2)
                    //     + ' (' + this.delayCodes[i].delay_alphabetic_code.trim() + ') - ' + this.delayCodes[i].description
                    this.delayCodes[i].delay_alphabetic_code = this.delayCodes[i].delay_alphabetic_code ? this.delayCodes[i].delay_alphabetic_code : '';
                    this.bind = (this.delayCodes[i].delay_numeric_code) + ' (' + this.delayCodes[i].delay_alphabetic_code + ') - ' + this.delayCodes[i].description
                    this.dependencyTasks.push({
                        index: this.delayCodes[i].id,
                        name: this.bind,
                        selected: this.tasksID.indexOf(this.delayCodes[i].id) > -1,
                        // defaultCode: ('0' + this.delayCodes[i].delay_numeric_code).slice(-2)
                        //     + ' (' + this.delayCodes[i].delay_alphabetic_code + ')'
                        defaultCode: (this.delayCodes[i].delay_numeric_code) + ' (' + this.delayCodes[i].delay_alphabetic_code + ')'
                    })
                }
                this.copyDependencyTasks = this.dependencyTasks;
            }
        },
            error => {
            });
    }
    closeModal() {
        console.log("cancel called")
        this.dialogRef.close();
    }

    binding() {
        let result: any[] = [];
        for (let i = 0; i < this.dependencyTasks.length; i++) {

            if (this.dependencyTasks[i].selected == true) {
                result.push({
                    task_id: this.currentDT.task_id,
                    delay_code_id: this.dependencyTasks[i].index,
                    is_default: this.dependencyTasks[i].index === Number(this.defaultDT) ? 1 : 0,
                    user: this.currentStation.userId
                });
            }
        }
        return result;
    }
    // Function to populate default delay code dropdown array
    onChange(event) {
        console.log(this.dependencyTasks)
        console.log(event);
        if (event.selected == false) {
            for (var index = 0; index < this.dependencyTasks.length; index++) {
                var element = this.dependencyTasks[index];
                if (event.index === element.index) {
                    console.log(this.nextDrop)
                    this.nextDrop.push({
                        id: element.index,
                        code: element.defaultCode
                    })
                }
                this.nextDropVal = this.nextDrop.length;
            }
            console.log('top', this.nextDrop);
        } else {
            const v = this.nextDrop.findIndex(value => value.id == event.index);
            this.nextDrop.splice(v, 1);
            this.nextDropVal = this.nextDrop.length;
            console.log('botttom', this.nextDrop);
        }
    }
    ngOnDestroy() {
        this.appService.addBtn.next(false);
        this.appService.action.next('refresh');
    }
    // ADD API call to add new delay code mapping
    addTaskDelayMapping() {
        this.dialogRef.close('RELOAD');
        let newDelayTask = {
            data: this.binding()
        }
        console.log(newDelayTask)
        let taskNames = this.nonAssignedTasks.filter(
            flight => (flight.id == this.currentDT.task_id))
        this.services.create(this.AppUrl.geturlfunction('DELAY_TASK_MAPPING_POST'), newDelayTask).subscribe(res => {
            if (res.status) {
                // The success/error message will be moved to App Message Service
                this.appService.toast('', "Delay code mapping has been created successfully for Task type : " + taskNames[0].name, 'success', 'success-mode');
                this.appService.action.next('refresh');
            } else if (res.errorMessage.substring(0, 4) == "dupl") {
                this.appService.toast('', "Entered Task Delay details already exist", 'error', 'error-mode');
            } else {
                this.appService.toast('', res.errorMessage, 'error', 'error-mode');
            }
        }, error => { });

    }
    // UPDATE API call to update delay code mapping
    updateTaskDelayMapping() {
        this.dialogRef.close('RELOAD');
        let newDelayTask = {
            data: this.binding()
        }
        let taskNames = this.fullTasks.filter(
            flight => (flight.id == this.currentDT.task_id))
        this.services.create(this.AppUrl.geturlfunction('DELAY_TASK_MAPPING_UPDATE'), newDelayTask).subscribe(res => {
            if (res.status) {
                this.appService.toast('', "Delay code mapping has been updated successfully for Task type : " + taskNames[0].name, 'success', 'success-mode');
                this.appService.action.next('refresh');
            } else if (res.errorMessage.substring(0, 4) == "dupl") {
                this.appService.toast('', "Entered Task Delay details already exist", 'error', 'error-mode');
            } else {
                this.appService.toast('', res.errorMessage, 'error', 'error-mode');
            }
        }, error => { });
    }
}
