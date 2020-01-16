import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { ApiService } from '../../../../service/app.api-service';
import { AppUrl } from '../../../../service/app.url-service';

@Component({
    selector: 'view-ddr',
    templateUrl: './view-ddr.component.html',
    styleUrls: ['./view-ddr.component.scss']
})

export class ViewDdrComponent implements OnInit {
    log: any;
    viewType:any;
    sendReport:{};
    allowEdit:Boolean;
    allowUpdate:Boolean;

    constructor(private dialogRef: MatDialogRef<ViewDdrComponent>, @Inject(MAT_DIALOG_DATA) public details: any, private services: ApiService,private AppUrl:AppUrl) {
     
        this.log = this.details.row;
        console.log(this.log)
        this.viewType = this.details.status;
        if(this.viewType == 'view'){
            if (!this.log.noShow){
                this.allowEdit = false;
                this.allowUpdate = true;
            } else {
            this.allowUpdate = false;
            this.allowEdit = true;
            }
        }
        else if(this.viewType == 'edit'){
            this.allowUpdate = true;
            this.allowEdit = false;
        }
        console.log(this.log, this.viewType);
        this.dialogRef.disableClose = true;
       
    }

    ngOnInit() {
    }

    //function call to update the details in ddr modal after clicking update button
    update(data: any) {
        console.log(data);
        this.dialogRef.close('RELOAD');
        this.sendReport = {
            flightScheduleId:data.flightSchedulesId ? data.flightSchedulesId : null, 
            noOfNoShowPax:data.noOfNoShowPax ? parseInt(data.noOfNoShowPax) : null,
            joiningPax:data.joiningPax ? parseInt(data.joiningPax) : null,
            infant:data.infant ? parseInt(data.infant) : null,
            transit:data.transit ? parseInt(data.transit) : null,
            transfer:data.transfer ? parseInt(data.transfer) : null,
            skyMarshal:data.skyMarshal ? parseInt(data.skyMarshal) : null,
            crew:data.crew ? parseInt(data.crew) : null,
            tob:data.tob ? parseInt(data.tob) : null,
            createdBy: "573",
            paxId:data.paxId ? parseInt(data.paxId) : null,
            remarks:data.remarks
        }
        console.log(this.sendReport);
//api call  for post the update data
        this.services.create(this.AppUrl.geturlfunction('REPORT_UPDATE'), this.sendReport).subscribe(res => {
            if (res.status) {
                console.log(res.status);
            }
            else{
                console.log(res.errorMessage)
            }
        }, error => {
            console.log(error)
        });
    }
    
    changeAction(){
        this.allowEdit = false;
        this.allowUpdate = true; 
    }
}