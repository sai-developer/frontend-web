import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})

export class AlertComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<AlertComponent>, @Inject(MAT_DIALOG_DATA) public details: any) {
    this.dialogRef.disableClose = true;
  }
  ngOnInit() {

  }
  // function to close dialog box
  closeModal() {
    this.dialogRef.close();
  }
  // function to close dialog box and pass response
  proceed() {
    this.dialogRef.close('PROCEED');
  }
}
