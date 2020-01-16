import { Component, OnInit } from '@angular/core';
import { ApiService } from 'app/service/app.api-service';
import { AppService, AuthService } from 'app/service/app.service';
import { MatDialog } from '@angular/material';
import { MqttService } from 'ngx-mqtt';
import { AppUrl } from '../../../service/app.url-service';
import { Chart } from 'chart.js';

import * as moment from 'moment';
import * as momentzone from 'moment-timezone';
@Component({
  selector: 'app-delay',
  templateUrl: './delay.component.html',
  styleUrls: ['./delay.component.scss']
})
export class DelayComponent implements OnInit {

  filter = {
    to: momentzone().tz(this.auth.user.airport.timezone).endOf('day'),
    from: momentzone().tz(this.auth.user.airport.timezone).startOf('day').subtract(6, 'days')
  };

  today = momentzone().tz(this.auth.user.airport.timezone);

  heatmapValues: { name: string; }[];
  data: { day: string; day1: string; values: { num: number; }[]; }[];
  taskGroup: { name: string; values: number; }[];
  currentStation: { "id": any; "code": any; "zone": any; };
  zoneOffset: any;
  delayInfo: any;
  topDelayCodes: any;
  delayedTask: any;
  taskHeatmapValue: any;
  taskHeatData: any;
  currentTaskId: any;

  constructor(private auth: AuthService, private appService: AppService, private AppUrl: AppUrl, private services: ApiService) {
    this.currentStation = { "id": this.auth.user.userAirportMappingList[0].id, "code": this.auth.user.userAirportMappingList[0].code, "zone": this.auth.user.airport.timezone }
    this.zoneOffset = this.auth.timeZone;
  }

  globalChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: true,
      position: 'right',
      align: 'start',
      onClick: function (e) {
      }
    }
  };

  //delay categorization chart
  delayChart = {
    type: 'pie',
    labels: [],
    values: [],
    colors: [
      {
        backgroundColor: ['#0c103d', '#006ddf', '#ed3f23', '#fbb216', '#86c43d', '#00b8a3', '#531b9b', '#7f154e', '#249d2d', '#e26262']
      }],
    options: Object.assign({
      elements: {
        arc: {
          hoverBorderWidth: 5,
          borderWidth: 2
        }
      }
    }, this.globalChartOptions),
  };

  barChartColors1 = [{
    fontColor: "#61c1fb",
    backgroundColor: '#61c1fb',
    borderColor: '#61c1fb',
    pointBackgroundColor: '#61c1fb',
    pointBorderColor: '#61c1fb',
    pointHoverBackgroundColor: '#61c1fb',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  }];

  barChartLegend = false;
  //top delay codes chart
  barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        gridLines: {
          color: '#7F7F7F',
          zeroLineColor: 'rgba(0,0,0,0.02)'
        },
        barPercentage: 0.4,
        ticks: {
          beginAtZero: true,
          fontColor: '#ffffff',
          suggestedMax: 100,
          fontSize: 9
        },
      }], yAxes: [{
        gridLines: {
          color: '#7F7F7F',
          zeroLineColor: 'rgba(0,0,0,0.02)'
        },
        ticks: {
          beginAtZero: true,
          fontColor: '#ffffff',
          suggestedMax: 100,
          fontSize: 9,
          stepSize: 25
        },
      }]
    },
    tooltips: {
      mode: 'index',
      axis: 'y',
      filter: function (tooltipItem) {
        return tooltipItem.datasetIndex === 0;
      }
    },
    hover: {
      mode: 'index'
    }
  };
  public barChartLabels = [];
  public barChartData = [
    { data: [] },
  ];
  public barChartData1 = [
    { data: [] }
  ];

  public barChartLabels1 = [];
  public barChartType = 'bar';
  public hzbarChartType = 'horizontalBar';

  public barChartColors = [{
    fontColor: "#e3102b",
    backgroundColor: '#e3102b',
    borderColor: '#e3102b',
    pointBackgroundColor: '#e3102b',
    pointBorderColor: '#e3102b',
    pointHoverBackgroundColor: '#e3102b',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  }];



  public mixedChartData = [
    { data: [] },
    {
      data: [],
      type: 'line',
      fill: false
    }
  ]
  public mixedChartLabels = [];

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




  ngOnInit() {
    this.appService.search.next('FILTER');
    this.getDelayedTask();
    this.getTopDelayCodesUsed();
    this.getTaskDelayCategory();
    this.currentTaskId = 1;
    if (this.currentTaskId) {
      this.getDelayTaskHeatmap();
      this.getTopFiveDelay();
      this.getDelayOtpTod();
      this.getDelayOtpDow();
      this.getTaskDelayCode();
    }
  }

  getDelayOtpTod() {
    let otpValues = '2&station=' + this.currentStation.id + '&id=' + this.currentTaskId + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_DELAY_BY_TOD'), otpValues).subscribe(res => {
      if (res.status == true) {
        let todValue = [];
        let todLabel = [];
        for (let index = 0; index < res.data.length; index++) {
          const element = res.data[index];
          todValue.push(element.percentage);
          todLabel.push(element.g);
        }
        this.barChartData1[0].data = todValue;
        this.barChartLabels1 = todLabel;
      }
    })
  }

  getDelayOtpDow() {
    let otpValues = '2&station=' + this.currentStation.id + '&id=' + this.currentTaskId + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_DELAY_BY_DOW'), otpValues).subscribe(res => {
      if (res.status == true) {
        let todValue = [];
        let todLabel = [];
        for (let index = 0; index < res.data.length; index++) {
          const element = res.data[index];
          todValue.push(element.percentage);
          todLabel.push(element.g);
        }
        this.mixedChartData[0].data = todValue;
        this.mixedChartData[1].data = todValue;
        this.mixedChartLabels = todLabel;
      }
    })
  }

  getDelayedTask() {
    let otpValues = '2&station=' + this.currentStation.id + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_DELAYED_TASK_LIST'), otpValues).subscribe(res => {
      if (res.status == true) {
        this.delayedTask = res.data;
      }
    })
  }


  getTopFiveDelay() {
    let otpValues = '2&station=' + this.currentStation.id + '&id=' + this.currentTaskId + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_TOP_FIVE_DELAYTASK'), otpValues).subscribe(res => {
      if (res.status == true) {
        this.topDelayCodes = [];
        this.topDelayCodes = res.data;
      }
    })
  }

  activeTask(data) {
    this.currentTaskId = data;
    this.getDelayTaskHeatmap();
    this.getTopFiveDelay();
    this.getDelayOtpTod();
    this.getDelayOtpDow();
    this.getTaskDelayCode();


  }


  getDelayTaskHeatmap() {
    let otpValues = '2&station=' + this.currentStation.id + '&zone=' + this.currentStation.zone + '&id=' + this.currentTaskId;
    //commented GET_DELAYED_TASK_HEATMAP  GET_HEATMAP_CHART
    this.services.getById(this.AppUrl.geturlfunction('GET_DELAYED_TASK_HEATMAP'), otpValues).subscribe(res => {
      if (res.status == true) {
        this.taskHeatData = [];
        this.taskHeatmapValue = res.range;
        this.taskHeatData = res.data;
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


  //TOP 5 DELAY CODES USED
  getTopDelayCodesUsed() {
    let otpValues = '2&station=' + this.currentStation.id + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_TOP_FIVE_DELAY_CODES'), otpValues).subscribe(res => {
      if (res.status == true) {
        let todValue = [];
        let todLabel = [];
        for (let index = 0; index < res.data.length; index++) {
          const element = res.data[index];
          todValue.push(element.time_percentage);
          todLabel.push(element.name);
        }

        this.barChartLabels = todLabel;
        this.barChartData[0].data = todValue;
      }
    })
  }


  //task delay category chart
  getTaskDelayCategory() {
    let otpValues = '2&station=' + this.currentStation.id + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_TASK_DELAY_CATEGORY'), otpValues).subscribe(res => {
      if (res.status == true) {
        let todValue = [];
        for (let index = 0; index < res.data.length; index++) {
          const element = res.data[index];
          todValue.push(element.delay_percentage);
          this.delayChart.labels.push(element.category_department);
        }
        this.delayChart.values = todValue;
      }
    })
  }

  filterrange() {
    console.log("filter applied")
    console.log(this.filter.from)
    console.log(this.filter.to)
  }


  getTaskDelayCode() {
    let otpValues = '2&station=' + this.currentStation.id + '&id=' + this.currentTaskId + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_CATEGORY_BY_DELAYCODES'), otpValues).subscribe(res => {
      if (res.status == true) {
        this.delayInfo = [];
        this.delayInfo = res.data;
      }
    })
  }

}
