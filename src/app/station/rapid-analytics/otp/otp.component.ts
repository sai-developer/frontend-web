import { Component, OnInit } from '@angular/core';
import { ApiService } from 'app/service/app.api-service';
import { AppService, AuthService } from 'app/service/app.service';
import { MatDialog } from '@angular/material';
import { MqttService } from 'ngx-mqtt';
import { AppUrl } from '../../../service/app.url-service';
import { CommonData } from 'app/service/common-data';
import * as moment from 'moment';
import * as momentzone from 'moment-timezone';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss']
})
export class OtpComponent implements OnInit {
  filter = {
    to: momentzone().tz(this.auth.user.airport.timezone).endOf('day'),
    from: momentzone().tz(this.auth.user.airport.timezone).startOf('day').subtract(6, 'days')
  };
  currentStation: { "id": any; "code": any; "zone": any; };
  today = momentzone().tz(this.auth.user.airport.timezone);
  zoneOffset: any;
  arrOtp: any[];
  totalArr: any;
  terminatePercentage: any;
  terminateFlts: any;
  depOtp: any = [];
  totalDep: any;
  basePercentage: any;
  baseFlts: any;
  metrics: any;
  equipInfo: any = [];
  openData: any;
  closedData: any;



  //common chart options
  globalChartOptions = {
    responsive: true,
    cutoutPercentage: 70,
    legend: {
      display: false,
      position: 'bottom'
    }
  };

  //arrival otp chart options
  arrivalOtp = {
    type: "doughnut",
    labels: ['Ontime', 'Buffer', 'Delay'],
    values: [],
    colors: [
      {
        backgroundColor: ['#34a853', '#0f2c18', '#f1011e']
      }],
    options: Object.assign({
      elements: {
        arc: {
          borderWidth: 2
        }
      }
    }, this.globalChartOptions)
  };

  //departure otp chart options
  departureOtp = {
    type: "doughnut",
    labels: ['Ontime', 'Buffer', 'Delay'],
    values: [],
    colors: [
      {
        backgroundColor: ['#34a853', '#0f2c18', '#f1011e']
      }],
    options: Object.assign({
      elements: {
        arc: {
          borderWidth: 2
        }
      }
    }, this.globalChartOptions)
  };

  //line chart options
  lineChartOptions = {
    responsive: true,
    tooltips: {
      mode: 'index',
      intersect: false,
      callbacks: {
        title: function (tooltipItem, data) {
          var title = tooltipItem[0].index;
          var title1 = tooltipItem[0].index + 1;
          if (title < 10) {
            title = '0' + title;
          }
          if (title1 < 10) {
            title1 = '0' + title1;
          }
          if (title == 23) {
            title1 = '00';
          }
          return title + '-' + title1;
        }
      }
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    legend: {
      display: true,
      position: 'top'
    }
  };

  //bottom routes chart options
  barChartOptions = {
    maintainAspectRatio: false,
    responsive: true,
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
      intersect: false,
      callbacks: {}
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    legend: {
      display: false,
      position: 'top',
      labels: {
        fontColor: '#ffffff'
      }
    }
  };


  ComboChartData: Array<any> = [{
    data: [],
    yAxisID: 'yAxes1',
    label: 'OTP',
    borderWidth: 1,
    type: 'line',
    fill: false
  },
  {
    data: [],
    yAxisID: 'yAxes2',
    label: 'Flights',
    borderWidth: 1,
    type: 'bar',
  }
  ];


  ComboChartOptions: any = Object.assign({
    animation: false,
    scales: {
      xAxes: [{
        gridLines: {
          color: 'rgba(0,0,0,0.02)',
          zeroLineColor: 'rgba(0,0,0,0.02)'
        },
        scaleLabel: {
          display: true,
          labelString: 'TIME',
          fontColor: '#7f7f7f'
        }
      }],
      yAxes: [{
        id: 'yAxes1',
        gridLines: {
          color: 'rgba(0,0,0,0.02)',
          zeroLineColor: 'rgba(0,0,0,0.02)'
        },
        scaleLabel: {
          display: true,
          labelString: 'OTP',
          fontColor: '#1b55e2'
        },
        ticks: {
          beginAtZero: true,
          suggestedMax: 100,
          stepSize: 25,
          fontColor: '#1b55e2',
        },
        position: 'left'
      },
      {
        id: 'yAxes2',
        gridLines: {
          color: 'rgba(0,0,0,0.02)',
          zeroLineColor: 'rgba(0,0,0,0.02)'
        },
        scaleLabel: {
          display: true,
          labelString: 'FLIGHTS',
          fontColor: '#00c2ff'
        },
        ticks: {
          beginAtZero: true,
          suggestedMax: 160,
          fontColor: '#00c2ff',
          stepSize: 40
        },
        position: 'right'
      }
      ]
    }
  },
    this.lineChartOptions);
  lineChartLabels: Array<any> = [];
  lineChartLegend = false;
  barChartLegend = true;
  barChartType = 'bar';

  lineChartColors = [{
    fontColor: "#1b55e2",
    backgroundColor: '#1b55e2',
    borderColor: '#1b55e2',
    pointBackgroundColor: '#1b55e2',
    pointBorderColor: '#1b55e2',
    pointHoverBackgroundColor: '#1b55e2',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  },
  {
    backgroundColor: '#00c2ff',
    borderColor: '#00c2ff',
    pointBackgroundColor: '#00c2ff',
    pointBorderColor: '#00c2ff',
    pointHoverBackgroundColor: '#00c2ff',
    pointHoverBorderColor: 'rgba(77,83,96,1)'
  }
  ];

  barChartColors = [{
    fontColor: ['#61c1fb', '#61c1fb', '#61c1fb', '#61c1fb', '#61c1fb', '#f1011e', '#f1011e', '#f1011e', '#f1011e', '#f1011e'],
    backgroundColor: ['#61c1fb', '#61c1fb', '#61c1fb', '#61c1fb', '#61c1fb', '#f1011e', '#f1011e', '#f1011e', '#f1011e', '#f1011e'],
    borderColor: ['#61c1fb', '#61c1fb', '#61c1fb', '#61c1fb', '#61c1fb', '#f1011e', '#f1011e', '#f1011e', '#f1011e', '#f1011e'],
    pointBackgroundColor: ['#61c1fb', '#61c1fb', '#61c1fb', '#61c1fb', '#61c1fb', '#f1011e', '#f1011e', '#f1011e', '#f1011e', '#f1011e'],
    pointBorderColor: ['#61c1fb', '#61c1fb', '#61c1fb', '#61c1fb', '#61c1fb', '#f1011e', '#f1011e', '#f1011e', '#f1011e', '#f1011e'],
    pointHoverBackgroundColor: ['#61c1fb', '#61c1fb', '#61c1fb', '#61c1fb', '#61c1fb', '#f1011e', '#f1011e', '#f1011e', '#f1011e', '#f1011e'],
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  }];


  heatmapValues: any[];
  values: any[];
  data: any;
  public barChartLabels = [];
  public barChartData = [
    { data: [], value: [] }
  ];

  delayPercentage: any;
  recoverPercentage: any;
  load: boolean = false;
  delayFlights: any;
  bufferFlights: any;
  recoveryFlts: any;
  recoveryBuff: any;
  openPer: any;
  contactPer: any;
  topList: any;
  routeList: any = [];
  percentageValue: any = [];
  topLists: any = [];
  dayValues: any = [];
  heatValues: any = [];
  openTotal: any;
  closedTotal: any;
  constants: CommonData;
  flightsCount: any = [];
  constructor(private services: ApiService, private appService: AppService, private dialog: MatDialog, private AppUrl: AppUrl, private auth: AuthService, private mqttService: MqttService, private common: CommonData
  ) {
    this.currentStation = { "id": this.auth.user.userAirportMappingList[0].id, "code": this.auth.user.userAirportMappingList[0].code, "zone": this.auth.user.airport.timezone }
    this.zoneOffset = this.auth.timeZone;
  }


  ngOnInit() {
    this.appService.search.next('FILTER');
    this.getHeatMapChart();
    this.getTopConnection();
    this.getArrivalOtp();
    this.getDepartureOtp();
    this.timeOfDay();
    this.equipOtp();
    this.bayOtp();
    this.constants = this.common;
  }
  //Arrival OTP 
  getArrivalOtp() {
    let otpValues = '2&station=' + this.currentStation.id + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_ANALYTICS_ARRIVAL_OTP'), otpValues).subscribe(res => {
      if (res.record_count >= 1) {
        this.arrOtp = res.data;
        this.arrivalOtp.values = [this.arrOtp[0].otp_percentage, this.arrOtp[0].buffer_percentage, this.arrOtp[0].delay_percentage]
        this.totalArr = this.arrOtp[0].total_arrivals;
        this.terminatePercentage = this.arrOtp[0].terminate_percentage;
        this.terminateFlts = this.arrOtp[0].terminate_flights;
      }
    })
  }

  filterrange() {
    console.log("filter applied")
    console.log(this.filter.from)
    console.log(this.filter.to)
  }

  //heat map chart
  getHeatMapChart() {
    let otpValues = '2&station=' + this.currentStation.id + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_HEATMAP_CHART'), otpValues).subscribe(res => {
      this.heatmapValues = res.range;
      if (res.status == true) {
        this.data = res.data;
      }

    })
  }

  //Departue OTP
  getDepartureOtp() {
    let otpValues = '2&station=' + this.currentStation.id + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_ANALYTICS_DEPARTURE_OTP'), otpValues).subscribe(res => {
      if (res.record_count >= 1) {
        this.depOtp = res.data;
        this.departureOtp.values = [this.depOtp[0].otp_percentage, this.depOtp[0].buffer_percentage, this.depOtp[0].delay_percentage]
      }
    })
  }

  //Top Connection
  getTopConnection() {
    let otpValues = '2&station=' + this.currentStation.id + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_TOP_FIVE_ROUTES'), otpValues).subscribe(res => {
      this.topList = res.data;
      for (let index = 0; index < this.topList.length; index++) {
        const element = this.topList[index];
        var route = element.routes.replace(/[()]/g, '');
        var routes = route.replace(/,/g, ' - ');
        this.routeList.push(routes);
        this.percentageValue.push(element.percentage);
        this.flightsCount.push(element.total_flights);
      }

      this.services.getById(this.AppUrl.geturlfunction('GET_BOTTOM_FIVE_ROUTES'), otpValues).subscribe(res => {
        this.topLists = res.data;
        for (let index = 0; index < this.topLists.length; index++) {
          const element = this.topLists[index];
          var route = element.routes.replace(/[()]/g, '');
          var routes = route.replace(/,/g, ' - ');
          this.routeList.push(routes);
          this.percentageValue.push(element.percentage);
          this.flightsCount.push(element.total_flights);
        }
        this.barChartData[0].data = this.percentageValue;
        this.barChartData[0].value = this.flightsCount;
        this.barChartLabels = this.routeList;
        this.barChartOptions.tooltips.callbacks = {
          afterTitle: function (tooltipItem, data) {
            var index = tooltipItem[0].index;
            var count = data.datasets[0].value[index];
            return 'Flights: ' + count;
          },
          label: function (tooltipItem,data) {
            return tooltipItem.yLabel+'%';
          }
        }
      })
    })
  }



  //OTP slot change
  otpChangeSlot(e: any) {
    if (e.index == 1) {
      this.dayOfWeek();
    } else {
      this.timeOfDay();
    }
  }
  //Time of day
  timeOfDay() {
    let otpValues = '2&station=' + this.currentStation.id + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_ANALYTICS_TIME_OF_DAY'), otpValues).subscribe(res => {
      let otpArray = [];
      let flightCountArray = [];
      let xaxisArray = [];
      for (var index = 0; index < res.data.length; index++) {
        var element = res.data[index];
        let otpPercentDecimal = element.otp == null ? null : ((element.otp).toFixed(0));
        let flight_c = element.flight_count ? (element.flight_count == null ? null : element.flight_count) : '';
        otpArray.push(otpPercentDecimal)
        flightCountArray.push(flight_c)
        xaxisArray.push(element.g);
      }
      this.ComboChartData[0].data = otpArray;
      this.ComboChartData[1].data = flightCountArray;
      this.ComboChartOptions.scales.xAxes[0].scaleLabel.labelString = 'TIME';
      this.ComboChartOptions.scales.xAxes[0].barPercentage = 1;
      this.lineChartLabels = xaxisArray;
      this.ComboChartOptions.tooltips.callbacks = {
        title: function (tooltipItem, data) {
          var title = tooltipItem[0].index;
          var title1 = tooltipItem[0].index + 1;
          if (title < 10) {
            title = '0' + title;
          }
          if (title1 < 10) {
            title1 = '0' + title1;
          }
          if (title == 23) {
            title1 = '00';
          }
          return title + '-' + title1;
        }
      }
    })
  }

  //Day of week
  dayOfWeek() {
    let otpValues = '2&station=' + this.currentStation.id + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_ANALYTICS_DAY_OF_WEEK'), otpValues).subscribe(res => {
      let otpArray = [];
      let flightCountArray = [];
      let xaxisArray = [];
      for (var index = 0; index < res.data.length; index++) {
        var element = res.data[index];
        let otpPercentDecimal = element.flight_otp == null ? null : ((element.flight_otp).toFixed(0));
        let flight_c = element.flight_count ? (element.flight_count == null ? null : element.flight_count) : '';
        otpArray.push(otpPercentDecimal)
        flightCountArray.push(flight_c)
        xaxisArray.push(element.day);
      }
      this.ComboChartData[0].data = otpArray;
      this.ComboChartData[1].data = flightCountArray;
      this.lineChartLabels = xaxisArray;
      this.ComboChartOptions.scales.xAxes[0].scaleLabel.labelString = 'DAYS';
      this.ComboChartOptions.scales.xAxes[0].barPercentage = 0.5;
      this.ComboChartOptions.tooltips.callbacks = {
        title: function (tooltipItem, data) {
          var title = tooltipItem[0].xLabel;
          return title;
        }
      }
    })
  }


  //Equipment type otp
  equipOtp() {
    let otpValues = '2&station=' + this.currentStation.id + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_ANALYTICS_EQUIPMENT_OTP'), otpValues).subscribe(res => {
      this.equipInfo = res.data;
    })
  }


  daterange(date, value) {
    if (value == 'from') {
      this.filter.from = momentzone(date.value).tz(this.auth.user.airport.timezone).startOf('day');
    }

    if (value == 'to') {
      this.filter.to = momentzone(date.value).tz(this.auth.user.airport.timezone).endOf('day');
    }

    console.log(momentzone(this.filter.from).format("DD-MM-YYYY").toString())
    console.log(momentzone(this.filter.to).format("DD-MM-YYYY").toString())
  }

  //Bay type otp
  bayOtp() {
    let otpValues = '2&station=' + this.currentStation.id + '&zone=' + this.currentStation.zone;
    this.services.getById(this.AppUrl.geturlfunction('GET_ANALYTICS_BAY_OTP'), otpValues).subscribe(res => {
      if (res.data) {
        for (let i = 0; i < res.data.length; i++) {
          if (res.data[i].bay_type == 0) {
            this.openData = res.data[0].on_time;
            this.closedData = res.data[1].on_time;
            this.openTotal = res.data[0].total_flights;
            this.closedTotal = res.data[1].total_flights;
            this.openPer = res.data[0].on_time_percentage;
            this.contactPer = res.data[1].on_time_percentage;
          }
        }
      }
    })
  }
}