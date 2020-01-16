import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppUrl } from '../../../service/app.url-service';
import { ApiService } from '../../../service/app.api-service';
import { AppService, AuthService } from "../../../service/app.service";
import { MatDialog } from "@angular/material";
import { StaffComponent } from "./staff/staff.component";
import { AlertComponent } from '../../../alert/alert.component';
import * as momentzone from 'moment-timezone';
import {
  IMqttMessage,
  MqttModule,
  IMqttServiceOptions,
  MqttService
} from 'ngx-mqtt';

@Component({
  templateUrl: './staffs.component.html',
  styleUrls: ['./staffs.component.scss']
})

export class StaffsComponent implements OnInit, OnDestroy {
  load: Boolean = false;
  staffList: any[] = [];
  actionSubscription: any;
  zone = 'Europe/Dublin';
  currentStation: any;
  role: any;
  // viewType: String = 'GRID_VIEW';
  viewType: any = this.appService.getcookie('userView') ? this.appService.getcookie('userView') : 'LIST_VIEW'
  stateSubscription: any;
  searchText: string;
  selectedRow: number;
  constructor(private services: ApiService, private mqttService: MqttService, private AppUrl: AppUrl, private appService: AppService, private auth: AuthService, private dialog: MatDialog) {
    this.currentStation = { "id": this.auth.user.userAirportMappingList[0].id, "userId": this.auth.user.id, "code": this.auth.user.userAirportMappingList[0].code }
  }
  ngOnInit() {
    this.getStaffList('init');
    this.appService.addBtn.next(true);
    this.subscribeActions();
    this.getRoles();
    this.appService.state.next('REFRESH');
  }
  ngOnDestroy() {
    this.actionSubscription.unsubscribe();
  }

  //getting roles from role master api
  getRoles() {
    this.services.getAll(this.AppUrl.geturlfunction('GET_ROLE_MASTER')).subscribe(res => {
      this.role = this.appService.sortName(res.successMessage, 'name');
    }, error => {
      console.log('error')
    });
  }

  //function for subscribe from observable
  subscribeActions() {
    this.actionSubscription = this.appService.action.subscribe((action) => {
      if (action === 'ADD') {
        this.add();
      } else if (action === 'REFRESH') {
        this.getStaffList('init');
      } else if (action.indexOf('REFRESH_') != -1) {
        let id = action.split('_', 2);
        this.getStaffList(id[1]);
      }
      if (action === 'GRID_VIEW' || action === 'LIST_VIEW') {
        this.viewType = action;
      }
    });

    this.stateSubscription = this.appService.filter.subscribe((value) => {
      this.searchText = value;
    })
  }

  //opening the add modal dialog box
  add() {
    const dialogRef = this.dialog.open(StaffComponent, {
      position: {
        right: '0'
      },
      // minHeight: '96vh',
      // maxHeight: '90vh',
      panelClass: 'modelOpen',
      width: '600px',
      data: {
        mode: 'ADD',
        Role: this.role,
        Location: this.staffList[0].userAirportMappingList[0].code
      }
    })

    //function to be called while closing the add modal dialog
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.getStaffList('init');
      }
    })
  }
  //function for the edit modal opening
  edit(staff) {
    const dialogRef = this.dialog.open(StaffComponent, {
      position: {
        // top: '20px'
      },
      // minHeight: '96vh',
      width: '600px',
      panelClass: 'modelOpen',
      data: {
        mode: 'EDIT',
        staff: staff,
        Role: this.role,
        Location: staff.userAirportMappingList[0].code
      }
    });

    //function to be called while closing the edit modal
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.getStaffList('init');
      }
    })
  }

//to get  the staff list by  station
  getStaffList(action: any) {
    this.load = true;
    this.services.getAll(this.AppUrl.geturlfunction('GET_STAFF_BY_STATION') + this.currentStation.code).subscribe(res => {
      this.staffList = this.appService.sortName(res.data, 'userId');
      if (action !== 'init') {
        // If we remember id , then we need to publish
        // after publish , remove the remembered id
        console.log('full list', this.staffList);
        for (let index = 0; index < this.staffList.length; index++) {
          const staff = this.staffList[index];
          if (staff.id == action) {
            //publish this user
            console.log(staff)
            this.mqttService.unsafePublish("USERS/" + staff.userId, JSON.stringify(staff), { qos: 1, retain: true });
          }
        }
      }
      this.load = false;
    }, error => {
      this.load = false;
      console.log('error');
    });

  }

  //function for  opening the  delete modal  box
  delete(data: any) {
    if (this.dialog.openDialogs.length > 0) {
      return;
    }
    console.log('DIALOG OPENED');
    const dialogRef = this.dialog.open(AlertComponent, {
      width: '500px',
      // minHeight: '185px',
      panelClass: 'modelOpen',
      data: {
        text: {
          sub: ' Do you wish to delete ' + data.firstName + " " + data.lastName
        },
        ok: 'YES',
        cancel: 'NO'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.deleteStaff(data);
      }
    });
  }
//function for deleting the staffs
  deleteStaff(data: any) {
    const staff = data;
    this.touchTime(staff);
    staff.active = 'N';
    this.services.create(this.AppUrl.geturlfunction('USER_MASTER_UPDATE'), staff).subscribe(res => {
      const staffName = staff.firstName + ' ' + staff.lastName;
      if (res.status === true) {
        this.getStaffList('init');
        this.appService.showToast('STAFF_DELETE', staffName, 'success');
      } else {
        if (res.errorMessage.includes('duplicate') === true) {
          this.appService.showToast('STAFF_DUPLICATE', staffName, 'warning');
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
    newData.createdBy = this.currentStation.userId;
    newData.createdAt = momentzone().tz(this.zone).unix();
    newData.modifiedBy = this.currentStation.userId;
    newData.modifiedAt = momentzone().tz(this.zone).unix();
    return newData;
  }

  showStatus(selectedIndex :number) : void{
    this.selectedRow = selectedIndex;
  }
}
