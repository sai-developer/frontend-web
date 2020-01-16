import { Component, OnInit, ViewChild, Inject, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../../service/app.api-service';
import { AppService, AuthService } from '../../../service/app.service';
import { Router } from '@angular/router';
import { AppUrl } from '../../../service/app.url-service';
import * as mz from 'moment-timezone';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { MatDialog } from '@angular/material';
import * as moment from 'moment';



import {
  IMqttMessage,
  MqttModule,
  IMqttServiceOptions,
  MqttService
} from 'ngx-mqtt';
import * as _ from 'underscore';
import * as __ from 'lodash';
declare let vis: any;

@Component({
  selector: 'app-critical',
  templateUrl: './critical-path-v3.component.html',
  styleUrls: ['../gantt_chart/gantt-chart.component.scss',
'./critical-path.component.scss']

})
export class CriticalPathdataComponent implements OnInit {

//   zoneOffset: any;
//   message: any;
//   currentStation: any
//   flightData: any;
//   criticalpathdatas: any;
//   schedules: any = {
//     groups: [],
//     items: []
//   };
//   windowStart: any;
//   windowEnd: any;
//   options: any;
//   criticalArray:any[];
//   timeline: any;
//   tempDataSet:any;


//   constructor(private appurl: AppUrl, private auth: AuthService, private dialogRef: MatDialogRef<CriticalPathdataComponent>, @Inject(MAT_DIALOG_DATA) public details: any, private appService: AppService, private eventBus: MqttService, private services: ApiService, private router: Router, private dialog: MatDialog, private ref: ChangeDetectorRef) {
//     this.currentStation = {
//       "id": this.auth.user.userAirportMappingList[0].id,
//       "code": this.auth.user.userAirportMappingList[0].code,
//       "timezone": this.auth.user.airport.timezone
//     };
//     this.zoneOffset = this.auth.timeZone;
//     this.flightData = this.details.firstdata;
//     this.criticalpathdatas = this.details.datas
//     console.log(this.details.datas);
//     this.criticalArray = this.details.datas;
//     this.windowStart = this.details.start;
//     this.windowEnd =  this.details.end;
//     this.createGroups();
//   }


  ngOnInit() {

  }

//   // function to navigate to live status 
//   backToLive() {
//     // this.router.navigate(['/station/flifo/live_status']);
//     this.dialogRef.close();
//   }


//   createGroups() {

//     if (true) {
//       this.schedules.groups.push({
//         id: 1,
//         content: '<div class="i-flight-detail">' +
//           '<div class="fs-tail-no">Planned</div>' +
//           '</div>'
//       },
//       {
//         id: 2,
//         content: '<div class="i-flight-detail">' +
//           '<div class="fs-tail-no">Actual</div>' +
//           '</div>'
//       })
//       for (var j = 0; j < this.criticalArray.length; j++) {
//         var element1 = this.criticalArray[j];
//         console.log(element1.name);
//         // let flightClr = this.flycolor.transform(element1);
//         var element2 = this.criticalArray[j + 1];
//         let current_start_time;
//         let current_end_time;
//         let planned_start_time;
//         let planned_end_time;
//         let dummy_start_time;
//         let dummy_end_time;
//         console.log(element1.tstatus)
//         let taskcolor;
//         let eventcolor;
//         let contentdiv;
//         let contentdivv;
//         if(element1.astart && element1.aend){
//           console.log('inside planned if', element1.name);
//           current_start_time = element1.astart;
//           current_end_time = element1.aend;
//           if(element1.duration == 0){
//             contentdivv = '<div fxLayout="row"><div fxFlex class="diamond-yet"><div class="event-name">' + this.splitFunc(element1.name) + '</div></div>'
//           } else{
//              contentdivv = '<div fxLayout="row"><div class="c-task-name">'+ element1.name + '</div></div>'
//           }
//         }
//          if(element1.pstart && element1.pend && element1.tstatus){
//            console.log('inside actual if', element1.name);
//           planned_start_time = element1.pstart;
//           planned_end_time = element1.pend;
//           if(element1.duration == 0){
//             contentdiv = '<div fxLayout="row"><div fxFlex class="diamond-ontime"><div class="event-name">' + this.splitFunc(element1.name) + '</div></div>'
//           } else{
//              contentdiv = '<div fxLayout="row"><div class="c-task-name">'+ this.splitFunc(element1.name) + '</div></div>'
//           }
//         } if(element1.ref == 'yts') {
//           console.log('inside the else case', element1.name)
//           if(element1.duration == 0){
//             contentdiv = ''
//           } else{
//              contentdiv = ''
//           }
//         }

//         // if(element1.pstart && element1.pend && element1.tstatus){
//         //   planned_start_time = element1.pstart;
//         //   planned_end_time = element1.pend;
//         // }else{
//         //   planned_start_time = current_start_time;
//         //   planned_end_time = current_end_time;
//         // }
//         // if(element1.duration == 0){
//         //   console.log('inside event', element1.name);
//         //   contentdiv = '<div fxLayout="row"><div fxFlex class="diamond-' + aclassname + '">' + '</div>'
//         // } else{
//         //   console.log('inside duration', element1.name);
//         //    contentdiv = '<div fxLayout="row"><div class="' + aclassname + '">'+ element1.name + '</div></div>'
//         // }
//         // if(element1.duration == 0){
//         //   contentdiv = '<div fxLayout="row"><div fxFlex class="diamond-"><div class="event-name">' + this.splitFunc(element1.name) + '</div></div>'
//         // } else{
//         //    contentdiv = '<div fxLayout="row"><div class="c-task-name">'+ element1.name + '</div></div>'
//         // }


//         // console.log('just before the items push', element1, element2);
//         // this.schedules.groups.push({
//         //   id: j+1,
//         //   content: '<div class="i-flight-detail">' +
//         //     '<div class="fs-tail-no">'+ element1.name +'</div>' +
//         //     '</div>'
//         // })
//         this.schedules.items.push({
//           // id: element1.pId,
//           group: 1,
//           // start:new Date(),
//           flightdetails: element1,
//           start: moment(current_start_time).toDate(),
//           end: moment(current_end_time).toDate(),
//           // end: date.setHours(date.getHours() + 2 + Math.floor(Math.random()*4)),
//           // content: '<div class="inline-block expecting">' + element1.name + '</div>',
//           content: contentdivv,
//           className: 'yet',
//           planned:true,
//           details:element1.details
//         },
//           // {
//           //   id: '_' + Math.random().toString(36).substr(2, 9),
//           //   group: 1,
//           //   // start:new Date(),
//           //   start: moment(dummy_start_time).toDate(),
//           //   end: moment(dummy_end_time).toDate(),
//           //   // end: date.setHours(date.getHours() + 2 + Math.floor(Math.random()*4)), 
//           //   content: '<div class="fs-blank inline-block"><span class="link"></span></div>',
//           //   className: 'transparent'
//           // },
//           {
//             // id: element1.pId,
//             group: 2,
//             name:element1.name,
//             flightdetails: element1,
//             start: moment(planned_start_time).toDate(),
//             end: moment(planned_end_time).toDate(),
//             // end: date.setHours(date.getHours() + 2 + Math.floor(Math.random()*4)),
//             // content: '<div class="inline-block expecting">' + element1.name + '</div>',
//             content: contentdiv,
//             className: 'ontime',
//             planned:false,
//             details:element1.details


//           }
//         )
//       }
//       console.log(this.schedules.items)
//     }
//     // console.log('The schedules',JSON.stringify(this.schedules))
//     // this.load = false;
//     // specify options
//     console.log(this.windowStart, this.windowEnd);
//     this.options = {
//       start: mz(this.windowStart).tz(this.currentStation.timezone).subtract(5, 'minutes').toDate(),
//       end: mz(this.windowEnd).tz(this.currentStation.timezone).add(5, 'minutes').toDate(),
//       min: mz(this.windowStart).tz(this.currentStation.timezone).subtract(2, 'hours').toDate(),
//       max: mz(this.windowEnd).tz(this.currentStation.timezone).add(2, 'hours').toDate(),
//       editable: false,
//       moment: function (date) {
//         return date
//       },
//       zoomMin: (1000 * 60 * 15),
//       zoomMax: (1000 * 60 * 30 * 24),
//       margin: {
//         item: 15, // minimal margin between items
//         axis: 5   // minimal margin between items and the axis
//       },
//       orientation: 'top',
//       stack: false,
//       zoomable: true,
//       selectable: false,
//       // showTooltips: true
//     };
//     console.log(this.options.start, this.options.end);
//     this.createTimeline();

//   }
//   convertTimeFromValue(param,value, actualEnd, scheduleType, Timing,sta,ts): any {
//     let stnTiming = mz(value).tz(this.currentStation.timezone).toDate() // ata
//     let depTiming = mz(actualEnd).tz(this.currentStation.timezone).toDate()  // std
//     let addedMins;
   
//     if (scheduleType == 0) {
//         if(param && stnTiming > sta){
// let a=value;
// let d=ts.standardDepartureTime;
// let sa=sta;
// let t=d-sa;
// let pt=a+t;
//       stnTiming = mz(pt).tz(this.currentStation.timezone).subtract(Timing, 'minutes').toDate()
//       }else{

//         stnTiming = mz(depTiming).tz(this.currentStation.timezone).subtract(Timing, 'minutes').toDate()
//         }
//     } else if (scheduleType == 1) {
//         stnTiming = mz(stnTiming).tz(this.currentStation.timezone).add(Timing, 'minutes').toDate()

//     }
//     return stnTiming;
// }

//   createTimeline() {
//     // console.log(this.schedules);
//     // create a Timeline
//     const _self = this;
//       setTimeout(function () {
//       console.log(document.getElementById('cTimeline'))
//       let container = document.getElementById('cTimeline');
//       _self.options.moment = function (date) {
//         return vis.moment(date).utcOffset(_self.zoneOffset);
//       };
//       _self.timeline = new vis.Timeline(container, null, _self.options);
//       var tc = mz(localStorage.getItem('userTime')).tz(_self.currentStation.timezone).unix() * 1000;
//       _self.timeline.setCurrentTime(tc);
//       _self.timeline.setGroups(_self.schedules.groups);
//       // _self.timeline.setItems(_self.schedules.items);
//       _self.tempDataSet = new vis.DataSet();
//       _self.tempDataSet.add(_self.schedules.items);
//       _self.timeline.setItems(_self.tempDataSet); // set right side items (Start/End time, user details)

//       _self.timeline.addCustomTime(_self.details.start);
//       _self.timeline.addCustomTime(_self.details.end, 2);
//       //console.log("schedulesItem",_self.schedules.items);
//       _self.timeline.on('select', function (event) {
//         let start = this.itemsData._data[event.items].start,
//           end = this.itemsData._data[event.items].end,
//           id = this.itemsData._data[event.items].id,
//           flightDet = this.itemsData._data[event.items].flightdetails
//         // console.log(flightDet)
//         // if (flightDet !== undefined) {
//         //   _self.ganttChart(id, start, end, flightDet);
//         // }
//       });
//       var c;
//       for (c in _self.timeline.itemsData._data) {
//         let v = _self.timeline.itemsData._data[c];

//         if (v.flightdetails.ref == "inprogress" && v.planned == false) {
//           console.log("kjsgkgaksgkav")
//             v.end = mz(localStorage.getItem('userTime')).tz(_self.currentStation.timezone).toDate()
//             setInterval(function () {
//                  if (v.flightdetails.ref == "inprogress" && v.planned == false) {
//                     // v.details.taskActualEndTime = null;
//                     let det = mz(v.end).tz(_self.currentStation.timezone).add(1, 'seconds');
//                     v.end = det.toDate()
//                     if (mz(v.end).diff(v.planE) <= 0) {
//                         v.className = 'ontime';
//                     }
//                     if (mz(v.end).diff(v.planE) > 0 && mz(v.end).diff(v.ethold) <= 0) {
//                         v.className = 'amber'
//                     }
//                     if (mz(v.end).diff(v.ethold) > 0) {
//                         v.className = 'delayed'
//                     }
//                     _self.tempDataSet.update(v);
//                     //_self.temgroupdata[c] = v;
//                 }

//             }, 1000)

//         }
//     }
//     // subscription for MQTT topic task-complete
//     var y;
//      let mqttTopic = _self.currentStation.code + _self.appurl.getMqttTopic('TASK_COMPLETE');
//     _self.eventBus.observe(mqttTopic, {
//         qos: 0
//     }).subscribe((message: IMqttMessage) => {
//         _self.message = message.payload.toString();
//         let object = JSON.parse(_self.message);
//         if (object) {
//             let counter = 0;
//             for (y in _self.timeline.itemsData._data) {
//                 let value = _self.timeline.itemsData._data[y];
//                 if ((object.data.taskActualStartTime != null) && (object.data.taskActualEndTime == null)) {
//                     // if (value.flightdetails.rid == object.data.resourceMappingId && value.planned == "planned") {

//                     //     value.className = 'planned';
//                     //     value.tRef = "inprogress";
//                     //     _self.tempDataSet.update(value);
//                     // }
//                     if (value.flightdetails.rid == object.data.resourceMappingId && value.planned == false) {
//                         // value.flightdetails.taskActualStartTime = object.data.taskActualStartTime;
//                         // value.flightdetails.taskActualEndTime = null;
//                         value.start = mz(object.data.taskActualStartTime).tz(_self.currentStation.timezone).toDate()
//                         value.end = mz(localStorage.getItem('userTime')).tz(_self.currentStation.timezone).toDate()
//                         value.flightdetails.ref = "inprogress";
//                         setInterval(function () {
//                             if (value.flightdetails.ref == "inprogress") {
//                                 let det = mz(value.end).tz(_self.currentStation.timezone).add(1, 'seconds');
//                                 value.end = det.toDate()
//                                 if (mz(value.end).diff(value.planE) <= 0) {
//                                     value.className = 'ontime'
//                                 }
//                                 if (mz(value.end).diff(value.planE) > 0 && mz(value.end).diff(value.ethold) <= 0) {
//                                     value.className = 'amber'
//                                 }
//                                 if (mz(value.end).diff(value.ethold) > 0) {
//                                     value.className = 'delayed'
//                                 }
//                                 _self.tempDataSet.update(value);
//                             }
//                         }, 1000)
                        
//                     }
//                 }
//                 if ((object.data.taskActualStartTime != null) && (object.data.taskActualEndTime != null)) {
//                   if (object.data.taskName == 'Chocks on') {
//                     let s = mz(object.data.taskActualStartTime).tz(_self.currentStation.timezone).toDate()
//                     _self.timeline.customTimes[0].customTime = s;
//                 } else if (object.data.taskName == 'Chocks off') {
//                     let e = mz(object.data.taskActualEndTime).tz(_self.currentStation.timezone).toDate()
//                     _self.timeline.customTimes[1].customTime = e;
//                 } else { }
                  
//                     if (value.flightdetails.rid == object.data.resourceMappingId && value.planned == false) {
                        
//                         value.start = mz(object.data.taskActualStartTime).tz(_self.currentStation.timezone).toDate()
//                         value.end = mz(object.data.taskActualEndTime).tz(_self.currentStation.timezone).toDate()
//                         value.flightdetails.ref = "completed";
//                         if (mz(value.end).diff(value.planE) <= 0) {
//                             value.className = 'ontime'
//                         }
//                         if (mz(value.end).diff(value.planE) > 0 && mz(value.end).diff(value.ethold) <= 0) {
//                             value.className = 'amber'
//                             // _self.amberTask = _self.amberTask + 1;
//                         }
//                         if (mz(value.end).diff(value.ethold) > 0) {
//                             value.className = 'delayed'
//                             // _self.delayTask = _self.delayTask + 1;
//                         }
//                         if (mz(value.start).isSame(value.end)) {
//                             value.content = '<div fxLayout="row">' + '<div fxFlex class="diamond-' + value.className + '">' + this.splitFunc(value.name) +'</div>' +
//                                 '</div>'
//                         } else {
//                           value.content = '<div fxLayout="row"><div class="c-task-name">'+ this.splitFunc(value.name) + '</div></div>'
//                             // _self.onGoingtask = _self.onGoingtask - 1;
//                         }
//                         _self.tempDataSet.update(value);

//                     }
//                     // subscription for MQTT topic Chocks on
//                     if (object.data.taskName == 'Chocks on') {

//                         if (value.name !== 'Chocks on' && value.name !== 'Chocks off' && (value.flightdetails.tstatus == false) && value.planned == true) {
//                             let endv;
//                             if (value.details.standardDepartureTime) {
//                                 endv = value.details.standardDepartureTime;
//                             }
//                             if (value.details.estimatedDepartureTime) {
//                                 endv = value.details.estimatedDepartureTime;
//                             }
//                             value.start = _self.convertTimeFromValue(value.details.is_depend_chockson,object.data.taskActualStartTime, endv, value.details.arrivalDepartureType, value.details.activityStartTime,value.details.standardArrivalTime,value.details)
//                             value.end = mz(value.start).tz(_self.currentStation.timezone).add(value.details.taskDuration, 'minutes').toDate()

//                             let ethold, sthold;
//                             if (mz(value.start).isSame(value.end)) {
//                                 sthold = mz(value.start).add(30, 'seconds').toDate()
//                                 ethold = mz(value.end).add(30, 'seconds').toDate()
//                             } else {
//                                 let d = value.details.taskDuration * 0.1
//                                 sthold = mz(value.start).add(d, 'minutes').toDate()
//                                 ethold = mz(value.end).add(d, 'minutes').toDate()
//                             }
//                             value.sthold = sthold;
//                             value.ethold = ethold;
//                             value.tRef = 'yts';
//                             value.planS = value.start;
//                             value.planE = value.end;
//                             _self.tempDataSet.update(value);
//                         }
//                     }
                   
//                 }
//             }
//         }
//     })

//       }, 100)
//   }

//   splitFunc(inp){
//     var str = inp ; 
//   var res = str.slice(0, 2);
//   return res;
//   }
}
