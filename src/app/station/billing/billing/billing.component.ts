import { Component, OnInit } from '@angular/core';
import { MatDialog } from "@angular/material";
import { InvoiceComponent} from './invoice/invoice.component';
import * as momentzone from 'moment-timezone';
import { AppService, AuthService } from '../../../service/app.service';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss','../../reports/task-summary/task-summary.component.scss']
})
export class BillingComponent implements OnInit {
  currentStation: any;
  today: any 
  constructor(private dialog: MatDialog,private appService: AppService, private auth: AuthService) { 
    this.currentStation = {
      "id": this.auth.user.userAirportMappingList[0].id, "userId": this.auth.user.id, "code": this.auth.user.userAirportMappingList[0].code,
      "zone": this.auth.user.airport.timezone
    }
    this.today = momentzone().tz(this.currentStation.zone).format('DD/MM/YYYY');
    console.log(this.currentStation);
    console.log(this.today);
  }
flights: any;
// today : '';
  ngOnInit() {
    this.appService.search.next('FILTER');
    this.flights =[
      {
        "flightType" : 1,
        "originAirportCode" : 'MAA',
        "arrFlightNumber" : 'SG1829',
        "standardArrivalTime" : '12:00',
        "actualArrivalTime" : '12:00',
        "destinationAirportCode" : 'CCU',
        "depFlightNumber" : 'SG2018',
        "standardDepartureTime" : '13:00',
        "actualDepartureTime" : '13:00',
        "date": this.today,
        "eqpType": 'B737-800',
        "airline": 'spice-jet',
        "bg": 'spice',
        "currency" : '$',
        "amount": '824'
      },
      {
        "flightType" : 1,
        "originAirportCode" : 'LHR',
        "arrFlightNumber" : 'EI159',
        "standardArrivalTime" : '12:15',
        "actualArrivalTime" : '12:15',
        "destinationAirportCode" : 'MCO',
        "depFlightNumber" : 'EI121',
        "standardDepartureTime" : '21:00',
        "actualDepartureTime" : '21:00',
        "date": this.today,
        "eqpType": 'B737-800',
        "airline": 'aer-lingus',
        "bg": 'al',
        "currency" : '$',
        "amount": '912'
      },
      {
        "flightType" : 1,
        "originAirportCode" : 'JFK',
        "arrFlightNumber" : 'DL1026',
        "standardArrivalTime" : '08:20',
        "actualArrivalTime" : '08:20',
        "destinationAirportCode" : 'MEX',
        "depFlightNumber" : 'DL1026',
        "standardDepartureTime" : '12:10',
        "actualDepartureTime" : '12:10',
        "date": this.today,
        "eqpType": 'B737-800',
        "airline": 'delta-logo',
        "bg": 'delta',
        "currency" : '$',
        "amount": '945'
      },
      {
        "flightType" : 1,
        "originAirportCode" : 'DEL',
        "arrFlightNumber" : 'KL3211',
        "standardArrivalTime" : '01:05',
        "actualArrivalTime" : '01:05',
        "destinationAirportCode" : 'AMS',
        "depFlightNumber" : 'KL3212',
        "standardDepartureTime" : '08:35',
        "actualDepartureTime" : '08:35',
        "date": this.today,
        "eqpType": 'B737-800',
        "airline": 'klm-logo',
        "bg": 'klm',
        "currency" : '$',
        "amount": '855'
      },
      {
        "flightType" : 1,
        "originAirportCode" : 'KUL',
        "arrFlightNumber" : 'NZ7812',
        "standardArrivalTime" : '08:45',
        "actualArrivalTime" : '08:45',
        "destinationAirportCode" : 'AUK',
        "depFlightNumber" : 'NZ7132',
        "standardDepartureTime" : '23:35',
        "actualDepartureTime" : '23:35',
        "date": this.today,
        "eqpType": 'B737-800',
        "airline": 'anz-logo',
        "bg": 'anz',
        "currency" : '$',
        "amount": '900'
      },
      {
        "flightType" : 1,
        "originAirportCode" : 'HYD',
        "arrFlightNumber" : 'EK122',
        "standardArrivalTime" : '05:45',
        "actualArrivalTime" : '05:45',
        "destinationAirportCode" : 'JED',
        "depFlightNumber" : 'EK133',
        "standardDepartureTime" : '13:30',
        "actualDepartureTime" : '13:30',
        "date": this.today,
        "eqpType": 'B737-800',
        "airline": 'emirates-logo',
        "bg": 'emirates',
        "currency" : '$',
        "amount": '978'
      }
    ]
  }

  ngOnDestroy() {
    this.appService.search.next(' ');
}


  openInvoice(data: any) {
    const dialogRef = this.dialog.open(InvoiceComponent, {
      position: {
        // right: '0'
      },
      //  minHeight: '96vh',
      minWidth: '95vw',
      minHeight: '90vh',
      panelClass: 'modelOpen',
      data: {
        flights: data
      }
    });

}
}