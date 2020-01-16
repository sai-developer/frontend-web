import { Component, OnInit } from '@angular/core';
import { MatDialog } from "@angular/material";
import { ContractDetComponent } from './contract-det/contract-det.component';

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.scss',
'../../reports/task-summary/task-summary.component.scss',
'../billing/billing.component.scss']
})
export class ContractComponent implements OnInit {

  constructor(private dialog: MatDialog) { }
airline:any;
  ngOnInit() {
    this.airlines();
  }
  openContract(data: any) {
    const dialogRef = this.dialog.open(ContractDetComponent, {
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
airlines(){
this.airline =[
  {
    "eqpType": 'B737-800',
    "airline": 'spice-jet',
    "bg": 'spice'
  },
  {
    "eqpType": 'B737-800',
    "airline": 'aer-lingus',
    "bg": 'al'
  },
  {
    "eqpType": 'B737-800',
    "airline": 'delta-logo',
    "bg": 'delta'
  },
  {
    "eqpType": 'B737-800',
    "airline": 'klm-logo',
    "bg": 'klm'
  },
  {
    "eqpType": 'B737-800',
    "airline": 'anz-logo',
    "bg": 'anz'
  },
  {
    "eqpType": 'B737-800',
    "airline": 'emirates-logo',
    "bg": 'emirates'
  }
]
}
}
