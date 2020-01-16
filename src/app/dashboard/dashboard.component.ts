import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { AppUrl } from '../service/app.url-service';
import { ApiService } from '../service/app.api-service';
import { AuthService, AppService } from '../service/app.service'
import {
    IMqttMessage,
    MqttModule,
    IMqttServiceOptions,
    MqttService
} from 'ngx-mqtt';
import * as _ from 'underscore';
import { CommonData } from 'app/service/common-data';


@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

    // Shared chart options
    otpPercentageDecimal: any;
    globalChartOptions = {
        responsive: true,
        cutoutPercentage: 70,
        legend: {
            display: false,
            position: 'bottom'
        },
        tooltips: {
            mode: 'nearest',
            intersect: true,
            bodyFontSize: 10,
            xPadding: 6,
        }
    };
    stations: any[] = [];
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
                  if(title1 < 10)
                  {
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

    // Doughnut
    doughnutChartColors = [{
        backgroundColor: ['#6cc920', '#e94e2a']
    }];
    doughnutChartLabels = ['ON TIME PERFORMANCE', 'REPORTABLE DELAY'];
    doughnutChartData: number[] = [];
    doughnutChartType = 'doughnut';
    doughnutOptions: any = Object.assign({
        elements: {
            arc: {
                borderWidth: 0
            }
        }
    }, this.globalChartOptions);

    // Doughnut for Delay Catgory
    doughnutDelayChartColors = [{
        backgroundColor: ['#0c103d', '#006ddf', '#ed3f23', '#fbb216', '#86c43d', '#00b8a3', '#531b9b', '#7f154e', '#249d2d', '#e26262', '#999999']
    }];
    doughnutDelayChartLabels: any[] = [];
    doughnutDelayChartData: any[] = [];
    doughnutDelayChartType = 'doughnut';
    doughnutDelayOptions: any = Object.assign({
        elements: {
            arc: {
                borderWidth: 0
            }
        }
    }, this.globalChartOptions);

    // Combo Chart
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

    lineChartLabels: Array<any> = []
    lineChartLegend = true;
    barChartType = 'bar';

    //Otp  chart options
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
                    fontColor: '#21a1da'
                }
            }],
            yAxes: [{
                id: 'yAxes1',
                gridLines: {
                    color: 'rgba(0,0,0,0.02)',
                    zeroLineColor: 'rgba(0,0,0,0.02)'
                },
                ticks: {
                    beginAtZero: true,
                    suggestedMax: 100,
                    fontColor: '#21a1da',
                    stepSize: 20
                },
                scaleLabel: {
                    display: true,
                    labelString: 'OTP',
                    fontColor: '#21a1da'
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
                    suggestedMax: 100,
                    stepSize: 20,
                    fontColor: '#b186c8',
                },
                position: 'right'
            }
            ]
        }
    }, this.lineChartOptions);

    lat: any;
    lng: any;
    latitudes: any;
    longitudes: any;
    showRegion = false;
    zoom: any;
    fscdetails: any;
    markers: any[] = []
    delays = [];
    taskDelayDepartments: any[] = [];
    viewMode: any;
    regionList: any;
    stateid: any;
    regionOrstation: boolean;
    delayact: any = [];
    delaysrep: any = [];
    departEff: any = [];
    message: any;
    msg: any = [];
    data: any;
    flightPlace: any;
    flights: any;
    flightList: any;
    onGroundCount: any;
    yetToArriveCount: any;
    stationValue: any;
    icon: { url: any; scaledSize: { height: number; width: number; }; };
    previous: any;
    zoneOffset: any;
    constants: any;
    delayCount: any[];
    openedWindow: number = 0; // alternative: array of numbers

    constructor(private services: ApiService, private mqttService: MqttService, private appService: AppUrl, private appServices: AppService, private auth: AuthService,
        private common: CommonData) {
        this.zoneOffset = this.auth.timeZone;
    }

    ngOnInit() {
        this.previous = "";
        this.constants = this.common;
        this.stateid = "all";
        this.lat = 26.60912;
        this.lng = 70.5805858;
        this.zoom = 3;
        this.getRegionList();
        this.getFSCDashboardDetails("all", "");
        this.Otpchart("all", "");
        this.getDelayDepartment("all", "")
        this.getTaskDelayCategory("all", "", "0");
        this.getTodayFlights("all", "");
        this.listenSocket();
        this.appServices.search.next('FILTER');
    }

    ngOnDestroy() {
        this.appServices.search.next(' ');
    }

    //api  response for the list of regions
    getRegionList() {
        this.services.getAll(this.appService.geturlfunction('REGION_LIST')).subscribe(res => {
            // this.regionList = this.appServices.sortNumber(res.data, 'id');
            this.regionList = res.data;
            console.log(this.regionList)
        }, error => {
            console.log(error)
        });

    }

    //function call for  the mqtt subscriptions
    listenSocket() {
        //subscription for the entire task  complete topics across stations
        let taskComplete = "+" + this.appService.getMqttTopic('TASK_COMPLETE');
        this.mqttService.observe(taskComplete, { qos: 0 }).subscribe((message: IMqttMessage) => {
            this.message = message.payload.toString();
            this.msg = this.message;
            let object = JSON.parse(this.message);
            this.setactualtiming(object, this.flightList, "taskComplete");
        })

        let etaChange = "+" + this.appService.getMqttTopic('ETA_ETD_CHANGE');
        this.mqttService.observe(etaChange, { qos: 0 }).subscribe((message: IMqttMessage) => {
            this.message = message.payload.toString();
            let object = JSON.parse(this.message);
            this.setactualtiming(object, this.flightList, 'ETA ETD change');
        })
    }

    setactualtiming(object, arr, check) {
        if (object.data && check == "taskComplete") {
            console.log(object.data)
            if (object.data.taskName == "Chocks off") {
                if (this.regionOrstation == false) {
                    this.Otpchart(this.stateid, "");
                    this.getFSCDashboardDetails(this.stateid, "");
                    this.getDelayDepartment(this.stateid, "");
                    this.getTaskDelayCategory(this.stateid, "", "0");
                }
                else if (this.regionOrstation == true) {
                    this.getTaskDelayCategory(this.stateid, "station", "0");
                    this.getDelayDepartment(this.stateid, "station")
                    this.Otpchart(this.stateid, "station");
                    this.getFSCDashboardDetails(this.stateid, "station");
                }
                else {
                    this.getDelayDepartment("all", "");
                    this.getTaskDelayCategory("all", "", "0");
                    this.getFSCDashboardDetails("all", "");
                    this.Otpchart("all", "");
                }
            }

            if (object.data.taskName == "Chocks on") {
                if (this.regionOrstation == false) {
                    this.Otpchart(this.stateid, "");
                    this.getFSCDashboardDetails(this.stateid, "");
                }
                else if (this.regionOrstation == true) {
                    this.Otpchart(this.stateid, "station")
                    this.getFSCDashboardDetails(this.stateid, "station")
                }
                else {
                    this.getFSCDashboardDetails("all", "");
                    this.Otpchart("all", "");
                }
            }

            if (arr) {
                for (let index = 0; index < arr.length; index++) {
                    const element = arr[index];
                    if (object.data.flightSchedulesId == element.flightSchedulesId) {
                        if (object.data.taskCompletedCount) {
                            element.taskCompletedCount = object.data.taskCompletedCount;
                            element.completed = object.data.completed;
                        }

                        if (object.data.taskName == "Chocks on" && object.data.taskActualStartTime) {
                            element.actualArrivalTime = object.data.taskActualStartTime;
                            if (this.flightPlace == 0) {
                                this.selectFlights({ index: 1 });
                                this.selectFlights({ index: 0 });
                            }
                            else if (this.flightPlace == 1) {
                                this.selectFlights({ index: 0 });
                                this.selectFlights({ index: 1 });
                            }
                        }

                        if (object.data.taskName == "Chocks off" && object.data.taskActualEndTime) {
                            element.actualDepartureTime = object.data.taskActualEndTime;
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

        if (object && check == "ETA ETD change") {
            if (arr) {
                for (let index = 0; index < arr.length; index++) {
                    const element = arr[index];
                    if (object.id == element.flightSchedulesId) {
                        if (object.estimatedArrivalTime) {
                            element.estimatedArrivalTime = object.estimatedArrivalTime;
                        }
                        if (object.estimatedDepartureTime) {
                            element.estimatedDepartureTime = object.estimatedDepartureTime;
                        }
                    }
                }
            }

        }
    }



    //function to select region
    selectRegion(event) {
        this.previous = "";
        this.stationValue = event.tab.textLabel;
        this.showRegion = event.index > 0;
        let id;
        if (event.index == 0) {
            id = 'all';
            this.lat = 26.60912;
            this.lng = 70.5805858;
            this.zoom = 3;
        } else {
            let data = _.findLastIndex(this.regionList, {
                region_name: event.tab.textLabel
            });
            id = this.regionList[data].id;
            this.latitudes = this.regionList[data].latitude;
            this.longitudes = this.regionList[data].longitude;
            this.lat = parseInt(this.latitudes);
            this.lng = parseInt(this.longitudes);
            this.zoom = 3;
        }
        this.stateid = id;
        this.regionOrstation = false;
        this.getFSCDashboardDetails(id, "")
        this.Otpchart(id, "")
        this.getTaskDelayCategory(id, "", "0");
        this.getDelayDepartment(id, "")
        this.getTodayFlights(id, "")

    }

    //function call to  filter based on  stations
    stationBasedDetails(event) {
        this.stateid = event;
        this.regionOrstation = true;
        this.getFSCDashboardDetails(event, "station")
        this.Otpchart(event, "station")
        this.getTaskDelayCategory(event, "station", "0");
        this.getDelayDepartment(event, "station")
        this.getTodayFlights(event, "station")
        this.openWindow(event);
    }


    // getBackground(value: number): string {
    //     return 'linear-gradient(to bottom, #fff ' + (100 - value) + '%, #ff0000 ' + (value) + '%)';
    // }

    //function call for the otp percentage
    getFSCDashboardDetails(value, parm) {
        let url = (value === 'all') ? this.appService.geturlfunction('FSC_BY_ALL') + value : this.appService.geturlfunction('FSC_BY_REGION') + value;
        if (parm === "station") {
            url = this.appService.geturlfunction('FSC_BY_STATION') + value
        }
        this.services.getAll(url).subscribe(res => {
            this.fscdetails = res.data;
            this.fscdetails.ontime_percentage = Math.round(this.fscdetails.ontime_percentage);
            if (res.stations) {
                this.postionMapping(res.stations);
            }
            this.Doughnut(this.fscdetails, "fsc")
        }, error => {
            console.log(error)
        });
    }

    //function call for the mapping the positions in  map
    postionMapping(value) {
        console.log(value)
        this.markers = [];
        this.stations = [];
        for (var index = 0; index < value.length; index++) {
            var element = value[index];
            let obj = {
                id: element.station_id,
                lat: Number(element.lat),
                lng: Number(element.lng),
                label: element.code + ' - ' + element.name,
                otp: element.ontime_percentage,
                iconUrl: {
                    url: require('../../assets/images/dashboard/' + element.class + '.svg'),
                    scaledSize: {
                        height: 20,
                        width: 20
                    }
                }
            }

            let regionBasedStation = {
                id: element.station_id,
                name: element.code,
                percentage: element.ontime_percentage
            }

            this.markers.push(obj)
            this.stations.push(regionBasedStation)
        }
    }

    //function call for the data setup for  delay categorisation  chart
    Doughnut(value, param) {
        if (param == "delaychart" || "report") {
            let array1 = [];
            for (var index = 0; index < value.length; index++) {
                var element = value[index];
                this.doughnutDelayChartLabels.push(element.category_department);
                array1.push(element.delay_percentage.toFixed(0));
                this.doughnutDelayChartData = array1;
                this.delayCount = array1.filter(
                    count => count !== "0");
            }
        }
        if (param == "fsc") {
            this.doughnutChartData = [value.ontime_percentage.toFixed(0), value.delay_percentage.toFixed(0)]
        }
    }


    //function  call for the fsc details based upon the clicked station on  map


    clickedMarker(label: string, index: number) {
        this.stateid = label;
        // if (this.previous) {
        //      this.previous.close();
        //  }
        //  this.previous = label;
        this.regionOrstation = true;
        this.getFSCDashboardDetails(label, "station")
        this.Otpchart(label, "station")
        this.getTaskDelayCategory(label, "station", "0")
        this.getDelayDepartment(label, "station")
        this.getTodayFlights(label, "station")
        this.openWindow(label);

    }
    onMouseOver(infoWindow, gm, label: string,) {
        this.stateid = label;
        infoWindow.open();
        this.openWindow(this.stateid);
        // if (gm.lastOpen != null)  {
        //     gm.lastOpen.close();
        //     //this.previous.close();
        //     }
        gm.lastOpen = infoWindow;
    }

    onMouseOut(infoWindow, gm) {
        //infoWindow.close();
        gm.lastOpen = infoWindow;
        infoWindow.close();
    }
    //function call for the ontime percentage chart for station, region  and all
    Otpchart(value, parm) {
        let url;
        url = value === 'all' ? this.appService.geturlfunction('FSC_OTP_BY_ALL') + value : this.appService.geturlfunction('FSC_OTP_BY_REGION') + value;
        if (parm === "station") {
            url = this.appService.geturlfunction('FSC_OTP_BY_STATION') + value
        }
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
                xaxisArray.push(this.appService.getHrs(element.time, this.auth.user.airport.timezone));
            }
            this.ComboChartData[0].data = otpArray;
            this.ComboChartData[1].data = flightCountArray;
            this.lineChartLabels = xaxisArray;
        }, error => {
            console.log(error)
        });

    }

    //api response call for the delay  categorisation chart
    getTaskDelayCategory(value, parm, param) {
        let url;
        url = value === 'all' ? this.appService.geturlfunction('TASKDELAY_Actual_DELAYDEPARTMENT_TASKBYCAT_ByReport_BY_ALL') + value : this.appService.geturlfunction('TASKDELAY_Actual_DELAYDEPARTMENT_TASKBYCAT_ByReport_BY_REGION') + value;
        if (parm === "station") {
            url = this.appService.geturlfunction('TASKDELAY_Actual_DELAYDEPARTMENT_TASKBYCAT_ByReport_BY_STATION') + value
        }
        this.services.getAll(url).subscribe(res => {
            if (res.status == true) {
                this.delayact = res.actual;
                this.delaysrep = res.report;
            }
            if (param === "0") {
                this.delays = this.delayact;
                this.delays = this.appServices.sortName(this.delays, 'category_department');
                this.Doughnut(this.delays, "delaychart")
            }
            else if (param === '1') {
                this.delays = this.delaysrep;
                this.delays = this.appServices.sortName(this.delays, 'category_department');
                this.Doughnut(this.delays, "report")
            }


        }
            , error => {
                console.log(error)
            });
    }

    //api response call for the delay  departments chart
    getDelayDepartment(value, parm) {
        let url;
        url = value === 'all' ? this.appService.geturlfunction('FSC_DELAYDEPARTMENT_BY_ALL') + value : this.appService.geturlfunction('FSC_DELAYDEPARTMENT_BY_REGION') + value;
        if (parm === "station") {
            url = this.appService.geturlfunction('FSC_DELAYDEPARTMENT_BY_STATION') + value
        }
        this.services.getAll(url).subscribe(res => {
            this.taskDelayDepartments = this.appServices.sortName(res.data, 'name');
        }, error => {
            console.log(error)
        });
    }

    //function call for the delay  category value changes based on actual  and reported
    onValChange(event, state, checkFlag) {
        if (state == "all" && event == "reported") {
            this.getTaskDelayCategory("all", "", "1");
        }
        else if (state == "all" && event == "actual") {
            this.getTaskDelayCategory("all", "", "0");
        } else if (state !== "all" && event == "reported" && checkFlag == true) {
            this.getTaskDelayCategory(state, "", "1");
        } else if (state !== "all" && event == "actual" && checkFlag == true) {
            this.getTaskDelayCategory(state, "station", "0");
        }
        else if (state !== "all" && event == "reported" && checkFlag == false) {
            this.getTaskDelayCategory(state, "", "1");
        } else if (state !== "all" && event == "actual" && checkFlag == false) {
            this.getTaskDelayCategory(state, "", "0");
        }
    }

    //mat tab function to  select onground and yet to arrive flights
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
        this.flights = this.appServices.sortNumber(this.flights, 'actualArrivalTime');

    }
    //flight list ==> today and next day list filters
    getTodayFlights(value, parm) {
        let url = (value === 'all') ? this.appService.geturlfunction('FSC_FLIGHTS_BY_ALL') + value : this.appService.geturlfunction('FSC_FLIGHTS_BY_REGION') + value;
        if (parm === "station") {
            url = this.appService.geturlfunction('FSC_FLIGHTS_BY_STATION') + value
        }
        this.services.getAll(url).subscribe(res => {
            // this.flights = res.data.filter(
            //     flight => flight.bayType !== null);
            this.flightList = res.data;
            this.selectFlights({ index: 1 });
            this.selectFlights({ index: 0 });
        }, error => {
            console.log("error")
        });
    }

    /** Clear the previously opened info windows */
    openWindow(id) {
     this.openedWindow = id; // alternative: push to array of numbers
     }

    isInfoWindowOpen(id)
     {
        return this.openedWindow == id;     // alternative: check if id is in array
    }

}

