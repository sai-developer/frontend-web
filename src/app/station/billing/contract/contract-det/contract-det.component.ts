import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-contract-det',
  templateUrl: './contract-det.component.html',
  styleUrls: ['./contract-det.component.scss',
'../../billing/invoice/invoice.component.scss']
})
export class ContractDetComponent implements OnInit {
  flight: any;

  constructor(private dialogRef: MatDialogRef<ContractDetComponent>, @Inject(MAT_DIALOG_DATA) public details: any) {
    this.flight = this.details.flights;
   }

  ngOnInit() {
  }

}
