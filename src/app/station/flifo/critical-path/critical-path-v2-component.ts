import { Component, OnInit, ViewChild, Inject, ChangeDetectorRef } from '@angular/core';
import { GanttEditorComponent, GanttEditorOptions } from 'ng-gantt';
import { JSGantt } from 'jsgantt-improved';
import { ApiService } from '../../../service/app.api-service';
import { AppService, AuthService } from '../../../service/app.service';
import { Router } from '@angular/router';
import { AppUrl } from '../../../service/app.url-service';
import * as mz from 'moment-timezone';
import * as moment from 'moment-timezone';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { MatDialog } from '@angular/material';
import { CriticalPathdataComponent } from '../critical-path/critical-path-v3.component';
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
  selector: 'app-critical-path',
  templateUrl: './critical-path-v2-component.html',
  styleUrls: ['./critical-path.component.scss',
    '../gantt_chart/gantt-chart.component.scss']
})
export class CriticalPathComponent implements OnInit {

  public editorOptions: any = {};
  data: any[] = [];
  finalydata: any[] = [];
  firstdata:any
  public data2: any;

  vUseSingleCell = '0';
  vShowRes = '1';
  vShowCost = '0';
  vShowComp = '0';
  vShowDur = '0';
  vShowStartDate = '0';
  vShowEndDate = '0';
  vShowPlanStartDate = '0';
  vShowPlanEndDate = '0';
  vShowEndWeekDate = '0';
  vShowTaskInfoLink = '0';
  vDebug = 'false';
  vEditable = 'false';
  vUseSort = 'false';
  vLang = 'en';
  delay = 150;

  taskstatusDetails: any[] = [];
  getTaskStatusUrl: any;
  startTaskwindow: any;
  endTaskwindow: any;
  fArrNo: any;
  depNo: any;
  sta: string = null;
  eta: string = null;
  std: string = null;
  etd: string = null;

  fType: any;
  height: number;
  displayTime: boolean = false;
  staTomorrow: boolean;
  stdTomorrow: boolean;
  etaTomorrow: boolean;
  etdTomorrow: boolean;
  staPerviews: boolean;
  stdPerviews: boolean;
  etaPerviews: boolean;
  etdPerviews: boolean;
  currentStation: any;
  currStart: any;
  currEnd: any;
  flightDet: any;
  zoneOffset: any;
  datas:any;
  ganntChart:any;
  tasks:any;
  message: any;
  flightData: any;
  criticalpathdatas: any;
  schedules: any = {
    groups: [],
    items: []
  };
  windowStart: any;
  windowEnd: any;
  options: any;
  criticalArray:any[];
  timeline: any;
  tempDataSet:any;

  @ViewChild('editor') editor: GanttEditorComponent;

  constructor(private appurl: AppUrl, private auth: AuthService, private dialogRef: MatDialogRef<CriticalPathComponent>, @Inject(MAT_DIALOG_DATA) public details: any, private appService: AppService, private eventBus: MqttService, private services: ApiService, private router: Router,private dialog: MatDialog, private ref: ChangeDetectorRef) {
    this.getTaskStatusUrl = this.details.flightscheduleID;
    this.currentStation = {
      "id": this.auth.user.userAirportMappingList[0].id,
      "code": this.auth.user.userAirportMappingList[0].code,
      "timezone": this.auth.user.airport.timezone
    };
    this.zoneOffset = this.auth.timeZone;
    this.flightDet = this.details.flightdetails;
    console.log(this.flightDet)
    this.startTaskwindow = this.details.start;
    this.endTaskwindow = this.details.end;
    this.sta = this.details.flightdetails.standardArrivalTime;
    this.std = this.details.flightdetails.standardDepartureTime;
    this.eta = this.details.flightdetails.estimatedArrivalTime;
    this.etd = this.details.flightdetails.estimatedDepartureTime;
  }

  depTasks: any;
  getDependency(id): void {
    this.services.getById(this.appurl.geturlfunction('TASKDEPENDENCY_SERVICE_ByID'), id).subscribe(res => {
      this.depTasks = [];
      if (res.data) {
        for (let index = 0; index < res.data.length; index++) {
          let element = res.data[index];
          // console.log(element)
          if (element.task_schedule_detail_id !== null) {

            if (element.dependency_type === 0) {
              element.pparent = element.dependent_task_desc;
              element.dependent_task_id = element.dependent_task_id + 'FS'

            }
            if (element.dependency_type === 1) {
              element.pparent = element.dependent_task_desc;
              element.dependent_task_id = element.dependent_task_id + 'SS'

            }
            if (element.dependency_type === 2) {
              element.pparent = element.dependent_task_desc;
              element.dependent_task_id = element.dependent_task_id + 'SF'

            }
            if (element.dependency_type === 3) {
              element.pparent = element.dependent_task_desc;
              element.dependent_task_id = element.dependent_task_id + 'FF'

            }


            this.depTasks.push({ 'task_schedule_detail_id': element.task_schedule_detail_id, 'dependent_task_id': element.dependent_task_id, 'dependent_task_desc': element.dependent_task_desc, 'pparent': element.pparent })
          }
        }
      } else {
        this.appService.showToast('APP_ERROR', '', 'warning');
      }
      this.chartrender()
    })
  }
  convertTimeFromValue(param,value, actualEnd, scheduleType, Timing,sta,ts): any {
    let stnTiming = mz(value).tz(this.currentStation.timezone).toDate() // ata
    let depTiming = mz(actualEnd).tz(this.currentStation.timezone).toDate()  // std
    let addedMins;
   
    if (scheduleType == 0) {
      if(ts.flightType !== 0 && ts.actualArrivalTime !== null && param && stnTiming > sta){
        let a=value;
let d=ts.standardDepartureTime;
let sa=sta;
let t=d-sa;
let pt=a+t;
      stnTiming = mz(pt).tz(this.currentStation.timezone).subtract(Timing, 'minutes').toDate()
      }else{

        stnTiming = mz(depTiming).tz(this.currentStation.timezone).subtract(Timing, 'minutes').toDate()
        }
    } else if (scheduleType == 1) {
        stnTiming = mz(stnTiming).tz(this.currentStation.timezone).add(Timing, 'minutes').toDate()

    }
    return stnTiming;
}
  chartrender() {
    for (let i = 0; i < this.taskstatusDetails.length; i++) {
      let element = this.taskstatusDetails[i]

      this.fArrNo = element.arrFlightNumber;
      this.depNo = element.depFlightNumber;
      // console.log(this.depTasks)
      let v = this.depTasks.filter(
        task => task.task_schedule_detail_id == element.taskScheduleDetailId);
      // console.log(v)
      if (v.length > 0) {
        element.dependent_task_id = _.pluck(v, 'dependent_task_id');
        element.pparent = _.pluck(v, 'pparent')
      } else {
        element.dependent_task_id = null
        element.pparent = 0;
      }
      var stime, etime, miles, mileclass, cmppercentage, sthold, ethold, actualStart, actualEnd, classname, tRef, contentdiv, contentdivs, leftcontent, startTimes, endTimes, pstime, petime, classnames;
      let current_start_time = element.ata ? element.ata : element.eta ? element.eta : element.sta;
      this.currStart = current_start_time;
      let current_end_time = element.atd ? element.atd : element.etd ? element.etd : element.std;
      this.currEnd = current_end_time;

      if (element.flightType == 0) {
        this.fType = "Base";
      }
      else if (element.flightType == 1) {
        this.fType = "Transit";
      }
      else if (element.flightType == 2) {
        this.fType = "Turnaround";
      }
      else {
        this.fType = "Terminating";
      }
      if (element.standardArrivalTime) {
        actualStart = element.standardArrivalTime;
      }
      if (element.standardArrivalTime === null) {
        actualStart = mz(this.currEnd).tz(this.currentStation.timezone).subtract(60, 'minutes').toDate();
      }
      if (element.estimatedArrivalTime) {
        actualStart = element.estimatedArrivalTime;
      }
      if (element.actualArrivalTime) {
        actualStart = element.actualArrivalTime;
      }
      if (element.standardDepartureTime) {
        actualEnd = element.standardDepartureTime;
      }
      if (element.standardDepartureTime == null) {
        actualEnd = mz(this.currStart).tz(this.currentStation.timezone).add(60, 'minutes').toDate();
      }
      if (element.estimatedDepartureTime) {
        actualEnd = element.estimatedDepartureTime;
      }

      if (element.standardArrivalTime) {
        startTimes = this.convertTimeFromValue('sta',element.standardArrivalTime, element.standardDepartureTime, element.arrivalDepartureType, element.activityStartTime,element.standardArrivalTime,element)
    }
    if (element.standardArrivalTime === null) {
        let baseStart = element.estimatedDepartureTime != null ? element.estimatedDepartureTime : element.standardDepartureTime;
        startTimes = this.convertTimeFromValue('base',actualStart, baseStart, element.arrivalDepartureType, element.activityStartTime,element.standardArrivalTime,element)
    }

      if (element.estimatedArrivalTime) {
        let endvalue;
        endvalue = element.estimatedDepartureTime;
        if (element.estimatedDepartureTime == null) {
          endvalue = element.standardDepartureTime
        }
        startTimes = this.convertTimeFromValue('eta',element.estimatedArrivalTime, endvalue, element.arrivalDepartureType, element.activityStartTime,element.standardArrivalTime,element)
      }

      if (element.actualArrivalTime && element.taskName !== "Chocks on" && element.taskName !== "Chocks off") {
        let endvalue;
       if (element.actualDepartureTime == null || element.actualDepartureTime) {
           endvalue = element.estimatedDepartureTime
       }

       // incase of  etd was null
       if (element.estimatedDepartureTime == null) {
           endvalue = element.standardDepartureTime
       }

       startTimes = this.convertTimeFromValue(element.is_depend_chockson,element.actualArrivalTime, endvalue, element.arrivalDepartureType, element.activityStartTime,element.standardArrivalTime,element)
   }

      if (element.standardDepartureTime) {
        endTimes = mz(startTimes).tz(this.currentStation.timezone).add(element.taskDuration, 'minutes').toDate()
      }
      if (element.estimatedDepartureTime) {
        endTimes = mz(startTimes).tz(this.currentStation.timezone).add(element.taskDuration, 'minutes').toDate()
      }
      if (element.actualDepartureTime && element.taskName !== "Chocks on" && element.taskName !== "Chocks off") {
        endTimes = mz(startTimes).tz(this.currentStation.timezone).add(element.taskDuration, 'minutes').toDate()
      }

      if (element.standardDepartureTime == null && element.estimatedDepartureTime == null && element.actualDepartureTime == null) {
        endTimes = mz(startTimes).tz(this.currentStation.timezone).add(element.taskDuration, 'minutes').toDate()
      }
      if (mz(startTimes).isSame(endTimes)) {
        sthold = mz(startTimes).add(30, 'seconds').toDate()
        ethold = mz(endTimes).add(30, 'seconds').toDate()
        miles = 1
        mileclass = 'gmilestone'

      } else {
        let d = element.taskDuration * 0.1
        sthold = mz(startTimes).add(d, 'minutes').toDate()
        ethold = mz(endTimes).add(d, 'minutes').toDate()
        miles = 0
        mileclass = 'gtaskblue'

      }
      let tstaus;
      if (element.taskActualStartTime && element.taskActualEndTime) {
        stime = mz(element.taskActualStartTime).tz(this.currentStation.timezone).toDate()
        etime = mz(element.taskActualEndTime).tz(this.currentStation.timezone).toDate()
        pstime = mz(element.taskActualStartTime).tz(this.currentStation.timezone).toDate()
        petime = mz(element.taskActualEndTime).tz(this.currentStation.timezone).toDate()
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
        cmppercentage = 100
        tstaus = true
      } else if (element.taskActualStartTime && element.taskActualEndTime == null) {
        stime = mz(element.taskActualStartTime).tz(this.currentStation.timezone).toDate()
        etime = null;
        pstime = mz(element.taskActualStartTime).tz(this.currentStation.timezone).toDate()
        petime = null;
        tRef = "inprogress";
        cmppercentage = 30
        tstaus = true
      } else {
        stime = this.convertTimeFromValue('staoreta',actualStart, actualEnd, element.arrivalDepartureType, element.activityStartTime,element.standardArrivalTime,element),
        etime = mz(stime).tz(this.currentStation.timezone).add(element.taskDuration, 'minutes').toDate()
        pstime = null
        petime = null,
          // stime = null
          // etime = null
          tRef = "yts"
        cmppercentage = 0;
        tstaus =  false

      }
      this.data.push(
        {
          'pID': element.taskId,
          'pName': element.taskName,
          'pStart': stime,
          'pEnd': etime,
          'pPlanStart': startTimes,
          'pPlanEnd': endTimes,
          'pClass': mileclass,

          'pLink': '',
          'pMile': miles,
          'pRes': element.name,
          'pComp': cmppercentage,
          'pGroup': '',
          'pParent': element.pparent ? element.pparent : [],
          'pOpen': '',
          'pDepend': element.dependent_task_id,
          'pCaption': '',
          'pNotes': element.taskName,
          'seq': element.taskSequenceNumber,
          // name:element.taskId,
          // predecessors:[{name:element.pparent ? element.pparent : 0}],
           'activityStartTime':element.activityStartTime,
           'ref':tRef,
           'rid':element.resourceMappingId,
           'tstatus':tstaus,
           'details':element,
           'sthold':sthold,
           'ethold':ethold


        }

      )
    }
    console.log('The final data array', this.data)
console.log(JSON.stringify(this.data))
    // this.data.sort(function (a, b) {
    //   return b.pParent - a.pParent;
    // });
    this.data.sort(function (a, b) {
      return a.seq - b.seq;
    });
    this.finalydata = this.data;
    var dt =[]

    for (let index = 0; index < this.finalydata.length; index++) {
      const element = this.finalydata[index];
      // if(element.pParent.length > 0){
      //   console.log(element.pParent)
    //   for (let t = 0; t < element.pParent.length; t++) {
    //     const el = element.pParent[t];

    //     if(element.pID === el){
    //       if(element.pParent == 0){
    //         element.pParent = [];
    //       }
    //       console.log(element)
    //       dt.push({"name":element.pName,"predecessors":element.pParent,"duration":element.duration})
    //     }
    // }
        
     // }
    if(element.pParent.length > 0){
      dt.push({"pId":element.pID,"details":element.details,"ref":element.ref,"tstatus":element.tstatus,"rid":element.rid,"name":element.pName,"pstart":element.pStart,"pend":element.pEnd,"astart":element.pPlanStart,"aend":element.pPlanEnd,"taskName":element.pName,"predecessors":element.pParent,"duration":element.activityStartTime,"ethold":element.ethold})
    }
    if(element.pID === 5){
      if(element.pParent == 0){
        element.pParent = [];
      }
      dt.push({"pId":element.pID,"details":element.details,"ref":element.ref,"tstatus":element.tstatus,"rid":element.rid,"name":element.pName,"pstart":element.pStart,"pend":element.pEnd,"astart":element.pPlanStart,"aend":element.pPlanEnd,"taskName":element.pName,"predecessors":element.pParent,"duration":element.activityStartTime,"ethold":element.ethold})
    }
      
 
      
    }
    console.log("dtttttttttttttttttt")
    console.log(dt)
    this.datas = dt
    this.ganntChart = {
      tasks:this.datas
    }
    this.gc.init(this.ganntChart);
    this.tasks =  this.gc.get().tasks
    let datas = [];
    for (var i=0; i<this.tasks.length; i++) {
        var t = this.tasks[i];
        if(t.isCritical){
            t.fxValue = t.duration *100
        datas.push(t)
        }
       }
       this.tasks = datas;
       console.log(this.tasks)
  
    console.log(this.finalydata)
    

  // this.afterfunction()
  // data: {
  //   mode: 'ADD',
  //   datas:this.tasks,
  //   firstdata:this.firstdata,
  //   start: this.details.start,
  //   end: this.details.end
  // }
  this.flightData = this.firstdata;
  this.criticalpathdatas = this.tasks
  // console.log(this.details.datas);
  this.criticalArray = this.tasks;
  this.windowStart = this.details.start;
  this.windowEnd =  this.details.end;

  this.createGroups()
  }
  GanttChart() {
    var chartData;
    var pathes;
    
    function init(params) { 
        // check for isNaN, expected properties.
        chartData = params;
        console.log(chartData)
        // compute pathes
        pathes = getPathes();
        // compute critical start time startTime:
        for(var i=0; i<chartData.tasks.length; i++) {
            setTaskStartTime({ i: i, name: chartData.tasks[i].name });
        }
        // setCriticalPathMark
        setCriticalPathMark();
        // add connectors
        AddConnectors();
        //console.log("Init complete."); 
    };
    function get() { return chartData; };
    function setTaskStartTime(params) {
        ////console.log(params.i + " > " + params.name);
        //console.log("Not implemented yet.");
    }
    function setCriticalPathMark() {
        var maxPathIndex = 0;
        for (var i=0; i<pathes.length; i++) {
            if(pathes[i].duration > pathes[maxPathIndex].duration) {
                maxPathIndex = i;
            }
        }
        //console.log("yyyyyyyyyyyyyyyyyyyyyyyyyy")
        //console.log(pathes)
        for (var i=0; i<pathes[maxPathIndex].tasks.length; i++) {
            for (var j=0; j<chartData.tasks.length; j++){
                if(j === pathes[maxPathIndex].tasks[i].index) {
                    chartData.tasks[j].isCritical = true;
                }
            } 
            ////console.log("index: " + paths[maxPathIndex].tasks[i].index);
        }
    };
    function addTask(task) { 
        //console.log("addTask(task): Not implemented yet."); 
    };
    function getPathes() {
        /*
        var paths = [{ duration: 0, 
                      tasks: [{name: "", 
                               duration: 0,
                               index: 0}, ...] }];//*/
        var paths = [];
        for (var i = 0; i < chartData.tasks.length; i++) {
            var curTask = chartData.tasks[i];
            
            //console.log(i + " " +  curTask.name + " " + curTask.predecessors);
            // 1. If no predecessor --> add path to paths
            if (curTask.predecessors != undefined && 
                curTask.predecessors.length == 0) {
                //console.log("new path " + curTask.name);
                paths.push({ duration: curTask.duration, 
                            tasks: [{name: curTask.name, 
                                     duration: curTask.duration,
                                     index: i}] });
                // IF START TIME isNaN {SET ZERO START TIME}
                if (isNaN(chartData.tasks[i].startTime))
                    chartData.tasks[i].startTime = 0;
                
            }
            // 2. Has predecessor --> Find all pathes to add to or branch & add
            if (curTask.predecessors != undefined && 
                curTask.predecessors.length >= 1) {
                //console.log("prolong path " + curTask.name);
                for(var p=0; p<curTask.predecessors.length; p++) {
                    // for each predecessor
                    //console.log('ppppppppp',paths);
                    var pathsCount = paths.length;
                    for(var j=0; j<pathsCount; j++) {
                        // for each existing path
        //console.log("pred:  " + paths[j].tasks[paths[j].tasks.length-1].name +"  " +curTask.predecessors[p]);
                        if(paths[j].tasks[paths[j].tasks.length-1].name == 
                           curTask.predecessors[p]){
                            // START TIME
                            if(isNaN(curTask.startTime)) {
                                chartData.tasks[i].startTime =
                                    paths[j].duration;
                            }
                            if (!isNaN(curTask.startTime) &&
                                curTask.startTime < paths[j].duration) {
                                chartData.tasks[i].startTime =
                                    paths[j].duration;
                            }
                            
                            paths[j].duration += curTask.duration;
                            paths[j].tasks.push({name: curTask.name,
                                                 duration:
                                                     curTask.duration,
                                                 index: i});
                        } else {
                            var t = paths[j].tasks.length-1;
                            var duration = paths[j].duration - 
                                paths[j].tasks[t].duration;
                            for(--t; t>=0; t--) {
                                if(paths[j].tasks[t].name == 
                                   curTask.predecessors[p]) {
                                   //console.log('ooooooooooooo')
                                   //console.log(paths[j].tasks)
                                    var tasks = paths[j].tasks.slice(0,t+1);
                                    tasks.push({name: curTask.name,
                                                duration:
                                                    curTask.duration,
                                                index: i});
                                    // START TIME
                                    //console.log(curTask.name + " |S.T. ====> " + isNaN(curTask.startTime) + " " +curTask.startTime + " | " + paths[j].duration);
                                    if (isNaN(curTask.startTime)) {
                                        chartData.tasks[i].startTime =
                                            duration/*aths[j].duration*/;
                                    }
                                    if (!isNaN(curTask.startTime) &&
                                        curTask.startTime <
                                        paths[j].duration) {
                                        chartData.tasks[i].startTime =
                                            duration/*paths[j].duration*/;
                                    }
                                    
                                    duration += curTask.duration;
                                    paths.push({duration: duration,
                                                tasks: tasks});
                                    break;
                                } else {
                                    duration -= paths[j].tasks[t].duration;
                                }
                            }
                        }
                    }
                }
            }
        }
        return paths;        
    };
    function AddConnectors() {
        for (var i = 0; i < chartData.tasks.length; i++) {
            // for each task
            for (var j = 0; j < chartData.tasks[i].predecessors.length; j++) 
            {
                // each predecessor (connection)
                
                ////console.log(i+"========"+j);
                var curTask = chartData.tasks[i];
                var predecessorName = chartData.tasks[i].predecessors[j];
                var predecessorIndex = getTaskIndex(predecessorName);
               // console.log(chartData.tasks[i].predecessors[j])
                ////console.log(predecessorName + " : " + predecessorIndex);
                var predecessor = chartData.tasks[predecessorIndex];

                var height = (i - predecessorIndex) * 32 - 21;
                console.log(height)
               //console.log(curTask.startTime - predecessor.startTime-predecessor.duration);
                var width = (curTask.startTime - predecessor.startTime - predecessor.duration) * 20 + 5;
                console.log(width); 

             // chartData.tasks[i].predecessors[j].height = height;
            //   chartData.tasks[i].predecessors[j].width = 10;
                //console.log(chartData.tasks[i].isCritical)
               // console.log(chartData.tasks[predecessorIndex].isCritical)
                // if(chartData.tasks[i].isCritical === true &&
                //   chartData.tasks[predecessorIndex].isCritical === true) {
                //    chartData.tasks[i].predecessors[j].isCritical = true;
                //    console.log(chartData.tasks[i].predecessors[j].isCritical)

                // }
            }
        }
    }
    function getTaskIndex(taskName) {
        var taskIndex = -1;
       // console.log(chartData.tasks)
        for (var i=0; i<chartData.tasks.length; i++) {
            if (chartData.tasks[i].name == taskName) {
                return i;
            }
        }
        return -1;
    }
    function getCriticalPath() {};
    function getCriticalPathDuration() {};
    function getStartDate() { return chartData.startDate; }
    
    return {
        init: init,
        get: get,
        addTask: addTask,
        getPathes: getPathes,
        getCriticalPath: getCriticalPath,
        getCriticalPathDuration: getCriticalPathDuration,
        getStartDate: getStartDate
    };
}
createGroups() {

  if (true) {
    this.schedules.groups.push({
      id: 1,
      content: '<div class="i-flight-detail">' +
        '<div class="fs-tail-no">Planned</div>' +
        '</div>'
    },
    {
      id: 2,
      content: '<div class="i-flight-detail">' +
        '<div class="fs-tail-no">Actual</div>' +
        '</div>'
    })
    for (var j = 0; j < this.criticalArray.length; j++) {
      var element1 = this.criticalArray[j];
      console.log(element1.name);
      // let flightClr = this.flycolor.transform(element1);
      var element2 = this.criticalArray[j + 1];
      let current_start_time;
      let current_end_time;
      let planned_start_time;
      let planned_end_time;
      let dummy_start_time;
      let dummy_end_time;
      console.log(element1.tstatus)
      let taskcolor;
      let eventcolor;
      let contentdiv;
      let contentdivv;
      if(element1.astart && element1.aend){
        console.log('inside planned if', element1.name);
        current_start_time = element1.astart;
        current_end_time = element1.aend;
        if(mz(element1.astart).isSame(element1.aend)){
          contentdivv = '<div fxLayout="row"><div fxFlex class="diamond-yet"><div class="event-name">' + this.splitFunc(element1.name) + '</div></div>'
        } else{
           contentdivv = '<div fxLayout="row"><div class="c-task-name">'+ this.splitFunc(element1.name) + '</div></div>'
        }
      }
      // element1.color;
      // element1.ethold;
      // element1.sthold;
    //   if (mz(element1.astart).isSame(element1.aend)) {
    //     element1.sthold = mz(element1.astart).add(30, 'seconds').toDate()
    //     element1.ethold = mz(element1.aend).add(30, 'seconds').toDate()
    // } else {
    //     let d = element1.details.taskDuration * 0.1
    //     element1.sthold = mz(element1.astart).add(d, 'minutes').toDate()
    //     element1.ethold = mz(element1.aend).add(d, 'minutes').toDate()
    // }

       if(element1.pstart && element1.pend && element1.tstatus){
         console.log('inside actual if', element1.name);
        planned_start_time = mz(element1.pstart).tz(this.currentStation.timezone).toDate();
        planned_end_time =  mz(element1.pend).tz(this.currentStation.timezone).toDate();
      if (mz(planned_end_time).diff(element1.aend) <= 0) {
          element1.color = 'ontime';
      }
      if (mz(planned_end_time).diff(element1.aend) > 0 && mz(planned_end_time).diff(element1.ethold) <= 0) {
          element1.color = 'amber'
      }
      if (mz(planned_end_time).diff(element1.ethold) > 0) {
          element1.color = 'delayed'
      }
      console.log(element1.color)
        if(mz(element1.pstart).isSame(element1.pend)){
          contentdiv = '<div fxLayout="row"><div fxFlex class="diamond-'+element1.color+'"><div class="event-name">' + this.splitFunc(element1.name) + '</div></div>'
        } else{
           contentdiv = '<div fxLayout="row"><div class="c-task-name">'+ this.splitFunc(element1.name) + '</div></div>'
        }
      } if(element1.ref == 'yts') {
        console.log('inside the else case', element1.name)
        if(mz(element1.astart).isSame(element1.aend)){
          contentdiv = ''
        } else{
           contentdiv = ''
        }
      }

      // if(element1.pstart && element1.pend && element1.tstatus){
      //   planned_start_time = element1.pstart;
      //   planned_end_time = element1.pend;
      // }else{
      //   planned_start_time = current_start_time;
      //   planned_end_time = current_end_time;
      // }
      // if(element1.duration == 0){
      //   console.log('inside event', element1.name);
      //   contentdiv = '<div fxLayout="row"><div fxFlex class="diamond-' + aclassname + '">' + '</div>'
      // } else{
      //   console.log('inside duration', element1.name);
      //    contentdiv = '<div fxLayout="row"><div class="' + aclassname + '">'+ element1.name + '</div></div>'
      // }
      // if(element1.duration == 0){
      //   contentdiv = '<div fxLayout="row"><div fxFlex class="diamond-"><div class="event-name">' + this.splitFunc(element1.name) + '</div></div>'
      // } else{
      //    contentdiv = '<div fxLayout="row"><div class="c-task-name">'+ element1.name + '</div></div>'
      // }


      // console.log('just before the items push', element1, element2);
      // this.schedules.groups.push({
      //   id: j+1,
      //   content: '<div class="i-flight-detail">' +
      //     '<div class="fs-tail-no">'+ element1.name +'</div>' +
      //     '</div>'
      // })
      this.schedules.items.push({
        // id: element1.pId,
        group: 1,
        // start:new Date(),
        flightdetails: element1,
        start: moment(current_start_time).toDate(),
        end: moment(current_end_time).toDate(),
        // end: date.setHours(date.getHours() + 2 + Math.floor(Math.random()*4)),
        // content: '<div class="inline-block expecting">' + element1.name + '</div>',
        content: contentdivv,
        className: 'yet',
        planned:true,
        details:element1.details
      },
        // {
        //   id: '_' + Math.random().toString(36).substr(2, 9),
        //   group: 1,
        //   // start:new Date(),
        //   start: moment(dummy_start_time).toDate(),
        //   end: moment(dummy_end_time).toDate(),
        //   // end: date.setHours(date.getHours() + 2 + Math.floor(Math.random()*4)), 
        //   content: '<div class="fs-blank inline-block"><span class="link"></span></div>',
        //   className: 'transparent'
        // },
        {
          // id: element1.pId,
          group: 2,
          name:element1.name,
          flightdetails: element1,
          start: moment(planned_start_time).toDate(),
          end: moment(planned_end_time).toDate(),
          // end: date.setHours(date.getHours() + 2 + Math.floor(Math.random()*4)),
          // content: '<div class="inline-block expecting">' + element1.name + '</div>',
          content: contentdiv,
          className: element1.color,
          planned:false,
          details:element1.details,
          stholds: element1.sthold,
          etholds: element1.ethold,
          planend:element1.aend



        }
      )
    }
    console.log(this.schedules.items)
  }
  // console.log('The schedules',JSON.stringify(this.schedules))
  // this.load = false;
  // specify options
  console.log(this.windowStart, this.windowEnd);
  this.options = {
    start: mz(this.windowStart).tz(this.currentStation.timezone).subtract(5, 'minutes').toDate(),
    end: mz(this.windowEnd).tz(this.currentStation.timezone).add(5, 'minutes').toDate(),
    min: mz(this.windowStart).tz(this.currentStation.timezone).subtract(2, 'hours').toDate(),
    max: mz(this.windowEnd).tz(this.currentStation.timezone).add(2, 'hours').toDate(),
    editable: false,
    moment: function (date) {
      return date
    },
    zoomMin: (1000 * 60 * 15),
    zoomMax: (1000 * 60 * 30 * 24),
    margin: {
      item: 15, // minimal margin between items
      axis: 5   // minimal margin between items and the axis
    },
    orientation: 'top',
    stack: false,
    zoomable: true,
    selectable: false,
    // showTooltips: true
  };
  console.log(this.options.start, this.options.end);
  this.createTimeline();

}

createTimeline() {
  // console.log(this.schedules);
  // create a Timeline
  const _self = this;
    setTimeout(function () {
    console.log(document.getElementById('cTimeline'))
    let container = document.getElementById('cTimeline');
    _self.options.moment = function (date) {
      return vis.moment(date).utcOffset(_self.zoneOffset);
    };
    _self.timeline = new vis.Timeline(container, null, _self.options);
    var tc = mz(localStorage.getItem('userTime')).tz(_self.currentStation.timezone).unix() * 1000;
    _self.timeline.setCurrentTime(tc);
    _self.timeline.setGroups(_self.schedules.groups);
    // _self.timeline.setItems(_self.schedules.items);
    _self.tempDataSet = new vis.DataSet();
    _self.tempDataSet.add(_self.schedules.items);
    _self.timeline.setItems(_self.tempDataSet); // set right side items (Start/End time, user details)

    _self.timeline.addCustomTime(_self.details.start);
    _self.timeline.addCustomTime(_self.details.end, 2);
    //console.log("schedulesItem",_self.schedules.items);
    _self.timeline.on('select', function (event) {
      let start = this.itemsData._data[event.items].start,
        end = this.itemsData._data[event.items].end,
        id = this.itemsData._data[event.items].id,
        flightDet = this.itemsData._data[event.items].flightdetails
      // console.log(flightDet)
      // if (flightDet !== undefined) {
      //   _self.ganttChart(id, start, end, flightDet);
      // }
    });
    var c;
    for (c in _self.timeline.itemsData._data) {
      let v = _self.timeline.itemsData._data[c];

      if (v.flightdetails.ref == "inprogress" && v.planned == false) {
        console.log("kjsgkgaksgkav")
          v.end = mz(localStorage.getItem('userTime')).tz(_self.currentStation.timezone).toDate()
          setInterval(function () {
               if (v.flightdetails.ref == "inprogress" && v.planned == false) {
                  // v.details.taskActualEndTime = null;
                  let det = mz(v.end).tz(_self.currentStation.timezone).add(1, 'seconds');
                  v.end = det.toDate()
                  if (mz(v.end).diff(v.planend) <= 0) {
                      v.className = 'ontime';
                  }
                  if (mz(v.end).diff(v.planend) > 0 && mz(v.planend).diff(v.etholds) <= 0) {
                      v.className = 'amber'
                  }
                  if (mz(v.end).diff(v.etholds) > 0) {
                      v.className = 'delayed'
                  }
                  v.content = '<div fxLayout="row"><div class="c-task-name">'+ _self.splitFunc(v.name) + '</div></div>'
                  
                  _self.tempDataSet.update(v);
                  //_self.temgroupdata[c] = v;
              }

          }, 1000)

      }
  }
  // subscription for MQTT topic task-complete
  var y;
   let mqttTopic = _self.currentStation.code + _self.appurl.getMqttTopic('TASK_COMPLETE');
  _self.eventBus.observe(mqttTopic, {
      qos: 0
  }).subscribe((message: IMqttMessage) => {
      _self.message = message.payload.toString();
      let object = JSON.parse(_self.message);
      if (object) {
          let counter = 0;
          for (y in _self.timeline.itemsData._data) {
              let value = _self.timeline.itemsData._data[y];
              if ((object.data.taskActualStartTime != null) && (object.data.taskActualEndTime == null)) {
                  // if (value.flightdetails.rid == object.data.resourceMappingId && value.planned == "planned") {

                  //     value.className = 'planned';
                  //     value.tRef = "inprogress";
                  //     _self.tempDataSet.update(value);
                  // }
                  if (value.flightdetails.rid == object.data.resourceMappingId && value.planned == false) {
                      // value.flightdetails.taskActualStartTime = object.data.taskActualStartTime;
                      // value.flightdetails.taskActualEndTime = null;
                      value.start = mz(object.data.taskActualStartTime).tz(_self.currentStation.timezone).toDate()
                      value.end = mz(localStorage.getItem('userTime')).tz(_self.currentStation.timezone).toDate()
                      value.flightdetails.ref = "inprogress";
                      setInterval(function () {
                          if (value.flightdetails.ref == "inprogress") {
                              let det = mz(value.end).tz(_self.currentStation.timezone).add(1, 'seconds');
                              value.end = det.toDate()
                              if (mz(value.end).diff(value.planend) <= 0) {
                                  value.className = 'ontime'
                              }
                              if (mz(value.end).diff(value.planend) > 0 && mz(value.planend).diff(value.etholds) <= 0) {
                                  value.className = 'amber'
                              }
                              if (mz(value.end).diff(value.etholds) > 0) {
                                  value.className = 'delayed'
                              }
                              value.content = '<div fxLayout="row"><div class="c-task-name">'+ _self.splitFunc(value.name) + '</div></div>'
                              _self.tempDataSet.update(value);
                          }
                      }, 1000)
                      
                  }
              }
              if ((object.data.taskActualStartTime != null) && (object.data.taskActualEndTime != null)) {
                if (object.data.taskName == 'Chocks on') {
                  let s = mz(object.data.taskActualStartTime).tz(_self.currentStation.timezone).toDate()
                  _self.timeline.customTimes[0].customTime = s;
              } else if (object.data.taskName == 'Chocks off') {
                  let e = mz(object.data.taskActualEndTime).tz(_self.currentStation.timezone).toDate()
                  _self.timeline.customTimes[1].customTime = e;
              } else { }
                
                  if (value.flightdetails.rid == object.data.resourceMappingId && value.planned == false) {
                      
                      value.start = mz(object.data.taskActualStartTime).tz(_self.currentStation.timezone).toDate()
                      value.end = mz(object.data.taskActualEndTime).tz(_self.currentStation.timezone).toDate()
                      value.flightdetails.ref = "completed";
                      if (mz(value.end).diff(value.planend) <= 0) {
                          value.className = 'ontime'
                      }
                      if (mz(value.end).diff(value.planend) > 0 && mz(value.planend).diff(value.etholds) <= 0) {
                          value.className = 'amber'
                          // _self.amberTask = _self.amberTask + 1;
                      }
                      if (mz(value.end).diff(value.etholds) > 0) {
                          value.className = 'delayed'
                          // _self.delayTask = _self.delayTask + 1;
                      }
                      if (mz(value.start).isSame(value.end)) {
                          value.content = '<div fxLayout="row">' + '<div fxFlex class="diamond-' + value.className + '"><div class="event-name">' + _self.splitFunc(value.name) +'</div></div>' +
                              '</div>'
                      } else {
                        value.content = '<div fxLayout="row"><div class="c-task-name">'+ _self.splitFunc(value.name) + '</div></div>'
                          // _self.onGoingtask = _self.onGoingtask - 1;
                      }
                      _self.tempDataSet.update(value);

                  }
                  // subscription for MQTT topic Chocks on
                  if (object.data.taskName == 'Chocks on') {

                      if (value.name !== 'Chocks on' && value.name !== 'Chocks off' && (value.flightdetails.tstatus == false) && value.planned == true) {
                          let endv;
                          if (value.details.standardDepartureTime) {
                              endv = value.details.standardDepartureTime;
                          }
                          if (value.details.estimatedDepartureTime) {
                              endv = value.details.estimatedDepartureTime;
                          }
                          value.start = _self.convertTimeFromValue(value.details.is_depend_chockson,object.data.taskActualStartTime, endv, value.details.arrivalDepartureType, value.details.activityStartTime,value.details.standardArrivalTime,value.details)
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
                          value.stholds = sthold;
                          value.etholds = ethold;
                          value.tRef = 'yts';
                          // value.planS = value.start;
                          // value.planE = value.end;
                          _self.tempDataSet.update(value);
                      }
                  }
                 
              }
          }
      }
  })

    }, 100)
}

splitFunc(inp){
  var str = inp ; 
var res = str.slice(0, 2);
return res;
}
gc = this.GanttChart();
  criticalpaths(){
    this.dialog.open(CriticalPathdataComponent, {
      position: {
        // top: '2vh',
        // left: '2vh',
        // right: '2vw',
        // bottom: '2vw'
      },
      maxHeight: '60vh',
      minHeight: '60vh',
      minWidth: '90vw',
      maxWidth: '90vw',
      panelClass: 'criticaldata',
      data: {
        mode: 'ADD',
        datas:this.tasks,
        firstdata:this.firstdata,
        start: this.details.start,
        end: this.details.end
      }
    })

  }
  // timer (){
    // var _self= this;
   
  // }

  getTasksByflight() {
    // console.log(this.getTaskStatusUrl)
    this.services.getById(this.appurl.geturlfunction('TASKSCHEDULE_SERVICES'), this.getTaskStatusUrl).subscribe(res => {
      // this.taskstatusDetails = TaskScheduleResouceMapping.set(res.data);
      this.taskstatusDetails = res.data;
      this.firstdata = res.data[0]
      this.getDependency(this.taskstatusDetails[0].taskScheduleId)
      // console.log(this.taskstatusDetails);
      this.displayTime = true;
      this.sta = null;
      this.std = null;
      this.eta = null;
      this.etd = null;
    }, error => {
    });
  }

  // afterfunction() {
  //   const vAdditionalHeaders = {
  //     // category: {
  //     //   title: 'Category'
  //     // },
  //     // sector: {
  //     //   title: 'Sector'
  //     // }
  //   };

  //   // console.log(this.editorOptions)
  //   this.editorOptions = {
  //     vCaptionType: 'Complete',  // Set to Show Caption : None,Caption,Resource,Duration,Complete,
  //     vHourColWidth: 600,
  //     vRowHeight: 32,
  //     vDateTaskDisplayFormat: 'day dd month yyyy', // Shown in tool tip box
  //     vDayMajorDateDisplayFormat: 'mon yyyy - Week ww', // Set format to display dates in the "Major" header of the "Day" view
  //     vWeekMinorDateDisplayFormat: 'dd mon', // Set format to display dates in the "Minor" header of the "Week" view
  //     vLang: this.vLang,
  //     vUseSingleCell: this.vUseSingleCell,
  //     vShowRes: parseInt(this.vShowRes, 10),
  //     vShowCost: parseInt(this.vShowCost, 10),
  //     vShowComp: parseInt(this.vShowComp, 10),
  //     vShowDur: parseInt(this.vShowDur, 10),
  //     vShowStartDate: parseInt(this.vShowStartDate, 10),
  //     vShowEndDate: parseInt(this.vShowEndDate, 10),
  //     vShowPlanStartDate: parseInt(this.vShowPlanStartDate, 10),
  //     vShowPlanEndDate: parseInt(this.vShowPlanEndDate, 10),
  //     vShowTaskInfoLink: parseInt(this.vShowTaskInfoLink, 10), // Show link in tool tip (0/1)
  //     // Show/Hide the date for the last day of the week in header for daily view (1/0)
  //     vShowEndWeekDate: parseInt(this.vShowEndWeekDate, 10),
  //     vAdditionalHeaders: vAdditionalHeaders,
  //     vEvents: {
  //       taskname: console.log,
  //       res: console.log,
  //       dur: console.log,
  //       comp: console.log,
  //       start: console.log,
  //       end: console.log,
  //       planstart: console.log,
  //       planend: console.log,
  //       cost: console.log
  //     },
  //     vEventsChange: {
  //       taskname: this.editValue.bind(this, this.data),
  //       res: this.editValue.bind(this, this.data),
  //       dur: this.editValue.bind(this, this.data),
  //       comp: this.editValue.bind(this, this.data),
  //       start: this.editValue.bind(this, this.data),
  //       end: this.editValue.bind(this, this.data),
  //       planstart: this.editValue.bind(this, this.data),
  //       planend: this.editValue.bind(this, this.data),
  //       cost: this.editValue.bind(this, this.data)
  //     },
  //     vResources: [
  //       { id: 0, name: 'Anybody' },
  //       { id: 1, name: 'Mario' },
  //       { id: 2, name: 'Henrique' },
  //       { id: 3, name: 'Pedro' }
  //     ],
  //     vEventClickRow: console.log,
  //     vTooltipDelay: this.delay,
  //     vDebug: this.vDebug === 'true',
  //     vEditable: this.vEditable === 'true',
  //     vUseSort: this.vUseSort === 'true',
  //     // vFormatArr: ['Day', 'Week', 'Month', 'Quarter'],
  //     // vFormatArr:['hour','Day', 'Week', 'Month', 'Quarter'],
  //     vFormatArr: [''],
  //     vFormat: 'hour'
  //   };
  //   console.log(this.editor)
  //   // var c;
  //   // for (c in this.finalydata) {
  //   //   let v = this.finalydata[c];
  //   //       setInterval(function(){ 
                    
  //   //             if(v.pStart !== null && v.pEnd == null){
  //   //     console.log(v.pName)
  //   //               v.pEnd = mz(v.pStart).add(1, 'seconds').toDate()
  //   //               console.log(v.pEnd)
  //   //             }
        
  //   //           }, 1000);
  //   //           }
  //   this.editor.setOptions(this.editorOptions);
  //   // this.editorOptions.onChange = this.change.bind(this);
  // }

  ngOnInit() {

    this.getTasksByflight();

  }

  // editValue(list, task, event, cell, column) {
  //   // tslint:disable-next-line:triple-equals
  //   const found = list.find(item => item.pID == task.getOriginalID());
  //   if (!found) {
  //     return;
  //   } else {
  //     found[column] = event ? event.target.value : '';
  //   }
  //   console.log(found);
  // }

  // change() {
  //   // console.log('change:', this.editor);
  // }

  // setLanguage(lang) {
  //   this.editorOptions.vLang = lang;
  //   this.editor.setOptions(this.editorOptions);
  // }

  // customLanguage() {
  //   // this.editorOptions.languages = {
  //   //   'pt-BR': {
  //   //     'auto': 'Automático testing'
  //   //   },
  //   //   'en': {
  //   //     'auto': 'Auto testing'
  //   //   }
  //   // };
  //   this.editor.setOptions(this.editorOptions);
  // }

  // changeData() {
  //   this.data = Object.assign({}, this.data,
  //     { randomNumber: Math.random() * 100 });
  // }

  /**
   * Example on how get the json changed from the jsgantt
   */
  // getData() { 
  //   // const changedGantt = this.editor.get();
  //   // console.log(changedGantt);
  // }

  // function to navigate to live status 
  backToLive() {
    // this.router.navigate(['/station/flifo/live_status']);
    this.dialogRef.close();
  }


}
