import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'notam-modal',
  templateUrl: './notam-modal.html',
  styleUrls: [ './notam-modal.scss' ]
})

export class NotamModal {
  
  constructor(private dialogRef: MatDialogRef<NotamModal>, @Inject(MAT_DIALOG_DATA) public details: any) {
   // this.dialogRef.disableClose = true;
        console.log(details)

  }
  
  closeModal(){
    this.dialogRef.close();
  }
}
