import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from "@angular/material";
import { AppService, TaskService, AuthService } from "../../../service/app.service";
import { AppUrl } from '../../../service/app.url-service';
import { ApiService } from '../../../service/app.api-service';
import { TaskComponent } from './task/task.component';
import { TaskScheduleDetails } from "./task/task-schedule-details.class";
import { AlertComponent } from '../../../alert/alert.component';
import * as momentzone from 'moment-timezone';
import { ToastrService, GlobalConfig } from 'ngx-toastr';
import { ToastComponent } from '../../../toast/toast.component';
import { EquipmentList } from '././task/aircraft-master.class';
import { CookieService } from 'ngx-cookie-service';
import { AppMessages } from '../../../service/app.messages';
import { CommonData } from '../../../service/common-data'
import * as _ from 'underscore';

@Component({
    templateUrl: './tasks.component.html',
    styleUrls: ['./tasks.component.scss']
})

export class TasksComponent implements OnInit, OnDestroy {
    // Initialize variables required for the page
    load: Boolean = false;
    viewType: any = this.appService.getcookie('userView') ? this.appService.getcookie('userView') : 'LIST_VIEW';
    task = TaskScheduleDetails;
    taskList: any;
    taskDet = TaskScheduleDetails;
    bayType: any;
    value: any;
    toasterOptions: GlobalConfig;
    equipmentType: any;
    flightType: any;
    selectedCategory: any;
    category: any;
    taskListLength: any;
    taskMasterId: any;
    zone: any;
    depTasks: any = [];
    equipments: EquipmentList[] = [];
    dependencyTasks: any;
    taskCombo: any;
    flightTypes = [];
    bayTypes = [];
    tasklist: any;
    sourceTasks: any;
    stateSubscription: any;
    searchText: string;
    baytype: string;
    rowDepTask: any;
    selectedDepTask: any;
    depTaskArr: any;
    taskInfodet: any;
    sourceTask: any;
    tasks: any;
    depValues: any
    taskInfos: TaskScheduleDetails[] = [];
    constructor(private dialog: MatDialog, private AppUrl: AppUrl, private appService: AppService, private services: ApiService, private taskService: TaskService, private toastr: ToastrService,
        private cookieService: CookieService, private appMessages: AppMessages, private commondata: CommonData, private auth: AuthService) {
        this.toasterOptions = this.toastr.toastrConfig;
        this.flightTypes = this.commondata.flightType;
        this.bayTypes = this.appService.toTitleCaseArray(this.commondata.bayType, 'type');
        this.zone = this.auth.user.airport.timezone;
    }

    actionSubscription: any;
    actionListSubscription: any;

    ngOnInit() {
        this.taskCombo = {
            flightType: 1,
            bayType: 0,
            equipmentTypeId: this.commondata.equimentCode
        }
        this.updateUserPreference(this.taskCombo.flightType, this.taskCombo.bayType, this.taskCombo.equipmentTypeId, '', '')
        this.getEquipmentList();
        this.getComboData();
        this.appService.addBtn.next(true);
        this.subscribeActions();
        this.appService.state.next('REFRESH');
        this.getTaskNames();
        console.log(this.category);
        this.baytype = this.commondata.bayTitle;
    }
    // function to subscribe to events and funcctions from station layout
    subscribeActions() {
        this.actionSubscription = this.appService.action.subscribe((action) => {
            if (action === 'ADD') {
                this.add();
            }
            if (action === 'REFRESH') {
                this.getTaskList(this.category)
            }
            if (action === 'GRID_VIEW' || action === 'LIST_VIEW') {
                this.viewType = action;
            }
            if (action === 'FLIGHT_TYPE' || action === 'BAY_TYPE' || action === 'EQUIPMENT_TYPE') {
                this.getComboData();
            }

        });

        this.stateSubscription = this.appService.filter.subscribe((value) => {
            this.searchText = value;
        })


    }
    ngOnDestroy() {
        this.appService.addBtn.next(false);
        this.appService.disable.next(' ');
        this.actionSubscription.unsubscribe();
    }
    // function to set the combination for which the list of tasks have to be fetched
    getComboData() {
        this.load = true;
        this.selectedCategory = this.taskCombo;
        this.category = 'bayType=' + this.selectedCategory.bayType + "&equipmentType=" + this.selectedCategory.equipmentTypeId + "&flightType=" + this.selectedCategory.flightType;
        this.getTaskList(this.category);
        console.log(this.category);
    }
    // GET API call to fetch list of tasks available based on the selected  combination
    getTaskList(list) {
        this.services.getAll(this.AppUrl.geturlfunction('GET_TASKS_BY_COMBO') + list).subscribe(res => {
            this.taskList = this.appService.sortNumber(res.data[0].taskScheduleDetailsList, 'taskSequenceNumber');
            if (this.taskList.length == 0) {
                this.taskList.taskScheduleId = { 'id': res.data[0].id };
            }
            for (let i = 0; i < this.taskList.length; i++) {
                this.taskList[i].taskScheduleId = { 'id': this.taskList[i].taskScheduleMasterId };
            }
            this.taskListLength = res.data[0].taskScheduleDetailsList.length;
            this.taskMasterId = res.data[0].id;
            this.getDependency(this.taskMasterId);
            this.load = false;
            this.getTaskNames();
        }, error => {
            this.load = false;
        });

    }
    // function to open ADD new task dialog box 
    add() {
        console.log(this.taskList)
        const dialogRef = this.dialog.open(TaskComponent, {
            position: {
                right: '0'
            },
            width: '600px',
            panelClass: 'modelOpen',
            data: {
                mode: 'ADD',
                taskInfo: this.taskList,
                taskInfos: this.taskList,
                taskScheduleId: this.taskList.taskScheduleId ? this.taskList.taskScheduleId.id : this.taskList[0].taskScheduleId.id,
                groupBy: this.selectedCategory
            }
        })
        // return response when the dialog box is closed
        dialogRef.afterClosed().subscribe(result => {
            if (result !== undefined) {
                this.getComboData();
                this.getTaskList(this.selectedCategory);
            }
        });
    }
    // function to open ADD new task dialog box 
    edit(row) {
        console.log(row)

        this.selectedDepTask = [];
        this.depTaskArr = [];
        this.taskInfodet = JSON.parse(JSON.stringify(row));
        this.sourceTask = JSON.parse(JSON.stringify(row));
        this.tasks = [];
        this.depTasks = [];
        for (let index = 0; index < this.depValues.length; index++) {
            if (this.depValues[index].id !== row.id) {
                this.depTasks.push(this.depValues[index]);
            }
        }
        this.depTaskArr = [];
        if (row.dependency.length > 0) {

            for (let ind = 0; ind < this.dependencyTasks.length; ind++) {
                if (this.dependencyTasks[ind].task_schedule_detail_id == row.id) {

                    this.depTaskArr.push({ "id": this.dependencyTasks[ind].dependent_task_schedule_id, "itemName": this.dependencyTasks[ind].dependent_task_desc });
                }
            }
        }
        this.rowDepTask = this.depTaskArr;
        this.tasks.push(row.taskId);
        let valuesModel = JSON.parse(JSON.stringify(row)) // Doing deep copy
        const dialogRef = this.dialog.open(TaskComponent, {
            position: {
            },
            width: '600px',
            panelClass: 'modelOpen',
            data: {
                mode: 'EDIT',
                taskInfo: valuesModel,
                taskInfos: this.taskList,
                taskScheduleId: this.taskList[0].taskScheduleId.id,
                groupBy: this.selectedCategory,
                depTasks: this.depTasks,

            }
        });
        // return response when dialog box is closed
        dialogRef.afterClosed().subscribe(result => {
            if (result !== undefined) {
                this.getComboData();
                this.getTaskList(this.category);
            }
        });
    }
    // function to open confirmation dialog box for delete
    delete(data: any) {
        console.log(data);
        if (this.dialog.openDialogs.length > 0) {
            return;
        }
        console.log('DIALOG OPENED');
        const dialogRef = this.dialog.open(AlertComponent, {
            minWidth: '500px',
            panelClass: 'modelOpen',
            data: {
                text: {
                    main: 'Delete Staff',
                    sub: 'Do you wish to remove ' + data.taskId.name + ' task from the list?'
                },
                ok: 'YES',
                cancel: 'NO'
            }
        });
        // return response when confirmation dialog box is closed
        dialogRef.afterClosed().subscribe(result => {
            if (result !== undefined) {
                this.deleteTask(data);
            }
        });
    }
    // DELETE API based on confirmation response dialog box
    deleteTask(data: any) {
        const taskDelete = data;
        this.touchTime(taskDelete);
        taskDelete.active = 'N';
        this.services.create(this.AppUrl.geturlfunction('TASK_MASTER_UPDATE'), taskDelete).subscribe(res => {
            if (res.status === true) {
                this.getTaskList(this.category);
                const preference = JSON.parse(this.appService.getcookie('userPreference'))
                const message = data.taskId.name;
                const userPreference = preference.taskInfo;
                const message1 = this.commondata.flightType[userPreference.flightType].type
                    + ' - ' + this.appService.toTitleCase(this.commondata.bayType[userPreference.bayType].type)  + ' - ' +
                    ' ' + userPreference.equipmentValue;
                const toastMsg = this.appMessages.getMessage('TASK_INFO_DELETE', '');
                this.appService.showToast(message + toastMsg + message1, 'custom', 'success');
            } else {
                if (res.errorMessage.includes('duplicate') === true) {
                    this.appService.toast('', 'Record already exists', 'warning', 'warning-mode');
                } else {
                    this.appService.toast('', res.errorMessage, 'error', 'error-mode');
                }
            }
        }, error => {
            this.appService.toast('', 'Server Error', 'error', 'error-mode');
        });

    }
    getDependency(id): void {
        // dependent tasks api call
        this.services.getById(this.AppUrl.geturlfunction('TASKDEPENDENCY_SERVICE_ByID'), id).subscribe(res => {
            this.dependencyTasks = res.data;
            let newObj = this.taskList;
            this.depTasks = [];
            for (let index = 0; index < newObj.length; index++) {
                this.depTasks.push({ 'id': newObj[index].id, 'itemName': newObj[index].taskId.name })
            }
            var sortDepTaskName = this.depTasks;
            /* sorting task name in  ASC order */
            sortDepTaskName.sort(function (a, b) {
                var keyA = a.itemName,
                    keyB = b.itemName;
                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;
                return 0;
            });
            this.depValues = sortDepTaskName;
            for (let i = 0; i < this.taskList.length; i++) {
                var temp = [];
                if (this.dependencyTasks) {
                    for (let j = 0; j < this.dependencyTasks.length; j++) {

                        if (this.taskList[i].id == this.dependencyTasks[j].task_schedule_detail_id) {
                            temp.push(this.dependencyTasks[j])
                        }
                    }
                }
                this.taskList[i].dependency = temp;
            }
        })
    }

    touchTime(data: any) {
        const newData = data;
        newData.active = 'Y';
        newData.createdBy = 1;
        newData.createdAt = momentzone().tz(this.zone).unix();
        newData.modifiedBy = 1;
        newData.modifiedAt = momentzone().tz(this.zone).unix();
        return newData;
    }
    // GET API call to fetch list of tasks available
    getTaskNames() {
        this.services.getAll(this.AppUrl.geturlfunction('GET_TASK_MASTERLIST')).subscribe(res => {
            this.tasklist = res.data;
            if (this.tasklist.length == this.taskList.length) {
                this.appService.disable.next('DISABLE-ADD');
            }
            else {
                this.appService.disable.next(' ');
            }
        })
    }

    // function called whenever there is a change in the selected conbination
    modList(data: any) {
        const equipmentType = _.where(this.equipments, { id: this.taskCombo.equipmentTypeId });
        this.taskCombo = {
            'flightType': this.taskCombo.flightType,
            'bayType': this.taskCombo.bayType,
            'equipmentTypeId': this.taskCombo.equipmentTypeId
        };
        this.updateUserPreference(this.flightTypes[this.taskCombo.flightType].id,
            this.bayTypes[this.taskCombo.bayType].id, this.taskCombo.equipmentTypeId, equipmentType[0].description, '')
        this.getComboData()
    }
    // GET API to fetch list of equipments available
    getEquipmentList() {
        this.services.getAll(this.AppUrl.geturlfunction('EQUIPMENT_TYPE_SERVICE')).subscribe(res => {
            let equipment = new EquipmentList({});
            this.equipments = equipment.set(res.data);
            const preference = JSON.parse(this.appService.getcookie('userPreference'))
            const userPreference = preference.taskInfo;
            const equipmentTypeName = _.where(this.equipments, { id: this.taskCombo.equipmentTypeId });
            let equipmentTypeNameValue = equipmentTypeName[0].description;
            this.updateUserPreference(userPreference.flightType, userPreference.bayType,
                userPreference.equipmentTypeId, equipmentTypeNameValue, '');
        }, error => {
        });
    }
    // functionn to reset the user selected combination
    updateUserPreference(flightType, bayType, equipmentType, equipmentValue, task) {
        const comboValue = {
            'flightType': flightType,
            'bayType': bayType,
            'equipmentTypeId': equipmentType,
            'equipmentValue': equipmentValue,
            'task': ''
        }
        const userPreference = JSON.stringify({ taskInfo: comboValue });
        this.appService.setCookie('userPreference', userPreference)
        console.log('updated', userPreference);
    }
}
