import { Component, Inject, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { ApiService } from '../../../../service/app.api-service';
import { AppService, AuthService } from '../../../../service/app.service';
import { AppUrl } from '../../../../service/app.url-service';
import { ToastrService, GlobalConfig } from 'ngx-toastr';
import { ToastComponent } from '../../../../toast/toast.component';
import * as momentzone from 'moment-timezone';
import { TaskScheduleDetails } from "./task-schedule-details.class";
import { Task } from "./task-master.class";
import { EquipmentList } from './aircraft-master.class';
import { TaskScheduleMaster } from './task-schedule-master.class';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { AppMessages } from '../../../../service/app.messages';
import { SortValues, ParseValues, FilterPipe } from '../../../../service/app.pipe';
import { CommonData } from '../../../../service/common-data';
import * as _ from 'underscore';

@Component({
  selector: 'task-info',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
  providers: [SortValues, ParseValues, FilterPipe]

})

export class TaskComponent implements OnInit {
  // initialization of variables for the page
  searchText: any;
  taskInfo: TaskScheduleDetails;
  taskInfos: TaskScheduleDetails[] = [];
  allTasks: Task[] = [];
  tasks: Task[] = [];
  sourceTasks: Task[] = [];
  taskScheduleId: number;
  toasterOptions: GlobalConfig;
  taskName: any;
  groupBy: any;
  depTasks: any = [];
  mode: string;
  isDepChanged: boolean = false;
  selectedDepTask: any = [];
  loading: boolean = false;
  taskScheduleMasterId: number;
  currentStation: any;
  createdTask: any;
  taskInfoType: any;
  preferenceFlight = '';
  preferenceBay = '';
  preferenceEquipment = '';
  preferences: any;
  deletePreference: any;
  getPreference: any;
  taskInfoTypes: any;

  constructor(private dialogRef: MatDialogRef<TaskComponent>, @Inject(MAT_DIALOG_DATA) public details: any, private auth: AuthService, private services: ApiService, private appService: AppService, private toastr: ToastrService, private AppUrl: AppUrl, private fb: FormBuilder, private filterpipe: FilterPipe,
    private cookieService: CookieService, private sortPipe: SortValues, private ParsePipe: ParseValues, private appMessages: AppMessages, private commondata: CommonData) {
    this.toasterOptions = this.toastr.toastrConfig;
    this.taskInfo = new TaskScheduleDetails;
    this.groupBy = this.details.groupBy;
    this.depTasks = [];
    this.mode = this.details.mode;
    this.taskScheduleMasterId = this.details.taskScheduleId;
    this.currentStation = {
      "id": this.auth.user.userAirportMappingList[0].id,
      "code": this.auth.user.userAirportMappingList[0].code,
      "timezone": this.auth.user.airport.timezone,
      "userId": this.auth.user.id
    },
      this.taskInfo = this.details.mode === 'ADD' ? new TaskScheduleDetails({ arrDepType: this.groupBy.flightType === 0 ? 0 : 1 }) : this.details.taskInfo;
    this.taskInfos = this.details.taskInfos;
    this.getTaskNames();
    this.dialogRef.disableClose = true;
  }

  ngOnInit() {

    const preference = JSON.parse(this.appService.getcookie('userPreference'));
    const userPreference = preference.taskInfo;
    let flightType = this.commondata.flightType[userPreference.flightType].type;
    let bayType = this.commondata.bayType[userPreference.bayType].type;
    this.preferenceFlight = flightType;
    this.preferenceBay = bayType;
    this.preferenceEquipment = userPreference.equipmentValue;
  }
  closeModal() {
    this.dialogRef.close();
  }
  // GET API to fetch list of tasks available
  getTaskNames() {
    let taskInfos = this.details.taskInfos;
    this.services.getAll(this.AppUrl.geturlfunction('GET_TASK_MASTERLIST')).subscribe(res => {
      this.tasks = res.data;
      this.allTasks = Task.setTasks(this.tasks);
      this.sortPipe.transform(this.allTasks, 'name');
      this.filterTasks();
    });
  }
  // function to calculat the count of dependency tasks selected
  checkedCount() {
    return this.depTasks.filter(function (task) {
      return task.checked;
    }).length;
  }
  // function to select the type of dependency that is selected
  selectDependency(task: any) {
    task.dependency_type = task.checked ? 0 : task.dependency_type;
    this.isDepChanged = true;
  }
  selectDepType(task: any, dependency_type: number) {
    task.dependency_type = dependency_type;
    this.isDepChanged = true;
  }
  // function to segregate unassigned tasks to display in the dropdown
  filterTasks() {
    this.sourceTasks = [];
    this.depTasks = [];
    let existTasksIndex = [];
    for (let i = 0; i < this.taskInfos.length; i++) {
      if (existTasksIndex.indexOf(this.taskInfos[i].taskId.id) === -1) {
        existTasksIndex.push(this.taskInfos[i].taskId.id);
      }
      if (this.taskInfos[i].id !== this.taskInfo.id) {
        this.depTasks.push({ 'id': this.taskInfos[i].id, 'itemName': this.taskInfos[i].taskId.name, checked: false });
      }
    }
    this.sortPipe.transform(this.depTasks, 'itemName');

    if (this.mode === 'ADD') {
      for (let i = 0; i < this.allTasks.length; i++) {
        if (existTasksIndex.indexOf(this.allTasks[i].id) === -1) {
          this.sourceTasks.push(this.allTasks[i]);
        }
      }
    }

    if (this.mode === 'EDIT') {
      this.sourceTasks.push(new Task({ id: this.taskInfo.taskId.id, name: this.taskInfo.taskId.name }));

      let depTasksIndex = this.ParsePipe.transform(this.depTasks, 'id');
      for (let i = 0; i < this.taskInfo.dependency.length; i++) {
        let taskIndex = depTasksIndex.indexOf(this.taskInfo.dependency[i].dependent_task_schedule_id);
        if (taskIndex > -1) {
          this.depTasks[taskIndex].checked = true;
          this.depTasks[taskIndex].dependency_type = this.taskInfo.dependency[i].dependency_type;
        }
      }
    }

  }
  // function to set the new combination selected in the cookies
  modList(data) {
    const task = _.where(this.sourceTasks, { id: data });
    const preference = JSON.parse(this.appService.getcookie('userPreference'))
    const userPreference = preference.taskInfo;
    const userPreferenceTask = {
      'flightType': userPreference.flightType,
      'bayType': userPreference.bayType,
      'equipmentTypeId': userPreference.equipmentTypeId,
      'equipmentValue': userPreference.equipmentValue,
      'task': task[0].name
    }
    const userPreferenceValue = JSON.stringify({ taskInfo: userPreferenceTask });
    this.appService.setCookie('userPreference', userPreferenceValue)
    this.createdTask = task[0].name;
    const preferences = JSON.parse(this.appService.getcookie('userPreference'))
  }

  onChange(data) {
   for (let index = 0; index < this.sourceTasks.length; index++) {
      const element = this.sourceTasks[index];
      if (element.id === data) {
        this.taskName = element.name;
      }
    }
  }

  touchTime(data: any) {
    const newData = data;
    newData.active = 'Y';
    newData.createdBy = this.currentStation.userId;
    newData.createdAt = momentzone().tz(this.currentStation.timezone).unix();
    newData.modifiedBy = this.currentStation.userId;
    newData.modifiedAt = momentzone().tz(this.currentStation.timezone).unix();
    return newData;
  }

  arrDepValue(param) {
    console.log(param)
    if (param.index == 1) {
      this.taskInfo.arrDepType = 1;
    } else {
      this.taskInfo.arrDepType = 0;
    }
  }

  optionalValue(param) {
    console.log(param)
    if (param.index == 0) {
      this.taskInfo.optional = 0;
    } else {
      this.taskInfo.optional = 1;
    }
  }

  getDependentTask() {
    return this.depTasks.filter(task => task.checked) || [];
  }

  error(error: string = 'Please try after sometime') {
    this.loading = false;
    this.appService.toast('', "error", error);
    // this.loaderService.display(false);
  }

  saveTaskDependency() {
    this.dialogRef.close('RELOAD');
    let taskInfo = this.taskInfo;
    if (!this.isSequenceNoAvailable(taskInfo)) {
      return false;
    }

    this.loading = true;
    // this.loaderService.display(true);
    taskInfo.taskScheduleId.id = this.taskScheduleMasterId;
    this.selectedDepTask = this.getDependentTask();
    this.touchTime(taskInfo)
    console.log('printing..', taskInfo);
    let url = this.mode === 'EDIT' ? this.AppUrl.geturlfunction('TASK_MASTER_UPDATE') : this.AppUrl.geturlfunction('TASK_MASTER_CREATE');

    // const preference = JSON.parse(this.cookieService.get('userPreference'))

    const preference = JSON.parse(this.appService.getcookie('userPreference'))
    const userPreference = preference.taskInfo;
    const userPreferenceTask = {
      'flightType': userPreference.flightType,
      'bayType': userPreference.bayType,
      'equipmentTypeId': userPreference.equipmentTypeId,
      'equipmentValue': userPreference.equipmentValue,
      'task': taskInfo.taskId.name
    }
    console.log(userPreferenceTask, "two")
    const userPreferenceTaskJson = JSON.stringify({ taskInfo: userPreferenceTask });
    this.appService.setCookie('userPreference', userPreferenceTaskJson)

    this.services.create(url, taskInfo).subscribe(res => {
      // this.loaderService.display(false);
      if (!res.status) {
        if (res.errorMessage.substring(0, 4) == "dupl") {
          this.appService.toast('', 'error', 'Sequence Number Already Exists');
        }
        //this.error(res.errorMessage);
        return;
      }
      let taskInfoId = this.mode === 'EDIT' ? this.taskInfo.id : res.id;
      if (this.selectedDepTask.length === 0) {
        this.removeDependency(taskInfoId);
        return;
      }
      if (this.isDepChanged) {
        this.saveDependency(taskInfoId);
        return;
      }
    }, error => {
      this.error(error);
    });
  }

  setTaskDependency(taskId: any, dependentTask: any): any {
    return {
      "task_schedule_detail_id": parseInt(taskId),
      "dependent_task_schedule_detail_id": parseInt(dependentTask.id),
      "start_strict": false,
      "active": "Y",
      "user": parseInt(this.currentStation.userId),
      "dependency_type": parseInt(dependentTask.dependency_type)
    }
  }

  saveDependency(id: number) {
    console.log(id)

    let dependency: any = [];
    for (let i = 0; i < this.selectedDepTask.length; i++) {
      dependency.push(this.setTaskDependency(id, this.selectedDepTask[i]));
    }
    if (dependency.length === 0) {
      dependency.push(this.setTaskDependency(id, this.selectedDepTask));
    }

    let url = this.mode === 'EDIT' ? this.AppUrl.geturlfunction('TASKDEPENDENCY_DETAILS_UPDATE') : this.AppUrl.geturlfunction('TASKDEPENDENCY_DETAILS_CREATE');
    console.log(url)
    this.services.create(url, { data: dependency }).subscribe(res => {
      if (res.status) {
        this.success();
        return;
      }
      this.error(res.errorMessage);
    }, error => {
      this.error(error);
    });
  }
  removeDependency(id: number) {

    let deleteItem = {
      "user": this.currentStation.userId,
      "task_schedule_detail_id": id
    };

    this.services.create(this.AppUrl.geturlfunction('TASKDEPENDENCY_DETAILS_DELETE'), deleteItem).subscribe(res => {
      if (res.status) {
        this.success();
        return;
      }
      this.error(res.errorMessage.substring(0, 4) == "dupl" ? "Entered Task details already exist" : res.errorMessage);
    }, error => {
      this.error(error);
    });
  }

  success() {
    // let msg = taskNam + " has been updated as new task for the combination : " + flightTypedetail + " – " + baynumber + " – " + this.eqpTyp;
    let msg = 'Task updated successfully';

    if (this.details.mode === 'ADD') {
      msg = "Task created successfully";
    }
    //  const preference = JSON.parse(this.cookieService.get('userPreference'))

    const preference = JSON.parse(this.appService.getcookie('userPreference'))

    const userPreference = preference.taskInfo;
    let message = '';
    if (userPreference.task === '') {
      message = this.createdTask
    } else {
      message = userPreference.task;
    }
    const message1 = this.commondata.flightType[userPreference.flightType].type + ' - ' + this.appService.toTitleCase(this.commondata.bayType[userPreference.bayType].type) + ' - ' +
      ' ' + userPreference.equipmentValue;
    const toastMsg = this.appMessages.getMessage('TASK_INFO_UPDATE', '');
    this.appService.showToast(message + toastMsg + message1, 'custom', 'success');

    // this.appService.showToast('TASK_INFO_UPDATE', '', 'success');
    this.appService.action.next('REFRESH');
  }

  isSequenceNoAvailable(taskInfo: any) {
    for (let i = 0; i < this.taskInfos.length; i++) {
      let task = this.taskInfos[i];
      if (task.taskSequenceNumber === taskInfo.taskSequenceNumber && (task.id == 0 || task.id !== taskInfo.id)) {
        this.appService.toast('', 'error', 'Sequence Number Already Exists');
        return false;
      }
    }
    return true;
  }

}