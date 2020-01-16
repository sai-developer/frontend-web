import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'shift-dialog',
    templateUrl: './shift-dialog.html',
    styleUrls: ['./shift-dialog.scss']
})

export class ShiftDialogComponent implements OnInit {
    constructor(private dialogRef: MatDialogRef<ShiftDialogComponent>, @Inject(MAT_DIALOG_DATA) public details: any, private dialog: MatDialog,
    ) {
        console.log(this.details);
    }

    ngOnInit() {

    }
}
