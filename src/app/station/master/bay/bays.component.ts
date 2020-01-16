import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppUrl } from '../../../service/app.url-service';
import { ApiService } from '../../../service/app.api-service';
import { AppService, AuthService } from '../../../service/app.service';
import { MatDialog } from '@angular/material';
import { BayComponent } from './bay/bay.component';
import { AlertComponent } from '../../../alert/alert.component';
import * as momentzone from 'moment-timezone';
import * as _ from 'underscore';
import { CommonData } from '../../../service/common-data';


@Component({
  templateUrl: './bays.component.html',
  styleUrls: [
    '../aircraft/aircraft.component.scss',
    './bays.component.scss',
  ]
})

export class BaysComponent implements OnInit, OnDestroy {
  // Initialize variables required for the page
  load: Boolean = false;
  bayList: any[] = [];
  openBays: any[] = [];
  contactBays: any[] = [];
  actionSubscription: any;
  zone = 'Europe/Dublin';
  currentStation: any;
  viewType: String = 'GRID_VIEW';
  constants: any;
  stateSubscription: any;
  searchText: string;

  constructor(private services: ApiService, private AppUrl: AppUrl, private appService: AppService,
    private auth: AuthService, private dialog: MatDialog, private common: CommonData) {
    this.currentStation = { "id": this.auth.user.userAirportMappingList[0].id, "userId": this.auth.user.id, "code": this.auth.user.userAirportMappingList[0].code }
  }

  ngOnInit() {
    this.getBayList();
    this.subscribeActions();
    this.appService.addBtn.next(true);
    this.appService.state.next('REFRESH');
    this.constants = this.common;
  }

  ngOnDestroy() {
    this.actionSubscription.unsubscribe();
  }
  // function to subscribe events/functions from the station layout
  subscribeActions() {
    this.actionSubscription = this.appService.action.subscribe((action) => {
      if (action === 'ADD') {
        this.add();
      } else if (action === 'REFRESH') {
        this.getBayList();
      } else if (action === 'GRID_VIEW' || action === 'LIST_VIEW') {
        this.viewType = action;
      } else {

      }
    });

    this.stateSubscription = this.appService.filter.subscribe((value) => {
      this.searchText = value;
    })

  }
  // GET API to fetch list of bays available for the currrent station
  getBayList() {
    this.load = true;
    this.services.getAll(this.AppUrl.geturlfunction('GET_BAY_BY_STATION') + this.currentStation.code).subscribe(res => {
      this.bayList = res.data;
      this.openBays = this.bayList.filter(bay => bay.bayType === 0).sort(function (a, b) {
        return +(parseInt(a.bayCode) > parseInt(b.bayCode));
      });
      this.contactBays = this.bayList.filter(bay => bay.bayType === 1).sort(function (a, b) {
        return +(parseInt(a.bayCode) > parseInt(b.bayCode));
      });
      this.openBays = this.appService.sortAlphaNumeric(this.openBays, 'bayCode');
      this.contactBays = this.appService.sortAlphaNumeric(this.contactBays, 'bayCode');
     this.load = false;
    }, error => {
      this.appService.showToast('APP_ERROR', '', 'warning');
      this.load = false;
    });

  }
  // function to open Add New Bay dialog box
  add() {
    const dialogRef = this.dialog.open(BayComponent, {
      position: {
        right: '0'
      },
      width: '600px',
      panelClass: 'modelOpen',
      data: {
        mode: 'ADD'
      }
    })
    // return response after the dialog box is dismissed
    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (result !== undefined) {
        console.log(result)
      }
    });
  }
  // function to open Edit bay dialog box
  edit(bay) {
    console.log(bay);
    const dialogRef = this.dialog.open(BayComponent, {
      position: {
      },
      width: '600px',
      panelClass: 'modelOpen',
      data: {
        mode: 'EDIT',
        bay: bay
      }
    })
    // return response after the dialog box is closed
    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (result !== undefined) {
        console.log(result)
      }
    });
  }
// function to open delete confirmation dialog box
  delete(data: any) {
    console.log(data);
    if (this.dialog.openDialogs.length > 0) {
      return;
    }
    const dialogRef = this.dialog.open(AlertComponent, {
      width: '500px',
      // minHeight: '185px',
      panelClass: 'modelOpen',
      data: {
        text: {
          main: 'Delete Bay',
          sub: 'Do you wish to delete ' + this.common.bayName + ' ' + data.bayCode + '?'
        },
        ok: 'YES',
        cancel: 'NO'
      }
    });
// return response after the confirmation dialog box is closed
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.deleteData(data);
      }
    });
  }
  // Delete API call based on confirmation dialog box
  deleteData(data: any) {
    const bay = data;
    this.touchTime(bay);
    bay.active = 'N';
    this.services.create(this.AppUrl.geturlfunction('BAY_NUMBER_UPDATE'), bay).subscribe(res => {
      if (res.status === true) {
        this.getBayList();
        this.appService.showToast('BAY_DELETE', bay.bayCode, 'success');
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
    newData.createdBy = this.currentStation.userId;
    newData.createdAt = momentzone().tz(this.zone).unix();
    newData.modifiedBy = this.currentStation.userId;
    newData.modifiedAt = momentzone().tz(this.zone).unix();
    newData.airportId.id = this.currentStation.id;
    return newData;
  }
}
