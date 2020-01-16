import { Component, OnInit } from '@angular/core';
import { AppUrl } from '../../../service/app.url-service';
import { ApiService } from '../../../service/app.api-service';
import { MatDialog } from '@angular/material';
import { SummaryComponent } from './summary/summary.component';
import { AuthService } from '../../../service/app.service';
import { AppService } from "../../../service/app.service";
import { AppMessages } from '../../../service/app.messages';

@Component({
  selector: 'app-task-summary',
  templateUrl: './task-summary.component.html',
  styleUrls: ['./task-summary.component.scss']
})
export class TaskSummaryComponent implements OnInit {

  flights: any;
  currentStation: any;
  zoneOffset: any;
  zone: any;
  load: any;
  taskList: any;
  stateSubscription: any;
  searchText: string;
  flight: any;
  constructor(private services: ApiService, private appUrl: AppUrl, private dialog: MatDialog, private auth: AuthService,
      private appService: AppService, private messages: AppMessages) {
    this.currentStation = { "id": this.auth.user.userAirportMappingList[0].id,
                            "userId": this.auth.user.id, "code": this.auth.user.userAirportMappingList[0].code }
    this.zoneOffset = this.auth.timeZone;
    this.zone = this.auth.user.airport.timezone;
  }

  ngOnInit() {
    this.getFlightList();
    this.subscribeActions();
  }


  //subscribe call to clear the searchtext values
  subscribeActions() {
    this.stateSubscription = this.appService.filter.subscribe((value) => {
      this.searchText = value;
    })
  }

//response call for the data setup in task summary  page
  getFlightList() {
    this.load = true;
    this.services.getAll(this.appUrl.geturlfunction('FLIGHTS_BY_FROM_TO')).subscribe(res => {
      if (res.status) {
        this.flight = res.data.filter(
          // flight => flight.bayType == 0);
          flight => flight.actualDepartureTime !== null);
        this.flights = this.appService.sortNumber(this.flight, 'standardDepartureTime');
        this.load = false;
      } else {
        this.load = false;
      }
    }, error => {
      this.load = false;
    });
  }

  //modal call to  open the summary  sheet for selected flights
  summarySheet(data: any) {
    this.dialog.open(SummaryComponent, {
      // position: {
      //   right: '0'
      // },
      maxHeight: '96vh',
      minHeight: '96vh',
      minWidth: '90vw',
      maxWidth: '90vw',
      panelClass: 'modelOpen',
      data: {
        flightId: data.flightSchedulesId,
        taskData: data
      },
      disableClose: true
    })
  }

}
