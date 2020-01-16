import { Component, Inject, OnInit, OnDestroy, ComponentFactoryResolver } from '@angular/core';
import { AppUrl } from '../service/app.url-service';
import { ApiService } from '../service/app.api-service';
import { AuthService, AppService } from '../service/app.service'
import { TaskStatusLogic } from "../service/app.pipe";
import * as mz from 'moment-timezone';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from "@angular/router";
import {
    IMqttMessage,
    MqttModule,
    IMqttServiceOptions,
    MqttService
} from 'ngx-mqtt';

// global variable for timeline
declare let vis: any;

@Component({
    selector: 'app-gantts-charts',
    templateUrl: './fsc-ganntchart.component.html',
    styleUrls: ['./fsc-ganntchart.component.scss'],
    providers: [TaskStatusLogic]
})

export class FSCGanttChartComponent implements OnInit {
    // initiallization of variable required for the page
    load: Boolean = false;
    //mat slider properties start
    autoTicks = false;
    disabled = false;
    invert = false;
    max = 375;
    min = 0;
    showTicks = false;
    step = 15;
    thumbLabel = false;
    value = 195;
    vertical = false;
    //mat slider properties end
    groups: any;
    items: any;
    options: any;
    schedules: any = {
        tasks: [],
        resources: []
    }
    Assignedtasks: any
    currentStation: any;
    zoneOffset: any;
    fArrNo: any;
    depNo: any
    message: any;
    state: any = 'task';
    timeline: any;
    tempDataSet: any;
    temgroupdata: any;
    temorderdata: any;
    amberTask: any;
    delayTask: any;
    onGoingtask: any;
    totalTask: any;
    completedTask: any;
    assignedTask: any;
    flightScheduleId: any;
    flightDet: any = {};
    allFlights: any = [];
    flightsOnGround: any = [];
    start1: any;
    end1: any;
    taskCounts: any = {};
    currStart: any;
    currEnd: any;
    newStart: any;
    newEnd: any;
    stopLeft: boolean;
    stopRight: boolean;
    stopZoomOut: boolean;
    stopZoomIn: boolean;
    viewStart: any;
    viewEnd: any;
    stationcode: any;

    constructor(private dialogRef: MatDialogRef<FSCGanttChartComponent>, @Inject(MAT_DIALOG_DATA) public details: any, public route: ActivatedRoute, private services: ApiService, private mqttService: MqttService, private router: Router,
        private tasklogic: TaskStatusLogic, private appUrl: AppUrl, private auth: AuthService, private appservice: AppService) {
        this.route.params.subscribe(params => {
            this.flightScheduleId = params.id;
        })
        this.flightScheduleId = this.details.id
        // this.getTodayFlights();
        this.fArrNo = this.flightDet.arrFlightNumber;
        this.depNo = this.flightDet.depFlightNumber;
        this.zoneOffset = this.auth.timeZone;
        this.currentStation = {
            "id": this.auth.user.userAirportMappingList[0].id,
            "code": this.auth.user.userAirportMappingList[0].code,
            "timezone": this.auth.user.airport.timezone
        };
        console.log(this.details)
        this.stationcode = this.details.flightdetails.code
        this.getTasksByFlights()
    }

    ngOnInit() {
        this.listenSocket();

    }
    // ngOnDestroy() {
    //     this.appservice.data.next('');
    // }

    // publish variable to station layout to hide menu items
    // emitActions() {
    //     this.appservice.data.next('GANTT');
    // }

    backToLive() {
        this.dialogRef.close();
    }

    // GET API for list of flights/details
    getTodayFlights() {
        this.flightsOnGround = [];
        this.load = true;
        this.services.getAll(this.appUrl.geturlfunction('FLIGHTS_BY_FROM_TO')).subscribe(res => {
            this.allFlights = res.data.filter(
                flight => flight.bayId !== null
            )
            this.flightsOnGround = this.allFlights.filter(
                ground => ground.actualArrivalTime !== null
            )
            for (let i = 0; i < this.allFlights.length; i++) {
                if (this.allFlights[i].flightType == 0) {
                    if (this.allFlights[i].actualDepartureTime == null) {
                        this.flightsOnGround.push(this.allFlights[i]);
                    }
                }
            }
            let check = this.flightsOnGround.filter(
                chk => chk.flightSchedulesId == this.flightScheduleId
            );
            if (check.length == 0) {
                this.flightsOnGround.push(this.flightDet);
                let tmp = this.allFlights.filter(
                    task => task.flightSchedulesId == this.flightScheduleId
                )
                this.taskCounts = tmp[0];
            } else if (check.length == 1) {
                this.taskCounts = check[0];
            }
        }, error => {
            this.load = false;
        })
        this.getTasksByFlights();
    }
    // function to switch between flights on single page
    changeFlight(fId) {
        let _self = this
        console.log('inside timeline')
        _self.timeline.destroy();
        _self.schedules.tasks = [];
        _self.schedules.resources = [];
        _self.flightScheduleId = fId;
        _self.getTasksByFlights();
        _self.getTodayFlights();
    }

    // GET API for list of task for flights
    getTasksByFlights() {
        this.load = true;
        this.services.getAll(this.appUrl.geturlfunction('TASKSCHEDULE_SERVICES') + this.flightScheduleId).subscribe(res => {
            console.log(res.data);
            if (res.data.length > 0) {
                this.Assignedtasks = res.data;
                this.flightDet = this.Assignedtasks[0];
                this.createGroups()
            } else {
                this.appservice.toast('', 'No Task Combination Allocated', 'error', 'error-mode');
            }
        }, error => {
            console.log("error")
        })
    }

    // function call for MQTT subscription 
    listenSocket() {
        let taskComplete = this.stationcode + this.appUrl.getMqttTopic('TASK_COMPLETE');
        console.log(taskComplete)
        this.mqttService.observe(taskComplete, { qos: 0 }).subscribe((message: IMqttMessage) => {
            this.message = message.payload.toString();
            let object = JSON.parse(this.message);
            if (this.flightDet.flightSchedulesId == object.data.flightSchedulesId && object.data.taskActualEndTime != null) {
                this.flightDet.completedTask = object.data.taskCompletedCount;
                if (object.data.taskName == "Chocks on") {
                    this.flightDet.actualArrivalTime = object.data.taskActualEndTime
                }
                if (object.data.taskName == "Chocks off") {
                    this.flightDet.actualDepartureTime = object.data.taskActualEndTime
                }
            }
        })
    }

    // function to set Start & end time for base & terminating
    convertTimeFromValue(param, value, actualEnd, scheduleType, Timing, sta, ts): any {
        let stnTiming = mz(value).tz(this.currentStation.timezone).toDate() // ata
        let depTiming = mz(actualEnd).tz(this.currentStation.timezone).toDate()  // std
        let addedMins;

        if (scheduleType == 0) {
            if (param && stnTiming > sta) {
                let a = value;
                let d = ts.standardDepartureTime;
                let sa = sta;
                let t = d - sa;
                let pt = a + t;
                stnTiming = mz(pt).tz(this.currentStation.timezone).subtract(Timing, 'minutes').toDate()
            } else {

                stnTiming = mz(depTiming).tz(this.currentStation.timezone).subtract(Timing, 'minutes').toDate()
            }
        } else if (scheduleType == 1) {
            stnTiming = mz(stnTiming).tz(this.currentStation.timezone).add(Timing, 'minutes').toDate()

        }
        return stnTiming;
    }

    // function call to create right side content for timeline
    createGroups() {
        let comTaskz = 0;
        // for loop for calculating Start,End end & threshold duration for tasks 
        for (var index = 0; index < this.Assignedtasks.length; index++) {
            var ts = this.Assignedtasks[index]; //
            var stime, etime, actualStart, actualEnd, classname, tRef, contentdiv, contentdivs, leftcontent, startTimes, endTimes, pstime, petime, classnames;

            if (ts.standardArrivalTime) {
                actualStart = ts.standardArrivalTime;
            }
            if (ts.standardArrivalTime === null) {
                actualStart = mz(this.currEnd).tz(this.currentStation.timezone).subtract(60, 'minutes').toDate();
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
                actualEnd = mz(this.currStart).tz(this.currentStation.timezone).add(60, 'minutes').toDate();
            }
            if (ts.estimatedDepartureTime) {
                actualEnd = ts.estimatedDepartureTime;
            }
            if (ts.standardArrivalTime) {
                startTimes = this.convertTimeFromValue('sta', ts.standardArrivalTime, ts.standardDepartureTime, ts.arrivalDepartureType, ts.activityStartTime, ts.standardArrivalTime, ts)
            }
            if (ts.standardArrivalTime === null) {
                let baseStart = ts.estimatedDepartureTime != null ? ts.estimatedDepartureTime : ts.standardDepartureTime;
                startTimes = this.convertTimeFromValue('base', actualStart, baseStart, ts.arrivalDepartureType, ts.activityStartTime, ts.standardArrivalTime, ts)
            }

            if (ts.estimatedArrivalTime) {
                let endvalue;
                endvalue = ts.estimatedDepartureTime;
                if (ts.estimatedDepartureTime == null) {
                    endvalue = ts.standardDepartureTime
                }
                startTimes = this.convertTimeFromValue('eta', ts.estimatedArrivalTime, endvalue, ts.arrivalDepartureType, ts.activityStartTime, ts.standardArrivalTime, ts)
            }

            if (ts.actualArrivalTime && ts.taskName !== "Chocks on" && ts.taskName !== "Chocks off") {
                let endvalue;
                // if (ts.actualDepartureTime == null || ts.actualDepartureTime) {
                //     endvalue = ts.estimatedDepartureTime
                // }

                //  incase of  etd was null
                //if (ts.estimatedDepartureTime == null) {
                endvalue = ts.standardDepartureTime
                // }

                startTimes = this.convertTimeFromValue(ts.is_depend_chockson, ts.actualArrivalTime, endvalue, ts.arrivalDepartureType, ts.activityStartTime, ts.standardArrivalTime, ts)
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

            // Applying class based on color logic wrt task timing
            if (ts.name === null)
                ts.name = "Unassigned"
            classnames = 'plan'
            classname = 'expecting'
            contentdivs = '<div fxLayout="row">' +
                '<div fxFlex class="">' +
                '<div>' + ts.name + '</div>' +
                '</div>'
            contentdiv = '<div fxLayout="row">' +
                '<div fxFlex class="">' +
                '<div>' + ts.name + '</div>' +
                '</div>'
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
                comTaskz++
                if (mz(etime).diff(endTimes) <= 0) {
                    classname = 'save'

                }
                if (mz(etime).diff(endTimes) > 0 && mz(etime).diff(ethold) <= 0) {
                    classname = 'warning'

                }
                if (mz(etime).diff(ethold) > 0) {
                    classname = 'delay'

                }
                classnames = 'plan'
                tRef = "completed"
            } else if (ts.taskActualStartTime && ts.taskActualEndTime == null) {
                stime = mz(ts.taskActualStartTime).tz(this.currentStation.timezone).toDate()
                etime = null;
                pstime = mz(ts.taskActualStartTime).tz(this.currentStation.timezone).toDate()
                petime = null;
                tRef = "inprogress";
            } else {
                stime = this.convertTimeFromValue('staoreta', actualStart, actualEnd, ts.arrivalDepartureType, ts.activityStartTime, ts.standardArrivalTime, ts),
                    etime = mz(stime).tz(this.currentStation.timezone).add(ts.taskDuration, 'minutes').toDate()
                pstime = null
                petime = null,
                    tRef = "yts"

            }

            // HTML content with color logic for duration tasks
            leftcontent = '<div class="i-gantt-details-expecting">' +
                '<div class="activities-title">' + ts.taskName + '<span class="task-time pull-right">' + this.appUrl.getHrsmintues(pstime, this.currentStation.timezone) + ' - ' + this.appUrl.getHrsmintues(petime, this.currentStation.timezone) + '</span></div>' +
                '</div>'
            // HTML content with color logic for event tasks
            if (mz(stime).isSame(etime)) {
                contentdivs = '<div fxLayout="row">' + '<div fxFlex class="diamond-' + classname + '">' + '</div>' +
                    '</div>',
                    leftcontent = '<div class="i-gantt-details-expecting">' +
                    '<div class="activities-title">' + ts.taskName + '<span class="task-time pull-right">' + this.appUrl.getHrsmintues(petime, this.currentStation.timezone) + '</span></div>' +
                    '</div>'
            }
            if (mz(startTimes).isSame(endTimes)) {
                contentdiv = '<div fxLayout="row">' + '<div fxFlex class="diamond-' + classnames + '">' + '</div>' +
                    '</div>'
            }

            this.schedules.tasks.push({
                id: ts.id,
                content: leftcontent,
                seq: ts.taskSequenceNumber,
                resId: ts.resourceMappingId,
                rstart: pstime,
                rend: petime,
                taskName: ts.taskName,
                tRef: tRef
            });

            // create items
            this.schedules.resources.push({
                id: '_' + Math.random().toString(36).substr(2, 9),
                group: ts.id,
                // start:new Date(),
                start: startTimes,
                end: endTimes,
                // end: date.setHours(date.getHours() + 2 + Math.floor(Math.random()*4)),
                content: contentdiv,
                // content: '<div fxLayout="row">'+'<div fxFlex class="diamond">'+'</div>'+
                //   '</div>',
                // className: classname,
                className: 'planned',
                planedtask: 'planned',
                planS: startTimes,
                planE: endTimes,
                tRef: tRef,
                details: ts,
                subgroup: 'sg_1',
                seqs: ts.taskSequenceNumber,
                sthold: sthold,
                ethold: ethold

            }, {
                id: '_' + Math.random().toString(36).substr(2, 9),
                group: ts.id,
                // start:new Date(),
                start: stime,
                end: etime,
                // end: date.setHours(date.getHours() + 2 + Math.floor(Math.random()*4)),
                content: contentdivs,
                // content: '<div fxLayout="row">'+'<div fxFlex class="diamond">'+'</div>'+
                //   '</div>',
                className: classname,
                actualtask: 'actual',
                planS: startTimes,
                planE: endTimes,
                tRef: tRef,
                details: ts,
                subgroup: 'sg_1',
                seqnum: ts.taskSequenceNumber,
                sthold: sthold,
                ethold: ethold


            });
            let obj = this.getStartEndTime(this.flightDet);
            let current_start_time = obj.ata ? obj.ata : obj.eta ? obj.eta : obj.sta;
            this.currStart = current_start_time;
            let current_end_time = obj.atd ? obj.atd : obj.etd ? obj.etd : obj.std;
            this.currEnd = current_end_time;
            this.start1 = mz(current_start_time).tz(this.currentStation.timezone).toDate();
            this.end1 = mz(current_end_time).tz(this.currentStation.timezone).toDate();
            // default configurable options for the timeline
            this.options = {
                stack: false,
                selectable: false,
                start: mz(current_start_time).tz(this.currentStation.timezone).subtract(5, 'minutes').toDate(),
                end: mz(current_end_time).tz(this.currentStation.timezone).add(5, 'minutes').toDate(),
                editable: false,
                min: mz(current_start_time).tz(this.currentStation.timezone).subtract(2, 'hours').toDate(),
                max: mz(current_end_time).tz(this.currentStation.timezone).add(2, 'hours').toDate(),
                margin: {
                    item: 15, // minimal margin between items
                    axis: 5 // minimal margin between items and the axis
                },
                groupOrder: function (a, b) {
                    return a.seq - b.seq;
                },
                //verticalScroll: true,
                // zoomKey: 'ctrlKey',
                //maxHeight: 800,
                // rollingMode: {
                //   follow: true,
                //   offset: 0.5
                // },
                // min: 1000 * 60,
                // max: (1000 * 60 * 60 * 24),
                zoomable: false,
                moveable: false,
                zoomMin: (1000 * 60 * 15),
                zoomMax: (1000 * 60 * 30 * 10),
                moment: function (date) {
                    return date;
                },
                orientation: 'top',
            };

        }
        this.completedTask = comTaskz;
        this.createTimeline()
    }

    // function call to create timeline
    createTimeline() {
        // create a Timeline
        let _self = this;
        //setTimeout(function () {
        let container = document.getElementById('fscganttChart');
        _self.options.moment = function (date) {
            return vis.moment(date).utcOffset(_self.zoneOffset)
        };
        _self.timeline = new vis.Timeline(container, null, _self.options); // initiallize timeline
        var tc = mz(localStorage.getItem('userTime')).tz(_self.currentStation.timezone).unix() * 1000;
        _self.timeline.setCurrentTime(tc);
        _self.timeline.setGroups(_self.schedules.tasks); // set left side items (Tasks time) 
        _self.tempDataSet = new vis.DataSet();
        _self.tempDataSet.add(_self.schedules.resources);
        _self.timeline.setItems(_self.tempDataSet); // set right side items (Start/End time, user details)
        _self.temgroupdata = _self.schedules.resources;
        _self.temorderdata = _self.schedules.tasks;
        _self.timeline.addCustomTime(_self.start1);
        _self.timeline.addCustomTime(_self.end1, 2);
        let c;
        let oncount = 0;
        let dcount = 0;
        let amber = 0;
        let comple = 0;
        let total = 0;
        let m;

        for (c in _self.timeline.itemsData._data) {
            let v = _self.timeline.itemsData._data[c];
            if (v.actualtask == "actual" && v.tRef === "inprogress") {
                oncount++
            };
            if (v.actualtask == "actual" && v.className === "delay") {
                dcount++
            };
            if (v.actualtask == "actual" && v.className === "warning") {
                amber++
            }
            if (v.actualtask == "actual" && v.tRef === "completed") {
                comple++
            }
            if (v.actualtask == "actual") {
                total++
            }
            if (v.planedtask == "planned") {
                setInterval(function () {
                    let cp = _self.tasklogic.transform(v, mz(localStorage.getItem('userTime')).tz(_self.currentStation.timezone).toDate());
                    if (v.tRef == "yts") {
                        v.className = cp.classname
                        if (mz(v.start).isSame(v.end)) {
                            v.content = '<div fxLayout="row">' + '<div fxFlex class="diamond-' + cp.classname + '">' + '</div>' +
                                '</div>'
                        }
                        _self.tempDataSet.update(v);
                    }
                }, 1000)
            }

            if (v.start && v.end == null) {
                v.end = mz(localStorage.getItem('userTime')).tz(_self.currentStation.timezone).toDate()
                setInterval(function () {
                    if (v.tRef == "inprogress" && v.actualtask == "actual") {
                        v.details.taskActualEndTime = null;
                        let det = mz(v.end).tz(_self.currentStation.timezone).add(1, 'seconds');
                        v.end = det.toDate()
                        if (mz(v.end).diff(v.planE) <= 0) {
                            v.className = 'save';
                        }
                        if (mz(v.end).diff(v.planE) > 0 && mz(v.end).diff(v.ethold) <= 0) {
                            v.className = 'warning'
                        }
                        if (mz(v.end).diff(v.ethold) > 0) {
                            v.className = 'delay'
                        }
                        _self.tempDataSet.update(v);
                        //_self.temgroupdata[c] = v;

                        for (m in _self.timeline.groupsData._data) {
                            var left = _self.timeline.groupsData._data[m];
                            if (left.tRef == "inprogress") {
                                let tname = left.taskName;
                                let tstart = left.rstart;
                                let tend = left.rend;
                                left.content = '<div class="i-gantt-details-expecting">' +
                                    '<div class="activities-title">' + tname + '<span class="task-time pull-right">' + _self.appUrl.getHrsmintues(tstart, _self.currentStation.timezone) + ' - ' + _self.appUrl.getHrsmintues(tend, _self.currentStation.timezone) + '</span></div>' +
                                    '</div>'
                                _self.timeline.groupsData.update(left);
                                //_self.temgroupdata[m] = left;
                            }
                        }


                    }

                }, 1000)

            }
        }


        _self.amberTask = amber;
        _self.delayTask = dcount;
        _self.onGoingtask = oncount;
        _self.totalTask = total;
        _self.assignedTask = comple;

        let y;
        //let t;
        let p;
        // subscription for MQTT topic task-complete
        let mqttTopic = _self.currentStation.code + _self.appUrl.getMqttTopic('TASK_COMPLETE');
        _self.mqttService.observe(mqttTopic, {
            qos: 0
        }).subscribe((message: IMqttMessage) => {
            _self.message = message.payload.toString();
            let object = JSON.parse(_self.message);
            if (object) {
                let counter = 0;
                for (y in _self.timeline.itemsData._data) {
                    let value = _self.timeline.itemsData._data[y];
                    if ((object.data.taskActualStartTime != null) && (object.data.taskActualEndTime == null)) {
                        if (value.details.resourceMappingId == object.data.resourceMappingId && value.planedtask == "planned") {

                            value.className = 'planned';
                            value.tRef = "inprogress";
                            _self.tempDataSet.update(value);
                        }
                        if (value.details.resourceMappingId == object.data.resourceMappingId && value.actualtask == "actual") {
                            value.details.taskActualStartTime = object.data.taskActualStartTime;
                            value.details.taskActualEndTime = null;
                            value.start = mz(object.data.taskActualStartTime).tz(_self.currentStation.timezone).toDate()
                            value.end = mz(localStorage.getItem('userTime')).tz(_self.currentStation.timezone).toDate()
                            value.tRef = "inprogress";
                            setInterval(function () {
                                if (value.tRef == "inprogress") {
                                    let det = mz(value.end).tz(_self.currentStation.timezone).add(1, 'seconds');
                                    value.end = det.toDate()
                                    if (mz(value.end).diff(value.planE) <= 0) {
                                        value.className = 'save'
                                    }
                                    if (mz(value.end).diff(value.planE) > 0 && mz(value.end).diff(value.ethold) <= 0) {
                                        value.className = 'warning'
                                    }
                                    if (mz(value.end).diff(value.ethold) > 0) {
                                        value.className = 'delay'
                                    }
                                    _self.tempDataSet.update(value);
                                }
                            }, 1000)
                            for (p in _self.timeline.groupsData._data) {
                                var left = _self.timeline.groupsData._data[p];
                                if (left.resId == object.data.resourceMappingId) {

                                    let tname = object.data.taskName;
                                    left.tRef = "inprogress";
                                    left.rstart = mz(object.data.taskActualStartTime).tz(_self.currentStation.timezone).toDate();
                                    left.rend = null;
                                    left.content = '<div class="i-gantt-details-expecting">' +
                                        '<div class="activities-title">' + tname + '<span class="task-time pull-right">' + _self.appUrl.getHrsmintues(left.rstart, _self.currentStation.timezone) + ' - ' + _self.appUrl.getHrsmintues(left.rend, _self.currentStation.timezone) + '</span></div>' +
                                        '</div>'
                                    _self.timeline.groupsData.update(left);
                                }
                            }
                            _self.onGoingtask = _self.onGoingtask + 1;
                        }
                    }
                    if ((object.data.taskActualStartTime != null) && (object.data.taskActualEndTime != null)) {
                        if (value.details.resourceMappingId == object.data.resourceMappingId && value.planedtask == "planned") {

                            if (mz(object.data.taskActualStartTime).isSame(object.data.taskActualEndTime)) {
                                value.className = 'plan';
                                value.content = '<div fxLayout="row">' + '<div fxFlex class="diamond-' + value.className + '">' + '</div>' +
                                    '</div>'
                            } else {
                                value.className = 'planned';
                            }
                            value.tRef = "completed";
                            _self.tempDataSet.update(value);
                        }
                        if (value.details.resourceMappingId == object.data.resourceMappingId && value.actualtask == "actual") {
                            _self.assignedTask = _self.assignedTask + 1;
                            if (object.data.taskName == 'Chocks on') {
                                let s = mz(object.data.taskActualStartTime).tz(_self.currentStation.timezone).toDate()
                                _self.timeline.customTimes[0].customTime = s;
                            } else if (object.data.taskName == 'Chocks off') {
                                let e = mz(object.data.taskActualEndTime).tz(_self.currentStation.timezone).toDate()
                                _self.timeline.customTimes[1].customTime = e;
                            } else { }
                            value.details.taskActualStartTime = object.data.taskActualStartTime;
                            value.details.taskActualEndTime = object.data.taskActualEndTime;
                            value.start = mz(object.data.taskActualStartTime).tz(_self.currentStation.timezone).toDate()
                            value.end = mz(object.data.taskActualEndTime).tz(_self.currentStation.timezone).toDate()
                            value.tRef = "completed";
                            if (mz(value.end).diff(value.planE) <= 0) {
                                value.className = 'save'
                            }
                            if (mz(value.end).diff(value.planE) > 0 && mz(value.end).diff(value.ethold) <= 0) {
                                value.className = 'warning'
                                _self.amberTask = _self.amberTask + 1;
                            }
                            if (mz(value.end).diff(value.ethold) > 0) {
                                value.className = 'delay'
                                _self.delayTask = _self.delayTask + 1;
                            }
                            if (mz(value.start).isSame(value.end)) {
                                value.content = '<div fxLayout="row">' + '<div fxFlex class="diamond-' + value.className + '">' + '</div>' +
                                    '</div>'
                            } else {
                                _self.onGoingtask = _self.onGoingtask - 1;
                            }
                            _self.tempDataSet.update(value);

                            for (p in _self.timeline.groupsData._data) {
                                var left = _self.timeline.groupsData._data[p];

                                if (left.resId == object.data.resourceMappingId) {
                                    left.rstart = mz(object.data.taskActualStartTime).tz(_self.currentStation.timezone).toDate()
                                    left.rend = mz(object.data.taskActualEndTime).tz(_self.currentStation.timezone).toDate()
                                    left.tRef = "completed";
                                    if (mz(left.rstart).isSame(left.rend)) {
                                        // left.content = '<div class="i-gantt-details-' + value.className + '">' +
                                        left.content = '<div class="i-gantt-details-expecting">' +
                                            '<div class="activities-title">' + object.data.taskName + '<span class="task-time pull-right">' + _self.appUrl.getHrsmintues(left.rend, _self.currentStation.timezone) + '</span></div>' +
                                            '</div>'
                                    } else {
                                        left.content = '<div class="i-gantt-details-expecting">' +
                                            '<div class="activities-title">' + object.data.taskName + '<span class="task-time pull-right">' + _self.appUrl.getHrsmintues(left.rstart, _self.currentStation.timezone) + ' - ' + _self.appUrl.getHrsmintues(left.rend, _self.currentStation.timezone) + '</span></div>' +
                                            '</div>'
                                    }
                                    _self.timeline.groupsData.update(left);
                                }
                            }
                        }
                        // subscription for MQTT topic Chocks on
                        if (object.data.taskName == 'Chocks on') {

                            if (value.details.taskName !== 'Chocks on' && value.details.taskName !== 'Chocks off' && (value.details.taskActualStartTime == null && value.details.taskActualEndTime == null)) {
                                let endv;
                                if (value.details.standardDepartureTime) {
                                    endv = value.details.standardDepartureTime;
                                }
                                if (value.details.estimatedDepartureTime) {
                                    endv = value.details.estimatedDepartureTime;
                                }
                                value.start = _self.convertTimeFromValue(value.details.is_depend_chockson, object.data.taskActualStartTime, endv, value.details.arrivalDepartureType, value.details.activityStartTime, value.details.standardArrivalTime, value.details)
                                value.end = mz(value.start).tz(_self.currentStation.timezone).add(value.details.taskDuration, 'minutes').toDate()

                                let ethold, sthold;
                                if (mz(value.start).isSame(value.end)) {
                                    sthold = mz(value.start).add(30, 'seconds').toDate()
                                    ethold = mz(value.end).add(30, 'seconds').toDate()
                                } else {
                                    let d = value.details.taskDuration * 0.1
                                    sthold = mz(value.start).add(d, 'minutes').toDate()
                                    ethold = mz(value.end).add(d, 'minutes').toDate()
                                }
                                value.sthold = sthold;
                                value.ethold = ethold;
                                value.tRef = 'yts';
                                value.planS = value.start;
                                value.planE = value.end;
                                _self.tempDataSet.update(value);
                            }
                        }
                        // subscription for MQTT topic Chocks off
                        if (object.data.taskName == 'Chocks off') {

                            if (value.tRef == "inprogress" && value.actualtask == "actual") {
                                counter++
                                value.end = mz(object.data.taskActualEndTime).tz(_self.currentStation.timezone).toDate();
                                value.tRef = 'completed';
                                _self.tempDataSet.update(value);
                                for (p in _self.timeline.groupsData._data) {
                                    var left = _self.timeline.groupsData._data[p];
                                    if (left.tRef == "inprogress") {
                                        left.rend = mz(object.data.taskActualEndTime).tz(_self.currentStation.timezone).toDate()
                                        left.tRef = "completed";
                                        left.content = '<div class="i-gantt-details-expecting">' +
                                            '<div class="activities-title">' + left.taskName + '<span class="task-time pull-right">' + _self.appUrl.getHrsmintues(left.rstart, _self.currentStation.timezone) + ' - ' + _self.appUrl.getHrsmintues(left.rend, _self.currentStation.timezone) + '</span></div>' +
                                            '</div>'
                                        _self.timeline.groupsData.update(left);
                                    }
                                }
                            }
                        }
                    }
                }
                _self.assignedTask = _self.assignedTask + counter;
            }
        })
        this.viewStart = mz(this.options.start).format('HH:mm');
        this.viewEnd = mz(this.options.end).format('HH:mm');
        this.load = false;
    }
    // function block for optimization (Testing)

    // test(data: any) {
    //     // if(data == 'task'){
    //     this.state = data;
    //     let x;
    //     let b;
    //     for (x in this.temorderdata) {
    //         var left = this.temorderdata[x];
    //         for (b in this.temgroupdata) {
    //             var right = this.temgroupdata[b];
    //             if (left.id == right.group) {
    //                 this.timeline.groupsData.remove(left.id)
    //                 this.tempDataSet.remove(right.id);
    //                 if (data == 'task') {
    //                     // this.state = data; 
    //                     this.timeline.groupsData.add(left)
    //                     this.tempDataSet.add(right);

    //                 } else if (right.tRef === "inprogress" && data == 'going') {
    //                     //  this.state = data;
    //                     this.timeline.groupsData.add(left)
    //                     this.tempDataSet.add(right);
    //                 } else if (right.tRef === "completed" && (right.className === "delay" || right.className === "planned") && data == 'delay') {
    //                     // this.state = data; 
    //                     this.timeline.groupsData.add(left)
    //                     this.tempDataSet.add(right);
    //                 } else if (right.tRef === "completed" && (right.className === "warning" || right.className === "planned") && data == 'amber') {
    //                     // filter function
    //                     // this.state = data;
    //                     this.timeline.groupsData.add(left)
    //                     this.tempDataSet.add(right);
    //                 }
    //             }
    //         }

    //     }
    // }

    // function for Zoom In, Zoom out (FOOTER)  
    zoom(type: any) {
        if (type === 'zoomIn') {
            this.newStart = mz(this.options.start).tz(this.currentStation.timezone).add(5, 'minutes').toDate()
            this.newEnd = mz(this.options.end).tz(this.currentStation.timezone).subtract(5, 'minutes').toDate()
        } else if (type === 'zoomOut') {
            this.newStart = mz(this.options.start).tz(this.currentStation.timezone).subtract(5, 'minutes').toDate()
            this.newEnd = mz(this.options.end).tz(this.currentStation.timezone).add(5, 'minutes').toDate()
        }
        this.options.start = this.newStart;
        this.options.end = this.newEnd;
        this.timeline.setWindow(this.options.start, this.options.end);
    }

    // function for horizontal navigation (FOOTER)  
    move(type: any) {
        if (type === 'left') {
            this.newStart = mz(this.options.start).tz(this.currentStation.timezone).subtract(15, 'minutes').toDate()
            this.newEnd = mz(this.options.end).tz(this.currentStation.timezone).subtract(15, 'minutes').toDate()
        } else if (type === 'right') {
            this.newStart = mz(this.options.start).tz(this.currentStation.timezone).add(15, 'minutes').toDate()
            this.newEnd = mz(this.options.end).tz(this.currentStation.timezone).add(15, 'minutes').toDate()
        }
        this.options.start = this.newStart;
        this.options.end = this.newEnd;
        this.timeline.setWindow(this.options.start, this.options.end);
    }

    // function to listen to footer actions
    click() {
        this.stopLeft = false;
        this.stopRight = false;
        this.stopZoomOut = false;
        this.stopZoomIn = false;
        this.viewStart = mz(this.options.start).format('HH:mm');
        this.viewEnd = mz(this.options.end).format('HH:mm');
        let tmp1 = mz(this.options.end).unix() - mz(this.options.start).unix();
        let tmp2 = mz(this.options.max).unix() - mz(this.options.min).unix();
        if ((mz(this.options.start).unix()) <= (mz(this.options.min).unix())) {
            this.stopLeft = true;
        } else if ((mz(this.options.end).unix()) >= (mz(this.options.max).unix())) {
            this.stopRight = true;
        }
        if (tmp1 >= tmp2) {
            this.stopZoomOut = true;
        }
        if (tmp1 * 1000 <= 780000) {
            this.stopZoomIn = true;
        }
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
}

