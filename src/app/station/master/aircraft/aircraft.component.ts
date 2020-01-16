import { Component, OnInit } from '@angular/core';
import { AppUrl } from '../../../service/app.url-service';
import { ApiService } from '../../../service/app.api-service';
import { EquipmentList } from '../tasks/task/aircraft-master.class';
import { MatDialog } from '@angular/material';
import { AppService, AuthService } from '../../../service/app.service';
import { AircraftsComponent } from './aircrafts/aircrafts.component';
import { AlertComponent } from '../../../alert/alert.component';
import * as momentzone from 'moment-timezone';

@Component({
  templateUrl: './aircraft.component.html',
  styleUrls: ['./aircraft.component.scss']
})

export class AircraftComponent implements OnInit {
  // Initializing variables required for the page
  stateSubscription: any;
  searchText: string;
  constructor(private services: ApiService, private appUrl: AppUrl, private dialog: MatDialog, private appService: AppService, private auth: AuthService) { }
  load: Boolean = false;
  aircrafts: any[] = [];
  equipments: any[] = [];
  actionSubscription: any;
  currentStation: any;
  aircraftsLength: any;
  

  ngOnInit() {
    this.load = true;
    this.getTailNumber();
    this.getEquipmentList();
    this.subscribeActions();
    this.getTailLength();
    this.appService.addBtn.next(true);
    this.appService.state.next('REFRESH');
    this.currentStation = {
      "id": this.auth.user.userAirportMappingList[0].id, "userId": this.auth.user.id, "code": this.auth.user.userAirportMappingList[0].code,
      "timezone": this.auth.user.airport.timezone
    }
  }

  ngOnDestroy() {
    this.actionSubscription.unsubscribe();
  }
  // function to subscribe events and functions required for this page from the Station layout
  subscribeActions() {
    this.actionSubscription = this.appService.action.subscribe((action) => {
      if (action === 'ADD') {
        this.add();
      }
    });
    this.stateSubscription = this.appService.filter.subscribe((value) => {
      this.searchText = value;
    })
  }
  // Ungrouped(Equipement types) GET api for the total data lenght of array
  getTailLength() {
    this.services.getAll(this.appUrl.geturlfunction('EQUIPMENT_SERVICE')).subscribe(res => {
      this.aircraftsLength = res.data.length;
    });
  }
  // Grouped(by Equipment types) GET Api for page listing
  getTailNumber() {
    this.services.getAll(this.appUrl.geturlfunction('EQUIPMENT_SERVICE_BY_GROUP')).subscribe(res => {
      this.aircrafts = res.data;
      console.log(this.aircrafts);
      this.aircrafts.forEach(typeObj => {
        typeObj.tails.sort(function (a, b) {
          var keyA = a.tailNumber,
            keyB = b.tailNumber;
          if (keyA < keyB) return -1;
          if (keyA > keyB) return 1;
          return 0;
        });
      });
      this.load = false;
    }, error => {
      this.appService.showToast('APP_ERROR', '', 'warning');
      this.load = false;
    });
  }
  // GET Api for equipments available
  getEquipmentList() {
    this.services.getAll(this.appUrl.geturlfunction('EQUIPMENT_TYPE_SERVICE')).subscribe(res => {
      let equipment = new EquipmentList({});
      this.equipments = equipment.set(res.data);
   
   }, error => {
    });

  }

  // Funciton to open Add New registration dialog box
  add() {
    const dialogRef = this.dialog.open(AircraftsComponent, {
      position: {
        right: '0'
      },
      width: '600px',
      panelClass: 'modelOpen',
      data: {
        mode: 'ADD',
        equipments: this.equipments,
      }
    });
    // Return response when dialog box is closed 
    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (result !== undefined) {
        this.getTailNumber();
        this.getTailLength();
      }
    });
  }

  // Funciton to open Edit registration dialog box
  edit(aircraft) {
    console.log(aircraft);
    const dialogRef = this.dialog.open(AircraftsComponent, {
      position: {
      },
      width: '600px',
      panelClass: 'modelOpen',
      data: {
        mode: 'EDIT',
        equipments: this.equipments,
        aircraft: aircraft,
      }
    });
    // Return response when the dialog box is closed
    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (result !== undefined) {
        this.getTailNumber();
        this.getTailLength();
      }
    });
  }

// function to open confirmation dialog box
  delete(data: any) {
    console.log(data);
    if (this.dialog.openDialogs.length > 0) {
      return;
    }
    console.log('DIALOG OPENED');
    const dialogRef = this.dialog.open(AlertComponent, {
      width: '500px',
      panelClass: 'modelOpen',
      data: {
        text: {
          sub: ' Do you wish to delete this Tail number?'
        },
        ok: 'YES',
        cancel: 'NO'
      }
    });
    // return response from confirmation dialog box
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.deleteAircraft(data);
      }
    });
  }
  // delete Api call based on confirmation response
  deleteAircraft(data: any) {
    console.log(data);
    this.deletePayload(data);
    console.log(this.deleteData);
    this.services.create(this.appUrl.geturlfunction('EQUIPMENT_SERVICE_DELETE'), this.deleteData).subscribe(res => {
      if (res.status === true) {
        this.getTailNumber();
        this.getTailLength();
        this.appService.showToast('AIRCRAFT_DELETE', this.deleteData.tailNumber, 'success');
      } else {
        if (res.errorMessage.includes('duplicate') === true) {
          this.appService.showToast('AIRCRAFT_DUPLICATE', this.deleteData.tailNumber, 'warning');
        } else {
          this.appService.showToast('APP_ERROR', '', 'warning');
        }
      }
    }, error => {
      this.appService.showToast('APP_ERROR', '', 'warning');
    });
  }
  deleteData: any = {};
  // forming delete payload
  deletePayload(data) {
    this.deleteData = {
      "active": "N",
      "createdBy": this.currentStation.userId,
      "createdAt": momentzone().tz(this.currentStation.timezone).unix() * 1000,
      "modifiedBy": 821,
      "modifiedAt": momentzone().tz(this.currentStation.timezone).unix() * 1000,
      "id": data.id,
      "tailNumber": data.tailNumber,
      "typeId": {
        "id": data.typeId.id
      }
    }
  }
}
