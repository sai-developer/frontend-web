import { Component, OnInit, ViewChild, Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AppUrl } from '../../../service/app.url-service';
import { ApiService } from '../../../service/app.api-service';
import { FlightStatusComponent } from './flight_status/flight_status.component';
import { MatDialog } from "@angular/material";
import { AppService, AuthService } from '../../../service/app.service'
import { TaskBG, flightColor } from "../../../service/app.pipe";
import * as mz from 'moment-timezone';
import { Observable } from 'rxjs';
import { ToastrService, GlobalConfig } from 'ngx-toastr';
import {
    IMqttMessage,
    MqttModule,
    IMqttServiceOptions,
    MqttService
} from 'ngx-mqtt';
import { max } from 'rxjs/operators';
import { formatDate } from 'ngx-bootstrap/chronos';
import { ToastComponent } from '../../../toast/toast.component';
import * as _ from 'underscore';
import { AddFlightComponent } from './add-flight/add-flight.component';
import { EquipmentList } from '../../../station/master/tasks/task/aircraft-master.class';
import { CommonData } from '../../../service/common-data';

// global variable for timeline
declare let vis: any;

@Component({
    templateUrl: './live_status.component.html',
    styleUrls: ['./live_status.component.scss'],
    providers: [TaskBG, flightColor, DatePipe]
})

export class LiveStatusComponent implements OnInit, OnDestroy {
    // initiallization of variable required for the page
    load: Boolean = false;
    toasterOptions: GlobalConfig;
    actionSubscription: any;
    flightcount: any = [];
    msg: string;
    oldBayId: any;
    publishflag: boolean;
    constructor(private services: ApiService, private appService: AppService, private appUrl: AppUrl, private toastr: ToastrService, private mqttService: MqttService, private auth: AuthService, private dialog: MatDialog, private taskBG: TaskBG, private flycolor: flightColor, private datePipe: DatePipe, private common: CommonData) {
        this.currentStation = {
            "id": this.auth.user.userAirportMappingList[0].id,
            "code": this.auth.user.userAirportMappingList[0].code,
            "timezone": this.auth.user.airport.timezone,
            "userId": this.auth.user.id
        },
            // console.log('userDetails', this.auth.user);
        this.zoneOffset = this.auth.timeZone
        this.toasterOptions = this.toastr.toastrConfig;

    }
    webWidth: any;
    webHeight: any;
    newX: any;
    newY: any;
    modalWidth: any = 300;
    modalHeight: any = 400;
    flights: any;
    currentStation: any;
    bayList: any;
    schedules: any = {
        bays: [],
        flights: []
    }
    flightProgress: any;
    zoneOffset: any;
    options: any;
    startOfDay: any;
    endOfDay: any;
    message: any;
    date: any;
    bayId: any
    equipments: EquipmentList[] = [];
    airportList: any;
    bays: any;
    constants: any;
    footerAction: any;
    newStart: any;
    newEnd: any;
    timeline: any;
    left: any;
    top: any;

    ngOnInit() {
        this.appService.state.next('TIMELINE');
        this.constants = this.common;
        this.startOfDay = mz().tz(this.currentStation.timezone).startOf('day').toDate();
        this.endOfDay = mz().tz(this.currentStation.timezone).endOf('day').toDate();
        this.date = this.datePipe.transform(this.endOfDay, 'dd/MM/yyyy');
        this.getTodayFlights();
        this.webWidth = window.screen.availWidth;
        this.webHeight = window.screen.availHeight;
        this.subscribeActions();
        this.getEquipmentList();
        this.getAirportList();
        this.getBays();
        this.appService.search.next('FILTER');
    }

    ngOnDestroy() {
        this.actionSubscription.unsubscribe();
        this.appService.search.next(' ');
        this.footerAction.unsubscribe();
    }

    // function to subscribe events/functions required for the page from station layout
    subscribeActions() {
        this.actionSubscription = this.appService.action.subscribe((action) => {
            if (action === 'REFRESH') {
            } else if (action === 'ADD') {
                this.addNewFlight();
            }
        });
        this.footerAction = this.appService.data.subscribe((action) => {
            // console.log('action received from the footer', action);
            this.move(action);
            this.click();
        });
    }
    // GET API for list of flights/details
    getTodayFlights() {
        this.schedules.bays = [];
        this.schedules.flights = [];
        this.load = true;
        this.services.getAll(this.appUrl.geturlfunction('FLIGHTS_BY_FROM_TO')).subscribe(res => {
            this.flights = res.data;
            this.bayId = [];
            for (let i = 0; i < this.flights.length; i++) {
                if (this.flights[i].bayId !== null) {
                    this.bayId[this.flights[i].bayId] = this.flights[i];
                }
            }
            // console.log(this.bayId)
            if (this.flights.length > 0) {
                this.load = false;
                this.createItems();
            } else {
                this.load = false;
                this.appService.toast('', 'No Bay And Flights Allocated', 'error', 'error-mode');
            }
        }, error => {
            this.load = false;
            this.appService.toast('', 'No Bay And Flights Allocated', 'error', 'error-mode');
        })
    }

    // function to calculate Start & End Time for base & terminating
    getStartEndTime(flightData) {
        let obj = {
            sta: flightData.standardArrivalTime,
            std: flightData.standardDepartureTime,
            eta: flightData.estimatedArrivalTime,
            etd: flightData.estimatedDepartureTime,
            ata: flightData.actualArrivalTime,
            atd: flightData.actualDepartureTime
        }
        if (flightData.flightType == 0 || flightData.flightType == 3) {
            if (obj.sta == null) {
                obj.sta = mz(obj.std).tz(this.currentStation.timezone).subtract(60, 'minutes').unix() * 1000;
            }
            if (obj.std == null) {
                obj.std = mz(obj.sta).tz(this.currentStation.timezone).add(60, 'minutes').unix() * 1000;
            }
            if (obj.eta == null) {
                obj.eta = mz(obj.etd).tz(this.currentStation.timezone).subtract(60, 'minutes').unix() * 1000;
            }
            if (obj.etd == null) {
                obj.etd = mz(obj.eta).tz(this.currentStation.timezone).add(60, 'minutes').unix() * 1000;
            }
            if (obj.ata == null) {
                obj.ata = mz(obj.atd).tz(this.currentStation.timezone).subtract(60, 'minutes').unix() * 1000;
            }
            if (obj.atd == null) {
                obj.atd = mz(obj.ata).tz(this.currentStation.timezone).add(60, 'minutes').unix() * 1000;
            }
        }
        return obj
    }

    // function to create left side items for timeline (BAYS)
    createItems() {
        let bays = [];
        bays = _.uniq(this.bayId);
        for (var index = 0; index < this.flights.length; index++) {
            var flight = this.flights[index];
            if (bays[index + 1] !== undefined) {
                let bayName = (bays[index + 1].bayType === 0) ? this.constants.bayType[0].type : this.constants.bayType[1].type;
                this.schedules.bays.push({
                    id: bays[index + 1].bayId,
                    content: '<div class="i-live-detail">' +
                        '<div class="live-txt">' + this.constants.bayTitle + ' <span class="bay-no">' + bays[index + 1].bayCode + '</span></div>' +
                        '<br>' +
                        '<div class="live-txt"><span class="bay-type">' + bayName + '<span></div>' +
                        //   '<hr class="tc-separator">'+
                        '</div>',
                    seq: bays[index + 1].bayCode
                });
            }
            let obj = this.getStartEndTime(flight)
            let current_start_time = obj.ata ? obj.ata : obj.eta ? obj.eta : obj.sta;
            let current_end_time = obj.atd ? obj.atd : obj.etd ? obj.etd : obj.std;
            let taskBGC = this.taskBG.transform(flight); // color logic calculation from TaskBG Pipe
            let arrivaltime = this.appUrl.getHrsmintues(flight.standardArrivalTime, this.currentStation.timezone);
            let departuretime = this.appUrl.getHrsmintues(flight.standardDepartureTime, this.currentStation.timezone);
            let flightClr = this.flycolor.transform(flight); // color logic calculation from flightColor pipe
            if (!flight.actualArrivalTime) {
                flightClr.arrColor = 'no-' + flightClr.arrColor
            }
            if (!flight.actualDepartureTime) {
                flightClr.depColor = 'no-' + flightClr.depColor
            }
            let taskcolor;
            if (flight.actualDepartureTime) {
                // taskcolor = 'task-detail-' + taskBGC
                taskcolor = 'flt-comp-' + taskBGC
            } else {
                taskcolor = taskBGC
            }

            let actualcontent; // forming HTML content for the timeline based of flightTypes
            if (flight.flightType == 0) {
                actualcontent = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flight-name-right">' + (flight.destinationAirportCode || '') + '</span><span class="flt-no-right">' + (flight.depFlightNumber || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-right-' + flightClr.depColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="taskcompletecount">' + (flight.taskCompletedCount != null ? flight.taskCompletedCount : 0) + '/' + (flight.taskAssignedCount != null ? flight.taskAssignedCount : 0) + '</span><span class="departuretime">' + ('STD:' + (departuretime || '--:--')) + '</span></div>' + '</div>' + '</div>'
            } else if (flight.flightType == 3) {
                actualcontent = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flt-no-left">' + (flight.arrFlightNumber || '') + '</span><span class="flight-name-left">' + (flight.originAirportCode || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-left-' + flightClr.arrColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="arrivaltime">' + ('STA:' + (arrivaltime || '--:--')) + '</span><span class="taskcompletecount">' + (flight.taskCompletedCount != null ? flight.taskCompletedCount : 0) + '/' + (flight.taskAssignedCount != null ? flight.taskAssignedCount : 0) + '</span></div>' + '</div>' + '</div>'
            } else {
                actualcontent = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flt-no-left">' + (flight.arrFlightNumber || '') + '</span><span class="flight-name-left">' + (flight.originAirportCode || '') + '</span><span class="flight-name-right">' + (flight.destinationAirportCode || '') + '</span><span class="flt-no-right">' + (flight.depFlightNumber || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-left-' + flightClr.arrColor + '"></span><span class="dot-right-' + flightClr.depColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="arrivaltime">' + ('STA:' + (arrivaltime || '--:--')) + '</span><span class="taskcompletecount">' + (flight.taskCompletedCount != null ? flight.taskCompletedCount : 0) + '/' + (flight.taskAssignedCount != null ? flight.taskAssignedCount : 0) + '</span><span class="departuretime">' + ('STD:' + (departuretime || '--:--')) + '</span></div>' + '</div>' + '</div>'
            }

            this.schedules.flights.push({
                id: flight.flightSchedulesId,
                group: flight.bayId,
                start: mz(current_start_time).toDate(),
                end: mz(current_end_time).toDate(),
                content: actualcontent,
                className: taskcolor,
                flightdetails: flight
            });
            // default configurable options for the timeline
            this.options = {
                stack: true,
                moveable: false,
                //zoomKey: 'ctrlKey',
                //maxHeight: '100%',
                start: mz().tz(this.currentStation.timezone).subtract(3, 'hours').toDate(),
                end: mz().tz(this.currentStation.timezone).add(3, 'hours').toDate(),
                min: mz().tz(this.currentStation.timezone).startOf('day').subtract(6, 'hours').toDate(),
                max: mz().tz(this.currentStation.timezone).endOf('day').add(6, 'hours').toDate(),
                editable: false,
                margin: {
                    item: 10, // minimal margin between items
                    axis: 5 // minimal margin between items and the axis
                },
                groupOrder: function (a, b) {
                    return a.seq - b.seq;
                },
                zoomable: true,
                // zoomMin: 1000 * 60 * 30,
                zoomMax: 1000 * 60 * 60 * 6,
                orientation: 'top',
                moment: function (date) {
                    return date
                },
            };
        }
        this.createTimeline();
    }

    // specify options


    // function call to create timeline
    createTimeline() {
        // create a Timeline
        let _self = this;

        // setTimeout(function(){
        let container = document.getElementById('bayAllocation');
        _self.options.moment = function (date) {
            var tm = mz(date).tz(_self.currentStation.timezone).format('HH:mm:ss');
            return vis.moment(date).utcOffset(_self.zoneOffset);
        };


        //     var locales = {
        //         mylocale: {
        //             current: '',
        //             time: ''
        //         }
        //  };
        //     _self.options = {
        //         locales: locales,
        //         locale: 'mylocale',

        //     };

        _self.timeline = new vis.Timeline(container, null, _self.options); // initiallize timeline
        var tc = mz(localStorage.getItem('userTime')).tz(_self.currentStation.timezone).unix() * 1000;
        _self.timeline.setCurrentTime(tc);
        _self.timeline.setGroups(_self.schedules.bays); // set left side items (BAYS) 
        //_self.timeline.setCurrentTime( new Date().toLocaleString(_self.currentStation.timezone, 
        //  { hour: 'numeric', minute: 'numeric', hour12: true }));

        // vis.timeline.TimeStep.prototype.getLabelMajor(new Date().toLocaleString('IT', 
        //     { hour: 'numeric', minute: 'numeric', hour12: true }))

        let tempDataSet = new vis.DataSet();
        tempDataSet.add(_self.schedules.flights);


        _self.timeline.setItems(tempDataSet); // set right side items (FLIGHTS)
        _self.timeline.on('select', function (event) {
            let start = this.itemsData._data[event.items].start,
                end = this.itemsData._data[event.items].end,
                flightDet = this.itemsData._data[event.items].flightdetails
            _self.left = event.event.center.x;
            _self.top = event.event.center.y;
            if (event.items.length > 0) {
                _self.view(_self.left, _self.top, event.items[0], start, end, flightDet);
            }
        });

        _self.timeline.on('rangechange', function (event) {
            const timelineWrap: any = document.getElementById('bayAllocation');
            //const currentTime: HTMLElement | null = timelineWrap ? timelineWrap.querySelectorAll('.vis-current-time')[0] : null;
            //const visForeground: HTMLElement | null = timelineWrap ? timelineWrap.querySelectorAll('.vis-foreground')[0] : null;
            // if (parseInt(currentTime.style.left, 10) < 1 || parseInt(currentTime.style.left, 10) > visForeground.offsetWidth) {
            //     currentTime.hidden = true;
            // }
            // else {
            //     currentTime.hidden = false;
            // }


            // On Current Time, to remove the "Current time" text
            // const titleArr: string[] = currentTime.title.split(',');
            // currentTime.title = titleArr[1].concat(titleArr[2]);
        });

        _self.timeline.on('currentTimeTick', function (event) {

            const currentTime: any = container ? container.querySelectorAll('.vis-current-time')[0] : null;
            // On Current Time, to remove the "Current time" text
            // const titleArr: string[] = currentTime.title.split(',');
            // currentTime.title = titleArr[1].concat(titleArr[2]);
        });

        // declaring MQTT topics required for subscribe
        let mqttTopic = _self.currentStation.code + _self.appUrl.getMqttTopic('TASK_COMPLETE');
        let turnColor = _self.currentStation.code + _self.appUrl.getMqttTopic('TURN_COLOR');
        let chockscount = _self.currentStation.code + _self.appUrl.getMqttTopic('CHOCKS_COUNT');
        let mqtttopicTaskcount = _self.currentStation.code + _self.appUrl.getMqttTopic('TASK_ASSIGN_COUNT');
        let eta_etdchange = _self.currentStation.code + _self.appUrl.getMqttTopic('ETA_ETD_CHANGE');
        let web_chockson = _self.currentStation.code + _self.appUrl.getMqttTopic('WEB_CHOCKS_ON');
        let web_chocksoff = _self.currentStation.code + _self.appUrl.getMqttTopic('WEB_CHOCKS_OFF');
        let eta_cron = _self.currentStation.code + _self.appUrl.getMqttTopic('ETACRON');

        // subscription for Webchocks on & Webchocks off count update
        _self.mqttService.observe(chockscount, { qos: 0 }).subscribe((message: IMqttMessage) => {
            _self.message = message.payload.toString();
            _self.message = JSON.parse(_self.message);
            // console.log(_self.message)
            // console.log("chockscount&&&&&&&&&&&&&")
            var y;
            for (y in _self.timeline.itemsData._data) {
                let value = _self.timeline.itemsData._data[y];
                if (_self.message) {
                    if (_self.message.flightSchId == value.id) {
                        let arrivaltime = this.appUrl.getHrsmintues(value.flightdetails.standardArrivalTime, this.currentStation.timezone);
                        let departuretime = this.appUrl.getHrsmintues(value.flightdetails.standardDepartureTime, this.currentStation.timezone);
                        let flightClr = this.flycolor.transform(value.flightdetails);
                        if (!value.flightdetails.actualArrivalTime) {
                            flightClr.arrColor = 'no-' + flightClr.arrColor
                        }
                        if (!value.flightdetails.actualDepartureTime) {
                            flightClr.depColor = 'no-' + flightClr.depColor
                        }
                        let taskcolor;
                        let taskBGC = this.taskBG.transform(value.flightdetails);
                        console.log('1',value.flightdetails.flight_flag);
                        if (value.flightdetails.actualDepartureTime) {
                            // taskcolor = 'task-detail-' + taskBGC
                            taskcolor = 'flt-comp-' + taskBGC
                        } else {
                            taskcolor = taskBGC
                        }
                        value.className = taskcolor;
                        value.flightdetails.taskCompletedCount = _self.message.count;
                        if (value.flightdetails.flightType == 0) {
                            value.content = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flight-name-right">' + (value.flightdetails.destinationAirportCode || '') + '</span><span class="flt-no-right">' + (value.flightdetails.depFlightNumber || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-right-' + flightClr.depColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="taskcompletecount">' + (_self.message.count != null ? _self.message.count : 0) + '/' + (value.flightdetails.taskAssignedCount != null ? value.flightdetails.taskAssignedCount : 0) + '</span><span class="departuretime">' + ('STD:' + (departuretime || '--:--')) + '</span></div>' + '</div>' + '</div>'
                        } else if (value.flightdetails.flightType == 3) {
                            value.content = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flt-no-left">' + (value.flightdetails.arrFlightNumber || '') + '</span><span class="flight-name-left">' + (value.flightdetails.originAirportCode || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-left-' + flightClr.arrColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="arrivaltime">' + ('STA:' + (arrivaltime || '--:--')) + '</span><span class="taskcompletecount">' + (_self.message.count != null ? _self.message.count : 0) + '/' + (value.flightdetails.taskAssignedCount != null ? value.flightdetails.taskAssignedCount : 0) + '</span></div>' + '</div>' + '</div>'
                        } else {
                            value.content = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flt-no-left">' + (value.flightdetails.arrFlightNumber || '') + '</span><span class="flight-name-left">' + (value.flightdetails.originAirportCode || '') + '</span><span class="flight-name-right">' + (value.flightdetails.destinationAirportCode || '') + '</span><span class="flt-no-right">' + (value.flightdetails.depFlightNumber || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-left-' + flightClr.arrColor + '"></span><span class="dot-right-' + flightClr.depColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="arrivaltime">' + ('STA:' + (arrivaltime || '--:--')) + '</span><span class="taskcompletecount">' + (_self.message.count != null ? _self.message.count : 0) + '/' + (value.flightdetails.taskAssignedCount != null ? value.flightdetails.taskAssignedCount : 0) + '</span><span class="departuretime">' + ('STD:' + (departuretime || '--:--')) + '</span></div>' + '</div>' + '</div>'
                        }
                        tempDataSet.update(value);
                    }
                }
            }
        });




        // subscription for task completed count
        _self.mqttService.observe(mqttTopic, { qos: 0 }).subscribe((message: IMqttMessage) => {
            _self.message = message.payload.toString();
            _self.message = JSON.parse(_self.message);
            var tc = mz(localStorage.getItem('userTime')).tz(_self.currentStation.timezone).unix() * 1000;
            _self.timeline.setCurrentTime(tc);
            // console.log("**************taskcount")
            // console.log('--------------------------------------',_self.message)
            var y;
            for (y in _self.timeline.itemsData._data) {
                let value = _self.timeline.itemsData._data[y];
                // console.log('--------------------------this is the value payload', value);
                if (_self.message.data) {
                    // if (_self.message.data.flightSchedulesId == value.id && (_self.message.data.taskActualStartTime != null) && (_self.message.data.taskActualEndTime != null)) {
                    if (_self.message.data.flightSchedulesId == value.id) {
                        // console.log('inside the mqqt section')
                        let flightClr;

                        if (_self.message.data.taskName == 'Chocks on') {
                            // console.log('inside chocks on');
                            value.flightdetails.actualArrivalTime = _self.message.data.taskActualStartTime;
                            value.start = mz(_self.message.data.taskActualStartTime).toDate();
                        } else if (_self.message.data.taskName == 'Chocks off') {
                            // console.log('inside chocks off')
                            value.flightdetails.actualDepartureTime = _self.message.data.taskActualEndTime;
                            value.end = mz(_self.message.data.taskActualEndTime).toDate();
                        } else {
                        }
                        flightClr = this.flycolor.transform(value.flightdetails);
                        if (!value.flightdetails.actualArrivalTime) {
                            flightClr.arrColor = 'no-' + flightClr.arrColor
                        }
                        if (!value.flightdetails.actualDepartureTime) {
                            flightClr.depColor = 'no-' + flightClr.depColor
                        }
                        let arrivaltime = this.appUrl.getHrsmintues(value.flightdetails.standardArrivalTime, this.currentStation.timezone);
                        let departuretime = this.appUrl.getHrsmintues(value.flightdetails.standardDepartureTime, this.currentStation.timezone);
                        value.flightdetails.taskCompletedCount = _self.message.data.taskCompletedCount;
                        // console.log(_self.message.data);
                        console.log('2',value.flightdetails.flight_flag);
                        let taskBGC = this.taskBG.transform(value.flightdetails);
                        let taskcolor;
                        if (value.flightdetails.actualDepartureTime) {
                            // taskcolor = 'task-detail-' + taskBGC
                            taskcolor = 'flt-comp-' + taskBGC
                        } else {
                            taskcolor = taskBGC
                        }
                        value.className = taskcolor;
                        let actualcontent;  // forming HTML content for the timeline based of flightTypes
                        if (value.flightdetails.flightType == 0) {
                            actualcontent = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flight-name-right">' + (value.flightdetails.destinationAirportCode || '') + '</span><span class="flt-no-right">' + (value.flightdetails.depFlightNumber || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-right-' + flightClr.depColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="taskcompletecount">' + (_self.message.data.taskCompletedCount != null ? _self.message.data.taskCompletedCount : 0) + '/' + (value.flightdetails.taskAssignedCount != null ? value.flightdetails.taskAssignedCount : 0) + '</span><span class="departuretime">' + ('STD:' + (departuretime || '--:--')) + '</span></div>' + '</div>' + '</div>'
                        } else if (value.flightdetails.flightType == 3) {
                            actualcontent = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flt-no-left">' + (value.flightdetails.arrFlightNumber || '') + '</span><span class="flight-name-left">' + (value.flightdetails.originAirportCode || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-left-' + flightClr.arrColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="arrivaltime">' + ('STA:' + (arrivaltime || '--:--')) + '</span><span class="taskcompletecount">' + (_self.message.data.taskCompletedCount != null ? _self.message.data.taskCompletedCount : 0) + '/' + (value.flightdetails.taskAssignedCount != null ? value.flightdetails.taskAssignedCount : 0) + '</span></div>' + '</div>' + '</div>'
                        } else {
                            actualcontent = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flt-no-left">' + (value.flightdetails.arrFlightNumber || '') + '</span><span class="flight-name-left">' + (value.flightdetails.originAirportCode || '') + '</span><span class="flight-name-right">' + (value.flightdetails.destinationAirportCode || '') + '</span><span class="flt-no-right">' + (value.flightdetails.depFlightNumber || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-left-' + flightClr.arrColor + '"></span><span class="dot-right-' + flightClr.depColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="arrivaltime">' + ('STA:' + (arrivaltime || '--:--')) + '</span><span class="taskcompletecount">' + (_self.message.data.taskCompletedCount != null ? _self.message.data.taskCompletedCount : 0) + '/' + (value.flightdetails.taskAssignedCount != null ? value.flightdetails.taskAssignedCount : 0) + '</span><span class="departuretime">' + ('STD:' + (departuretime || '--:--')) + '</span></div>' + '</div>' + '</div>'
                        }
                        value.content = actualcontent;
                        tempDataSet.update(value);

                    }
                }
            }
        });

        // subscription for task assign count
        _self.mqttService.observe(mqtttopicTaskcount, { qos: 0 }).subscribe((message: IMqttMessage) => {
            _self.message = message.payload.toString();
            _self.message = JSON.parse(_self.message);
            // console.log(_self.message)
            // console.log("topic count updated+++++++++++++")
            var y;
            for (y in _self.timeline.itemsData._data) {
                let value = _self.timeline.itemsData._data[y];
                if (_self.message.data) {
                    if (_self.message.data.flightSchId == value.id) {
                        let arrivaltime = this.appUrl.getHrsmintues(value.flightdetails.standardArrivalTime, this.currentStation.timezone);
                        let departuretime = this.appUrl.getHrsmintues(value.flightdetails.standardDepartureTime, this.currentStation.timezone);
                        let flightClr = this.flycolor.transform(value.flightdetails);
                        if (!value.flightdetails.actualArrivalTime) {
                            flightClr.arrColor = 'no-' + flightClr.arrColor
                        }
                        if (!value.flightdetails.actualDepartureTime) {
                            flightClr.depColor = 'no-' + flightClr.depColor
                        }
                        let taskcolor;
                        console.log('3',value.flightdetails.flight_flag);
                        let taskBGC = this.taskBG.transform(value.flightdetails);
                        if (value.flightdetails.actualDepartureTime) {
                            // taskcolor = 'task-detail-' + taskBGC
                            taskcolor = 'flt-comp-' + taskBGC
                        } else {
                            taskcolor = taskBGC
                        }
                        value.className = taskcolor;
                        value.flightdetails.taskAssignedCount = _self.message.count;
                        if (value.flightdetails.flightType == 0) {
                            value.content = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flight-name-right">' + (value.flightdetails.destinationAirportCode || '') + '</span><span class="flt-no-right">' + (value.flightdetails.depFlightNumber || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-right-' + flightClr.depColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="taskcompletecount">' + (value.flightdetails.taskCompletedCount != null ? value.flightdetails.taskCompletedCount : 0) + '/' + (_self.message.count != null ? _self.message.count : 0) + '</span><span class="departuretime">' + ('STD:' + (departuretime || '--:--')) + '</span></div>' + '</div>' + '</div>'
                        } else if (value.flightdetails.flightType == 3) {
                            value.content = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flt-no-left">' + (value.flightdetails.arrFlightNumber || '') + '</span><span class="flight-name-left">' + (value.flightdetails.originAirportCode || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-left-' + flightClr.arrColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="arrivaltime">' + ('STA:' + (arrivaltime || '--:--')) + '</span><span class="taskcompletecount">' + (value.flightdetails.taskCompletedCount != null ? value.flightdetails.taskCompletedCount : 0) + '/' + (_self.message.count != null ? _self.message.count : 0) + '</span></div>' + '</div>' + '</div>'
                        } else {
                            value.content = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flt-no-left">' + (value.flightdetails.arrFlightNumber || '') + '</span><span class="flight-name-left">' + (value.flightdetails.originAirportCode || '') + '</span><span class="flight-name-right">' + (value.flightdetails.destinationAirportCode || '') + '</span><span class="flt-no-right">' + (value.flightdetails.depFlightNumber || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-left-' + flightClr.arrColor + '"></span><span class="dot-right-' + flightClr.depColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="arrivaltime">' + ('STA:' + (arrivaltime || '--:--')) + '</span><span class="taskcompletecount">' + (value.flightdetails.taskCompletedCount != null ? value.flightdetails.taskCompletedCount : 0) + '/' + (_self.message.count != null ? _self.message.count : 0) + '</span><span class="departuretime">' + ('STD:' + (departuretime || '--:--')) + '</span></div>' + '</div>' + '</div>'
                        }
                        tempDataSet.update(value);
                    }
                }
            }
        });

        // subscription for ETA & ETD change
        _self.mqttService.observe(eta_etdchange, { qos: 0 }).subscribe((message: IMqttMessage) => {
            _self.message = message.payload.toString();
            _self.message = JSON.parse(_self.message);
            var y;
            for (y in _self.timeline.itemsData._data) {
                let value = _self.timeline.itemsData._data[y];
                if (((_self.message) && (!value.flightdetails.actualArrivalTime)) || ((_self.message) && (!value.flightdetails.actualDepartureTime))) {
                    if (_self.message.id == value.flightdetails.flightSchedulesId) {
                        let arrivaltime = this.appUrl.getHrsmintues(value.flightdetails.standardArrivalTime, this.currentStation.timezone);
                        let departuretime = this.appUrl.getHrsmintues(value.flightdetails.standardDepartureTime, this.currentStation.timezone);
                        let flightClr = this.flycolor.transform(value.flightdetails);
                        if (!value.flightdetails.actualArrivalTime) {
                            flightClr.arrColor = 'no-' + flightClr.arrColor
                        }
                        if (!value.flightdetails.actualDepartureTime) {
                            flightClr.depColor = 'no-' + flightClr.depColor
                        }
                        // console.log(_self.message);
                        console.log('4',value.flightdetails.flight_flag);
                        let taskBGC = this.taskBG.transform(value.flightdetails);
                        let taskcolor;
                        value.flightdetails.tailNumber = (_self.message.newTail ? _self.message.newTail : value.flightdetails.tailNumber);
                        if ((value.flightdetails.flightType == 3) && (!value.flightdetails.actualArrivalTime)) {
                            value.flightdetails.estimatedArrivalTime = _self.message.estimatedArrivalTime;
                            value.start = mz(_self.message.estimatedArrivalTime).tz(_self.currentStation.timezone).toDate();
                            let etd = mz(_self.message.estimatedArrivalTime).tz(this.currentStation.timezone).add(60, 'minutes').unix() * 1000;
                            value.end = mz(etd).tz(_self.currentStation.timezone).toDate();
                        }
                        else if ((value.flightdetails.flightType == 0) && (!value.flightdetails.actualDepartureTime)) {
                            let eta = mz(_self.message.estimatedDepartureTime).tz(this.currentStation.timezone).subtract(60, 'minutes').unix() * 1000;
                            value.start = mz(eta).tz(_self.currentStation.timezone).toDate();
                            value.flightdetails.estimatedDepartureTime = _self.message.estimatedDepartureTime;
                            value.end = mz(_self.message.estimatedDepartureTime).tz(_self.currentStation.timezone).toDate();
                        }
                        else {
                            if ((!value.flightdetails.actualArrivalTime) && (_self.message.estimatedArrivalTime != null)) {
                                value.flightdetails.estimatedArrivalTime = _self.message.estimatedArrivalTime;
                                value.start = mz(_self.message.estimatedArrivalTime).tz(_self.currentStation.timezone).toDate();
                            }
                            if ((!value.flightdetails.actualDepartureTime) && (_self.message.estimatedDepartureTime != null)) {
                                value.flightdetails.estimatedDepartureTime = _self.message.estimatedDepartureTime;
                                value.end = mz(_self.message.estimatedDepartureTime).tz(_self.currentStation.timezone).toDate();
                            }
                        }

                        if (value.flightdetails.actualDepartureTime) {
                            // taskcolor = 'task-detail-' + taskBGC
                            taskcolor = 'flt-comp-' + taskBGC
                        } else {
                            taskcolor = taskBGC
                        }
                        value.className = taskcolor;
                        let actualcontent;
                        if (value.flightdetails.flightType == 0) {
                            actualcontent = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flight-name-right">' + (value.flightdetails.destinationAirportCode || '') + '</span><span class="flt-no-right">' + (value.flightdetails.depFlightNumber || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-right-' + flightClr.depColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="taskcompletecount">' + (value.flightdetails.taskCompletedCount != null ? value.flightdetails.taskCompletedCount : 0) + '/' + (value.flightdetails.taskAssignedCount != null ? value.flightdetails.taskAssignedCount : 0) + '</span><span class="departuretime">' + ('STD:' + (departuretime || '--:--')) + '</span></div>' + '</div>' + '</div>'
                        } else if (value.flightdetails.flightType == 3) {
                            actualcontent = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flt-no-left">' + (value.flightdetails.arrFlightNumber || '') + '</span><span class="flight-name-left">' + (value.flightdetails.originAirportCode || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-left-' + flightClr.arrColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="arrivaltime">' + ('STA:' + (arrivaltime || '--:--')) + '</span><span class="taskcompletecount">' + (value.flightdetails.taskCompletedCount != null ? value.flightdetails.taskCompletedCount : 0) + '/' + (value.flightdetails.taskAssignedCount != null ? value.flightdetails.taskAssignedCount : 0) + '</span></div>' + '</div>' + '</div>'
                        } else {
                            actualcontent = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flt-no-left">' + (value.flightdetails.arrFlightNumber || '') + '</span><span class="flight-name-left">' + (value.flightdetails.originAirportCode || '') + '</span><span class="flight-name-right">' + (value.flightdetails.destinationAirportCode || '') + '</span><span class="flt-no-right">' + (value.flightdetails.depFlightNumber || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-left-' + flightClr.arrColor + '"></span><span class="dot-right-' + flightClr.depColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="arrivaltime">' + ('STA:' + (arrivaltime || '--:--')) + '</span><span class="taskcompletecount">' + (value.flightdetails.taskCompletedCount != null ? value.flightdetails.taskCompletedCount : 0) + '/' + (value.flightdetails.taskAssignedCount != null ? value.flightdetails.taskAssignedCount : 0) + '</span><span class="departuretime">' + ('STD:' + (departuretime || '--:--')) + '</span></div>' + '</div>' + '</div>'
                        }
                        value.content = actualcontent;
                        tempDataSet.update(value);
                    }
                }
            }
        })
        // subscription for Webchocks On
        _self.mqttService.observe(web_chockson, { qos: 0 }).subscribe((message: IMqttMessage) => {
            _self.message = message.payload.toString();
            _self.message = JSON.parse(_self.message);
            var y;
            for (y in _self.timeline.itemsData._data) {
                let value = _self.timeline.itemsData._data[y];
                if ((_self.message) && (!value.flightdetails.actualArrivalTime)) {
                    if (_self.message.flightSchedulesId == value.flightdetails.flightSchedulesId) {
                        let arrivaltime = this.appUrl.getHrsmintues(value.flightdetails.standardArrivalTime, this.currentStation.timezone);
                        let departuretime = this.appUrl.getHrsmintues(value.flightdetails.standardDepartureTime, this.currentStation.timezone);
                        let flightClr = this.flycolor.transform(value.flightdetails);
                        if (!value.flightdetails.actualArrivalTime) {
                            flightClr.arrColor = 'no-' + flightClr.arrColor
                        }
                        if (!value.flightdetails.actualDepartureTime) {
                            flightClr.depColor = 'no-' + flightClr.depColor
                        }
                        console.log('5',value.flightdetails.flight_flag);
                        let taskBGC = this.taskBG.transform(value.flightdetails);
                        let taskcolor;
                        if (!value.flightdetails.actualArrivalTime) {
                            value.flightdetails.actualArrivalTime = _self.message.actualStartTime;
                            value.start = mz(_self.message.actualStartTime).tz(_self.currentStation.timezone).toDate();
                        }
                        if (value.flightdetails.flightType == 3) {
                            let atd = mz(_self.message.actualStartTime).tz(this.currentStation.timezone).add(60, 'minutes').unix() * 1000;
                            value.end = mz(atd).tz(_self.currentStation.timezone).toDate();
                        }
                        if (value.flightdetails.actualDepartureTime) {
                            // taskcolor = 'task-detail-' + taskBGC
                            taskcolor = 'flt-comp-' + taskBGC
                        } else {
                            taskcolor = taskBGC
                        }
                        value.className = taskcolor;
                        let actualcontent;
                        if (value.flightdetails.flightType == 0) {
                            actualcontent = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flight-name-right">' + (value.flightdetails.destinationAirportCode || '') + '</span><span class="flt-no-right">' + (value.flightdetails.depFlightNumber || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-right-' + flightClr.depColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="taskcompletecount">' + (value.flightdetails.taskCompletedCount != null ? value.flightdetails.taskCompletedCount : 0) + '/' + (value.flightdetails.taskAssignedCount != null ? value.flightdetails.taskAssignedCount : 0) + '</span><span class="departuretime">' + ('STD:' + (departuretime || '--:--')) + '</span></div>' + '</div>' + '</div>'
                        } else if (value.flightdetails.flightType == 3) {
                            actualcontent = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flt-no-left">' + (value.flightdetails.arrFlightNumber || '') + '</span><span class="flight-name-left">' + (value.flightdetails.originAirportCode || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-left-' + flightClr.arrColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="arrivaltime">' + ('STA:' + (arrivaltime || '--:--')) + '</span><span class="taskcompletecount">' + (value.flightdetails.taskCompletedCount != null ? value.flightdetails.taskCompletedCount : 0) + '/' + (value.flightdetails.taskAssignedCount != null ? value.flightdetails.taskAssignedCount : 0) + '</span></div>' + '</div>' + '</div>'
                        } else {
                            actualcontent = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flt-no-left">' + (value.flightdetails.arrFlightNumber || '') + '</span><span class="flight-name-left">' + (value.flightdetails.originAirportCode || '') + '</span><span class="flight-name-right">' + (value.flightdetails.destinationAirportCode || '') + '</span><span class="flt-no-right">' + (value.flightdetails.depFlightNumber || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-left-' + flightClr.arrColor + '"></span><span class="dot-right-' + flightClr.depColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="arrivaltime">' + ('STA:' + (arrivaltime || '--:--')) + '</span><span class="taskcompletecount">' + (value.flightdetails.taskCompletedCount != null ? value.flightdetails.taskCompletedCount : 0) + '/' + (value.flightdetails.taskAssignedCount != null ? value.flightdetails.taskAssignedCount : 0) + '</span><span class="departuretime">' + ('STD:' + (departuretime || '--:--')) + '</span></div>' + '</div>' + '</div>'
                        }
                        value.content = actualcontent;
                        tempDataSet.update(value);
                    }
                }
            }
        })
        // subscription for Webchocks Off
        _self.mqttService.observe(web_chocksoff, { qos: 0 }).subscribe((message: IMqttMessage) => {
            _self.message = message.payload.toString();
            _self.message = JSON.parse(_self.message);
            var y;
            for (y in _self.timeline.itemsData._data) {
                let value = _self.timeline.itemsData._data[y];
                if ((_self.message) && (!value.flightdetails.actualDepartureTime)) {
                    if (_self.message.flightSchedulesId == value.flightdetails.flightSchedulesId) {
                        let arrivaltime = this.appUrl.getHrsmintues(value.flightdetails.standardArrivalTime, this.currentStation.timezone);
                        let departuretime = this.appUrl.getHrsmintues(value.flightdetails.standardDepartureTime, this.currentStation.timezone);
                        let flightClr = this.flycolor.transform(value.flightdetails);
                        if (!value.flightdetails.actualArrivalTime) {
                            flightClr.arrColor = 'no-' + flightClr.arrColor
                        }
                        if (!value.flightdetails.actualDepartureTime) {
                            flightClr.depColor = 'no-' + flightClr.depColor
                        }
                        console.log('6',value.flightdetails.flight_flag);
                        let taskBGC = this.taskBG.transform(value.flightdetails);
                        let taskcolor;
                        if (value.flightdetails.flightType == 0) {
                            let ata = mz(_self.message.actualEndTime).tz(this.currentStation.timezone).subtract(60, 'minutes').unix() * 1000;
                            value.start = mz(ata).tz(_self.currentStation.timezone).toDate();
                        }
                        if (!value.flightdetails.actualDepartureTime) {
                            value.flightdetails.actualDepartureTime = _self.message.actualEndTime;
                            value.end = mz(_self.message.actualEndTime).tz(_self.currentStation.timezone).toDate();
                        }
                        if (value.flightdetails.actualDepartureTime) {
                            // taskcolor = 'task-detail-' + taskBGC
                            taskcolor = 'flt-comp-' + taskBGC
                        } else {
                            taskcolor = taskBGC
                        }
                        value.className = taskcolor;
                        let actualcontent;
                        if (value.flightdetails.flightType == 0) {
                            actualcontent = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flight-name-right">' + (value.flightdetails.destinationAirportCode || '') + '</span><span class="flt-no-right">' + (value.flightdetails.depFlightNumber || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-right-' + flightClr.depColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="taskcompletecount">' + (value.flightdetails.taskCompletedCount != null ? value.flightdetails.taskCompletedCount : 0) + '/' + (value.flightdetails.taskAssignedCount != null ? value.flightdetails.taskAssignedCount : 0) + '</span><span class="departuretime">' + ('STD:' + (departuretime || '--:--')) + '</span></div>' + '</div>' + '</div>'
                        } else if (value.flightdetails.flightType == 3) {
                            actualcontent = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flt-no-left">' + (value.flightdetails.arrFlightNumber || '') + '</span><span class="flight-name-left">' + (value.flightdetails.originAirportCode || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-left-' + flightClr.arrColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="arrivaltime">' + ('STA:' + (arrivaltime || '--:--')) + '</span><span class="taskcompletecount">' + (value.flightdetails.taskCompletedCount != null ? value.flightdetails.taskCompletedCount : 0) + '/' + (value.flightdetails.taskAssignedCount != null ? value.flightdetails.taskAssignedCount : 0) + '</span></div>' + '</div>' + '</div>'
                        } else {
                            actualcontent = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flt-no-left">' + (value.flightdetails.arrFlightNumber || '') + '</span><span class="flight-name-left">' + (value.flightdetails.originAirportCode || '') + '</span><span class="flight-name-right">' + (value.flightdetails.destinationAirportCode || '') + '</span><span class="flt-no-right">' + (value.flightdetails.depFlightNumber || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-left-' + flightClr.arrColor + '"></span><span class="dot-right-' + flightClr.depColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="arrivaltime">' + ('STA:' + (arrivaltime || '--:--')) + '</span><span class="taskcompletecount">' + (value.flightdetails.taskCompletedCount != null ? value.flightdetails.taskCompletedCount : 0) + '/' + (value.flightdetails.taskAssignedCount != null ? value.flightdetails.taskAssignedCount : 0) + '</span><span class="departuretime">' + ('STD:' + (departuretime || '--:--')) + '</span></div>' + '</div>' + '</div>'
                        }
                        value.content = actualcontent;
                        tempDataSet.update(value);
                    }

                }

            }
        })


        // subscription for ETA Cron final approach
        _self.mqttService.observe(eta_cron, { qos: 1 }).subscribe((message: IMqttMessage) => {
            _self.message = message.payload.toString();
            _self.message = JSON.parse(_self.message);
            var y;
            for (y in _self.timeline.itemsData._data) {
                let value = _self.timeline.itemsData._data[y];
                var flightNumbers = (value.flightdetails.depFlightNumber) ? (value.flightdetails.depFlightNumber) : value.flightdetails.arrFlightNumber;
                if (_self.message.flightNumber) {
                    if (_self.message.flightNumber === flightNumbers) {
                        let arrivaltime = this.appUrl.getHrsmintues(value.flightdetails.standardArrivalTime, this.currentStation.timezone);
                        let departuretime = this.appUrl.getHrsmintues(value.flightdetails.standardDepartureTime, this.currentStation.timezone);
                        let flightClr = this.flycolor.transform(value.flightdetails);
                        if (!value.flightdetails.actualArrivalTime) {
                            flightClr.arrColor = 'no-' + flightClr.arrColor
                        }
                        if (!value.flightdetails.actualDepartureTime) {
                            flightClr.depColor = 'no-' + flightClr.depColor
                        }
                        console.log('7',value.flightdetails.flight_flag);
                        let taskBGC = this.taskBG.transform(value.flightdetails);
                        let taskcolor;
                        if ((value.flightdetails.actualArrivalTime !== null && value.flightdetails.actualDepartureTime === null)) {
                            // taskcolor = 'task-detail-' + taskBGC
                            taskcolor = 'flt-comp-' + taskBGC
                        } else {
                            taskcolor = taskBGC
                        }
                        let actualcontent;
                        let ac;
                        actualcontent = '<div>' + '<div class="final-approach-live blinking">' + '<img src="assets/images/dashboard/arrival-icon1.png" class="final-approach-live-icon"/>' + '<span class="final-approach-live-span">' + 'final approach' + ' </span>' + '</div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flt-no-left">' + (value.flightdetails.arrFlightNumber || '') + '</span><span class="flight-name-left">' + (value.flightdetails.originAirportCode || '') + '</span><span class="flight-name-right">' + (value.flightdetails.destinationAirportCode || '') + '</span><span class="flt-no-right">' + (value.flightdetails.depFlightNumber || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-left-' + flightClr.arrColor + '"></span><span class="dot-right-' + flightClr.depColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="arrivaltime">' + ('STA:' + (arrivaltime || '--:--')) + '</span><span class="taskcompletecount">' + value.flightdetails.taskCompletedCount + '/' + value.flightdetails.taskAssignedCount + '</span><span class="departuretime">' + ('STD:' + (departuretime || '--:--')) + '</span></div>' + '</div>' + '</div>';
                        ac = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flt-no-left">' + (value.flightdetails.arrFlightNumber || '') + '</span><span class="flight-name-left">' + (value.flightdetails.originAirportCode || '') + '</span><span class="flight-name-right">' + (value.flightdetails.destinationAirportCode || '') + '</span><span class="flt-no-right">' + (value.flightdetails.depFlightNumber || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-left-' + flightClr.arrColor + '"></span><span class="dot-right-' + flightClr.depColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="arrivaltime">' + ('STA:' + (arrivaltime || '--:--')) + '</span><span class="taskcompletecount">' + value.flightdetails.taskCompletedCount + '/' + value.flightdetails.taskAssignedCount + '</span><span class="departuretime">' + ('STD:' + (departuretime || '--:--')) + '</span></div>' + '</div>' + '</div>'
                        // }
                        value.start = value.start;
                        value.end = value.end;
                        value.content = actualcontent;
                        tempDataSet.update(value);
                        setTimeout(() => {
                            value.content = ac;
                            tempDataSet.update(value);
                        }, 5000);
                        let obj = {}
                        this.mqttService.unsafePublish(mqttTopic, JSON.stringify(obj), { qos: 0, retain: false });
                    }
                }
            }
        })

                // subscription for Turn color
                _self.mqttService.observe(turnColor, { qos: 0 }).subscribe((message: IMqttMessage) => {
                    _self.message = message.payload.toString();
                    _self.message = JSON.parse(_self.message);
                    console.log(turnColor , _self.message);
                    var tc = mz(localStorage.getItem('userTime')).tz(_self.currentStation.timezone).unix() * 1000;
                    _self.timeline.setCurrentTime(tc);
                    var y;
                    for (y in _self.timeline.itemsData._data) {
                        let value = _self.timeline.itemsData._data[y];
                        // console.log('inside the new topic',_self.message );
                        if (_self.message.data) {
                            if (_self.message.data.flightSchedulesId == value.id) {
                                let flightClr;
                                flightClr = this.flycolor.transform(value.flightdetails);
                                if (!value.flightdetails.actualArrivalTime) {
                                    flightClr.arrColor = 'no-' + flightClr.arrColor
                                }
                                if (!value.flightdetails.actualDepartureTime) {
                                    flightClr.depColor = 'no-' + flightClr.depColor
                                }
                                let arrivaltime = this.appUrl.getHrsmintues(value.flightdetails.standardArrivalTime, this.currentStation.timezone);
                                let departuretime = this.appUrl.getHrsmintues(value.flightdetails.standardDepartureTime, this.currentStation.timezone);
                                // value.flightdetails.taskCompletedCount = _self.message.data.taskCompletedCount;
                                // console.log('from mqtt',_self.message.data);
                                // console.log('from value',value.flightdetails);
                                value.flightdetails.flight_flag = _self.message.data.flight_flag;
                                console.log('8',_self.message.data.flight_flag);
                                let taskBGC = this.taskBG.transform(_self.message.data);
                                let taskcolor;
                                if (value.flightdetails.actualDepartureTime) {
                                    // taskcolor = 'task-detail-' + taskBGC
                                    taskcolor = 'flt-comp-' + taskBGC
                                } else {
                                    taskcolor = taskBGC
                                }
                                value.className = taskcolor;
                                let actualcontent;  // forming HTML content for the timeline based of flightTypes
                                if (value.flightdetails.flightType == 0) {
                                    actualcontent = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flight-name-right">' + (value.flightdetails.destinationAirportCode || '') + '</span><span class="flt-no-right">' + (value.flightdetails.depFlightNumber || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-right-' + flightClr.depColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="taskcompletecount">' + (value.flightdetails.taskCompletedCount != null ? value.flightdetails.taskCompletedCount : 0) + '/' + (value.flightdetails.taskAssignedCount != null ? value.flightdetails.taskAssignedCount : 0) + '</span><span class="departuretime">' + ('STD:' + (departuretime || '--:--')) + '</span></div>' + '</div>' + '</div>'
                                } else if (value.flightdetails.flightType == 3) {
                                    actualcontent = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flt-no-left">' + (value.flightdetails.arrFlightNumber || '') + '</span><span class="flight-name-left">' + (value.flightdetails.originAirportCode || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-left-' + flightClr.arrColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="arrivaltime">' + ('STA:' + (arrivaltime || '--:--')) + '</span><span class="taskcompletecount">' + (value.flightdetails.taskCompletedCount != null ? value.flightdetails.taskCompletedCount : 0) + '/' + (value.flightdetails.taskAssignedCount != null ? value.flightdetails.taskAssignedCount : 0) + '</span></div>' + '</div>' + '</div>'
                                } else {
                                    actualcontent = '<div>' + '<div class="task-detail">' + '<div class="task-txt"><span class="flt-no-left">' + (value.flightdetails.arrFlightNumber || '') + '</span><span class="flight-name-left">' + (value.flightdetails.originAirportCode || '') + '</span><span class="flight-name-right">' + (value.flightdetails.destinationAirportCode || '') + '</span><span class="flt-no-right">' + (value.flightdetails.depFlightNumber || '') + '</span>' + '</div>' + '</div>' + '</div>' + '<div><span class="dot-left-' + flightClr.arrColor + '"></span><span class="dot-right-' + flightClr.depColor + '"></span>' + '</div>' + '<div>' + '<div class="' + + '">' + '<div class="task-count"><span class="arrivaltime">' + ('STA:' + (arrivaltime || '--:--')) + '</span><span class="taskcompletecount">' + (value.flightdetails.taskCompletedCount != null ? value.flightdetails.taskCompletedCount : 0) + '/' + (value.flightdetails.taskAssignedCount != null ? value.flightdetails.taskAssignedCount : 0) + '</span><span class="departuretime">' + ('STD:' + (departuretime || '--:--')) + '</span></div>' + '</div>' + '</div>'
                                }
                                value.content = actualcontent;
                                tempDataSet.update(value);
        
                            }
                        }
                    }
                });
    }
    xDiff: any;
    yDiff: any;
    view(left: any, top: any, flightId, start, end, flightDet) {
        this.xDiff = (this.webWidth - left);
        this.yDiff = (this.webHeight - top);
        // check for the left
        if (this.xDiff < this.modalWidth) {
            let tmpX = left - this.xDiff;
            this.newX = tmpX - 40;
        } else {
            this.newX = left;
        }
        // check for the top
        if (this.yDiff < this.modalHeight) {
            let tmpY = top - this.yDiff;
            this.newY = tmpY;
        } else {
            this.newY = top;
        }
        // function to open flight status modal
        if (this.dialog.openDialogs.length == 0) {
            const dialogRef = this.dialog.open(FlightStatusComponent, {
                position: {
                    // left: this.newX + 'px',
                    // top: this.newY + 'px',
                },
                minHeight: '380px',
                // minHeight: '315px',
                maxHeight: '462px',
                minWidth: '340px',
                maxWidth: '340px',
                panelClass: 'ls-modal',
                backdropClass: 'trans-backdrop',
                data: {
                    mode: 'ADD',
                    flightID: flightId,
                    startWindow: start,
                    endWindow: end,
                    flightDetails: flightDet,
                    max: 1,
                    min: 1,
                    moveable: false,
                    btnState: 'EDIT',
                    bays: this.bays,
                },

            });

            // function call to clear the timeline while closing the dialog box (Bay Change)
            dialogRef.afterClosed().subscribe(result => {
                // console.log(result)
                if (result == true) {
                    this.timeline.destroy();
                    this.schedules.bays = [];
                    this.schedules.flights = [];
                    this.getTodayFlights();
                }
            })
        }
    }

    // GET API for list of equipments available 
    getEquipmentList() {

        this.services.getAll(this.appUrl.geturlfunction('EQUIPMENT_TYPE_SERVICE')).subscribe(res => {
            //   console.log(res)
            let equipment = new EquipmentList({});
            this.equipments = equipment.set(res.data);
            //   console.log(this.equipments)
        }, error => {
        });
    }

    // function call to open Add New Flights dialog box
    addNewFlight() {
        const modalRef = this.dialog.open(AddFlightComponent, {
            position: {
                right: '0',
            },
            // minHeight: '96vh',
            width: '600px',
            maxHeight: '100vh',
            panelClass: 'addNewflight',
            data: {
                mode: 'ADD',
                eqpList: this.equipments,
                airports: this.airportList,
                bays: this.bays,
                currentStation: this.currentStation
            },

        });
        modalRef.afterClosed().subscribe(result => {
            // this.timeline.off('select', function(){});
        });
    }

    // GET API for list of Airports available
    getAirportList() {
        this.services.getAll(this.appUrl.geturlfunction('AIRPORT_SERVICE')).subscribe(res => {
            let t = this.appService.sortName(res.data, 'code');
            this.airportList = t.filter(arr =>
                arr.id !== this.currentStation.id)
        }, error => {
        });

    }

    // GET API for list of Bays available for that station
    getBays() {
        this.services.getAll(this.appUrl.geturlfunction('GET_BAY_BY_STATION') + this.currentStation.code).subscribe(res => {
            this.bays = res.data;
        });
    }

    // function for horizontal navigation (FOOTER)  
    move(type: any) {
        if (type === 'left') {
            // console.log('the current info', this.options.start, this.options.end);
            this.newStart = mz(this.options.start).tz(this.currentStation.timezone).subtract(3, 'hour').toDate()
            this.newEnd = mz(this.options.end).tz(this.currentStation.timezone).subtract(3, 'hour').toDate()
        } else if (type === 'right') {
            // console.log('inside the right function');
            this.newStart = mz(this.options.start).tz(this.currentStation.timezone).add(3, 'hour').toDate()
            this.newEnd = mz(this.options.end).tz(this.currentStation.timezone).add(3, 'hour').toDate()
        }
        this.options.start = this.newStart;
        this.options.end = this.newEnd;
        // console.log('updated info', this.options.start, this.options.end);
        this.timeline.setWindow(this.options.start, this.options.end);
    }
    // function to listen to footer actions
    viewStart: any;
    viewEnd: any;
    click() {
        this.appService.track.next('');
        this.viewStart = mz(this.options.start).format('HH:mm');
        this.viewEnd = mz(this.options.end).format('HH:mm');
        let tmp1 = mz(this.options.end).unix() - mz(this.options.start).unix();
        let tmp2 = mz(this.options.max).unix() - mz(this.options.min).unix();
        if ((mz(this.options.start).unix()) <= (mz(this.options.min).unix())) {
            this.appService.track.next('left');
        } else if ((mz(this.options.end).unix()) >= (mz(this.options.max).unix())) {
            this.appService.track.next('right');
        }
    }
}
