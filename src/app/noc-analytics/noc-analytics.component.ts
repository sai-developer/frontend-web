import { Component, OnInit } from '@angular/core';
import { ApiService } from 'app/service/app.api-service';
import { AppService, AuthService } from 'app/service/app.service';
import { MatDialog } from '@angular/material';
import { MqttService } from 'ngx-mqtt';
import { CommonData } from 'app/service/common-data';
import * as moment from 'moment';
import { AppUrl } from '../service/app.url-service';
import * as momentzone from 'moment-timezone';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core'
import { MomentDateAdapter } from '@angular/material-moment-adapter';

// Inbuild Formats/Options for the Material date picker
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD MMM YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};


@Component({
  selector: 'app-noc-analytics',
  templateUrl: './noc-analytics.component.html',
  styleUrls: ['./noc-analytics.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})

export class NocAnalyticsComponent implements OnInit {
  filter = {
    to: momentzone().tz(this.auth.user.airport.timezone).endOf('day'),
    from: momentzone().tz(this.auth.user.airport.timezone).startOf('day').subtract(6, 'days')
  };
  currentStation: { "id": any; "code": any; "zone": any; };
  today = momentzone().tz(this.auth.user.airport.timezone);
  //common bar chart options
  barChartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      xAxes: [{
        gridLines: {
          color: 'rgba(0,0,0,0.02)',
          zeroLineColor: 'rgba(0,0,0,0.02)'
        },
        barPercentage: 1,
        ticks: {
          beginAtZero: true,
          fontColor: '#000000',
          fontSize: 12
        },
      }], yAxes: [{
        gridLines: {
          color: '#eaf0f4',
          zeroLineColor: '#eaf0f4'
        },
        barPercentage: 0.5,
        ticks: {
          beginAtZero: true,
          fontColor: '#1b55e2',
          suggestedMax: 100,
          fontSize: 12,
          stepSize: 25
        },
      }]
    },
    tooltips: {
      mode: 'index',
      axis: 'y'
    },
    hover: {
      mode: 'index'
    }
  };
  barChartLegend = false;
  barChartType = 'bar';
  arrBarChartColors = [{
    fontColor: "#f49a58",
    backgroundColor: "#f49a58",
    borderColor: '#f49a58',
    pointBackgroundColor: '#f49a58',
    pointBorderColor: '#f49a58',
    pointHoverBackgroundColor: '#f49a58',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  },
  {
    fontColor: "#51a3ed",
    backgroundColor: "#51a3ed",
    borderColor: '#51a3ed',
    pointBackgroundColor: '#51a3ed',
    pointBorderColor: '#51a3ed',
    pointHoverBackgroundColor: '#51a3ed',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  }
  ];

  barChartColors = [{
    fontColor: "#1b55e2",
    backgroundColor: "#1b55e2",
    borderColor: '#1b55e2',
    pointBackgroundColor: '#1b55e2',
    pointBorderColor: '#1b55e2',
    pointHoverBackgroundColor: '#1b55e2',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  },
  {
    fontColor: "#7821de",
    backgroundColor: "#7821de",
    borderColor: '#7821de',
    pointBackgroundColor: '#7821de',
    pointBorderColor: '#7821de',
    pointHoverBackgroundColor: '#7821de',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  },
  {
    fontColor: "#d62470",
    backgroundColor: "#d62470",
    borderColor: '#d62470',
    pointBackgroundColor: '#d62470',
    pointBorderColor: '#d62470',
    pointHoverBackgroundColor: '#d62470',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  }
  ];

  //common line chart options

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
    yAxisID: 'yAxes1',
    label: 'OTP',
    borderWidth: 1,
    type: 'line',
    fill: false
  },
  {
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
  },
  {
    data: [],
    yAxisID: 'yAxes2',
    label: 'Flights',
    borderWidth: 1,
    type: 'bar',
  },
  {
    data: [],
    yAxisID: 'yAxes2',
    label: 'Flights',
    borderWidth: 1,
    type: 'bar',
  }
  ];

  lineChartOptions = {
    tooltips: {
      mode: 'index',
      intersect: false,
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
          fontColor: '#21a1da'
        },
        ticks: {
          beginAtZero: true,
          suggestedMax: 100,
          fontColor: '#b186c8'
        },
        position: 'right'
      }
      ]
    }
  },
    this.lineChartOptions);

  departmentChartOptions: any = Object.assign({
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      xAxes: [{
        gridLines: {
          color: 'rgba(0,0,0,0.02)',
          zeroLineColor: 'rgba(0,0,0,0.02)'
        },
        barPercentage: 0.5,
        scaleLabel: {
          display: true,
          labelString: 'DEPARTMENT',
          fontColor: '#7f7f7f'
        },
        ticks: {
          autoSkip: false
        }
      }],
      yAxes: [{
        id: 'yAxes',
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
      }
      ]
    }
  }, this.lineChartOptions);


  lineChartLegend = false;

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
    fontColor: "#7821de",
    backgroundColor: '#7821de',
    borderColor: '#7821de',
    pointBackgroundColor: '#7821de',
    pointBorderColor: '#7821de',
    pointHoverBackgroundColor: '#7821de',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  },
  {
    fontColor: "#d62470",
    backgroundColor: '#d62470',
    borderColor: '#d62470',
    pointBackgroundColor: '#d62470',
    pointBorderColor: '#d62470',
    pointHoverBackgroundColor: '#d62470',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  },
  {
    backgroundColor: '#1b55e2',
    borderColor: '#1b55e2',
    pointBackgroundColor: '#1b55e2',
    pointBorderColor: '#1b55e2',
    pointHoverBackgroundColor: '#1b55e2',
    pointHoverBorderColor: 'rgba(77,83,96,1)'
  },
  {
    backgroundColor: '#7821de',
    borderColor: '#7821de',
    pointBackgroundColor: '#7821de',
    pointBorderColor: '#7821de',
    pointHoverBackgroundColor: '#7821de',
    pointHoverBorderColor: 'rgba(77,83,96,1)'
  },
  {
    backgroundColor: '#d62470',
    borderColor: '#d62470',
    pointBackgroundColor: '#d62470',
    pointBorderColor: '#d62470',
    pointHoverBackgroundColor: '#d62470',
    pointHoverBorderColor: 'rgba(77,83,96,1)'
  }
  ];

  public hzbarChartType = 'horizontalBar'
  lineChartType = 'line'





  lineChartsLabels: Array<any> = [];
  equipBarChartData = [
    { data: [], label: '' },
    { data: [], label: '' },
    { data: [], label: '' }
  ];
  barChartData = [
    { data: [], label: 'Arrival' },
    { data: [], label: 'Departure' }
  ];
  arrBarChartLabels = [];
  eqBarChartLabels = [];
  CombosChartData = [
    {
      data: [],
      label: '',
      lineTension: 0,
      fill: false
    },
    {
      data: [],
      label: '',
      lineTension: 0,
      fill: false
    },
    {
      data: [],
      label: '',
      lineTension: 0,
      fill: false
    }
  ];
  airportList: any;
  value: any;
  updateList: any;
  st: any;
  st1: any;
  st2: any;
  stId: any;
  st1Id: any;
  st2Id: any;
  stationOne: any = [];
  stationPer: any = [];
  lineChartLabels: Array<any> = [];
  zoneOffset: any;
  dupAirportList: any;
  airportList1: any;
  airportList2: any;
  constructor(private services: ApiService, private appService: AppService, private dialog: MatDialog, private AppUrl: AppUrl, private auth: AuthService, private mqttService: MqttService, private common: CommonData) {
    this.st = 'MAA';
    this.st1 = 'DEL';
    this.st2 = 'CCU';
    this.stId = 81;
    this.st1Id = 56;
    this.st2Id = 33;
    this.currentStation = { "id": this.auth.user.userAirportMappingList[0].id, "code": this.auth.user.userAirportMappingList[0].code, "zone": this.auth.user.airport.timezone }
    this.zoneOffset = this.auth.timeZone;
  }

  ngOnInit() {
    this.appService.search.next('FILTER');
    this.getAirportList();
    this.updateRange();

  }

  ngOnDestroy() {
    this.appService.search.next(' ');
  }


  getAirportList() {
    this.services.getAll(this.AppUrl.geturlfunction('AIRPORT_SERVICE')).subscribe(res => {
      this.dupAirportList = this.appService.sortName(res.data, 'code');
      this.airportList = this.dupAirportList.filter(value => ((value.id != this.st1Id) && (value.id != this.st2Id)));
      this.airportList1 = this.dupAirportList.filter(value => ((value.id != this.stId) && (value.id != this.st2Id)));
      this.airportList2 = this.dupAirportList.filter(value => ((value.id != this.st1Id) && (value.id != this.stId)));
    })
  }


  Otpchart() {
    this.services.create(this.AppUrl.geturlfunction('NOC_ANALYTICS_FLIGHT_OTP'), this.updateList).subscribe(res => {
      let value = [];
      value = res.data;
      this.ComboChartData[0].data = value[0].pec;
      this.ComboChartData[1].data = value[1].pec;
      this.ComboChartData[2].data = value[2].pec;
      this.ComboChartData[3].data = value[0].flight;
      this.ComboChartData[4].data = value[1].flight;
      this.ComboChartData[5].data = value[2].flight;
      this.lineChartLabels = ['00:00 - 06:00', '06:00 - 12:00', '12:00 - 18:00', '18:00 - 24:00'];
    }, error => {
      console.log("error")
    });
  }




  updateRange() {
    this.updateList =
      {
        "s1": this.stId,
        "s1_code": this.st,
        "s2": this.st1Id,
        "s2_code": this.st1,
        "s3": this.st2Id,
        "s3_code": this.st2,
        "from": momentzone(this.filter.from).tz(this.auth.user.airport.timezone).startOf('day').unix() * 1000,
        "to": momentzone(this.filter.to).tz(this.auth.user.airport.timezone).endOf('day').unix() * 1000
      }
    this.getTurnAroundOtp();
    this.getArrivalDeparture();
    this.getEquipmentOtp();
    this.getDepartmentOtp();
    this.Otpchart();
  }

  getTurnAroundOtp() {
    this.services.create(this.AppUrl.geturlfunction('NOC_ANALYTICS_TURNAROUND_OTP'), this.updateList).subscribe(res => {
      let station = [];
      let otp = [];
      for (let index = 0; index < res.data.length; index++) {
        const element = res.data[index];
        station.push(element.station);
        otp.push(element.otp[0].otp);
      }
      this.stationOne = station;
      this.stationPer = otp;
    })
  }


  getArrivalDeparture() {
    this.services.create(this.AppUrl.geturlfunction('NOC_ANALYTICS_ARRIVAL_DEP_OTP'), this.updateList).subscribe(res => {
      let arrivalLabel = [];
      let arrivalOtp = [];
      let departureOtp = [];
      for (let index = 0; index < res.data.length; index++) {
        const element = res.data[index];
        arrivalLabel.push(element.station)
        arrivalOtp.push(element.otp[0].a_otp)
        departureOtp.push(element.otp[0].d_otp)
      }
      this.arrBarChartLabels = arrivalLabel;
      this.barChartData[0].data = arrivalOtp;
      this.barChartData[1].data = departureOtp;
    })
  }


  getEquipmentOtp() {
    this.services.create(this.AppUrl.geturlfunction('NOC_ANALYTICS_EQUIPMENT_OTP'), this.updateList).subscribe(res => {
      let stationOne = res.data[0].otp;
      let stationTwo = res.data[1].otp;
      let stationThree = res.data[2].otp;
      let equipLabels = [];
      let oneData = [];
      let threeData = [];
      let twoData = [];

      for (let index = 0; index < stationOne.length; index++) {
        const element = stationOne[index];
        equipLabels.push(element.type)
        oneData.push(element.otp_p)
      }

      for (let index = 0; index < stationTwo.length; index++) {
        const element = stationTwo[index];
        twoData.push(element.otp_p)
      }

      for (let index = 0; index < stationThree.length; index++) {
        const element = stationThree[index];
        threeData.push(element.otp_p)
      }
      this.eqBarChartLabels = equipLabels;
      this.equipBarChartData[0].data = oneData;
      this.equipBarChartData[1].data = twoData;
      this.equipBarChartData[2].data = threeData;
      this.equipBarChartData[0].label = this.st;
      this.equipBarChartData[1].label = this.st1;
      this.equipBarChartData[2].label = this.st2;
    })
  }


  getDepartmentOtp() {
    this.services.create(this.AppUrl.geturlfunction('NOC_ANALYTICS_DEPARTMENT_OTP'), this.updateList).subscribe(res => {
      let stationOne = res.data[0].otp;
      let stationTwo = res.data[1].otp;
      let stationThree = res.data[2].otp;
      let departLabels = [];
      let oneData = [];
      let threeData = [];
      let twoData = [];

      for (let index = 0; index < stationOne.length; index++) {
        const element = stationOne[index];
        departLabels.push(element.name)
        oneData.push(element.otp_p)
      }

      for (let index = 0; index < stationTwo.length; index++) {
        const element = stationTwo[index];
        twoData.push(element.otp_p)
      }

      for (let index = 0; index < stationThree.length; index++) {
        const element = stationThree[index];
        threeData.push(element.otp_p)
      }
      this.lineChartsLabels = departLabels;
      this.CombosChartData[0].data = oneData;
      this.CombosChartData[1].data = twoData;
      this.CombosChartData[2].data = threeData;
      this.CombosChartData[0].label = this.st;
      this.CombosChartData[1].label = this.st1;
      this.CombosChartData[2].label = this.st2;

    })
  }


  stationChange(value, index) {
    let code, id;
    code = value;

    for (let index = 0; index < this.airportList.length; index++) {
      const element = this.airportList[index];
      if (element.code == code) {
        id = element.id;
      }
    }

    if (index == 1) {
      this.stId = id;
      this.st = value;
    } else if (index == 2) {
      this.st1 = value;
      this.st1Id = id;
    }
    else {
      this.st2 = value;
      this.st2Id = id;
    }

    this.airportList = this.dupAirportList.filter(value => ((value.id != this.st1Id) && (value.id != this.st2Id)));
    this.airportList1 = this.dupAirportList.filter(value => ((value.id != this.stId) && (value.id != this.st2Id)));
    this.airportList2 = this.dupAirportList.filter(value => ((value.id != this.st1Id) && (value.id != this.stId)));
  }

  daterange(date, value) {
    if (momentzone(this.filter.to).diff(this.filter.from, 'day') <= 1) {
      console.log("lesser")  
      this.filter.from = momentzone(this.filter.to).tz(this.auth.user.airport.timezone).startOf('day').subtract(6, 'days');
    }

    if (moment(this.filter.from).isSame(this.filter.to, 'day')) {
      console.log("same")
      this.filter.from = momentzone(this.filter.to).tz(this.auth.user.airport.timezone).startOf('day').subtract(6, 'days');
    }
  }

}
