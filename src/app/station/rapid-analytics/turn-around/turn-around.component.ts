import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ApiService } from 'app/service/app.api-service';
import { AppService, AuthService } from 'app/service/app.service';
import { MatDialog } from '@angular/material';
import { MqttService } from 'ngx-mqtt';
import { AppUrl } from '../../../service/app.url-service';
import { CommonData } from 'app/service/common-data';

import * as moment from 'moment';
import * as momentzone from 'moment-timezone';
@Component({
  selector: 'app-turn-around',
  templateUrl: './turn-around.component.html',
  styleUrls: ['./turn-around.component.scss']
})
export class TurnAroundComponent implements OnInit {

  filter = {
    to: momentzone().tz(this.auth.user.airport.timezone).endOf('day'),
    from: momentzone().tz(this.auth.user.airport.timezone).startOf('day').subtract(6, 'days')
  };
  today = momentzone().tz(this.auth.user.airport.timezone);
  //common chart options
  globalChartOptions = {
    responsive: true,
    cutoutPercentage: 75,
    legend: {
      display: false,
      position: 'bottom'
    }
  };

  barChartColors = [{
    fontColor: "#61c1fb",
    backgroundColor: "#61c1fb",
    borderColor: '#61c1fb',
    pointBackgroundColor: '#61c1fb',
    pointBorderColor: '#61c1fb',
    pointHoverBackgroundColor: '#61c1fb',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  }];

  departBarChartColors = [{
    fontColor: '#1b55e2',
    backgroundColor: ['#1b55e2', '#dadada', '#dadada', '#dadada', '#dadada', '#dadada', '#dadada', '#dadada'],
    borderColor: '#1b55e2',
    pointBackgroundColor: '#1b55e2',
    pointBorderColor: '#1b55e2',
    pointHoverBackgroundColor: '#1b55e2',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  }];

  mixedChartColors = [{
    fontColor: "#4c84ff",
    backgroundColor: '#4c84ff',
    borderColor: '#4c84ff',
    pointBackgroundColor: '#4c84ff',
    pointBorderColor: '#4c84ff',
    pointHoverBackgroundColor: '#4c84ff',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  }, {
    fontColor: "#4c84ff",
    borderColor: '#4c84ff',
    pointBackgroundColor: '#ffffff',
    pointBorderColor: '#4c84ff',
    pointHoverBackgroundColor: '#4c84ff',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  }];


  barChartLabels = [];
  departTodChartLabels = [];
  mixedChartLabels = [];
  taskMixedChartLabels = [];
  barChartData = [
    { data: [] }
  ];
  departTodChartData = [{ data: [] }];
  todBarChartData = [{ data: [] }]
  departBarChartData = [{ data: [] }, { value: [] }]
  departBarChartLabels = []
  mixedChartData = [
    { data: [] },
    {
      data: [],
      type: 'line',
      fill: false
    }
  ]
  taskMixedChartData = [
    { data: [] },
    {
      data: [],
      type: 'line',
      fill: false
    }
  ]
  barChartLegend = false;
  barChartType = 'bar';


  //mainbar chart Options
  departBarChartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      xAxes: [{
        gridLines: {
          color: 'rgba(0,0,0,0.02)',
          zeroLineColor: 'rgba(0,0,0,0.02)'
        },
        barPercentage: 1.2,
        ticks: {
          beginAtZero: true,
          fontColor: '#000000',
          fontSize: 12,
          display: false
        },
      }], yAxes: [{
        gridLines: {
          color: '#dadada',
          zeroLineColor: '#dadada'
        },
        ticks: {
          beginAtZero: true,
          fontColor: '#a9aaad',
          suggestedMax: 100,
          fontSize: 12,
          stepSize: 20
        },
      }]
    },
    tooltips: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'nearest',
      intersect: true
    }
  };


  //timeof day bar charts
  barChartOptions = {
    responsive: true,
    scales: {
      xAxes: [{
        gridLines: {
          color: 'rgba(0,0,0,0.02)',
          zeroLineColor: 'rgba(0,0,0,0.02)'
        },
        barPercentage: 0.7,
        ticks: {
          beginAtZero: true,
          fontColor: '#a9aaad',
          fontSize: 9
        },
      }], yAxes: [{
        gridLines: {
          color: '#a9aaad',
          zeroLineColor: '#a9aaad'
        },
        ticks: {
          beginAtZero: true,
          fontColor: '#a9aaad',
          suggestedMax: 100,
          fontSize: 9,
          stepSize: 25
        },
      }]
    },
    tooltips: {
      filter: function (tooltipItem) {
        return tooltipItem.datasetIndex === 0;
      },
      mode: 'index',
      intersect: false
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    legend: {
      display: false,
      position: 'top',
      labels: {
        fontColor: '#a9aaad'
      }
    }
  };

  //turnotp options
  turnOtp = {
    type: "doughnut",
    labels: ['Base+Halt', 'Turnaround'],
    values: [],
    colors: [
      {
        backgroundColor: ['#00beff', '#1b55e2']
      }],
    options: Object.assign({
      elements: {
        arc: {
          borderWidth: 0
        }
      }
    }, this.globalChartOptions)
  };
  turnArOtp: number;
  turnFlights: number;
  turnFlightsNo: number;
  contactPer: number;
  openPer: number;
  closedData: number;
  openData: number;
  equipInfo: any = [];
  totalTasks: number;
  data: any = [];
  heatmapValues: any = [];
  taxiIn: number;
  dock: number;
  turnAround: number;
  unDock: number;
  taxiOut: number;
  currentDepId: number;
  delayInfo: any = [];
  departTask: any = [];
  currentStation: { "id": any; "code": any; "zone": any; };
  zoneOffset: any;
  turnBaseFlights: number;
  turnBaseFlightsNo: number;
  delayPercentage: number;
  bufferFlights: number;
  delayFlights: number;
  delayPercentages: any = [];
  onTimeDelayPercentages: any = [];
  taskGroup: any = [];
  taskLength: any;
  selectedTasks: any = [];
  currentTaskId: any;
  taskHeatData: any;
  taskHeatmapValue: any;
  recoverPercentage: any;
  recoveryFlts: any;
  recoveryBuff: any;
  onTimeMetricsData: any;
  bufferMetricsData: any;
  delayMetricsData: any;
  bufferDelayPercentages: any = [];
  delayedDelayPercentages: any = [];
  @ViewChild('widgetsContent', { read: ElementRef }) public widgetsContent: ElementRef<any>;
  constants: CommonData;
  openOntime: any;
  closedOntime: any;
  totalFlights: any;

  constructor(private auth: AuthService, private AppUrl: AppUrl, private appService: AppService, private services: ApiService, private common: CommonData) {
    this.currentStation = { "id": this.auth.user.userAirportMappingList[0].id, "code": this.auth.user.userAirportMappingList[0].code, "zone": this.auth.user.airport.timezone }
    this.zoneOffset = this.auth.timeZone;
  }

  ngOnInit() {
    this.appService.search.next('FILTER');
    this.turnAroundOtp();
    this.overallTurnaroundOtp();
    this.turnBayOtp();
    this.turnEquipOtp();
    this.recoveryMetrics();
    this.getTurnbyDepartment();
    this.currentDepId = 1;
    this.currentTaskId = 1;
    this.constants = this.common;
    if (this.currentDepId) {
      this.getOtpDepartTod();
      this.getOtpDepartDow();
      this.getOtpDepartHeat();
      this.getOtpDepartTaskView();
    }

    if (this.currentTaskId) {
      this.getTaskTod();
      this.getTaskDow();
      this.getTaskDelayCode();
      this.getTaskOtpHeat();
    }
    //taxi values
    this.taxiIn = 7;
    this.dock = 7;
    this.turnAround = 63;
    this.unDock = 8;
    this.taxiOut = 15;
  }

  turnAroundOtp() {
    let otpValues = '2&station=' + this.currentStation.id + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_TURNAROUND_OTP'), otpValues).subscribe(res => {
      let turnOtp = res.data;
      if (res.status == true) {
        this.turnArOtp = turnOtp[0].percentage;
      }
      this.turnArOtp = this.turnArOtp ? this.turnArOtp : 0;
    })
  }

  overallTurnaroundOtp() {
    let otpValues = '2&station=' + this.currentStation.id + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_OVERALL_TURNAROUND_OTP'), otpValues).subscribe(res => {
      let OverTurnOtp = res.data;
      if (res.status == true) {
        this.turnFlights = OverTurnOtp[0].turnaround_flights_percentage;
        this.turnOtp.values = [OverTurnOtp[0].other_flights_percentage, OverTurnOtp[0].turnaround_flights_percentage];
        this.turnFlightsNo = OverTurnOtp[0].turnaround_flights;
        this.turnBaseFlights = OverTurnOtp[0].other_flights_percentage;
        this.turnBaseFlightsNo = OverTurnOtp[0].other_flights;
      }
    })
  }


  recoveryMetrics() {
    let otpValues = '2&station=' + this.currentStation.id + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_ANALYTICS_RECOVERY_METRICS'), otpValues).subscribe(res => {

      if (res.status) {
        let value = res.data;
        this.delayPercentage = value.delay_rate;
        this.recoverPercentage = value.recover_rate;
        this.totalFlights = value.total_flight_turn;
        this.delayFlights = value.delay_denominator;
        this.bufferFlights = value.delay_numerator;
        this.recoveryFlts = value.recover_denominator;
        this.recoveryBuff = value.recorver_numerator;
        this.onTimeMetricsData = value.ontime_ptg;
        this.bufferMetricsData = value.buffer_ptg;
        this.delayMetricsData = value.delay_ptg;
        this.onTimeDelayPercentages = [{ type: 'success', label: value.ontime.o_o + '%' }, { type: 'warning', label: value.ontime.o_b + '%' }, { type: 'danger', label: value.ontime.o_d + '%' }]
        this.bufferDelayPercentages = [{ type: 'success', label: value.buffer.b_o + '%' }, { type: 'warning', label: value.buffer.b_b + '%' }, { type: 'danger', label: value.buffer.b_d + '%' }]
        this.delayedDelayPercentages = [{ type: 'success', label: value.delay.d_o + '%' }, { type: 'warning', label: value.delay.d_b + '%' }, { type: 'danger', label: value.delay.d_d + '%' }]
        this.onTimeDelayPercentages[0].value = value.ontime.o_o;
        this.onTimeDelayPercentages[1].value = value.ontime.o_b;
        this.onTimeDelayPercentages[2].value = value.ontime.o_d;
        this.bufferDelayPercentages[0].value = value.buffer.b_o;
        this.bufferDelayPercentages[1].value = value.buffer.b_b;
        this.bufferDelayPercentages[2].value = value.buffer.b_d;
        this.delayedDelayPercentages[0].value = value.delay.d_o;
        this.delayedDelayPercentages[1].value = value.delay.d_b;
        this.delayedDelayPercentages[2].value = value.delay.d_d;
      }
    })
  }

  chartClicked(event) {
    const chart = event.active[0]._chart;
    const activePoints = chart.getElementAtEvent(event.event);
    var elementIndex = (activePoints[0]._index);
    var color = activePoints[0]._chart.config.data.datasets[0].backgroundColor;
    for (let index = 0; index < color.length; index++) {
      if (index === elementIndex) {
        activePoints[0]._chart.config.data.datasets[0].backgroundColor[index] = '#1b55e2';
        this.currentDepId = activePoints[0]._chart.config.data.datasets[0].value[index];
        this.getOtpDepartTod();
        this.getOtpDepartDow();
        this.getOtpDepartHeat();
        this.getOtpDepartTaskView();
      }
      else {
        activePoints[0]._chart.config.data.datasets[0].backgroundColor[index] = '#dadada';
      }
    }
    chart.update();
  }


  turnBayOtp() {
    let otpValues = '2&station=' + this.currentStation.id + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_TURNAROUND_BAY_OPT'), otpValues).subscribe(res => {
      let bayTurnOtp = res.data;
      if (res.status == true) {
        for (let i = 0; i < bayTurnOtp.length; i++) {
          this.openOntime = bayTurnOtp[0].on_time;
          this.openData = bayTurnOtp[0].total_flights;
          this.openPer = bayTurnOtp[0].ontime_percentage;
          this.closedData = bayTurnOtp[1].total_flights;
          this.closedOntime = bayTurnOtp[1].on_time;
          this.contactPer = bayTurnOtp[1].ontime_percentage;
        }
      }
    })
  }

  turnEquipOtp() {
    let otpValues = '2&station=' + this.currentStation.id + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_TURNAROUND_EQUIP_TYPE_OTP'), otpValues).subscribe(res => {
      this.equipInfo = res.data;
      if (res.status == true) {
        for (let i = 0; i < this.equipInfo.length; i++) {
          this.equipInfo[i].type = res.data[i].type;
          this.equipInfo[i].total_flights = res.data[i].total_flights;
          this.equipInfo[i].avg_time = res.data[i].avg_time;
          this.equipInfo[i].turn_otp = res.data[i].otp_percentage
        }
      }
    })
  }

  getTurnbyDepartment() {
    let otpValues = '2&station=' + this.currentStation.id + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_TURNAROUND_BY_DEPARTMENTS'), otpValues).subscribe(res => {
      if (res.status == true) {
        let departLabels = [];
        let departValues = []
        let departId = [];
        this.totalTasks = res.total;
        let departOtp = res.data;
        this.departTask = res.data;

        for (let i = 0; i < departOtp.length; i++) {
          const element = departOtp[i];
          departLabels.push(element.department);
          departValues.push(element.overall_percentage);
          departId.push(element.id);
        }

        for (let i = 0; i < this.departTask.length; i++) {
          this.departTask[i].id = departOtp[i].id;
          this.departTask[i].department = departOtp[i].department;
          this.departTask[i].tasks = departOtp[i].total_task;
        }
        this.departBarChartLabels = departLabels;
        this.departBarChartData[0].data = departValues;
        this.departBarChartData[0].value = departId;

      }
    })
  }



  getOtpDepartTod() {
    let otpValues = '2&station=' + this.currentStation.id + '&id=' + this.currentDepId + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_TURNAROUND_DEPARTMENT_BY_TOD'), otpValues).subscribe(res => {
      if (res.status == true) {
        let todValue = [];
        let todLabel = [];
        for (let index = 0; index < res.data.length; index++) {
          const element = res.data[index];
          todValue.push(element.percentage);
          todLabel.push(element.g);
        }
        this.departTodChartData[0].data = todValue;
        this.departTodChartLabels = todLabel;
      }
    })
  }

  filterrange() {
    console.log("filter applied")
    console.log(this.filter.from)
    console.log(this.filter.to)
  }

  getOtpDepartDow() {
    let otpValues = '2&station=' + this.currentStation.id + '&id=' + this.currentDepId + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_TURNAROUND_DEPARTMENT_BY_DOW'), otpValues).subscribe(res => {
      if (res.status == true) {
        let dowValue = [];
        let dowLabel = [];
        for (let index = 0; index < res.data.length; index++) {
          const element = res.data[index];
          dowValue.push(element.percentage)
          dowLabel.push(element.g)
        }
        this.mixedChartData[0].data = dowValue;
        this.mixedChartData[1].data = dowValue;
        this.mixedChartLabels = dowLabel;
      }
    })
  }

  getOtpDepartHeat() {
    let otpValues = '2&station=' + this.currentStation.id + '&id=' + this.currentDepId + '&zone=' + this.currentStation.zone;
    //commented GET_TURNAROUND_DEPARTMENT_BY_HEATMAP
    this.services.getById(this.AppUrl.geturlfunction('GET_TURNAROUND_DEPARTMENT_BY_HEATMAP'), otpValues).subscribe(res => {
      if (res.status == true) {
        this.data = [];
        this.heatmapValues = res.range;
        this.data = res.data;
      }
    })
  }

  leftScroll() {
    this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft - this.widgetsContent.nativeElement.offsetWidth), behavior: 'smooth' });
  }


  rightScroll() {
    this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft + this.widgetsContent.nativeElement.offsetWidth), behavior: 'smooth' });
  }

  getTaskOtpHeat() {
    let otpValues = '2&station=' + this.currentStation.id + '&id=' + this.currentTaskId + '&zone=' + this.currentStation.zone;
    //commented GET_TURNAROUND_TASK_BY_HEATMAP
    this.services.getById(this.AppUrl.geturlfunction('GET_TURNAROUND_TASK_BY_HEATMAP'), otpValues).subscribe(res => {
      if (res.status == true) {
        this.taskHeatData = [];
        this.taskHeatmapValue = res.range;
        this.taskHeatData = res.data;
      }
    })
  }

  getTaskTod() {
    let otpValues = '2&station=' + this.currentStation.id + '&id=' + this.currentTaskId + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_TURNAROUND_TASK_BY_TOD'), otpValues).subscribe(res => {
      if (res.status == true) {
        let dowValue = [];
        let dowLabel = [];
        for (let index = 0; index < res.data.length; index++) {
          const element = res.data[index];
          dowValue.push(element.percentage)
          dowLabel.push(element.g)
        }
        this.barChartData[0].data = dowValue;
        this.barChartLabels = dowLabel;
      }
    })
  }

  getTaskDow() {
    let otpValues = '2&station=' + this.currentStation.id + '&id=' + this.currentTaskId + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_TURNAROUND_TASK_BY_DOW'), otpValues).subscribe(res => {
      if (res.status == true) {
        let dowValue = [];
        let dowLabel = [];
        for (let index = 0; index < res.data.length; index++) {
          const element = res.data[index];
          dowValue.push(element.percentage)
          dowLabel.push(element.g)
        }
        this.taskMixedChartData[0].data = dowValue;
        this.taskMixedChartData[1].data = dowValue;
        this.taskMixedChartLabels = dowLabel;
      }
    })
  }

  getTaskDelayCode() {
    let otpValues = '2&station=' + this.currentStation.id + '&id=' + this.currentTaskId + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_TURNAROUND_TASK_BY_DELAYCODE'), otpValues).subscribe(res => {
      if (res.status == true) {
        this.delayInfo = [];
        this.delayInfo = res.data;
      }
    })
  }

  selectedTask(data) {
    this.currentTaskId = data.id;
    let taskData = [];
    for (let index = 0; index < this.taskGroup.length; index++) {
      const element = this.taskGroup[index];
      if (element.id == this.currentTaskId) {
        taskData.push(element)
      }
    }
    this.selectedTasks = taskData;
    this.getTaskTod();
    this.getTaskDow();
    this.getTaskDelayCode();
    this.getTaskOtpHeat();
  }

  getOtpDepartTaskView() {
    let otpValues = '2&station=' + this.currentStation.id + '&id=' + this.currentDepId + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_TURNAROUND_DEPARTMENT_BY_TASKVIEW'), otpValues).subscribe(res => {
      if (res.status == true) {
        let taskData = [];
        this.taskGroup = res.data;
        this.taskLength = res.data.length;
        this.currentTaskId = this.taskGroup[0].id;
        for (let index = 0; index < this.taskGroup.length; index++) {
          const element = this.taskGroup[index];
          if (element.id == this.currentTaskId) {
            taskData.push(element)
          }
        }
        this.selectedTasks = taskData;
      }
    })
  }

  daterange(date, value) {
    if (value == 'from') {
      this.filter.from = momentzone(date.value).tz(this.auth.user.airport.timezone).startOf('day');
    }

    if (value == 'to') {
      this.filter.to = momentzone(date.value).tz(this.auth.user.airport.timezone).endOf('day');
    }
  }


}
