import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";

@Component({
  selector: 'app-view-eqps',
  templateUrl: './view-eqps.component.html',
  styleUrls: ['./view-eqps.component.scss']
})
export class ViewEqpsComponent implements OnInit {
log: any;
  constructor(private dialogRef: MatDialogRef<ViewEqpsComponent>, @Inject(MAT_DIALOG_DATA) public details: any) { 
    this.log = this.details.row;
  }

  ngOnInit() {
    console.log(this.log);
  }

  cancel(){
    this.dialogRef.close();
  }
}
