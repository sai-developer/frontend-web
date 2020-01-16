//  importing services, router, timezone, MQTTservices that are need for airport view 
import { Component, OnInit, Inject } from '@angular/core';
import { MapStyleJson } from '../../../service/map-style';
import { AppService, AuthService } from 'app/service/app.service';
import { Router } from '@angular/router';
import { AppUrl } from 'app/service/app.url-service';
import { ApiService } from 'app/service/app.api-service';
import * as _ from 'underscore';
import * as mz from 'moment-timezone';
import {
    IMqttMessage,
    MqttModule,
    IMqttServiceOptions,
    MqttService
} from 'ngx-mqtt';

@Component({
    selector: 'app-airport-test',
    templateUrl: './airport-view.component.html',
    styleUrls: ['./airport-view.component.scss'],

})

export class TestComponent implements OnInit {
    lat: any;
    long: any;
    zoom: any;
    currentStation: any;
    showTask: boolean;
    baynumberList: any;
    htmlToAdd: any[] = [];
    htmlToAdd2: any[] = [];
    Assignedtasks: any;
    markers: any[] = [];
    currFsId: any;
    bayShow: Boolean;
    test: boolean = true;
    styles = this.mapStyle.styles;    // styles for map to be displayed to the user
    message: string;
    stations: any;
    ind: boolean;
    staffLoc: boolean = false;
    showLive: boolean = true;
    selFlt: any;
    zoneOffset: any;
    selbayLat: any;
    selbayLong: any;
    fltUsers: any = [];
    tempBayList: any;
    userDetails: any;
    staffArr: any = [];
    viewTask: boolean = true;
    viewStaff: boolean = false;
    locations: any[];


    ngOnInit() {
        this.fullWidthAirport();
        this.getStations();
        this.showTask = false;
        // this.getBayNumber();
        this.appService.search.next('FILTER');
        this.listenSocket();
        this.locations = [
            {
                lat: -37.006223,
                lng: 174.792945
            },
            {
                lat: -37.006354,
                lng: 174.792637
            },
            {
                lat: -37.006682, 
                lng: 174.792784
            },
        ]
    }
    ngOnDestroy() {
        this.appService.search.next('');
        this.appService.airport.next('');

    }
    constructor(private mapStyle: MapStyleJson, private appService: AppService, private AppUrl: AppUrl, private services: ApiService, private auth: AuthService, private mqttService: MqttService, private router: Router) {
        // current station with time zone along with code
        this.currentStation = {
            'id': this.auth.user.userAirportMappingList[0].id, 'code': this.auth.user.userAirportMappingList[0].code,
            "timezone": this.auth.user.airport.timezone
        }
        // console.log(this.currentStation);

        this.zoneOffset = this.auth.timeZone,
        // country level lat long to be passed here
        this.lat = 23.286222; //lat of India
        this.long = 77.338391; //long of India
        // this.lat = -41.604203 // lat for New Zeland
        // this.long = 172.976306 // long for New Zeland 
        this.zoom = 4.75;
    }
    //  subscription function called in layouts -> station -> station layout ts
    fullWidthAirport() {
        this.appService.airport.next('AIRPORT');
    }
    getStations() {
        let url = this.AppUrl.geturlfunction('FSC_BY_ALL') + 'all';

        this.services.getAll(url).subscribe(res => {
            this.stations = res.stations;
            console.log('list of all the stations',this.stations);
            for (let index = 0; index < this.stations.length; index++) {
                const element = this.stations[index];
                element.iconUrl = {
                    url: require('../../../../assets/images/dashboard/' + element.class + '.svg'),
                    scaledSize: {
                        height: 50,
                        width: 30,
                    }
                }
                element.lat = parseFloat(element.lat);
                element.lng = parseFloat(element.lng);
                // element.lat = -37.006035
                // element.lng = 174.792396
            }
            console.log('this is the station response', this.stations);
        }, error => {
            console.log(error)
        });
    }
    // TASK COMPLETE MQTT topic and MQTT message for task CHOCKS OFF
    listenSocket() {
        let taskComplete = this.currentStation.code + this.AppUrl.getMqttTopic('TASK_COMPLETE');
        this.mqttService.observe(taskComplete, { qos: 0 }).subscribe((message: IMqttMessage) => {
            this.message = message.payload.toString();
            let object = JSON.parse(this.message);
            if (object.data.flightSchedulesId == this.currFsId) {
                this.selFlt.taskCompletedCount = object.data.taskCompletedCount;
                if (object.data.taskName == 'Chocks off') {
                    this.getBayNumber();
                    this.showTask = false;
                } else {
                    this.bayEntry(object.data, this.selbayLat, this.selbayLong);
                }
            }
        })
    }


    getBayNumber() {
        this.showLive = true
        this.bayShow = true;
        this.showTask = false;
        this.staffLoc = false;
        this.selbayLat = 0;
        this.selbayLong = 0;
        this.zoom = 15.5;
        this.services.getAll(this.AppUrl.geturlfunction('FLIGHTS_BY_FROM_TO_UTC_FILTERED')).subscribe(res => {
            this.baynumberList = res.data;
            this.tempBayList = res.data;
            for (let index = 0; index < this.baynumberList.length; index++) {
                const element = this.baynumberList[index];
                if (element.actualArrivalTime) {
                    element.arrColor = 'delayed_plane'
                    if (mz(element.actualArrivalTime).diff(mz(element.standardArrivalTime), 'minutes', true) <= 15) {
                        element.arrColor = 'ontime_plane'
                    } else if (mz(element.actualArrivalTime).diff(mz(element.standardArrivalTime), 'minutes', true) < 0) {
                        element.arrColor = 'ontime_plane'
                    }

                } else {
                    element.arrColor = 'ontime_plane';
                }
                element.bayLat = parseFloat(element.bayLat);
                element.bayLon = parseFloat(element.bayLon);
                element.iconn = {
                    url: require('../../../../assets/images/' + element.arrColor + '.svg'),
                    scaledSize: {
                        height: 50,
                        width: 30,
                    }
                }
            }
        })



    }

    onMouseOver(infoWindow, $event: MouseEvent) {
        infoWindow.open();
    }

    onMouseOut(infoWindow, $event: MouseEvent) {
        infoWindow.close();
    }

    // functions dealing with task API call, task color logic
    bayEntry(data, bLat, bLong) {
        this.getUserList(data);
        this.viewStaff = false;
        this.viewTask = true;
        console.log(data)
        this.showLive = false;
        this.currFsId = data.flightSchedulesId;
        console.log('current id', this.currFsId);
        this.selbayLat = bLat;
        this.selbayLong = bLong;
        this.lat = this.selbayLat;
        this.long = this.selbayLong;
        this.zoom = 19.5;
        console.log('baynumber', this.baynumberList);
        let selId = this.tempBayList.filter(
            selFlt => selFlt.flightSchedulesId == this.currFsId);
        this.selFlt = selId[0];
        console.log('selFlt', this.selFlt);
        // based on selected flight details respective getTaskSchedResMappingByFlightSchedId api is called for task  
        this.services.getAll(this.AppUrl.geturlfunction('TASKSCHEDULE_SERVICES') + data.flightSchedulesId).subscribe(res => {
            console.log(res);
            this.Assignedtasks = this.appService.sortNumber(res.data, 'taskSequenceNumber');
            // this.taskList = this.appService.sortNumber(res.data, 'taskSequenceNumber');
            console.log(this.Assignedtasks);
            for (let index = 0; index < this.Assignedtasks.length; index++) {
                const element = this.Assignedtasks[index];
                this.fltUsers.push(element.userId);
            }
            this.fltUsers = _.uniq(this.fltUsers);
            console.log('after unique', this.fltUsers);


            this.showTask = true;
            this.htmlToAdd = [];

            var blk = document.getElementById('con-blk');
            blk.classList.remove('visible');
            var blk = document.getElementById('fuel-blk');
            blk.classList.remove('visible');
            var blk = document.getElementById('doors-open');
            blk.classList.remove('visible');
            var blk = document.getElementById('catering-blk');
            blk.classList.remove('visible');
            var blk = document.getElementById('baggage-blk');
            blk.classList.remove('visible');

            this.baynumberList = [];
            this.createGroups();

        })
    }

    convertTimeFromValue(value, actualEnd, scheduleType, Timing): any {
        let stnTiming = mz(value).tz(this.currentStation.timezone).toDate()
        let depTiming = mz(actualEnd).tz(this.currentStation.timezone).toDate()
        if (scheduleType == 0) {
            stnTiming = mz(depTiming).tz(this.currentStation.timezone).subtract(Timing, 'minutes').toDate()
        } else if (scheduleType == 1) {
            stnTiming = mz(stnTiming).tz(this.currentStation.timezone).add(Timing, 'minutes').toDate()
        }
        return stnTiming;

    }
    filterTask(action: any) {
        // console.log('inside the filter function',this.htmlToAdd);
        if (action == 'DELAY') {
            var testDelay = this.htmlToAdd;
            var testFn = testDelay.filter(
                testing => testing.class === 'delay'
            )
            this.htmlToAdd2 = testFn;
        }
        if (action == 'AMBER') {
            var testAmber = this.htmlToAdd;
            var testFn = testAmber.filter(
                testing => testing.class === 'warning'
            )
            this.htmlToAdd2 = testFn;
        }
        if (action == 'ALL') {
            this.htmlToAdd2 = this.htmlToAdd;
        }
    }

    createGroups() {
        let comTaskz = 0;
        for (var index = 0; index < this.Assignedtasks.length; index++) {
            var ts = this.Assignedtasks[index];
            var stime, etime, actualStart, actualEnd, classname, tRef, contentdiv, contentdivs, leftcontent, startTimes, endTimes, pstime, petime, classnames, startTime, endTime;
            // create groups
            var baseactual = mz(ts.standardDepartureTime).tz(this.currentStation.timezone).subtract(1, 'hours').toDate()

            if (ts.standardArrivalTime) {
                actualStart = ts.standardArrivalTime;
            }
            if (ts.standardArrivalTime === null) {
                actualStart = mz(ts.standardDepartureTime).tz(this.currentStation.timezone).subtract(1, 'hours').toDate();
            }
            if (ts.estimatedArrivalTime) {
                actualStart = ts.estimatedArrivalTime;
            }
            if (ts.actualArrivalTime) {
                actualStart = ts.actualArrivalTime;
            }
            if (ts.standardDepartureTime) {
                actualEnd = ts.standardDepartureTime;
            }
            if (ts.standardDepartureTime == null) {
                actualEnd = mz(ts.standardArrivalTime).tz(this.currentStation.timezone).add(1, 'hours').toDate();
            }
            if (ts.estimatedDepartureTime) {
                actualEnd = ts.estimatedDepartureTime;
            }
            if (ts.standardArrivalTime) {
                startTimes = this.convertTimeFromValue(ts.standardArrivalTime, ts.standardDepartureTime, ts.arrivalDepartureType, ts.activityStartTime)
            }
            if (ts.standardArrivalTime === null) {
                startTimes = this.convertTimeFromValue(baseactual, ts.standardDepartureTime, ts.arrivalDepartureType, ts.activityStartTime)
            }

            if (ts.estimatedArrivalTime) {
                let endvalue;
                endvalue = ts.estimatedDepartureTime;
                if (ts.estimatedDepartureTime == null) {
                    endvalue = ts.standardDepartureTime
                }
                startTimes = this.convertTimeFromValue(ts.estimatedArrivalTime, endvalue, ts.arrivalDepartureType, ts.activityStartTime)
            }
            if (ts.actualArrivalTime && ts.taskName !== "Chocks on" && ts.taskName !== "Chocks off") {
                let endvalue;
                if (ts.actualDepartureTime == null || ts.actualDepartureTime) {
                    endvalue = ts.estimatedDepartureTime
                }
                startTimes = this.convertTimeFromValue(ts.actualArrivalTime, endvalue, ts.arrivalDepartureType, ts.activityStartTime)
            }
            if (ts.standardDepartureTime) {
                endTimes = mz(startTimes).tz(this.currentStation.timezone).add(ts.taskDuration, 'minutes').toDate()
            }
            if (ts.estimatedDepartureTime) {
                endTimes = mz(startTimes).tz(this.currentStation.timezone).add(ts.taskDuration, 'minutes').toDate()
            }
            if (ts.actualDepartureTime && ts.taskName !== "Chocks on" && ts.taskName !== "Chocks off") {
                endTimes = mz(startTimes).tz(this.currentStation.timezone).add(ts.taskDuration, 'minutes').toDate()
            }

            if (ts.standardDepartureTime == null && ts.estimatedDepartureTime == null && ts.actualDepartureTime == null) {
                endTimes = mz(startTimes).tz(this.currentStation.timezone).add(ts.taskDuration, 'minutes').toDate()
            }


            if (ts.name === null)
                ts.name = "Unassigned"
            classnames = 'plan'
            classname = 'expecting'
            let ethold, sthold;
            if (mz(startTimes).isSame(endTimes)) {
                sthold = mz(startTimes).add(30, 'seconds').toDate()
                ethold = mz(endTimes).add(30, 'seconds').toDate()
            } else {
                let d = ts.taskDuration * 0.1
                sthold = mz(startTimes).add(d, 'minutes').toDate()
                ethold = mz(endTimes).add(d, 'minutes').toDate()
            }
            if (ts.taskActualStartTime && ts.taskActualEndTime) {
                stime = mz(ts.taskActualStartTime).tz(this.currentStation.timezone).toDate()
                etime = mz(ts.taskActualEndTime).tz(this.currentStation.timezone).toDate()
                pstime = mz(ts.taskActualStartTime).tz(this.currentStation.timezone).toDate()
                petime = mz(ts.taskActualEndTime).tz(this.currentStation.timezone).toDate()
                comTaskz++;
                if (mz(etime).diff(endTimes) <= 0) {
                    classname = 'save';
                }
                if (mz(etime).diff(endTimes) > 0 && mz(etime).diff(ethold) <= 0) {
                    classname = 'warning';

                }
                if (mz(etime).diff(ethold) > 0) {
                    classname = 'delay';
                }

                classnames = 'plan'
                tRef = "completed"
            } else if (ts.taskActualStartTime && ts.taskActualEndTime == null) {
                stime = mz(ts.taskActualStartTime).tz(this.currentStation.timezone).toDate()
                etime = null;
                pstime = mz(ts.taskActualStartTime).tz(this.currentStation.timezone).toDate()

                if (mz(stime).diff(endTimes) <= 0) {
                    classname = 'save';
                }
                if (mz(stime).diff(endTimes) > 0 && mz(stime).diff(ethold) <= 0) {
                    classname = 'warning';

                }
                if (mz(stime).diff(ethold) > 0) {
                    classname = 'delay';
                }

                petime = null;
                tRef = "inprogress";
            } else {
                stime = this.convertTimeFromValue(actualStart, actualEnd, ts.arrivalDepartureType, ts.activityStartTime);
                etime = mz(stime).tz(this.currentStation.timezone).add(ts.taskDuration, 'minutes').toDate();
                pstime = null;
                petime = null;
                tRef = "yts";
            }

            startTime = this.AppUrl.getHrsmintues(pstime, this.currentStation.timezone)
            endTime = this.AppUrl.getHrsmintues(petime, this.currentStation.timezone)

            // if start and end time are different the corresponding class, start & end time, lat & long (DURATION TASK)
            leftcontent = {
                "class": classname,
                "tasks": ts.taskName,
                "start": startTime,
                "end": endTime,
                "lat": Number(ts.latitude),
                "lng": Number(ts.longitude),
            }
            // if start and end time is same the corresponding class, start and end time, lat and long (EVENT TASK)
            if (mz(stime).isSame(etime)) {
                leftcontent = {
                    "class": classname,
                    "tasks": ts.taskName,
                    "end": endTime,
                    "lat": Number(ts.latitude),
                    "lng": Number(ts.longitude),
                }
            }

            this.htmlToAdd.push(leftcontent);
            this.htmlToAdd2 = this.htmlToAdd;
            if (this.htmlToAdd) {
                this.flightBody(this.htmlToAdd);
            }
        }
    }

    // Icons will be displayed based on the task and color logic 
    flightBody(content) {
        this.markers = [];
        for (var index = 0; index < content.length; index++) {
            var element = content[index];

            let obj = {
                name: element.class,
                // lat: Number(element.lat),
                // lng: Number(element.lng),
                label: element.tasks,
                // iconUrl: '../../../../assets/images/dashboard/'+element.class+'-'+(element.tasks).replace(/ /g, '')+'.png'
                iconUrl: {
                    url: require('../../../../assets/images/dashboard/' + element.class + '.svg'),
                    scaledSize: {
                        height: 40,
                        width: 40,
                    }
                }
            }
            if (element.tasks == 'Chocks on') {
                var blk = document.getElementById('con-blk');
                var elem = document.getElementById('chocksOn');
                elem.classList.add(obj.name);
                if (obj.name != 'expecting') {
                    //   console.log('inside the not expecting loop', obj.name)
                    blk.classList.add('visible');
                }
            }

            if (element.tasks == 'Fuelling') {
                var blk = document.getElementById('fuel-blk');
                var elem = document.getElementById('fuel');
                elem.classList.add(obj.name);
                if (obj.name != 'expecting') {
                    blk.classList.add('visible');
                }
            }
            if (element.tasks == 'Pax doors open') {
                var blk = document.getElementById('doors-open');
                var elem = document.getElementById('doorsOpen');
                elem.classList.add(obj.name);
                if (obj.name != 'expecting') {
                    blk.classList.add('visible');
                }
            }
            if (element.tasks == 'Baggage loading') {
                var blk = document.getElementById('baggage-blk');
                var elem = document.getElementById('baggage');
                elem.classList.add(obj.name);
                if (obj.name != 'expecting') {
                    blk.classList.add('visible');
                }
            }
            if (element.tasks == 'Catering') {
                var blk = document.getElementById('catering-blk');
                var elem = document.getElementById('catering');
                elem.classList.add(obj.name);
                if (obj.name != 'expecting') {
                    blk.classList.add('visible');
                }
            }
            this.markers.push(obj);
            // console.log(this.markers);
        }
        // console.log(this.markers);
        // this.baynumberList = [];
    }
    city() {
        console.log()
        this.ind = false;
        this.getBayNumber();
        console.log(this.lat, this.long);
        // if (this.currentStation.code == 'MAA') {
        //     console.log('inside the MAA loop')
        //     this.lat = 12.985000;
        //     this.long = 80.167222;
        // }
        // else {
        //     this.lat = parseFloat(this.auth.user.userAirportMappingList[0].lat);
        //     this.long = parseFloat(this.auth.user.userAirportMappingList[0].lng);
        // }
        this.lat = -37.0082
        this.long = 174.7850
        this.zoom = 14.5;
    }

    // navigate back to resource map page on click on back button 
    backToLive() {
        this.router.navigate(['/station/flifo/live_status']);
    }
    viewChange(type: any) {
        // console.log(this.Assignedtasks);
        if (type == 'staff') {
            this.viewTask = false;
            this.viewStaff = true;
            this.staffLoc = true;
            // this.staffPayload();
        } else if (type == 'task') {
            this.staffLoc = false;
            this.viewStaff = false;
            this.viewTask = true;
        }
        console.log(this.fltUsers);
    }
    sampleStaff = [];
    getUserList(fltData: any) {
        this.services.getAll(this.AppUrl.geturlfunction('AV_STAFF') + fltData.flightSchedulesId).subscribe(res => {
            console.log(res);
            this.userDetails = res.users;
            this.sampleStaff = this.userDetails;
            for (let index = 0; index < this.sampleStaff.length; index++) {
                const element = this.sampleStaff[index];
                element.lat = this.locations[index].lat;
                element.lng = this.locations[index].lng;
            }
            // console.log('after the loop----------------',this.sampleStaff);
        })
    }
}