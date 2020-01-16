// import { Component, OnInit,Inject, ChangeDetectorRef } from '@angular/core';
// import { ApiService } from '../../../service/app.api-service';
// import { AppService, AuthService } from '../../../service/app.service';
// import { Router } from '@angular/router';
// import { AppUrl } from '../../../service/app.url-service';
// import * as moment from 'moment';
// import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
// import {
//   IMqttMessage,
//   MqttModule,
//   IMqttServiceOptions,
//   MqttService
// } from 'ngx-mqtt';
// import * as _ from 'underscore';

// declare let google: any;

// @Component({
//   selector: 'app-critical-path',
//   templateUrl: './critical-path.component.html',
//   styleUrls: ['./critical-path.component.scss']
// })
// export class CriticalPathComponentsss implements OnInit {


//   taskstatusDetails:any[]=[];
//   getTaskStatusUrl:any;
//   startTaskwindow: any;
//   endTaskwindow: any;
//   fArrNo: any;
//   depNo: any;
//   sta: string = null;
//   eta: string = null;
//   std: string = null;
//   etd: string = null;
  
//   fType: any;
//   height:number;
//   displayTime: boolean = false;
//   staTomorrow: boolean;
//   stdTomorrow: boolean;
//   etaTomorrow: boolean;
//   etdTomorrow: boolean; 
//   staPerviews:boolean;
//   stdPerviews:boolean;
//   etaPerviews:boolean;
//   etdPerviews:boolean;
//   constructor(private appurl: AppUrl,private dialogRef: MatDialogRef<CriticalPathComponent>, @Inject(MAT_DIALOG_DATA) public details: any,private appService:AppService,private eventBus: MqttService,private services: ApiService, private router: Router, private ref: ChangeDetectorRef) {
//   this.getTaskStatusUrl = this.details.flightscheduleID;
//   this.startTaskwindow = this.details.start;
//   this.endTaskwindow = this.details.end;
//   this.sta = this.details.flightdetails.standardArrivalTime;
//   this.std = this.details.flightdetails.standardDepartureTime;
//   this.eta = this.details.flightdetails.estimatedArrivalTime;
//   this.etd = this.details.flightdetails.estimatedDepartureTime;
//   }


//   ngOnInit() {
//     this.getTasksByflight();
//   }

//   getTasksByflight() {
//     console.log(this.getTaskStatusUrl)
//     this.services.getById(this.appurl.geturlfunction('TASKSCHEDULE_SERVICES'), this.getTaskStatusUrl).subscribe(res => {
//       // this.taskstatusDetails = TaskScheduleResouceMapping.set(res.data);
//       this.taskstatusDetails = res.data;
//       this.getDependency(this.taskstatusDetails[0].taskScheduleId)
//       console.log(this.taskstatusDetails);
//       this.displayTime = true;
//       this.sta = null;
//       this.std = null;
//       this.eta = null;
//       this.etd = null;
//     }, error => {
//     });
//   }
//   convertTimeFromValue(value, actualEnd, scheduleType, Timing): Date {
//     let stnTiming = new Date(value);
//     let depTiming = new Date(actualEnd);
//     let addedMins;
//     if (scheduleType == 0) {
//       stnTiming = moment(depTiming).subtract(Timing, 'minutes').toDate(); 1
//     } else if (scheduleType == 1) {
//       stnTiming = moment(stnTiming).add(Timing, 'minutes').toDate();

//     }
//     return stnTiming;
//   }
//   depTasks :any;
//   getDependency(id): void {
//         this.services.getById(this.appurl.geturlfunction('TASKDEPENDENCY_SERVICE_ByID'), id).subscribe(res => {
//           this.depTasks = [];
//           if(res.data){
//             for (let index = 0; index < res.data.length; index++) {
//                 let element = res.data[index];
//                 console.log(res.data.length)
//                 if(element.task_schedule_detail_id !== null){
//                  this.depTasks.push({'task_schedule_detail_id': element.task_schedule_detail_id, 'dependent_task_id': element.dependent_task_id,'dependent_task_desc':element.dependent_task_desc})
//                 } 
//           }
//           }else{
//             this.appService.showToast('APP_ERROR', '', 'warning');
//           }
//           this.chartrender()
//        })
//     }

//   chartrender(){
//    // console.log(google)
//     let _self = this;
//     google.charts.load('current', {'packages':['gantt']});
//     google.charts.setOnLoadCallback(drawChart);
//      function toMilliseconds(minutes) {
//       return minutes * 60 * 1000;
//     }
//     function drawChart() {
//     //  console.log(_self)
//       var data = new google.visualization.DataTable();
//       data.addColumn('string', 'Task ID');
//       data.addColumn('string', 'Task Name');
//       data.addColumn('string', 'Resource');
//       data.addColumn('date', 'Start Date');
//       data.addColumn('date', 'End Date');
//       data.addColumn('number', 'Duration');
//       data.addColumn('number', 'Percent Complete');
//       data.addColumn('string', 'Dependencies');
//       data.addColumn('number', 'taskSequenceNumber');
//       data.addColumn('string', 'progress');
//       data.addColumn('number', 'resmapid');
//       data.og = [];
//       // if(_self.taskstatusDetails.length < 6){
//       // _self.height = 42  8;
//       // }else if(_self.taskstatusDetails.length > 5){
//       // _self.height = 500;
//       // }else{
//       // _self.height = 850;
//       // }
//       for (let i = 0; i < _self.taskstatusDetails.length; i++) {
//         let element = _self.taskstatusDetails[i]

//     _self.fArrNo = element.arrFlightNumber;
//     _self.depNo = element.depFlightNumber;
//     console.log(_self.depTasks)
//     let v = _self.depTasks.filter(
//         task => task.task_schedule_detail_id == element.taskScheduleDetailId);
//     console.log(v)
//     if(v.length > 0){   
//     element.dependent_task_desc = _.pluck(v, 'dependent_task_desc').toString()
//     }else{
//     element.dependent_task_desc = null
//     }
//     let actualStart;
//     let actualEnd;
//     let d;
//     let taskRefernce
//     let startTimes;
//     let endTimes;
//     let cmppercentage
//     let startTime;
//     let endTime;
//     let dur;
//     if (element.standardArrivalTime != null || element.standardArrivalTime != undefined || element.standardArrivalTime != '') {
//       _self.sta = _self.appService.getHoursMin(element.standardArrivalTime);

//       if (_self.sta == "Invalid date" || _self.sta == null) {
//         // _self.sta = "--:--";
//       }
//     } else {
//       _self.sta = _self.appService.getHoursMin(element.standardArrivalTime);
//     }
//     if (element.standardDepartureTime != null || element.standardDepartureTime != undefined || element.standardDepartureTime != '') {
//       _self.std = _self.appService.getHoursMin(element.standardDepartureTime);
//       if (_self.std == "Invalid date" || _self.std == null) {
//         // _self.std = "--:--";

//       }
//     } else {
//       _self.std = _self.appService.getHoursMin(element.standardDepartureTime);
//     }
//     if (element.estimatedArrivalTime != null || element.estimatedArrivalTime != undefined || element.estimatedArrivalTime != '') {
//       _self.eta = _self.appService.getHoursMin(element.estimatedArrivalTime);

//       if (_self.eta == "Invalid date" || _self.eta == null) {
//         // _self.eta = "--:--";

//       }
//     } else {
//       _self.eta = _self.appService.getHoursMin(element.estimatedArrivalTime);
//     }
//     if (element.estimatedDepartureTime != null || element.estimatedDepartureTime != undefined || element.estimatedDepartureTime != '') {
//       _self.etd = _self.appService.getHoursMin(element.estimatedDepartureTime);
//       if (_self.etd == "Invalid date" || _self.etd == null) {
//         // _self.etd = "--:--";
//       }
//     } else {
//       _self.etd = _self.appService.getHoursMin(element.estimatedDepartureTime);
//     }
//     // if(moment(element.standardArrivalTime).format('Do MMM YYYY ') > moment().format('Do MMM YYYY ')){
//     //             _self.staTomorrow = true
//     // }
//     // if(moment(element.standardArrivalTime).format('Do MMM YYYY ') < moment().format('Do MMM YYYY ')){
//     //             _self.staPerviews = true
//     // }
//     // if(moment(element.standardDepartureTime).format('Do MMM YYYY ') > moment().format('Do MMM YYYY ')){
//     //             _self.stdTomorrow = true
//     // }
//     // if(moment(element.standardDepartureTime).format('Do MMM YYYY ') < moment().format('Do MMM YYYY ')){
//     //             _self.stdPerviews = true
//     // }
//     // if(moment(element.estimatedArrivalTime).format('Do MMM YYYY ') > moment().format('Do MMM YYYY ')){
//     //             _self.etaTomorrow = true
//     // }
//     // if(moment(element.estimatedArrivalTime).format('Do MMM YYYY ') < moment().format('Do MMM YYYY ')){
//     //             _self.etaPerviews = true
//     // }
//     // if(moment(element.estimatedDepartureTime).format('Do MMM YYYY ') > moment().format('Do MMM YYYY ')){
//     //             _self.etdTomorrow = true
//     // }
//     // if(moment(element.estimatedDepartureTime).format('Do MMM YYYY ') < moment().format('Do MMM YYYY ')){
//     //             _self.etdPerviews = true
//     // } 
//     if (element.flightType == 0) {
//       _self.fType = "Base";
//     }
//     else if (element.flightType == 1) {
//       _self.fType = "Transit";
//     }
//     else if (element.flightType == 2) {
//       _self.fType = "Turnaround";
//     }
//     else {
//       _self.fType = "Terminating";
//     }
//     if (element.standardArrivalTime) {
//       actualStart = element.standardArrivalTime;
//     }
//     if (element.standardArrivalTime === null) {
//       actualStart = _self.startTaskwindow;
//     }
//     if (element.standardDepartureTime) {
//       actualEnd = element.standardDepartureTime;
//     }
//     if (element.standardDepartureTime == null) {
//       actualEnd = _self.endTaskwindow;
//     }

//     if (element.standardArrivalTime) {
//       startTimes = _self.convertTimeFromValue(element.standardArrivalTime, element.standardDepartureTime, element.arrivalDepartureType, element.activityStartTime)
//     }
//     if (element.standardArrivalTime === null) {
//       startTimes = _self.convertTimeFromValue(_self.startTaskwindow, element.standardDepartureTime, element.arrivalDepartureType, element.activityStartTime)
//     }
//     if (element.standardDepartureTime) {
//       endTimes = moment(startTimes).add(element.taskDuration, 'minutes').toDate();
//     }

//     if (element.taskActualStartTime && element.taskActualEndTime == null) {
//       taskRefernce = "inprogress";
//       cmppercentage = 30;
//     } else if (element.taskActualStartTime && element.taskActualEndTime) {
//       taskRefernce = "completed";
//       cmppercentage = 100;
//     }
//     else{
//       taskRefernce = "";
//       cmppercentage = 0;
//     }
//      if (moment(startTimes).isSame(endTimes)) {
//         dur = 1
//      }else if (element.taskDuration > 30) {
//         dur = 5
//       }else{
//        dur = element.taskDuration;
//      }
//     let dures = dur+2
//       data.og.push(
//         // {c:[{v:element.taskName},{v:element.taskName},{v:element.name},
//         //  {v:null},{v:null},{v:toMilliseconds(dur)},{v:cmppercentage},{v:element.dependent_task_desc},
//         //  {v:element.taskSequenceNumber},{v:taskRefernce},{v:element.resourceMappingId}]},
//          {c:[{v:element.taskName},{v:element.taskName},{v:element.name},
//           {v:startTimes},{v:endTimes},{v:toMilliseconds(dur)},{v:cmppercentage},{v:element.dependent_task_desc},
//           {v:element.taskSequenceNumber},{v:taskRefernce},{v:element.resourceMappingId}]}
//         //  {d:[{v:element.taskName},{v:element.taskName},{v:element.name},
//         //   {v:null},{v:null},{v:toMilliseconds(dures)},{v:cmppercentage},{v:element.dependent_task_desc},
//         //   {v:element.taskSequenceNumber},{v:taskRefernce},{v:element.resourceMappingId}]}
//       )
//       }
//       var options = {
//         height: 42*_self.taskstatusDetails.length,
//         width:1138,
//          gantt: {
//           // defaultStartDateMillis: moment(_self.startTaskwindow).subtract(1 , 'hours'),
//           criticalPathEnabled: true, // Critical path arrows will be the same as other arrows.
//           criticalPathStyle: {
//             stroke: '#e64a19',
//             strokeWidth: 5
//           }
//           }
//           // gantt: {
//           // defaultStartDateMillis: new Date(_self.startTaskwindow),  
//           //   criticalPathEnabled: true,
//           //   criticalPathStyle: {
//           //     stroke: '#e64a19',
//           //     strokeWidth: 5
//           //   }
//           // }
//           // gantt: {
//           //   defaultStartDateMillis: new Date(_self.startTaskwindow),
//           //   criticalPathEnabled: false, // Critical path arrows will be the same as other arrows.
//           //   arrow: {
//           //     angle: 100,
//           //     width: 5,
//           //     color: 'green',
//           //     radius: 0
//           //   }
//           // }
//       };
//       //  data.og.sort(function (x, y) {
//       //   //console.log(x.c[7].v)
//       //     return x.c[8].v - y.c[8].v;
//       // })      
//       var chart = new google.visualization.Gantt(document.getElementById('chart_div'));
//       chart.draw(data, options);
//      console.log(data)

//     // for (var y = 0; y < data.og.length; y++) {
//     //   var element = data.og[y];
//     //   //if(element.c[2].v && element.c[3].v == null){
//     //     var value = 0.5;
//     //     setInterval(function () {
//     //       if (element.c[9].v == "inprogress") {
//     //          element.c[6].v+=value
//     //          console.log(element.c[6].v)
//     //         chart.draw(data,options)
//     //       }
//     //     }, 1000)
//     // }
//   //   // for (var x = 0; x < element.c.length; x++) {  
//   //   //    var t = element.c[x];
//   //   //    console.log(t)
//   //   // }  
//   // } 
//   // let location = localStorage.getItem('userLocation')
//   //   let object: any = {};
//   //   _self.eventBus.addSubscription(location + AppUrl.TASK_COMPLETE, 0)
//   //   _self.eventBus.getTopic(location + AppUrl.TASK_COMPLETE).subscribe((response: any) => {
//   //     object = JSON.parse(response);

//   //      for (var y = 0; y < data.og.length; y++) {
//   //     var element = data.og[y];
//   //       if ((object.data.taskActualStartTime != null) && (object.data.taskActualEndTime == null)) {
//   //         console.log(element)
//   //         if (element.c[9].v == object.data.resourceMappingId) {
//   //             element.c[2].v = new Date(object.data.taskActualStartTime);
//   //             element.c[3].v = new Date(object.data.taskActualStartTime);
//   //             element.c[8].v = "inprogress";
//   //             var value = 1
//   //             setInterval(function () {
//   //               if (element.c[8].v == "inprogress") {
//   //                 // let det = moment(value.end).add(1, 'seconds');
//   //                 // value.end = det.toLocaleString();
//   //                 // this.printedvalue = value.end;
//   //                 // let actualtasktime = moment(value.start).add(value.details.taskDuration, 'minutes');
//   //                 // value.className = 'green-no-opaque'
//   //                 // if (actualtasktime.toLocaleString() < moment().toLocaleString()) {
//   //                 //   value.className = 'orange-no-opaque'
//   //                 // }
//   //                 element.c[5].v+=value
//   //                  console.log(element.c[5].v)
//   //                 data.update(element);
//   //               }
//   //             }
//   //               , 1000)
//   //           }
//   //       }
//   //       if ((object.data.taskActualStartTime != null) && (object.data.taskActualEndTime != null)) {
//   //         if (element.c[9].v == object.data.resourceMappingId) {
//   //             element.c[2].v = new Date(object.data.taskActualStartTime);
//   //             element.c[3].v = new Date(object.data.taskActualEndTime);
//   //             element.c[8].v = "completed";
//   //             // value.className = 'green-no-opaque'
//   //             // if (moment(value.end).diff(moment(value.start), 'minutes', true) > value.details.taskDuration) {
//   //             //   value.className = 'red-no-opaque'
//   //             // }
//   //             data.update(element);
//   //         }
//   //       }
//   //     }
//   //   })
//     }

//   }
// }
