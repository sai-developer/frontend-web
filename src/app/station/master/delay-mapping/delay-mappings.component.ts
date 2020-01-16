import { Component, OnInit, OnDestroy } from '@angular/core';
import { DelayMappingComponent } from "./dealy-mapping/delay-mapping.component";
import { MatDialog } from "@angular/material";
import { AppService, AuthService } from "../../../service/app.service";
import { AppUrl } from '../../../service/app.url-service';
import { ApiService } from '../../../service/app.api-service';
import { AlertComponent } from '../../../alert/alert.component';
import { ToastrService, GlobalConfig } from 'ngx-toastr';
import { ToastComponent } from '../../../toast/toast.component';
import { MatExpansionPanel } from '@angular/material';

@Component({
  templateUrl: './delay-mappings.component.html',
  styleUrls: ['./delay-mappings.component.scss']
})

export class DelayMappingsComponent implements OnInit, OnDestroy {
  // Initialize variables required for the page
  load: Boolean = false;
  viewType: any = this.appService.getcookie('userView') ? this.appService.getcookie('userView') : 'LIST_VIEW';
  delayTasksList: any[] = [];
  manipulatedDelayTask: any[] = [];
  curIns: any;
  actionSubscription: any;
  currentStation: any;
  toasterOptions: GlobalConfig;
  stateSubscription: any;
  searchText: string;
  constructor(private dialog: MatDialog, private AppUrl: AppUrl, private auth: AuthService, private appService: AppService, private toastr: ToastrService, private services: ApiService) {
    this.currentStation = { "id": this.auth.user.userAirportMappingList[0].id, "userId": this.auth.user.id, "code": this.auth.user.userAirportMappingList[0].code }
    this.toasterOptions = this.toastr.toastrConfig;
  }

  ngOnInit() {
    this.getTaskDelayList();
    this.subscribeActions();
    this.appService.state.next('REFRESH');
  }

  ngOnDestroy() {
    this.appService.addBtn.next(false);
    this.appService.disable.next(' ');
    this.actionSubscription.unsubscribe();
  }
// Function to subscribe to events/Functions required from the station layout
  subscribeActions() {
    this.actionSubscription = this.appService.action.subscribe((action) => {
      if (action === 'ADD') {
        this.add();
      }
      if (action === 'GRID_VIEW' || action === 'LIST_VIEW') {
        this.viewType = action;
      }
    });
    this.stateSubscription = this.appService.filter.subscribe((value) => {
      this.searchText = value;
    })

  }
// Funciton to open Edit delay mapping dialog box
  edit(delayTaskIns) {
    const dialogRef = this.dialog.open(DelayMappingComponent, {
      position: {
      },
      width: '600px',
      panelClass: 'modelOpen',
      data: {
        mode: 'EDIT',
        taskDetails: delayTaskIns,
        list: this.taskMaster
      }
    })
// Return response when the dialog box is closed
    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (result !== undefined) {
        this.getTaskDelayList();
      }
    });
  }
// function to open Add New delay Mapping dialog box
  add() {
    const dialogRef = this.dialog.open(DelayMappingComponent, {
      position: {
        right: '0'
      },
      width: '600px',
      panelClass: 'modelOpen',
      data: {
        mode: 'ADD',
        list: this.taskMaster,
        nonAssigned: this.nonAssigned
      }
    })
// return response when the dialog box closed
    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (result !== undefined) {
        this.getTaskDelayList();
      }
    });
  }
// GET API call to fetch list of Tasks mapped with delay codes
  getTaskDelayList() {
    this.load = true;
    this.services.getAll(this.AppUrl.geturlfunction('GET_DELAY_TASK_MAPPING')).subscribe(res => {
      this.delayTasksList = this.appService.sortName(res.data, 'task_name');
      let tmpObj = this.groupBy(this.delayTasksList, 'task_name');
      this.manipulatedDelayTask = [];
      for (let field in tmpObj) {
        this.manipulatedDelayTask.push(tmpObj[field]);
      }
      const manipulatedDelayTask = [];
      for (let index = 0; index < this.manipulatedDelayTask.length; index++) {
        const element = this.manipulatedDelayTask[index];
        var inner = [];
        for (let ind = 0; ind < element.length; ind++) {
          const ele = element[ind];
          ele.sorting = ele.delay_numeric_code + '(' + ele.delay_alphabetic_code + '}';
          inner.push(ele);
        }
        inner = this.appService.sortAlphaNumeric(inner, 'sorting');
        manipulatedDelayTask.push(inner);
      }
      this.manipulatedDelayTask = manipulatedDelayTask;
      this.getTaskNames();
      if (res.errorMessage) {
        this.appService.toast('', res.errorMessage, 'error', 'error-mode');
      }
      this.load = false;
    }, error => {
      this.load = false;
    });
  }
  // Function to group the delay codes with respect to the tasks
  groupBy(iarr, ikey) {
    return iarr.reduce((a, b) => {
      (a[b[ikey]] = a[b[ikey]] || []).push(b);
      return a;
    }, {})
  }
  deletedItem: any;
  // functiont to open delete confirmation dialog box
  delete(data: any) {
    this.deletedItem = '';
    for (let index = 0; index < this.manipulatedDelayTask.length; index++) {
      if (data === this.manipulatedDelayTask[index][0].task_id) {
        this.deletedItem = this.manipulatedDelayTask[index][0].task_name;
        break;
      }
    }
    if (this.dialog.openDialogs.length > 0) {
      return;
    }
    const dialogRef = this.dialog.open(AlertComponent, {
      minWidth: '500px',
      panelClass: 'modelOpen',
      data: {
        text: {
          sub: 'Do you wish to remove ' + this.deletedItem + ' from the list?'
        },
        ok: 'YES',
        cancel: 'NO'
      }
    });
    // return response when the confirmation dialog box is closed
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.deleteDelayTask(data);
      }
    });
  }
  // DELETE API call to based on confirmation dialog box
  deleteDelayTask(value) {
    let taskDelayName = '';
    for (var index = 0; index < this.manipulatedDelayTask.length; index++) {
      var element = this.manipulatedDelayTask[index];
      taskDelayName = element[0].task_name;
    }
    let deleteId = { task_id: value, user: this.currentStation.userId };
    this.services.create(this.AppUrl.geturlfunction('DELAY_TASK_MAPPING_DELETE'), deleteId).subscribe(res => {
      //this.common.toast("success", taskDelayName+" has been deleted successfully");
      this.appService.toast('', this.deletedItem + " has been deleted successfully", 'success', 'success-mode');
      this.getTaskDelayList();
    }, error => {
      this.appService.toast('', 'server error', 'error', 'error-mode');
    });
  }
  
  taskMaster: any;
  nonAssigned: any;
  // GET API to fetch list of tasks availabe
  getTaskNames() {
    this.services.getAll(this.AppUrl.geturlfunction('GET_TASK_MASTERLIST')).subscribe(res => {
      this.taskMaster = res.data;
      console.log(this.taskMaster);
      this.findNonAssignedTasks();
    },
      error => {
        console.log("error")
      });
  }
  // funciton to filter the tasks that have delay codes mapped from those that dont
  findNonAssignedTasks() {
    let uniqueAllTasks = [];
    let uniqueAssingedTasks = [];
    let nonAssignedTasks = [];
    for (let i = 0; i < this.taskMaster.length; i++) {
      if (uniqueAllTasks.indexOf(this.taskMaster[i].id) === -1) {
        uniqueAllTasks.push(this.taskMaster[i].id);
      }
    }
    for (let i = 0; i < this.manipulatedDelayTask.length; i++) {
      if (uniqueAssingedTasks.indexOf(this.manipulatedDelayTask[i][0].task_id) === -1) {
        uniqueAssingedTasks.push(this.manipulatedDelayTask[i][0].task_id);
      } else if (uniqueAssingedTasks.indexOf(this.manipulatedDelayTask[i][0].task_id) === 1) {
        nonAssignedTasks.push(this.manipulatedDelayTask[i][0].task_id);
      }
    }
    for (let i = 0; i < uniqueAllTasks.length; i++) {
      if (uniqueAssingedTasks.indexOf(uniqueAllTasks[i]) === -1) {
        nonAssignedTasks.push(this.taskMaster[i]);
      }
    }
    this.nonAssigned = nonAssignedTasks;
    if (this.nonAssigned.length == 0) {
      this.appService.disable.next('DISABLE-ADD');
    }
    else {
      this.appService.disable.next(' ');
    }
  }
}
