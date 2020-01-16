import { Component,Inject, OnInit } from '@angular/core';
import { AuthService, AppService } from "../../../../service/app.service";
import { AppUrl } from '../../../../service/app.url-service';
import { ApiService } from '../../../../service/app.api-service';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";

@Component({
  selector: 'app-send-ddr',
  templateUrl: './send-ddr.component.html',
  styleUrls: ['./send-ddr.component.scss']
})
export class SendDdrComponent implements OnInit {
  currentStation: any;
  mails:any;
  info:any;
  sub:any;
  constructor(private dialogRef: MatDialogRef<SendDdrComponent>, @Inject(MAT_DIALOG_DATA) public details: any,private services: ApiService,private authService: AuthService,  private appService: AppService, private AppUrl: AppUrl) { 
    this.currentStation = { "id": this.authService.user.userAirportMappingList[0].id, "code": this.authService.user.userAirportMappingList[0].code, "city": this.authService.user.userAirportMappingList[0].city };
    this.info=this.details.row
    this.sub="Rapid DDR for"+(this.info.arrFlightNumber?this.info.arrFlightNumber:"BASE")+'-'+(this.info.depFlightNumber!=null?this.info.depFlightNumber:"HALT")
  }

  ngOnInit() {
    this.getMailConfig();
  }
  getMailConfig(){
console.log(this.currentStation.code,"code")
this.services.getAll(this.AppUrl.geturlfunction('GET_MAIL_CONFIG')).subscribe(res => {
  if (res.status) {
    console.log(res)
    this.mails=res.data
    console.log(this.mails)
  } else {
    // this.load = false;
  }
}, error => {
  // this.load = false;
});
  }

  send(){
    let rep_info={
      "flightSchedulesId":this.info.flightSchedulesId,
      "to":this.mails,
      "subject":this.sub,
      "code":this.currentStation.code
    }
    this.services.create(this.AppUrl.geturlfunction('SEND_MAIL_CONFIG'),rep_info).subscribe(res => {
      if (res.status) {
        console.log(res)
      } else {
        // this.load = false;
      }
    }, error => {
      // this.load = false;
    });
  }

}
