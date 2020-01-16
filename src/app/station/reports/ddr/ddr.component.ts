import { Component, OnInit, ViewChild } from '@angular/core';
import { AppUrl } from '../../../service/app.url-service';
import { ApiService } from '../../../service/app.api-service';
import { AuthService, AppService } from "../../../service/app.service";
import { MatDialog } from "@angular/material";
import { ViewDdrComponent } from './view-ddr/view-ddr.component';
import { ViewEqpsComponent } from './view-eqps/view-eqps.component';
import {SendDdrComponent} from './send-ddr/send-ddr.component'
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core'
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import * as momentzone from 'moment-timezone';

export const MY_FORMATS = {
    parse: {
        dateInput: 'LL',
    },
    display: {
        dateInput: 'DD MMM YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
    templateUrl: './ddr.component.html',
    styleUrls: ['./ddr.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})

export class DdrComponent implements OnInit {   
    currentStation: any;
    load: Boolean = false;
    zoneOffset: any;
    zone: any;
    stateSubscription: any;
    searchText: string;
    constructor(private services: ApiService, private appService: AppService, private AppUrl: AppUrl, private dialog: MatDialog, private authService: AuthService) {
        this.currentStation = { "id": this.authService.user.userAirportMappingList[0].id, "code": this.authService.user.userAirportMappingList[0].code, "city": this.authService.user.userAirportMappingList[0].city };
        this.zoneOffset = this.authService.timeZone;
        this.zone = this.authService.user.airport.timezone;
    }
    reportList: any = [];
    modList: any[] = [];
    today: any;
    selDate: any;
    start: any;
    end: any;
    query: any;
    noRecord: Boolean;
    showTable: Boolean;
    //On initialisation the following things will  be loaded
    ngOnInit() {
        this.today = momentzone().tz(this.zone);
        this.modList = [];
        this.selDate = this.today;
        this.getStationReport('new');
        this.subscribeActions();
    }


  //subsribe action for the search text from station  layout
    subscribeActions() {
        this.stateSubscription = this.appService.filter.subscribe((value) => {
          this.searchText = value;
        })
      }
    

//api response for the data setup  in the ddr component
    getStationReport(inp: any) {
        // this.showTable = false;
        // this.noRecord = false;
        this.load = true;
        this.modList = [];
        let params = this.currentStation.code;
        if (inp == 'new') {
           
        }
        else if (inp == 'update') {
            this.query = '?from=' + this.start + '&to=' + this.end + '&airport' + params;
        }
        console.log(this.AppUrl.getReport(this.start, this.end));
        this.services.getAll(this.AppUrl.getReport(this.start, this.end)).subscribe(res => {
            this.reportList = res.data;
            console.log(this.reportList);
            // if (this.reportList.length == 0) {
            //     this.noRecord = true;
            //     this.showTable = false;
            // }
            // else {
            //     this.noRecord = false;
            //     this.showTable = true;
            // }
            this.load = false;
        }, error => {
            this.load = false;
            // this.noRecord = true;
            // this.showTable = false;
            console.log('no data available');
        });
    }

    //function call to open the view ddr modal to edit the pax details
    viewDdr(data: any, type: any) {
        console.log(data,type)
        console.log(type);
        const dialogRef = this.dialog.open(ViewDdrComponent, {
            position: {
                right: '0'
            },
            minHeight: '96vh', 
            maxHeight: '96vh',
            width: '600px',
            panelClass: 'modelOpen',
            data: {
                row: data,
                status: type
            }
        });
        //dialogRef.disableClose = false;
        dialogRef.disableClose = true;
 
        dialogRef.afterClosed().subscribe(result => {
            if (result !== undefined) {
                console.log(result)
                this.modList = [];
                this.getStationReport('update');
            }
        });
    }
        //function call to open the view ddr modal to edit the pax details
        viewEqps(data: any) {
            const dialogRef = this.dialog.open(ViewEqpsComponent, {
                // position: {
                //     right: '0'
                // },
                minHeight: '70vh',
                maxHeight: '96vh',
                width: '600px',
                panelClass: 'modelOpen',
                data: {
                    row: data,
                }
            });
            //dialogRef.disableClose = false;
            dialogRef.disableClose = true;
     
            dialogRef.afterClosed().subscribe(result => {
                if (result !== undefined) {
                    console.log(result)
                    this.modList = [];
                    this.getStationReport('update');
                }
            });
        }

    //function  call to change the date in drr component view
    dateChange(change: any) {
        this.selDate = change;
        console.log(change);
        this.start = momentzone(change).tz(this.zone).startOf('day').unix() * 1000;
        this.end = momentzone(change).tz(this.zone).endOf('day').unix() * 1000;
        console.log(this.start, this.end);
        this.modList = [];
        this.getStationReport('update');
    }

    //Function to send ddr report mail
    sendMail(data:any){
        console.log(data)
        const dialogRef = this.dialog.open(SendDdrComponent, {
            position: {
                right: '0'
            },
            minHeight: '96vh', 
            maxHeight: '96vh',
            width: '600px',
            panelClass: 'modelOpen',
            data: {
                row: data,
            }
        });
        //dialogRef.disableClose = false;
        dialogRef.disableClose = true;
 
        dialogRef.afterClosed().subscribe(result => {
            if (result !== undefined) {
                console.log(result)
                this.modList = [];
                // this.getStationReport('update');
            }
        });
    }
}