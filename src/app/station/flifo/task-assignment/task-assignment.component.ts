import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AppUrl } from '../../../service/app.url-service';
import { ApiService } from '../../../service/app.api-service';
import { MatExpansionPanel } from '@angular/material';
import { AppService, AuthService } from '../../../service/app.service';
import { ToastrService, GlobalConfig } from 'ngx-toastr';
import { ToastComponent } from '../../../toast/toast.component';
import * as _ from 'underscore';
import * as mz from 'moment-timezone';
import {
    IMqttMessage,
    MqttModule,
    IMqttServiceOptions,
    MqttService
} from 'ngx-mqtt';

@Component({
    selector: 'app-task-assignment',
    templateUrl: './task-assignment.component.html',
    styleUrls: ['./task-assignment.component.scss']
})
export class TaskAssignmentComponent implements OnInit {
    // initiallization of variable required for the page
    load: Boolean = false;
    toasterOptions: GlobalConfig;

    droppedItems = [];
    currentStation: any;
    fArrNo: any;
    depNo: any;
    assigned: any;
    userList = [];
    rampOfficer = [];
    rampAgent = [];
    dutyManager = [];
    securityScreener = [];
    securityAgent = [];
    securitySupervisor = [];
    enableSubmit = true;
    editMode = false;
    taskList: any;
    taskListUnTouched: any;
    taskAssignFlag = false;
    counter: any;
    selectedList: any;
    accordionState: boolean;
    userData: any;
    startTime: number;
    endTime: any;
    sta: any;
    eta: any;
    std: any;
    etd: any;
    ata: any;
    atd: any;
    psta: any;
    peta: any;
    pstd: any;
    pata: any;
    petd: any;
    patd: any;
    resId: any;

    constructor(private services: ApiService, private appService: AppService, private appUrl: AppUrl,
        private dialogRef: MatDialogRef<TaskAssignmentComponent>, @Inject(MAT_DIALOG_DATA) public details: any, private auth: AuthService,
        private toastr: ToastrService,
        private mqttService: MqttService) {
        this.dialogRef.disableClose = true;
        this.fArrNo = this.details.flightdetails.arrFlightNumber;
        this.depNo = this.details.flightdetails.depFlightNumber;
        this.assigned = this.details.flightdetails.taskAssignedCount | 0;
        this.counter = 0;
        this.currentStation = {
            'id': this.auth.user.userAirportMappingList[0].id,
            'userId': this.auth.user.id,
            'code': this.auth.user.userAirportMappingList[0].code,
            "timezone": this.auth.user.airport.timezone
        }
        this.toasterOptions = this.toastr.toastrConfig;
    }

    ngOnInit() {
        console.log('started');
        this.taskList = [];
        this.taskListUnTouched = [];
        this.getTask();
        this.accordionState = false;
        this.listenSocket();
        this.userData = this.auth;
        this.sta = this.details.flightdetails.standardArrivalTime ? mz(this.details.flightdetails.standardArrivalTime).tz(this.currentStation.timezone).format() : null;
        this.eta = this.details.flightdetails.estimatedArrivalTime ? mz(this.details.flightdetails.estimatedArrivalTime).tz(this.currentStation.timezone).format() : null;
        this.std = this.details.flightdetails.standardDepartureTime ? mz(this.details.flightdetails.standardDepartureTime).tz(this.currentStation.timezone).format() : null;
        this.etd = this.details.flightdetails.estimatedDepartureTime ? mz(this.details.flightdetails.estimatedDepartureTime).tz(this.currentStation.timezone).format() : null;
        this.ata = this.details.flightdetails.actualArrivalTime ? mz(this.details.flightdetails.actualArrivalTime).tz(this.currentStation.timezone).format() : null;
        this.atd = this.details.flightdetails.actualDepartureTime ? mz(this.details.flightdetails.actualDepartureTime).tz(this.currentStation.timezone).format() : null;
        this.psta = this.details.flightdetails.standardArrivalTime ? mz(this.details.flightdetails.standardArrivalTime).tz(this.currentStation.timezone).format('YYYY-MM-DDTHH:mm:ss') : null;
        this.peta = this.details.flightdetails.estimatedArrivalTime ? mz(this.details.flightdetails.estimatedArrivalTime).tz(this.currentStation.timezone).format('YYYY-MM-DDTHH:mm:ss') : null;
        this.pstd = this.details.flightdetails.standardDepartureTime ? mz(this.details.flightdetails.standardDepartureTime).tz(this.currentStation.timezone).format('YYYY-MM-DDTHH:mm:ss') : null;
        this.petd = this.details.flightdetails.estimatedDepartureTime ? mz(this.details.flightdetails.estimatedDepartureTime).tz(this.currentStation.timezone).format('YYYY-MM-DDTHH:mm:ss') : null;
        this.pata = this.details.flightdetails.actualArrivalTime ? mz(this.details.flightdetails.actualArrivalTime).tz(this.currentStation.timezone).format('YYYY-MM-DDTHH:mm:ss') : null;
        this.patd = this.details.flightdetails.actualDepartureTime ? mz(this.details.flightdetails.actualDepartureTime).tz(this.currentStation.timezone).format('YYYY-MM-DDTHH:mm:ss') : null;

    }

    // GET API task list based on each flight - equipment type
    getTask() {
        this.load = true;
        const flightId = this.details.flightdetails.flightSchedulesId;
        const taskScheduleId = this.details.flightdetails.taskScheduleId;
        const url = this.appUrl.geturlfunction('GET_TASK_BY_FLIGHT') + '&id=' + flightId + '&taskScheduleId=' + taskScheduleId;
        this.services.getAll(url).subscribe(res => {
            if (res.status === true) {
                this.taskList = this.appService.sortNumber(res.data, 'taskSequenceNumber');
                this.taskListUnTouched = this.appService.sortNumber(res.data, 'taskSequenceNumber');
                this.getUsers();
            } else {
                this.load = false;
                this.appService.toast('', 'Task allocation not found', 'warning', 'warning-mode');
            }
        });
    }

    // GET API user list based on each shifts
    getUsers() {
        const flightId = this.details.flightdetails.flightSchedulesId;
        const taskScheduleId = this.details.flightdetails.taskScheduleId;
        const url = this.appUrl.geturlfunction('GET_USER_BY_SHIFT') + flightId;
        this.services.getAll(url).subscribe(res => {
            if (res.status === true) {
                this.userList = res.data;
                const users = res.data;
                for (let index = 0; index < users.length; index++) {
                    const element = users[index].userShiftByFlightSchedule;
                    element.list = [];
                    element.state = false;
                    element.listOriginal = [];
                    if (element.role === 'Ramp Officer') { this.rampOfficer.push(element); }
                    if (element.role === 'Duty Manager') { this.dutyManager.push(element); }
                    if (element.role === 'Ramp Agent') { this.rampAgent.push(element); }
                    if (element.role === 'Security Supervisor') { this.securityScreener.push(element); }
                    if (element.role === 'Screener') { this.securityScreener.push(element); }
                    if (element.role === 'Security Agent') { this.securityAgent.push(element); }
                }
                this.rampOfficer = this.appService.sortName(this.rampOfficer, 'firstName');
                this.dutyManager = this.appService.sortName(this.dutyManager, 'firstName');
                this.rampAgent = this.appService.sortName(this.rampAgent, 'firstName');
                this.securitySupervisor = this.appService.sortName(this.securitySupervisor, 'firstName');
                this.securityScreener = this.appService.sortName(this.securityScreener, 'firstName');
                this.securityAgent = this.appService.sortName(this.securityAgent, 'firstName');
                this.mapTaskToUser();
            } else {
                this.load = false;
                this.appService.toast('', res.errorMessage, 'error', 'error-mode');
            }
        });
    }
    //  function call to drag & map each task to the particular user in that shifts
    mapTaskToUser() {
        const emptyList = [];
        let matchCount = 0;
        for (let index = 0; index < this.taskList.length; index++) {
            const element = this.taskList[index];
            if (element.userId !== null) {
                let matched = 0;
                // map task for rampOfficer
                for (let ind = 0; ind < this.rampOfficer.length; ind++) {
                    const ele = this.rampOfficer[ind];
                    if (ele.userId === element.userId) {
                        this.rampOfficer[ind].list.push(element); this.rampOfficer[ind].listOriginal.push(element); matched = 1;
                    }
                }
                // map task for rampAgent
                for (let ind = 0; ind < this.rampAgent.length; ind++) {
                    const ele = this.rampAgent[ind];
                    if (ele.userId === element.userId) {
                        this.rampAgent[ind].list.push(element); this.rampAgent[ind].listOriginal.push(element); matched = 1;
                    }
                }
                // map task for dutyManager
                for (let ind = 0; ind < this.dutyManager.length; ind++) {
                    const ele = this.dutyManager[ind];
                    if (ele.userId === element.userId) {
                        this.dutyManager[ind].list.push(element); this.dutyManager[ind].listOriginal.push(element); matched = 1;
                    }
                }
                // map task for securitySupervisor
                for (let ind = 0; ind < this.securitySupervisor.length; ind++) {
                    const ele = this.securitySupervisor[ind];
                    if (ele.userId === element.userId) {
                        this.securitySupervisor[ind].list.push(element);
                        this.securitySupervisor[ind].listOriginal.push(element); matched = 1;
                    }
                }
                // map task for SecurityScreener
                for (let ind = 0; ind < this.securityScreener.length; ind++) {
                    const ele = this.securityScreener[ind];
                    if (ele.userId === element.userId) {
                        this.securityScreener[ind].list.push(element); this.securityScreener[ind].listOriginal.push(element); matched = 1;
                    }
                }
                // map task for securityAgent
                for (let ind = 0; ind < this.securityAgent.length; ind++) {
                    const ele = this.securityAgent[ind];
                    if (ele.userId === element.userId) {
                        this.securityAgent[ind].list.push(element); this.securityAgent[ind].listOriginal.push(element); matched = 1;
                    }
                }
                if (matched !== 1) {
                    emptyList.push(element);
                }
                matchCount = matchCount + matched;
            }
        }
        // task mapping to user is empty 
        if (matchCount !== 0) {
            this.taskList = emptyList;
            this.taskList = [];
            this.editMode = true;
        }
        // this.handleButton();
        this.load = false;
    }

    listtask() {
        this.taskAssignFlag = true;
    }

    // assigning task to particular user based on shift
    assignTask(s: any, e: any, data: any, source: any) {
        if (this.taskAssignFlag === true) {
            // Check the s length if it requires more condition && s.length > 0 
            this.taskAssignFlag = false;
            this.selectedList = [];
            this.counter++;
            for (let ind = 0; ind < s.length; ind++) {
                this.droppedItems.push(s[ind]);
                const taskPosition = _.findIndex(this.taskListUnTouched, { taskName: s[ind] });
                const taskObject = this.taskListUnTouched[taskPosition];
                const task: any = taskObject;
                task.oldUserId = data.userId;
                task.oldUserName = data.firstName + ' ' + data.lastName;
                const user = data;
                if (source === 'Ramp Officer') {
                    for (let index = 0; index < this.rampOfficer.length; index++) {
                        const element = this.rampOfficer[index];
                        if (element.rownum === user.rownum) { this.rampOfficer[index].list.push(task); }
                    }
                } else if (source === 'Duty Manager') {
                    for (let index = 0; index < this.dutyManager.length; index++) {
                        const element = this.dutyManager[index];
                        if (element.rownum === user.rownum) { this.dutyManager[index].list.push(task); }
                    }
                } else if (source === 'Ramp Agent') {
                    for (let index = 0; index < this.rampAgent.length; index++) {
                        const element = this.rampAgent[index];
                        if (element.rownum === user.rownum) { this.rampAgent[index].list.push(task); }
                    }
                } else if (source === 'Security Supervisor') {
                    for (let index = 0; index < this.securitySupervisor.length; index++) {
                        const element = this.securitySupervisor[index];
                        if (element.rownum === user.rownum) { this.securitySupervisor[index].list.push(task); }
                    }
                } else if (source === 'Screener') {
                    for (let index = 0; index < this.securityScreener.length; index++) {
                        const element = this.securityScreener[index];
                        if (element.rownum === user.rownum) { this.securityScreener[index].list.push(task); }
                    }
                } else if (source === 'Security Agent') {
                    for (let index = 0; index < this.securityAgent.length; index++) {
                        const element = this.securityAgent[index];
                        if (element.rownum === user.rownum) { this.securityAgent[index].list.push(task); }
                    }
                } else { }
                // Removing from taskList
                this.taskList = _.without(this.taskList, _.findWhere(this.taskList, {
                    taskName: s[ind]
                }));
                this.handleButton();
            }
        }
    }

    // de-allocate the task assigned to user
    unAssign(e: any, item: any, source: any) {
        this.accordionState = true;
        const taskPosition = _.findIndex(this.taskListUnTouched, { id: e.id });
        const taskObject = this.taskListUnTouched[taskPosition];
        this.taskList.push(taskObject);
        this.counter++;
        let task = item.list;
        task = _.without(task, _.findWhere(task, { id: e.id }));
        if (source === 'Ramp Officer') {
            const position = _.findIndex(this.rampOfficer, { userId: item.userId });
            this.rampOfficer[position].list = task;
        } else if (source === 'Ramp Agent') {
            const position = _.findIndex(this.rampAgent, { userId: item.userId });
            this.rampAgent[position].list = task;
        } else if (source === 'Duty Manager') {
            const position = _.findIndex(this.dutyManager, { userId: item.userId });
            this.dutyManager[position].list = task;
        } else if (source === 'Security Supervisor') {
            const position = _.findIndex(this.securitySupervisor, { userId: item.userId });
            this.securitySupervisor[position].list = task;
        } else if (source === 'Screener') {
            const position = _.findIndex(this.securityScreener, { userId: item.userId });
            this.securityScreener[position].list = task;
        } else if (source === 'Security Agent') {
            const position = _.findIndex(this.securityAgent, { userId: item.userId });
            this.securityAgent[position].list = task;
        } else { }
        this.handleButton();
    }
    // on submit assigning the task to the respective user based on shifts
    taskAssignSubmit() {
        const flightId = this.details.flightdetails.flightSchedulesId;
        const taskScheduleId = this.details.flightdetails.taskScheduleId;
        const taskData = [];
        const taskDataFull = [];
        const taskDetails = [];
        var startTime, endTime, diffTime, activityStart, activityEnd;
        if (this.editMode === true) {
            // Ramp Officer
            for (let index = 0; index < this.rampOfficer.length; index++) {
                const latest = this.rampOfficer[index].list;
                const original = this.rampOfficer[index].listOriginal;
                let difference = []; difference = _.difference(latest, original);
                for (let ind = 0; ind < difference.length; ind++) {
                    const ele = difference[ind];

                    const data = {
                        flightSchedulesId: { id: flightId },
                        taskScheduleDetailId: { id: ele.taskScheduleDetailId },
                        userId: {
                            id: ele.oldUserId, reassign_by: this.currentStation.userId,
                            reassignFrom: 0, userName: ele.oldUserName, airportId: this.currentStation.id
                        },
                        id: ele.resourceMappingId,
                        createdBy: this.currentStation.userId
                    };
                    taskData.push(data); taskDataFull.push(ele);
                }
            }
            // Ramp Agent
            for (let index = 0; index < this.rampAgent.length; index++) {
                const latest = this.rampAgent[index].list;
                const original = this.rampAgent[index].listOriginal;
                let difference = []; difference = _.difference(latest, original);
                for (let ind = 0; ind < difference.length; ind++) {
                    const ele = difference[ind];
                    const data = {
                        flightSchedulesId: { id: flightId },
                        taskScheduleDetailId: { id: ele.taskScheduleDetailId },
                        userId: {
                            id: ele.oldUserId, reassign_by: this.currentStation.userId,
                            reassignFrom: 0, userName: ele.oldUserName, airportId: this.currentStation.id
                        },
                        id: ele.resourceMappingId,
                        createdBy: this.currentStation.userId
                    };
                    taskData.push(data); taskDataFull.push(ele);
                }
                // Update Api
            }
            // Duty Manager
            for (let index = 0; index < this.dutyManager.length; index++) {
                const latest = this.dutyManager[index].list;
                const original = this.dutyManager[index].listOriginal;
                let difference = []; difference = _.difference(latest, original);
                for (let ind = 0; ind < difference.length; ind++) {
                    const ele = difference[ind];
                    const data = {
                        flightSchedulesId: { id: flightId },
                        taskScheduleDetailId: { id: ele.taskScheduleDetailId },
                        userId: {
                            id: ele.oldUserId, reassign_by: this.currentStation.userId,
                            reassignFrom: 0, userName: ele.oldUserName, airportId: this.currentStation.id
                        },
                        id: ele.resourceMappingId,
                        createdBy: this.currentStation.userId
                    };
                    taskData.push(data); taskDataFull.push(ele);
                }
            }
            // Security Supervisor
            for (let index = 0; index < this.securitySupervisor.length; index++) {
                const latest = this.securitySupervisor[index].list;
                const original = this.securitySupervisor[index].listOriginal;
                let difference = []; difference = _.difference(latest, original);
                for (let ind = 0; ind < difference.length; ind++) {
                    const ele = difference[ind];
                    const data = {
                        flightSchedulesId: { id: flightId },
                        taskScheduleDetailId: { id: ele.taskScheduleDetailId },
                        userId: {
                            id: ele.oldUserId, reassign_by: this.currentStation.userId,
                            reassignFrom: 0, userName: ele.oldUserName, airportId: this.currentStation.id
                        },
                        id: ele.resourceMappingId,
                        createdBy: this.currentStation.userId
                    };
                    taskData.push(data); taskDataFull.push(ele);
                }
            }
            // Screener
            for (let index = 0; index < this.securityScreener.length; index++) {
                const latest = this.securityScreener[index].list;
                const original = this.securityScreener[index].listOriginal;
                let difference = []; difference = _.difference(latest, original);
                for (let ind = 0; ind < difference.length; ind++) {
                    const ele = difference[ind];
                    const data = {
                        flightSchedulesId: { id: flightId },
                        taskScheduleDetailId: { id: ele.taskScheduleDetailId },
                        userId: {
                            id: ele.oldUserId, reassign_by: this.currentStation.userId,
                            reassignFrom: 0, userName: ele.oldUserName, airportId: this.currentStation.id
                        },
                        id: ele.resourceMappingId,
                        createdBy: this.currentStation.userId
                    };
                    taskData.push(data); taskDataFull.push(ele);
                }
            }
            // Security Agent
            for (let index = 0; index < this.securityAgent.length; index++) {
                const latest = this.securityAgent[index].list;
                const original = this.securityAgent[index].listOriginal;
                let difference = []; difference = _.difference(latest, original);
                for (let ind = 0; ind < difference.length; ind++) {
                    const ele = difference[ind];

                    const data = {
                        flightSchedulesId: { id: flightId },
                        taskScheduleDetailId: { id: ele.taskScheduleDetailId },
                        userId: {
                            id: ele.oldUserId, reassign_by: this.currentStation.userId,
                            reassignFrom: 0, userName: ele.oldUserName, airportId: this.currentStation.id
                        },
                        id: ele.resourceMappingId,
                        createdBy: this.currentStation.userId
                    };
                    taskData.push(data); taskDataFull.push(ele);
                }
            }
            // once reasssign task to user, Update API call is called
            const jsonObj = { ResourceAssignments: taskData, 'update': false };
            console.log(this.details);
            this.services.create(this.appUrl.geturlfunction('RESOURCE_MAPPING_UPDATE'), jsonObj).subscribe(res => {
                if (res.status === true) {
                    this.closeModal();
                    let message = '';
                    let fNo = this.details.flightdetails.depFlightNumber ? this.details.flightdetails.depFlightNumber : this.details.flightdetails.arrFlightNumber
                    if (res.successMessage.includes('updated') === true) {
                        message = 'Tasks reassigned successfully for ' + fNo + '';
                    } else {
                        message = 'Tasks assigned successfully for ' + fNo + '';
                    }
                    console.log(message);
                    this.appService.showToast(message, 'custom', 'success');
                    this.appService.action.next('REFRESH');
                } else {
                    this.appService.toast('', res.error, 'error', 'error-mode');
                }
            }, error => {
                this.appService.toast('', 'Server Error', 'error', 'error-mode');
            });
        } else {
            // rampOfficer
            for (let index = 0; index < this.rampOfficer.length; index++) {
                const element = this.rampOfficer[index];
                for (let ind = 0; ind < element.list.length; ind++) {
                    const ele = element.list[ind];
                    console.log(ele)
                    if (ele.arrivalDepartureType == 0) {
                        diffTime = (ele.estimatedDepartureTime != null) ? ele.estimatedDepartureTime : ele.standardDepartureTime;
                        activityStart = (ele.activityStartTime) * 60000;
                        activityEnd = (ele.taskDuration) * 60000;
                        startTime = diffTime - activityStart;
                        endTime = startTime + activityEnd;
                        startTime = mz(startTime).tz(this.currentStation.timezone).format();
                        endTime = mz(endTime).tz(this.currentStation.timezone).format();

                    }
                    else {
                        diffTime = (ele.estimatedArrivalTime != null) ? ele.estimatedArrivalTime : ele.standardArrivalTime;
                        activityStart = (ele.activityStartTime) * 60000;
                        activityEnd = (ele.taskDuration) * 60000;
                        startTime = diffTime + activityStart;
                        endTime = startTime + activityEnd;
                        startTime = mz(startTime).tz(this.currentStation.timezone).format();
                        endTime = mz(endTime).tz(this.currentStation.timezone).format();
                    }

                    const datas =
                    {
                        userId: element.userId,
                        taskDetail: {
                            t_eta: mz(startTime).tz(this.currentStation.timezone).format('YYYY-MM-DDTHH:mm:ss'),
                            t_etd: mz(endTime).tz(this.currentStation.timezone).format('YYYY-MM-DDTHH:mm:ss'),
                            t_ata: null,
                            t_atd: null,
                            u_s: ele.taskSkipped,
                            d_i: null,
                            d: ele.taskDuration,
                            s: ele.optional,
                            n: ele.taskName.replace(/(\r\n|\n|\r)/gm, ""),
                            id: ele.taskId,
                            a_st: ele.activityStartTime,
                            a_d_t: ele.arrivalDepartureType,
                            t_sc_id: ele.taskScheduleDetailId,
                            t_seq: ele.taskSequenceNumber,
                            p_by:null,
                            i_d_c:ele.is_depend_chockson
                        }
                    };
                    taskDetails.push(datas)

                    const data = {
                        flightSchedulesId: { id: flightId },
                        taskScheduleDetailId: { id: ele.taskScheduleDetailId },
                        userId: { id: element.userId },
                        e_startTime: startTime,
                        e_endTime: endTime
                    };
                    taskData.push(data); taskDataFull.push(ele);
                }
            }
            // rampAgent
            for (let index = 0; index < this.rampAgent.length; index++) {
                const element = this.rampAgent[index];
                for (let ind = 0; ind < element.list.length; ind++) {
                    const ele = element.list[ind];
                    if (ele.arrivalDepartureType == 0) {
                        diffTime = (ele.estimatedDepartureTime != null) ? ele.estimatedDepartureTime : ele.standardDepartureTime;
                        activityStart = (ele.activityStartTime) * 60000;
                        activityEnd = (ele.taskDuration) * 60000;
                        startTime = diffTime - activityStart;
                        endTime = startTime + activityEnd;
                        startTime = mz(startTime).tz(this.currentStation.timezone).format();
                        endTime = mz(endTime).tz(this.currentStation.timezone).format();
                    }
                    else {
                        diffTime = (ele.estimatedArrivalTime != null) ? ele.estimatedArrivalTime : ele.standardArrivalTime;
                        activityStart = (ele.activityStartTime) * 60000;
                        activityEnd = (ele.taskDuration) * 60000;
                        startTime = diffTime + activityStart;
                        endTime = startTime + activityEnd;
                        startTime = mz(startTime).tz(this.currentStation.timezone).format();
                        endTime = mz(endTime).tz(this.currentStation.timezone).format();
                    }
                    const data = {
                        flightSchedulesId: { id: flightId },
                        taskScheduleDetailId: { id: ele.taskScheduleDetailId },
                        userId: { id: element.userId },
                        e_startTime: startTime,
                        e_endTime: endTime
                    };

                    const datas =
                    {
                        userId: element.userId,
                        taskDetail: {
                            t_eta: mz(startTime).tz(this.currentStation.timezone).format('YYYY-MM-DDTHH:mm:ss'),
                            t_etd: mz(endTime).tz(this.currentStation.timezone).format('YYYY-MM-DDTHH:mm:ss'),
                            t_ata: null,
                            t_atd: null,
                            u_s: ele.taskSkipped,
                            d_i: null,
                            d: ele.taskDuration,
                            s: ele.optional,
                            n: ele.taskName.replace(/(\r\n|\n|\r)/gm, ""),
                            id: ele.taskId,
                            a_st: ele.activityStartTime,
                            a_d_t: ele.arrivalDepartureType,
                            t_sc_id: ele.taskScheduleDetailId,
                            t_seq: ele.taskSequenceNumber,
                            p_by:null,
                            i_d_c:ele.is_depend_chockson
                        }
                    };
                    taskDetails.push(datas)
                    taskData.push(data); taskDataFull.push(ele);
                }
            }
            // dutyManager
            for (let index = 0; index < this.dutyManager.length; index++) {
                const element = this.dutyManager[index];
                for (let ind = 0; ind < element.list.length; ind++) {
                    const ele = element.list[ind];
                    if (ele.arrivalDepartureType == 0) {
                        diffTime = (ele.estimatedDepartureTime != null) ? ele.estimatedDepartureTime : ele.standardDepartureTime;
                        activityStart = (ele.activityStartTime) * 60000;
                        activityEnd = (ele.taskDuration) * 60000;
                        startTime = diffTime - activityStart;
                        endTime = startTime + activityEnd;
                        startTime = mz(startTime).tz(this.currentStation.timezone).format();
                        endTime = mz(endTime).tz(this.currentStation.timezone).format();
                    }
                    else {
                        diffTime = (ele.estimatedArrivalTime != null) ? ele.estimatedArrivalTime : ele.standardArrivalTime;
                        activityStart = (ele.activityStartTime) * 60000;
                        activityEnd = (ele.taskDuration) * 60000;
                        startTime = diffTime + activityStart;
                        endTime = startTime + activityEnd;
                        startTime = mz(startTime).tz(this.currentStation.timezone).format();
                        endTime = mz(endTime).tz(this.currentStation.timezone).format();
                    }
                    const data = {
                        flightSchedulesId: { id: flightId },
                        taskScheduleDetailId: { id: ele.taskScheduleDetailId },
                        userId: { id: element.userId },
                        e_startTime: startTime,
                        e_endTime: endTime
                    };

                    const datas =
                    {
                        userId: element.userId,
                        taskDetail: {
                            t_eta: mz(startTime).tz(this.currentStation.timezone).format('YYYY-MM-DDTHH:mm:ss'),
                            t_etd: mz(endTime).tz(this.currentStation.timezone).format('YYYY-MM-DDTHH:mm:ss'),
                            t_ata: null,
                            t_atd: null,
                            u_s: ele.taskSkipped,
                            d_i: null,
                            d: ele.taskDuration,
                            s: ele.optional,
                            n: ele.taskName.replace(/(\r\n|\n|\r)/gm, ""),
                            id: ele.taskId,
                            a_st: ele.activityStartTime,
                            a_d_t: ele.arrivalDepartureType,
                            t_sc_id: ele.taskScheduleDetailId,
                            t_seq: ele.taskSequenceNumber,
                            p_by:null,
                            i_d_c:ele.is_depend_chockson
                        }
                    };
                    taskDetails.push(datas)
                    taskData.push(data); taskDataFull.push(ele);
                }
            }
            // securitySupervisor
            for (let index = 0; index < this.securitySupervisor.length; index++) {
                const element = this.securitySupervisor[index];
                for (let ind = 0; ind < element.list.length; ind++) {
                    const ele = element.list[ind];
                    if (ele.arrivalDepartureType == 0) {
                        diffTime = (ele.estimatedDepartureTime != null) ? ele.estimatedDepartureTime : ele.standardDepartureTime;
                        activityStart = (ele.activityStartTime) * 60000;
                        activityEnd = (ele.taskDuration) * 60000;
                        startTime = diffTime - activityStart;
                        endTime = startTime + activityEnd;
                        startTime = mz(startTime).tz(this.currentStation.timezone).format();
                        endTime = mz(endTime).tz(this.currentStation.timezone).format();
                    }
                    else {
                        diffTime = (ele.estimatedArrivalTime != null) ? ele.estimatedArrivalTime : ele.standardArrivalTime;
                        activityStart = (ele.activityStartTime) * 60000;
                        activityEnd = (ele.taskDuration) * 60000;
                        startTime = diffTime + activityStart;
                        endTime = startTime + activityEnd;
                        startTime = mz(startTime).tz(this.currentStation.timezone).format();
                        endTime = mz(endTime).tz(this.currentStation.timezone).format();
                    }
                    const data = {
                        flightSchedulesId: { id: flightId },
                        taskScheduleDetailId: { id: ele.taskScheduleDetailId },
                        userId: { id: element.userId },
                        e_startTime: startTime,
                        e_endTime: endTime
                    };

                    const datas =
                    {
                        userId: element.userId,
                        taskDetail: {
                            t_eta: mz(startTime).tz(this.currentStation.timezone).format('YYYY-MM-DDTHH:mm:ss'),
                            t_etd: mz(endTime).tz(this.currentStation.timezone).format('YYYY-MM-DDTHH:mm:ss'),
                            t_ata: null,
                            t_atd: null,
                            u_s: ele.taskSkipped,
                            d_i: null,
                            d: ele.taskDuration,
                            s: ele.optional,
                            n: ele.taskName.replace(/(\r\n|\n|\r)/gm, ""),
                            id: ele.taskId,
                            a_st: ele.activityStartTime,
                            a_d_t: ele.arrivalDepartureType,
                            t_sc_id: ele.taskScheduleDetailId,
                            t_seq: ele.taskSequenceNumber,
                            p_by:null,
                            i_d_c:ele.is_depend_chockson
                        }
                    };
                    taskDetails.push(datas)
                    taskData.push(data); taskDataFull.push(ele);
                }
            }
            // securityScreener
            for (let index = 0; index < this.securityScreener.length; index++) {
                const element = this.securityScreener[index];
                for (let ind = 0; ind < element.list.length; ind++) {
                    const ele = element.list[ind];
                    if (ele.arrivalDepartureType == 0) {
                        diffTime = (ele.estimatedDepartureTime != null) ? ele.estimatedDepartureTime : ele.standardDepartureTime;
                        activityStart = (ele.activityStartTime) * 60000;
                        activityEnd = (ele.taskDuration) * 60000;
                        startTime = diffTime - activityStart;
                        endTime = startTime + activityEnd;
                        startTime = mz(startTime).tz(this.currentStation.timezone).format();
                        endTime = mz(endTime).tz(this.currentStation.timezone).format();
                    }
                    else {
                        diffTime = (ele.estimatedArrivalTime != null) ? ele.estimatedArrivalTime : ele.standardArrivalTime;
                        activityStart = (ele.activityStartTime) * 60000;
                        activityEnd = (ele.taskDuration) * 60000;
                        startTime = diffTime + activityStart;
                        endTime = startTime + activityEnd;
                        startTime = mz(startTime).tz(this.currentStation.timezone).format();
                        endTime = mz(endTime).tz(this.currentStation.timezone).format();
                    }
                    const data = {
                        flightSchedulesId: { id: flightId },
                        taskScheduleDetailId: { id: ele.taskScheduleDetailId },
                        userId: { id: element.userId },
                        e_startTime: startTime,
                        e_endTime: endTime
                    };

                    const datas =
                    {
                        userId: element.userId,
                        taskDetail: {
                            t_eta: mz(startTime).tz(this.currentStation.timezone).format('YYYY-MM-DDTHH:mm:ss'),
                            t_etd: mz(endTime).tz(this.currentStation.timezone).format('YYYY-MM-DDTHH:mm:ss'),
                            t_ata: null,
                            t_atd: null,
                            u_s: ele.taskSkipped,
                            d_i: null,
                            d: ele.taskDuration,
                            s: ele.optional,
                            n: ele.taskName.replace(/(\r\n|\n|\r)/gm, ""),
                            id: ele.taskId,
                            a_st: ele.activityStartTime,
                            a_d_t: ele.arrivalDepartureType,
                            t_sc_id: ele.taskScheduleDetailId,
                            t_seq: ele.taskSequenceNumber,
                            p_by:null,
                            i_d_c:ele.is_depend_chockson
                        }
                    };
                    taskDetails.push(datas)
                    taskData.push(data); taskDataFull.push(ele);
                }
            }
            // securityAgent
            for (let index = 0; index < this.securityAgent.length; index++) {
                const element = this.securityAgent[index];
                for (let ind = 0; ind < element.list.length; ind++) {
                    const ele = element.list[ind];
                    if (ele.arrivalDepartureType == 0) {
                        diffTime = (ele.estimatedDepartureTime != null) ? ele.estimatedDepartureTime : ele.standardDepartureTime;
                        activityStart = (ele.activityStartTime) * 60000;
                        activityEnd = (ele.taskDuration) * 60000;
                        startTime = diffTime - activityStart;
                        endTime = startTime + activityEnd;
                        startTime = mz(startTime).tz(this.currentStation.timezone).format();
                        endTime = mz(endTime).tz(this.currentStation.timezone).format();
                    }
                    else {
                        diffTime = (ele.estimatedArrivalTime != null) ? ele.estimatedArrivalTime : ele.standardArrivalTime;
                        activityStart = (ele.activityStartTime) * 60000;
                        activityEnd = (ele.taskDuration) * 60000;
                        startTime = diffTime + activityStart;
                        endTime = startTime + activityEnd;
                        startTime = mz(startTime).tz(this.currentStation.timezone).format();
                        endTime = mz(endTime).tz(this.currentStation.timezone).format();
                    }
                    const data = {
                        flightSchedulesId: { id: flightId },
                        taskScheduleDetailId: { id: ele.taskScheduleDetailId },
                        userId: { id: element.userId },
                        e_startTime: startTime,
                        e_endTime: endTime
                    };

                    const datas =
                    {
                        userId: element.userId,
                        taskDetail: {
                            t_eta: mz(startTime).tz(this.currentStation.timezone).format('YYYY-MM-DDTHH:mm:ss'),
                            t_etd: mz(endTime).tz(this.currentStation.timezone).format('YYYY-MM-DDTHH:mm:ss'),
                            t_ata: null,
                            t_atd: null,
                            u_s: ele.taskSkipped,
                            d_i: null,
                            d: ele.taskDuration,
                            s: ele.optional,
                            n: ele.taskName.replace(/(\r\n|\n|\r)/gm, ""),
                            id: ele.taskId,
                            a_st: ele.activityStartTime,
                            a_d_t: ele.arrivalDepartureType,
                            t_sc_id: ele.taskScheduleDetailId,
                            t_seq: ele.taskSequenceNumber,
                            p_by:null,
                            i_d_c:ele.is_depend_chockson
                        }
                    };

                    taskDetails.push(datas)

                    taskData.push(data); taskDataFull.push(ele);
                }
            }


            const taskMqtt =
            {
                status: "true",
                flights:
                {
                    f_id: flightId,
                    a_f_no: this.fArrNo ? this.fArrNo : "--",
                    d_f_no: this.depNo ? this.depNo : "--",
                    t_count: taskDataFull.length
                },
                flights_details: {
                    f_id: flightId,
                    a_f_no: this.fArrNo ? this.fArrNo : "--",
                    d_f_no: this.depNo ? this.depNo : "--",
                    sta: this.psta,
                    std: this.pstd,
                    eta: this.peta,
                    etd: this.petd,
                    ata: this.pata,
                    atd: this.patd,
                    ataWeb: this.details.flightdetails.ataWeb,
                    atdWeb: this.details.flightdetails.atdWeb,
                    f_type: this.details.flightdetails.flightType,
                    bay_code: this.details.flightdetails.bayCode,
                },
                task_details: []
            }

            const mqttData = { 'flightSchId': flightId, 'data': taskDataFull };
            const mqttDataCount = { 'count': taskDataFull.length, 'data': { 'flightSchId': this.details.flightdetails.flightSchedulesId } };
            const ResourceAssignments = { ResourceAssignments: taskData }
            this.services.create(this.appUrl.geturlfunction('RESOURCE_MAPPING'), ResourceAssignments).subscribe(res => {
                if (res.status === 'success') {
                    this.resId = res.resourceids;
                    for (let index = 0; index < this.resId.length; index++) {
                        var element = this.resId[index];
                        var ts = taskDetails[index].taskDetail;
                        if (element.task_schedule_detail_id == ts.t_sc_id) {
                            ts.r_id = element.id;
                        }
                    }
                    taskMqtt.task_details = taskDetails;
                    this.closeModal();
                    let message = '';
                    console.log('task', this.details);
                    let fNo = this.details.flightdetails.depFlightNumber ? this.details.flightdetails.depFlightNumber : this.details.flightdetails.arrFlightNumber;
                    if (res.message.includes('updated') === true) {
                        message = 'Tasks reassigned successfully for ' + fNo + '';
                    } else {
                        message = 'Tasks assigned successfully for ' + fNo + '';
                    }
                    this.appService.showToast(message, 'custom', 'success');
                    const mqttTopic = this.currentStation.code + this.appUrl.getMqttTopic('TASK_ASSIGN');
                    const mqttTopicCount = this.currentStation.code + this.appUrl.getMqttTopic('TASK_ASSIGN_COUNT');
                    this.mqttService.unsafePublish(mqttTopic, JSON.stringify(mqttData), { qos: 1, retain: true });
                    this.mqttService.unsafePublish(mqttTopicCount, JSON.stringify(mqttDataCount), { qos: 0, retain: false });
                    if (taskMqtt.task_details) {
                        const mqttTask = this.currentStation.code + this.appUrl.getMqttTopic('TASK_ASSIGN_V2');
                        this.mqttService.unsafePublish(mqttTask, JSON.stringify(taskMqtt), { qos: 0, retain: true });
                        console.log(taskMqtt);
                    }
                } else {
                    this.appService.toast('', res.error, 'error', 'error-mode');
                }
            }, error => {
                this.appService.toast('', 'Server Error', 'error', 'error-mode');
            });
        }
    }
    // Task assignment Modal close
    closeModal() {
        this.dialogRef.close();
    }
    // function call for MQTT subscription 
    listenSocket() {
        const taskComplete = this.currentStation.code + this.appUrl.getMqttTopic('TASK_COMPLETE');
        this.mqttService.observe(taskComplete, { qos: 1 }).subscribe((message: IMqttMessage) => {
            const messageString = message.payload.toString();
            const messageObject = JSON.parse(messageString);
            if (messageObject.data.flightSchedulesId === this.details.flightdetails.flightSchedulesId) {
                // rampOfficer
                for (let index = 0; index < this.rampOfficer.length; index++) {
                    const officerTask = this.rampOfficer[index].list;
                    for (let ind = 0; ind < officerTask.length; ind++) {
                        const task = officerTask[ind];
                        if (messageObject.data.taskName == task.taskName) {
                            this.rampOfficer[index].list[ind].taskActualEndTime = messageObject.data.taskActualEndTime;
                        }
                    }
                }
                // rampAgent
                for (let index = 0; index < this.rampAgent.length; index++) {
                    const officerTask = this.rampAgent[index].list;
                    for (let ind = 0; ind < officerTask.length; ind++) {
                        const task = officerTask[ind];
                        if (messageObject.data.taskName == task.taskName) {
                            this.rampAgent[index].list[ind].taskActualEndTime = messageObject.data.taskActualEndTime;
                        }
                    }
                }
                // dutyManager
                for (let index = 0; index < this.dutyManager.length; index++) {
                    const officerTask = this.dutyManager[index].list;
                    for (let ind = 0; ind < officerTask.length; ind++) {
                        const task = officerTask[ind];
                        if (messageObject.data.taskName == task.taskName) {
                            this.dutyManager[index].list[ind].taskActualEndTime = messageObject.data.taskActualEndTime;
                        }
                    }
                }
                // securitySupervisor
                for (let index = 0; index < this.securitySupervisor.length; index++) {
                    const officerTask = this.securitySupervisor[index].list;
                    for (let ind = 0; ind < officerTask.length; ind++) {
                        const task = officerTask[ind];
                        if (messageObject.data.taskName == task.taskName) {
                            this.securitySupervisor[index].list[ind].taskActualEndTime = messageObject.data.taskActualEndTime;
                        }
                    }
                }
                // securityScreener
                for (let index = 0; index < this.securityScreener.length; index++) {
                    const officerTask = this.securityScreener[index].list;
                    for (let ind = 0; ind < officerTask.length; ind++) {
                        const task = officerTask[ind];
                        if (messageObject.data.taskName == task.taskName) {
                            this.securityScreener[index].list[ind].taskActualEndTime = messageObject.data.taskActualEndTime;
                        }
                    }
                }
                // securityAgent
                for (let index = 0; index < this.securityAgent.length; index++) {
                    const officerTask = this.securityAgent[index].list;
                    for (let ind = 0; ind < officerTask.length; ind++) {
                        const task = officerTask[ind];
                        if (messageObject.data.taskName == task.taskName) {
                            this.securityAgent[index].list[ind].taskActualEndTime = messageObject.data.taskActualEndTime;
                        }
                    }
                }
            }
        });
    }

    // Expand & collapse panel restriction
    expandPanel(matExpansionPanel: MatExpansionPanel, event: Event, source: any): void {
        event.stopPropagation();
        if (!this._isExpansionIndicator(event.target, source)) {
            matExpansionPanel.toggle(); // Here's the magic
        }
    }
    private _isExpansionIndicator(target: EventTarget, source: any) {
        const expansionIndicatorClass = 'mat-expansion-indicator';
        // return (target.classList && target.classList.contains(expansionIndicatorClass) );
    }

    // submit button disable
    handleButton() {
        if (this.taskList.length === 0) {
            this.enableSubmit = true;
        } else {
            this.enableSubmit = false;
        }
    }

}
