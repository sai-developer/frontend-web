import { Component, } from '@angular/core';
import { OnInit } from '@angular/core';
import { AppUrl } from '../service/app.url-service';
import { ApiService } from '../service/app.api-service';
import { AuthService, AppService } from '../service/app.service'
import {
    IMqttMessage,
    MqttModule,
    IMqttServiceOptions,
    MqttService
} from 'ngx-mqtt';
import * as _ from 'underscore';
import { CommonData } from 'app/service/common-data';
import * as mz from 'moment-timezone';



@Component({
    selector: 'check-status',
    templateUrl: './check_status.component.html',
    styleUrls: ['./check_status.component.scss']
})
export class CheckStatusComponent implements OnInit {
    zoneOffset: any;
    flightList: any;
    load: boolean
    constants: CommonData;
    options: { value: string; }[];
    stations: { value: string; }[];
    flightListLength: any;
    catgory: any;
    station: any;
    tail: any;
    equip: any;
    dupflightlist: any;
    delay: boolean;
    equipments: { value: string; }[];
    tailnumbers: { value: string; }[];
    searchText: any;
    hideOptions: boolean;
    zone: any;
    tailnumber: any;

    constructor(private services: ApiService, private mqttService: MqttService, private appService: AppUrl, private appServices: AppService, private auth: AuthService,
        private common: CommonData) {
        this.zoneOffset = this.auth.timeZone;
        this.zone = this.auth.user.airport.timezone
        this.options = [{ value: "All" }, { value: "Ontime" }, { value: "Delay" }];
        this.stations = [{ value: " All" }];
        this.equipments = [{ value: "All" }];
        this.tailnumbers = [{ value: "All" }];


    }

    ngOnInit() {
        this.catgory = "All";
        this.station = " All";
        this.delay = true;
        this.tail = "All";
        this.equip = "All";
        this.constants = this.common;
        console.log("working fine")
        this.getTodayFlights('all', "")
        this.appServices.search.next('FILTER');
    }



    // filterSearch(value) {
    //     console.log(value)
    //     this.searchText = value;
    //     this.hideOptions = true;
    // }

    // resetHide() {
    //     this.hideOptions = false;
    // }




    getTodayFlights(value, parm) {
        let url = (value === 'all') ? this.appService.geturlfunction('FSC_FLIGHTS_BY_ALL') + value : this.appService.geturlfunction('FSC_FLIGHTS_BY_REGION') + value;
        if (parm === "station") {
            url = this.appService.geturlfunction('FSC_FLIGHTS_BY_STATION') + value
        }
        this.load = true;
        this.services.getAll(url).subscribe(res => {
            this.flightList = res.data;
            console.log(this.flightList)
            this.dupflightlist = res.data;
            for (let i = 0; i < this.flightList.length; i++) {
                this.flightList[i].standardArrivalTimeSort = this.flightList[i].standardArrivalTime ? parseInt(mz(this.flightList[i].standardArrivalTime).tz(this.zone).format('HHmm')) : 0;
            }
            this.flightList = this.appServices.sortNumber(this.flightList, 'standardArrivalTimeSort');
            this.flightListLength = res.data.length;
            console.log(this.flightList)
            for (let index = 0; index < this.flightList.length; index++) {
                const element = this.flightList[index];
                this.stations.push({ value: element.stationAirportCode })
                this.tailnumbers.push({ value: element.tailNumber })
                this.equipments.push({ value: element.equipmentType })
                // if(element.actualDepartureTime !== null && element.actualDepartureTime < element.standardDepartureTime){
                // element.color = "ontime"
                // }
                // if(element.actualDepartureTime !== null && element.actualDepartureTime > element.standardDepartureTime){
                //     element.color = "delay"
                // }
                if (mz(element.actualDepartureTime).diff(mz(element.standardDepartureTime), 'minutes', true) <= 15) {
                    element.color = 'amber'
                }
                if (mz(element.actualDepartureTime).diff(mz(element.standardDepartureTime), 'minutes', true) <= 0) {
                    element.color = 'ontime'
                }
                if (mz(element.actualDepartureTime).diff(mz(element.standardDepartureTime), 'minutes', true) >= 15) {
                    element.color = 'delay'
                }
            }
            this.flightList = this.appServices.sortNumber(this.flightList, 'standardArrivalTimeSort');
            this.stations = _.uniq(this.stations, function (x) {
                return x.value;
            });
            this.tailnumbers = _.uniq(this.tailnumbers, function (x) {
                return x.value;
            });
            this.equipments = _.uniq(this.equipments, function (x) {
                return x.value;
            });
            this.tailnumber = this.appServices.sortAlphaNumeric(this.tailnumbers, 'value');
            this.stations = this.appServices.sortName(this.stations, 'value');
            this.tailnumbers = this.tailnumber.filter(
                tail => tail.value != null && tail.value != "")
            console.log(this.tailnumbers)
            this.load = false;
            if (res.status) {
            }
        }, error => {
            console.log("error")
            this.load = false;

        });
    }

    newfunction(catgory, station, tail, equip) {
        console.log(catgory, station, tail, equip)
        let c = catgory, s = station, t = tail, e = equip;

        //1110
        if (c !== "All" && s !== " All" && t !== "All" && e == "All") {

            if (c == 'Ontime') {
                this.flightList = this.dupflightlist.filter(
                    flight => (flight.stationAirportCode == this.station && flight.actualDepartureTime !== null && flight.actualDepartureTime < flight.standardDepartureTime && flight.tailNumber == t));
                this.flightListLength = this.flightList.length;

            } else {
                this.flightList = this.dupflightlist.filter(
                    flight => (flight.stationAirportCode == this.station && flight.actualDepartureTime !== null && flight.actualDepartureTime > flight.standardDepartureTime && flight.tailNumber == t));
                this.flightListLength = this.flightList.length;

            }
        }
        //1100
        if (c !== "All" && s !== " All" && t == "All" && e == "All") {

            if (c == 'Ontime') {
                this.flightList = this.dupflightlist.filter(
                    flight => (flight.stationAirportCode == this.station && flight.actualDepartureTime !== null && flight.actualDepartureTime < flight.standardDepartureTime));
                this.flightListLength = this.flightList.length;

            } else {
                this.flightList = this.dupflightlist.filter(
                    flight => (flight.stationAirportCode == this.station && flight.actualDepartureTime !== null && flight.actualDepartureTime > flight.standardDepartureTime));
                this.flightListLength = this.flightList.length;

            }
        }
        //1010
        if (c !== "All" && s == " All" && t !== "All" && e == "All") {

            if (c == 'Ontime') {
                this.flightList = this.dupflightlist.filter(
                    flight => (flight.tailNumber == t && flight.actualDepartureTime !== null && flight.actualDepartureTime < flight.standardDepartureTime));
                this.flightListLength = this.flightList.length;

            } else {
                this.flightList = this.dupflightlist.filter(
                    flight => (flight.tailNumber == t && flight.actualDepartureTime !== null && flight.actualDepartureTime > flight.standardDepartureTime));
                this.flightListLength = this.flightList.length;

            }
        }

        //1000
        if (c !== "All" && s == " All" && t == "All" && e == "All") {

            if (c == 'Ontime') {
                this.flightList = this.dupflightlist.filter(
                    flight => (flight.actualDepartureTime !== null && flight.actualDepartureTime < flight.standardDepartureTime));
                this.flightListLength = this.flightList.length;

            } else {
                this.flightList = this.dupflightlist.filter(
                    flight => (flight.actualDepartureTime !== null && flight.actualDepartureTime > flight.standardDepartureTime));
                this.flightListLength = this.flightList.length;

            }
        }



        //1111
        if (c !== "All" && s !== " All" && t !== "All" && e !== "All") {

            if (c == 'Ontime') {
                this.flightList = this.dupflightlist.filter(
                    flight => (flight.stationAirportCode == this.station && flight.actualDepartureTime !== null && flight.actualDepartureTime < flight.standardDepartureTime && flight.tailNumber == t && flight.equipmentType == e));
                this.flightListLength = this.flightList.length;

            } else {
                this.flightList = this.dupflightlist.filter(
                    flight => (flight.stationAirportCode == this.station && flight.actualDepartureTime !== null && flight.actualDepartureTime > flight.standardDepartureTime && flight.tailNumber == t && flight.equipmentType == e));
                this.flightListLength = this.flightList.length;

            }


        }
        //1101
        if (c !== "All" && s !== " All" && t == "All" && e !== "All") {
            if (c == 'Ontime') {

                this.flightList = this.dupflightlist.filter(
                    flight => (flight.stationAirportCode == this.station && flight.actualDepartureTime !== null && flight.actualDepartureTime < flight.standardDepartureTime && flight.equipmentType == e));
                this.flightListLength = this.flightList.length;


            } else {
                this.flightList = this.dupflightlist.filter(
                    flight => (flight.stationAirportCode == this.station && flight.actualDepartureTime !== null && flight.actualDepartureTime > flight.standardDepartureTime && flight.equipmentType == e));
                this.flightListLength = this.flightList.length;


            }
        }
        //1011
        if (c !== "All" && s == " All" && t !== "All" && e !== "All") {
            if (c == 'Ontime') {
                this.flightList = this.dupflightlist.filter(
                    flight => (flight.actualDepartureTime !== null && flight.actualDepartureTime < flight.standardDepartureTime && flight.tailNumber == t && flight.equipmentType == e));
                this.flightListLength = this.flightList.length;


            } else {
                this.flightList = this.dupflightlist.filter(
                    flight => (flight.actualDepartureTime !== null && flight.actualDepartureTime > flight.standardDepartureTime && flight.tailNumber == t && flight.equipmentType == e));
                this.flightListLength = this.flightList.length;

            }
        }
        //1001
        if (c !== "All" && s == " All" && t == "All" && e !== "All") {
            if (c == 'Ontime') {

                this.flightList = this.dupflightlist.filter(
                    flight => (flight.actualDepartureTime !== null && flight.actualDepartureTime < flight.standardDepartureTime && flight.equipmentType == e));
                this.flightListLength = this.flightList.length;


            } else {

                this.flightList = this.dupflightlist.filter(
                    flight => (flight.actualDepartureTime !== null && flight.actualDepartureTime > flight.standardDepartureTime && flight.equipmentType == e));
                this.flightListLength = this.flightList.length;

            }

        }
        //0111
        if (c == "All" && s !== " All" && t !== "All" && e !== "All") {
            this.flightList = this.dupflightlist.filter(
                flight => (flight.stationAirportCode == this.station && flight.tailNumber == t && flight.equipmentType == e));
            this.flightListLength = this.flightList.length;

        }
        //0101
        if (c == "All" && s !== " All" && t == "All" && e !== "All") {
            this.flightList = this.dupflightlist.filter(
                flight => (flight.stationAirportCode == this.station && flight.equipmentType == e));
            this.flightListLength = this.flightList.length;

        }

        //0100
        if (c == "All" && s !== " All" && t == "All" && e == "All") {
            this.flightList = this.dupflightlist.filter(
                flight => (flight.stationAirportCode == this.station));
            this.flightListLength = this.flightList.length;

        }
        //0011
        if (c == "All" && s == " All" && t !== "All" && e !== "All") {
            this.flightList = this.dupflightlist.filter(
                flight => (flight.tailNumber == t && flight.equipmentType == e));
            this.flightListLength = this.flightList.length;
        }
        //0110
        if (c == "All" && s !== " All" && t !== "All" && e == "All") {
            this.flightList = this.dupflightlist.filter(
                flight => (flight.tailNumber == t && flight.stationAirportCode == this.station));
            this.flightListLength = this.flightList.length;
        }
        //0000
        if (c == "All" && s == " All" && t == "All" && e == "All") {

            this.flightList = this.dupflightlist;
            this.flightListLength = this.flightList.length;
        }

        //0001
        if (c == "All" && s == " All" && t == "All" && e !== "All") {
            this.flightList = this.dupflightlist.filter(
                flight => (flight.equipmentType == e));
            this.flightListLength = this.flightList.length;
        }

        //0010
        if (c == "All" && s == " All" && t !== "All" && e == "All") {
            this.flightList = this.dupflightlist.filter(
                flight => (flight.tailNumber == t));
            this.flightListLength = this.flightList.length;
        }


    }

    selecttail(param) {
        // this.flightList = this.flightList.filter(
        //     flight => (flight.tailNumber == param));
        //     this.flightListLength =  this.flightList.length;
    }

    ngOnDestroy() {
        this.appServices.search.next(' ');
    }

}

