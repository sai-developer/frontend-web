import { Component } from '@angular/core';
import { AppUrl } from '../../service/app.url-service';
import { ApiService } from '../../service/app.api-service';
import { MatDialog } from '@angular/material';
import { MetarModal } from './metar-modal/metar-modal';
import { NotamModal } from './notam-modal/notam-modal';
import { AuthService, AppService } from '../../service/app.service'
import * as momentzone from 'moment-timezone';
import { Router } from '@angular/router';
import {
  IMqttMessage,
  MqttModule,
  IMqttServiceOptions,
  MqttService
} from 'ngx-mqtt';
import { Observable } from 'rxjs';
import { CommonData } from '../../service/common-data';


@Component({
  selector: 'app-station-dashboard',
  templateUrl: './dashboard-component.html',
  styleUrls: ['./dashboard-component.scss']
})

export class DashboardComponent {

  totalOtppercentage: any;
  totalFlightsDeparted: any;
  // Shared chart options
  globalChartOptions = {
    responsive: true,
    cutoutPercentage: 70,
    legend: {
      display: false,
      position: 'bottom'
    }
  };

  lineChartOptions = {
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
    responsive: true,
    cutoutPercentage: 70,
    legend: {
      display: false,
      position: 'bottom'
    }
  };

  lineChartColors = [{
    fontColor: "#21a1da",
    backgroundColor: '#21a1da',
    borderColor: '#21a1da',
    pointBackgroundColor: '#21a1da',
    pointBorderColor: '#21a1da',
    pointHoverBackgroundColor: '#21a1da',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  },
  {
    backgroundColor: '#b186c8',
    borderColor: '#b186c8',
    pointBackgroundColor: '#b186c8',
    pointBorderColor: '#b186c8',
    pointHoverBackgroundColor: '#b186c8',
    pointHoverBorderColor: 'rgba(77,83,96,1)'
  },
  {
    backgroundColor: 'rgba(148,159,177,0.2)',
    borderColor: 'rgba(148,159,177,1)',
    pointBackgroundColor: 'rgba(148,159,177,1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  }
  ];


  // flights otp  chart options
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
    label: 'Flight',
    borderWidth: 1,
    type: 'bar',
  }
  ];

  lineChartLabels: Array<any> = [];
  lineChartLegend = true;
  barChartType = 'bar';

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
          fontColor: '#21a1da'
        },
        ticks: {
          beginAtZero: true,
          suggestedMax: 100,
          stepSize: 20,
          fontColor: '#21a1da',
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
          fontColor: '#a821da'
        },
        ticks: {
          beginAtZero: true,
          suggestedMax: 50,
          fontColor: '#b186c8',
          stepSize: 10
        },
        position: 'right'
      }
      ]
    }
  },
    this.lineChartOptions);

  doughnutOptions: any = Object.assign({
    elements: {
      arc: {
        borderWidth: 0
      }
    }
  }, this.globalChartOptions);

  //delay categorization chart
  doughnut = {
    type: 'doughnut',
    options: Object.assign({
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            if (data.datasets[0].backgroundColor.length == 11) {
              var index = tooltipItem.index;
              var title = data.labels[index];
              var value = data.datasets[0].data[index]
              var labels = title + " - " + value + '%'
            }
            else {
              var index = tooltipItem.index;
              var title = data.labels[index];
              var labels = title + ' ';
            }
            return labels;
          }
        }
      },
      elements: {
        arc: {
          borderWidth: 0
        }
      }
    }, this.globalChartOptions),
    colors: [
      {
        backgroundColor: ['#6cc920', '#e94e2a']
      }
    ]
  };


  efficiencies = [];
  delayCats: any[];
  dcDoughnut = {
    labels: [],
    values: [],
    colors: [
      {
        backgroundColor: ['#0c103d', '#006ddf', '#ed3f23', '#fbb216', '#86c43d', '#00b8a3', '#531b9b', '#7f154e', '#249d2d', '#e26262', '#999999']
      }]
  };

  etaCheck: any = {
    boolenValue: false,
    number: ''
  };
  flights: any = [];
  flightList: any = [];
  delays: any = [];
  oAllPerEFFArray: any = [];
  oAllPerEFF: number;
  currentStation: any;
  metarDatas: any;
  notamDatas: any;
  zoneOffset: any;
  onGroundCount: any;
  yetToArriveCount: any;
  message: any;
  delayCatsAct: any = [];
  delayCatsRep: any = [];
  delayCatsEff: any = [];
  effFact: any = [];
  index: any;
  arrivalOtp: any;
  flightPlace: any;
  arrivalOtpValue: any;
  constants: any;
  constructor(private router: Router, private services: ApiService, private appService: AppService, private dialog: MatDialog, private AppUrl: AppUrl, private auth: AuthService, private mqttService: MqttService, private common: CommonData
  ) {
    this.currentStation = { "id": this.auth.user.userAirportMappingList[0].id, "code": this.auth.user.userAirportMappingList[0].code, "zone": this.auth.user.airport.timezone }
    this.zoneOffset = this.auth.timeZone;
  }

  ngOnInit() {
    this.constants = this.common;
    this.listenSocket();
    this.subETAaction();
    this.getTodayFlights("init");
    this.Otpchart();
    this.getEfficiencyFactor();
    this.getTaskDelayCategory();
    this.metarData();
    this.notamData();
    this.appService.search.next('FILTER');
    this.flightPlace = 0;
  }
  //mqtt for eta cron short finals
  subETAaction() {
    let mqttTopic = this.currentStation.code + this.AppUrl.getMqttTopic('ETACRON');

    this.mqttService.observe(mqttTopic).subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
      let object = JSON.parse(this.message);
      if (object.flightNumber) {
        this.etaCheck.number = object.flightNumber;
        this.etaCheck.boolenValue = true;
        setTimeout(() => {
          this.etaCheck.boolenValue = false;
        }, 5000);
        let obj = {}
        this.mqttService.unsafePublish(mqttTopic, JSON.stringify(obj), { qos: 0, retain: false });
      }
    })
  }
  //to clear the search bar text on destroy
  ngOnDestroy() {
    this.appService.search.next(' ');
  }
  //delay  category chart values set up
  setDelayCategory() {
    for (let i = 0; i < this.delayCats.length; i++) {
      this.dcDoughnut.labels.push(this.delayCats[i].category_department);
      this.dcDoughnut.values.push(this.delayCats[i].delay_percentage);
    }
  }


  // function call for yet to arrive/onground filters
  getTodayFlights(value) {
    this.services.getAll(this.AppUrl.geturlfunction('FLIGHTS_BY_FROM_TO')).subscribe(res => {
      this.flights = res.data.filter(
        flight => flight.bayType !== null);
      this.flightList = this.flights;
      if (value == "init") {
        this.selectFlights({ index: 1 });
        this.selectFlights({ index: 0 });
      } else {
        console.log(this.flightPlace)
        if (this.flightPlace == 0) {
          this.selectFlights({ index: 1 });
          this.selectFlights({ index: 0 });
        }
        else if (this.flightPlace == 1) {
          this.selectFlights({ index: 0 });
          this.selectFlights({ index: 1 });
        }
      }
    }, error => {
      console.log("error")
    });
  }
  temdata: any = [];

  //efficiency  factor values set up from  api response
  getEfficiencyFactor() {
    this.services.getAll(this.AppUrl.geturlfunction('EfficiencyFactor_BY_STATION') + this.currentStation.id).subscribe(res => {
      this.oAllPerEFFArray = [];
      this.temdata = [];
      this.oAllPerEFF = 0;
      if (res.data) {
        this.efficiencies = res.data;
        for (var index = 0; index < this.efficiencies.length; index++) {
          var element = this.efficiencies[index];
          if (element.id !== null) {
            this.oAllPerEFFArray.push(element.efficiencyPercentage)
            this.temdata.push(element)
          }
        }
        this.temdata = this.appService.sortName(this.temdata, 'activityName');
        this.oAllPerEFF = Math.round(this.oAllPerEFFArray.reduce((a, b) => a + b, 0) / this.efficiencies.length)
      }
    }, error => {
      console.log("error")
    });
  }


  //otp  chart values set up from api response
  Otpchart() {
    let url;
    url = this.AppUrl.geturlfunction('FSC_OTP_BY_STATION') + this.currentStation.id
    this.services.getAll(url).subscribe(res => {
      let otpArray = [];
      let flightCountArray = [];
      let xaxisArray = [];
      for (var index = 0; index < res.data.length; index++) {
        var element = res.data[index];
        let otpPercentDecimal = element.otp_percentage_cumulative == null ? null : ((element.otp_percentage_cumulative).toFixed(0));
        let flight_c = element.flight_count_cumulative ? (element.flight_count_cumulative == null ? null : element.flight_count_cumulative) : '';
        otpArray.push(otpPercentDecimal)
        flightCountArray.push(flight_c)
        xaxisArray.push(this.AppUrl.getHrs(element.time, this.auth.user.airport.timezone));
      }
      this.ComboChartData[0].data = otpArray;
      this.ComboChartData[1].data = flightCountArray;
      this.arrivalOtpValue = (res.actual_opt);
      this.arrivalOtp = (this.arrivalOtpValue == null) ? 0 : this.arrivalOtpValue.toFixed(0);
      this.totalOtppercentage = (res.OTP).toFixed(0);
      this.totalFlightsDeparted = res.overAllFlights
      this.lineChartLabels = xaxisArray
    }, error => {
      console.log("error")
    });

  }

  //mat tab options  for selecting today and  tomorrow flights
  selectFlights(value) {
    if (value.index == 0) {
      this.flightPlace = value.index;
      this.flights = this.flightList.filter(
        flight => flight.flightType == 0 && flight.actualDepartureTime == null || flight.actualArrivalTime !== null && flight.actualDepartureTime == null);
      this.onGroundCount = this.flights.length;
    } else {
      this.flightPlace = value.index;
      this.flights = this.flightList.filter(
        flight => (flight.actualArrivalTime == null && (flight.flightType == 1 || flight.flightType == 2 || flight.flightType == 3)));
      this.yetToArriveCount = this.flights.length;
    }
    this.flights = this.appService.sortNumber(this.flights, 'standardArrivalTime');

  }


  //function  call for metar information
  metarData() {
    this.services.getAll(this.AppUrl.geturlfunction('GET_METAR') + this.currentStation.code).subscribe(res => {
      let data = res.data;
      if (data[0] != null) {
        this.metarDatas = data[0];
      }
    }, error => {
      console.log("error")
    });
  }

  //dialog box for metar modal
  popupMetar() {
    this.dialog.open(MetarModal, {
      width: '600px',
      panelClass: 'modelOpen',
      data: {
        metarAirPortTitle: this.metarDatas.airport,
        metarAirPortName: this.metarDatas.airport_name,
        metarCountryCode: this.metarDatas.countryCode,
        metarRAW: this.metarDatas.raw_metar
      }
    })
  }

  //function call for notam modal
  notamData() {
    this.services.getAll(this.AppUrl.geturlfunction('GET_NOTAM') + this.currentStation.code).subscribe(res => {
      let data = res.data;
      if (data[0] != null) {
        this.notamDatas = data[0];
      }
    })
  }


  //dialog box for notam modal
  notamDataPopup() {
    this.dialog.open(NotamModal, {
      width: '600px',
      panelClass: 'modelOpen',
      data: {
        id: this.notamDatas.id,
        msg: this.notamDatas.message,
        location: this.notamDatas.location,
        condition: this.notamDatas.Condition,
        SubArea: this.notamDatas.SubArea,
        Subject: this.notamDatas.Subject
      }
    });
  }


  //mat tab options for selecting actual and reported in delay categorization
  delayByActOrRep(param) {
    if (param.index == 0) {
      this.delayCats = this.delayCatsAct;
      this.delayCats.sort(function (a, b) {
        return a.seq - b.seq;
      });
      this.delayCats = this.appService.sortName(this.delayCats, 'category_department');
      this.dcDoughnut.labels = [];
      this.Doughnutss(this.delayCats);
    }
    else {
      this.delayCats = this.delayCatsRep;
      this.delayCats.sort(function (a, b) {
        return a.seq - b.seq;
      });
      this.delayCats = this.appService.sortName(this.delayCats, 'category_department');
      this.dcDoughnut.labels = [];
      this.Doughnutss(this.delayCats);
    }
  }

  //task delay category values set up  from api  response
  getTaskDelayCategory() {
    this.dcDoughnut.labels = [];
    let url = this.AppUrl.geturlfunction('TASKDELAY_Actual_DELAYDEPARTMENT_TASKBYCAT_ByReport_BY_STATION') + this.currentStation.id
    this.services.getAll(url).subscribe(res => {
      if (res.status == true) {
        this.delayCatsAct = res.actual;
        this.delayCatsRep = res.report;
        this.delayCats = this.delayCatsAct;
        this.delayCats = this.appService.sortName(this.delayCats, 'category_department');
        this.Doughnutss(this.delayCats);
      }
    }, error => {
      console.log("error")
    });
  }

  //donut chart values
  Doughnutss(value) {
    let array1 = [];
    let array2 = [];
    let filtered;
    for (var index = 0; index < value.length; index++) {
      var element = value[index];
      this.dcDoughnut.labels.push(element.category_department);
      array1.push(element.delay_percentage.toFixed(0));
    }
    filtered = array1.filter(val => val == 0);
    if (filtered.length == array1.length) {
      let val = ['No Data Found']
      this.dcDoughnut.labels.splice(0, 0, val);
      this.dcDoughnut.values = [100];
      this.dcDoughnut.colors[0].backgroundColor.splice(0, 0, '#eaeaea');
    }
    else {
      this.dcDoughnut.values = array1;
      if (this.dcDoughnut.colors[0].backgroundColor.length > 11) {
        this.dcDoughnut.colors[0].backgroundColor.shift();
        this.dcDoughnut.labels.shift();
      }
    }
  }

  //mqtt function  for  subscribe
  listenSocket() {
    let taskComplete = this.currentStation.code + this.AppUrl.getMqttTopic('TASK_COMPLETE');
    this.mqttService.observe(taskComplete, { qos: 1 }).subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
      let object = JSON.parse(this.message);
      console.log(object)
      this.setactualtiming(object, this.flightList, 'taskCompleted');
    })

    let etaChange = this.currentStation.code + this.AppUrl.getMqttTopic('ETA_ETD_CHANGE');
    this.mqttService.observe(etaChange, { qos: 1 }).subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
      let object = JSON.parse(this.message);
      this.setactualtiming(object, this.flightList, 'ETA ETD change');

    })

    let chockson = this.currentStation.code + this.AppUrl.getMqttTopic('CHOCKS_ON');
    this.mqttService.observe(chockson, { qos: 0 }).subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
      let object = JSON.parse(this.message);
      this.setactualtiming(object, this.flightList, 'CHOCKS ON');
      this.Otpchart();
      this.getTodayFlights("mqtt");
    })

    let webchockson = this.currentStation.code + this.AppUrl.getMqttTopic('WEB_CHOCKS_ON');
    this.mqttService.observe(webchockson, { qos: 0 }).subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
      let object = JSON.parse(this.message);
      this.setactualtiming(object, this.flightList, 'WEB CHOCKS ON');
      this.Otpchart();
      this.getTodayFlights("mqtt");
    })

    let webchocksoff = this.currentStation.code + this.AppUrl.getMqttTopic('WEB_CHOCKS_OFF');
    this.mqttService.observe(webchocksoff, { qos: 0 }).subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
      let object = JSON.parse(this.message);
      this.setactualtiming(object, this.flightList, 'WEB CHOCKS OFF');
      this.Otpchart();
    })

    let chocksoff = this.currentStation.code + this.AppUrl.getMqttTopic('CHOCKS_OFF');
    this.mqttService.observe(chocksoff, { qos: 0 }).subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
      let object = JSON.parse(this.message);
      this.setactualtiming(object, this.flightList, 'CHOCKS OFF');
      this.Otpchart();
    })
  }

  //subscribe for task completed count
  setactualtiming(arr, object, check) {
    for (let index = 0; index < object.length; index++) {
      let element = object[index];
      if (arr) {
        if (check == 'taskCompleted') {
          if (arr.data.flightSchedulesId == element.flightSchedulesId) {
            if (arr.data.taskCompletedCount) {
              element.taskCompletedCount = arr.data.taskCompletedCount;
              element.completed = arr.data.completed;
            }
            if (arr.data.taskName == "Chocks off") {
              this.getEfficiencyFactor();
              this.getTaskDelayCategory();
            }
          }
        }


        //subscribe for web chocks on
        if (check == 'WEB CHOCKS ON') {
          if (arr.flightSchedulesId == element.flightSchedulesId) {
            if (!element.actualArrivalTime) {
              element.actualArrivalTime = arr.actualStartTime;
            }
          }
        }


        //subscribe for web chocks off
        if (check == 'WEB CHOCKS OFF') {
          if (arr.flightSchedulesId == element.flightSchedulesId) {
            if (!element.actualDepartureTime) {
              element.actualDepartureTime = arr.actualEndTime;
              if (this.flightPlace == 0) {
                this.selectFlights({ index: 1 });
                this.selectFlights({ index: 0 });
              }
              else if (this.flightPlace == 1) {
                this.selectFlights({ index: 0 });
                this.selectFlights({ index: 1 });
              }
            }
          }
        }


        //subscribe for eta etd change
        if (check == 'ETA ETD change') {
          if (arr.id == element.flightSchedulesId) {
            element.bayCode = arr.bayObj.bayCode;
            element.bayType = arr.bayObj.bayType;
            if (arr.estimatedArrivalTime) {
              element.estimatedArrivalTime = arr.estimatedArrivalTime;
            }
            if (arr.estimatedDepartureTime) {
              element.estimatedDepartureTime = arr.estimatedDepartureTime;
            }
          }
        }


        //subscribe for chocks on
        if (check == 'CHOCKS ON') {
          if (arr.data.flightSchedulesId == element.flightSchedulesId) {
            if (arr.data.taskActualStartTime) {
              element.actualArrivalTime = arr.data.taskActualStartTime;
            }
          }
        }


        //subscribe for chocks off
        if (check == 'CHOCKS OFF') {
          if (arr.data.flightSchedulesId == element.flightSchedulesId) {
            if (arr.data.taskActualEndTime) {
              element.actualDepartureTime = arr.data.taskActualEndTime;
              if (this.flightPlace == 0) {
                this.selectFlights({ index: 1 });
                this.selectFlights({ index: 0 });
              }
              else if (this.flightPlace == 1) {
                this.selectFlights({ index: 0 });
                this.selectFlights({ index: 1 });
              }
            }
          }
        }

      }
    }
  }
  // ganttChart(data:any) {
  //   console.log(data);
  //   // this.router.navigate(['/station/flifo/gantt_chart/', this.details.flightID]); // navigation for the v1 gantt chart
  //   this.router.navigate(['/station/flifo/gantt_chart_v2/', data.flightSchedulesId]); //navigation for the v2 gantt chart
  // }
} 