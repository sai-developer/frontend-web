import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppUrl } from '../../../service/app.url-service';
import { ApiService } from '../../../service/app.api-service';
import { AuthService } from '../../../service/app.service';
import { MatDialog } from '@angular/material';
import { ShiftComponent } from './shift/shift.component';
import { AppService } from '../../../service/app.service';
import { AlertComponent } from '../../../alert/alert.component';
import * as moment from 'moment';
import * as momentzone from 'moment-timezone';


@Component({
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.scss']
})

export class ShiftsComponent implements OnInit, OnDestroy {
  load: Boolean = false;
  shift: any = {};
  zone: any;
  shiftList: any[] = [];
  actionSubscription: any;
  currentStation: any;
  zoneOffset: any;
  stateSubscription: any;
  searchText: string;
  viewType: any = this.appService.getcookie('userView') ? this.appService.getcookie('userView') : 'LIST_VIEW'
  constructor(private dialog: MatDialog, private AppUrl: AppUrl, private services: ApiService, private auth: AuthService, private appService: AppService, private router: Router) {
    this.currentStation = { "id": this.auth.user.userAirportMappingList[0].id, "userId": this.auth.user.id, "code": this.auth.user.userAirportMappingList[0].code }
    this.zoneOffset = this.auth.timeZone;
    this.zone = this.auth.user.airport.timezone;
  }

  ngOnInit() {
    this.getShiftList();
    this.subscribeActions();
    this.appService.addBtn.next(true);
    this.appService.state.next('REFRESH');
  }

  ngOnDestroy() {
    this.appService.addBtn.next(false);
    this.actionSubscription.unsubscribe();
  }

  subscribeActions() {
    this.actionSubscription = this.appService.action.subscribe((action) => {
      if (action === 'ADD') {
        this.add();
      } else if (action === 'REFRESH') {
        this.getShiftList();
      } else {

      }
      
      if (action === 'GRID_VIEW' || action === 'LIST_VIEW') {
        this.viewType = action;
      }
    });


    this.stateSubscription = this.appService.filter.subscribe((value) => {
      // console.log(value)
      this.searchText = value;
    })
  }

//api response for the shiftslist data
  getShiftList() {
    this.load = true;
    this.services.getAll(this.AppUrl.geturlfunction('GET_SHIFT_BY_STATION') + this.currentStation.code).subscribe(res => {
      let shiftData = res.data;
      for (let index = 0; index < shiftData.length; index++) {
        const element = shiftData[index];
        shiftData[index].time = momentzone(element.startTime).tz(this.auth.user.airport.timezone).format('HH:MM')
      }
      shiftData = this.appService.sortName(shiftData, 'time');
      this.shiftList = shiftData;
      this.load = false;
    }, error => {
      this.load = false;
      console.log('error')
    });

  }

  //edit modal to be opened while click edit
  edit(shift) {
    const dialogRef = this.dialog.open(ShiftComponent, {
      position: {
        // top: '20px'
      },
      minHeight: '96vh',
      width: '500px',
      panelClass: 'modelOpen',
      data: {
        mode: 'EDIT',
        shift: shift
      }
    })

//function to be called while closing the edit modal
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.getShiftList();
        console.log(result)
      }
    });
  }

  //function call to open the add modal while click add 
  add() {
    const dialogRef = this.dialog.open(ShiftComponent, {
      position: {
        right: '0'
      },
      minHeight: '96vh',
      width: '500px',
      panelClass: 'modelOpen',
      data: {
        mode: 'ADD'
      }
    })

//function to be called while closing the add modal
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.getShiftList();
        console.log(result)
      }
    });
  }

  //function call for delete modal
  delete(data: any) {
    if (this.dialog.openDialogs.length > 0) {
      return;
    }
    console.log('DIALOG OPENED');
    const dialogRef = this.dialog.open(AlertComponent, {
      minWidth: '500px',
      panelClass: 'modelOpen',
      // minHeight: '185px',
      data: {
        text: {
          sub: 'Do you wish to delete ' + data.name + ' shift?'
        },
        ok: 'YES',
        cancel: 'NO'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.deleteData(data);
      }
    });
  }

  //function  call to delete the data
  deleteData(shift: any) {
    console.log(shift);
    const data = {
      id: shift.id,
      name: shift.name,
      alias: shift.alias,
      active: 'N',
      startTime: shift.startTime,
      endTime: shift.endTime,
      airportId: {
        id: ''
      }
    }
    this.touchTime(data);
    console.log(data);
    this.services.create(this.AppUrl.geturlfunction('SHIFT_SERVICE_UPDATE'), data).subscribe(res => {
      if (res.status === true) {
        this.getShiftList();
        this.appService.showToast('SHIFT_DELETE', data.name, 'success');
      } else {
        if (res.errorMessage.includes('duplicate') === true) {
          this.appService.showToast('SHIFT_DUPLICATE', data.name, 'success');
        } else {
          this.appService.showToast(res.errorMessage, 'custom', 'warning');
        }
      }
    }, error => {
      this.appService.showToast('APP_ERROR', '', 'warning');
    });
  }

  touchTime(data: any) {
    const newData = data;
    newData.active = 'N';
    newData.createdBy = this.currentStation.userId;
    newData.createdAt = momentzone().tz(this.zone).unix();
    newData.modifiedBy = this.currentStation.userId;
    newData.modifiedAt = momentzone().tz(this.zone).unix();
    newData.airportId.id = this.currentStation.id;
    return newData;
  }
}
