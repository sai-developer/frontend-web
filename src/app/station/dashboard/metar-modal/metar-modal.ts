import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'metar-modal',
  templateUrl: './metar-modal.html',
  styleUrls: [ './metar-modal.scss']
})

export class MetarModal {
  
  constructor(private dialogRef: MatDialogRef<MetarModal>, @Inject(MAT_DIALOG_DATA) public details: any) {
    // this.dialogRef.disableClose = true;
    console.log(details)
  }
  
  closeModal(){
    this.dialogRef.close();
  }
}
