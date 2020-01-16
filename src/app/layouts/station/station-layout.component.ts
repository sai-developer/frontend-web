import { Component, OnInit, OnDestroy, ViewChild, EventEmitter, HostListener, Inject, Output } from '@angular/core';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { DOCUMENT } from '@angular/platform-browser';
import { HorizontalMenuItems } from '../../shared/menu-items/horizontal-menu-items';
import { Subscription } from 'rxjs';
import { interval } from 'rxjs';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { CookieService } from 'ngx-cookie-service';
import { UploadOutput, UploadInput, UploadFile, humanizeBytes, UploaderOptions } from 'ngx-uploader';
import { ToastrService, GlobalConfig } from 'ngx-toastr';

import { Menu, MenuItems } from "../../shared/menu-items/menu-items";
import { AppService, AuthService, TaskService } from "../../service/app.service";
import { AppRoutingService } from "../../service/app.service";
import { AppUrl } from "../../service/app.url-service";
import { ToastComponent } from "../../toast/toast.component";
import { FormBuilder, FormGroup } from '@angular/forms';
import { EquipmentList } from '../../station/master/tasks/task/aircraft-master.class';
import { ApiService } from '../../service/app.api-service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import * as momentzone from 'moment-timezone';
import * as _ from 'underscore';
import { CommonData } from '../../service/common-data';
import { MatBottomSheet } from '@angular/material';
import { FinalApproachComponent } from '../station/final-approach/final-approach.component';
import {
  IMqttMessage,
  MqttModule,
  IMqttServiceOptions,
  MqttService
} from 'ngx-mqtt';

declare const window: any;

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
  selector: 'app-layout',
  templateUrl: './station-layout.component.html',
  styleUrls: ['./station-layout.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],

  // MENU Animation comments

  // animations: [
  //   trigger('MainNavAnimation',
  //     [
  //       state('* <=> station/dashboard, * <=> station/master, * <=> station/roster, * <=> station/fifo, * <=> station/reports', style({ transform: 'translateX(0)' })),
  //       transition(':enter', [
  //         style({ transform: 'translateX(-100%)', transition: 'all 3s' }),
  //         animate('0.5s 300ms ease-out')
  //       ]),
  //       // transition(':leave', [
  //       //   style({ transform: 'translateX(-100%)' }),
  //       //   animate('0.5s 300ms ease-out')
  //       // ])
  //     ]
  //   ),
  //   trigger('childNavAnimation',
  //     [
  //       state('* <=> *', style({ transform: 'translateY(0)', zIndex: -1 })),
  //       transition(':enter', [
  //         style({ transform: 'translateX(-100%)', zIndex: -1 }),
  //         animate('0.5s 300ms ease-in-out')
  //       ]),
  //       // transition(':leave', [
  //       //   style({ transform: 'translateY(0%)' }),
  //       //   animate('0.3s 300ms ease-out')
  //       // ])
  //     ]
  //   )]
})
export class StationLayoutComponent implements OnInit, OnDestroy {

  private _router: Subscription;

  filter = {
    from: momentzone().tz(this.authService.user.airport.timezone).startOf('day').toDate(),
    toshow: momentzone().tz(this.authService.user.airport.timezone).startOf('day').add(15, 'days').toDate(),
    to: momentzone().tz(this.authService.user.airport.timezone).startOf('day').add(15, 'days').toDate()
  };

  options: FormGroup;
  menuItems: Menu[] = [];
  curMenuItems: Menu[] = [];
  url: string;
  showSettings = false;
  dark: boolean;
  boxed: boolean;
  collapseSidebar: boolean;
  compactSidebar: boolean;
  sidebarBg: boolean = true;
  currentLang = 'en';
  layoutDir = 'ltr';
  equipments: EquipmentList[] = [];
  selectedList: any = {};
  selList: any;
  element: any;

  menuLayout: any = 'top-menu';
  selectedSidebarImage: any = 'bg-1';
  selectedSidebarColor: any = 'sidebar-default';
  selectedHeaderColor: any = 'header-light-black';
  collapsedClass: any = 'side-panel-opened';

  addBtn: boolean = false;
  layoutConfig: any = {
    tools: []
  };

  toasterOptions: GlobalConfig;
  uploadInput: EventEmitter<UploadInput>;
  files: UploadFile[] = [];
  timer: any = {};
  currentStation: any;
  userInfo: any;
  viewTemplate: boolean = false;
  roster: any = {};
  shiftsByDesign: any[] = [];
  shifts: any[] = [];
  designations = [];
  flag: any;

  lastScrollTop = 0;
  st = 0;

  maxdatevalue = momentzone().tz(this.authService.user.airport.timezone).startOf('day').add(15, 'days').toDate();
  constants: any;
  flightType: any;
  bayType: any;
  message: any;

  // It will be moved App Constants

  @ViewChild('sidemenu') sidemenu;
  public config: PerfectScrollbarConfigInterface = {};
  disableAdd: boolean;
  defaultUser: string;
  searchText: string;
  searchSubscription: Subscription;
  searchEnd: boolean;
  disabledSubscription: Subscription;
  bayList: any;
  bay: any;
  flok: any;
  dlok: any;
  showDetails: boolean;
  bayNumberList: any;
  bayNumber: string;
  fBay: any;
  pageAirprt: any;
  noRecord: boolean;
  stopLeft: any;
  stopRight: any;
  setClicked: boolean;
  isAirportViewPage: boolean = false;
  fixedPosition: boolean;
  fixedPositionGantt: boolean;
  fixedPositionFsc: boolean;
  tz: any;

  constructor(private router: Router,
    public horizontalMenuItems: HorizontalMenuItems,
    public translate: TranslateService,
    private appService: AppService,
    private services: ApiService,
    public authService: AuthService,
    private routerService: AppRoutingService,
    private cookieService: CookieService,
    private toastr: ToastrService,
    private AppUrl: AppUrl,
    private mqttService: MqttService,
    private taskService: TaskService,
    fb: FormBuilder,
    private bottomSheet: MatBottomSheet,
    private common: CommonData) {
    const browserLang: string = translate.getBrowserLang();
    translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
    this.options = fb.group({
      floatLabel: 'never',
    });

    router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        if (this.router.url === '/station/flifo/airport_view') {

          this.isAirportViewPage = true;
        }
      }

      if (e instanceof NavigationEnd) {
        if (this.router.url == "/station/master/aircraft") {
          // this.searchText = "VT-"
          this.searchText = ""
        }
        else {
          this.searchText = ''
        }
        if (this.router.url.startsWith('/station/analytics-dashboard')) {
          this.appService.search.next('FILTER');
        }
        else {
          this.appService.search.next(' ');
        }
      }

      if (e instanceof NavigationStart) {
        this.isAirportViewPage = false;
        this.setClicked = true;
        setTimeout(() => {
          this.setClicked = false;
        }, 1000);
      }
    });
  }
  stateSubscription: any;
  setView: any;
  pageStatus: any;
  pageState: Boolean = false;

  //Initialisaton
  ngOnInit() {
    this.constants = this.common;
    this.flightType = this.constants.flightType;
    this.router.events.subscribe((val) => {
      this.noRecord = false;
    });
    this.bayType = this.appService.toTitleCaseArray(this.constants.bayType, 'type');
    this.userInfo = this.authService.user;
    this.currentStation = this.userInfo.userAirportMappingList[0];
    this.tz = this.authService.user.airport.timezone
    this.defaultUser = this.common.defaultUser;
    this.setMenuItems();
    this.subscribeAddBtn();
    this.getLayoutConfig();
    this.getCurrentMenuItems();
    this.subRouterEvents();
    this.subscribeTimer('init');
    this.getEquipmentList();
    this.getbayRefresh();
    this.subscribeActions();
    this.subETAaction();
    this.flag = 0;
    this.toasterOptions = this.toastr.toastrConfig;
    this.uploadInput = new EventEmitter<UploadInput>();
    this.setView = this.appService.getcookie('userView') ? this.appService.getcookie('userView') : 'LIST_VIEW'
    this.disableAdd = false;
    interval(120000).subscribe(x => {
      this.subscribeTimer('change');
    });

  }
  //to change hover style while vertically move over the modal
  @HostListener('window:scroll', ['$event'])
  onWindowScroll(e) {
    // for live status page
    const container: any = document.getElementById('bayAllocation');
    const taskList: HTMLElement | null = container ? container.querySelectorAll('.vis-panel.vis-top')[0] : null;
    const currentTime: HTMLElement | null = container ? container.querySelectorAll('.vis-current-time')[0] : null;

    // for gantt page
    const ganttChart: any = document.getElementById('ganttChart');
    const ganttList: HTMLElement | null = ganttChart ? ganttChart.querySelectorAll('.vis-panel.vis-top')[0] : null;

    // for fsc live page
    const fscLive: any = document.getElementById('mytimeline');
    const fscLiveStatus: HTMLElement | null = fscLive ? fscLive.querySelectorAll('.vis-panel.vis-top')[0] : null;

    var navbarHeight = e.target.scrollHeight;
    var ch = e.target.clientHeight;
    let element = document.getElementById('navbar');
    let element1 = document.getElementById('navbar1');
    this.st = e.target.scrollTop;
    let user = this.authService.user;
    let role = user.userRoleMasterList && user.userRoleMasterList[0] && user.userRoleMasterList[0].name ? user.userRoleMasterList[0].name.toUpperCase() : 'ADMIN';

    if (role === this.defaultUser) {
      let elementdata = document.getElementById('fscClass');
      if (this.st > this.lastScrollTop) {
        elementdata.classList.add('dashboardMaxHeight');
      } else {
        elementdata.classList.remove('dashboardMaxHeight');
      }
    }

    if (this.st === 0) {
      element.classList.add('header-down');
      element1.classList.remove('header-down');
      element.classList.remove('header-up');
      this.flag = 0;
    } else if (Math.round(this.st + ch) === e.target.scrollHeight) {
      element.classList.remove('header-down');
      element1.classList.add('header-down');
      element.classList.add('header-up');
      this.flag = 1;
    } else if (this.st > this.lastScrollTop) {
      element.classList.remove('header-down');
      element1.classList.add('header-down');
      element.classList.add('header-up');
      this.flag = 1;
    } else {
      if ((navbarHeight) > (this.st + ch)) {
        element.classList.add('header-down');
        element1.classList.remove('header-down');
        element.classList.remove('header-up');
        this.flag = 0;
      }
    }

    this.lastScrollTop = this.st;
    this.lastScrollTop = this.st;
    if (taskList != null) {
      if (this.flag === 0) {
        //taskList.classList.remove('task-fixed');
        //currentTime.classList.remove('fixed-time'); // to hide the cuurent time comment this
        // taskList.classList.add('set-top-scroll-down');
        // taskList.classList.remove('set-top-scroll-up');
        if (this.fixedPosition === true) {
          taskList.classList.remove('set-top-scroll-up');
          taskList.classList.add('set-top-scroll-down');
        }
        // if (this.fixedPosition === true && taskList.getBoundingClientRect().top === 70) {
        //   taskList.classList.remove('set-top-scroll-up');
        //   taskList.classList.remove('set-top-scroll-down');
        //   taskList.classList.remove('task-fixed');
        // }
      } else if (taskList.getBoundingClientRect().top < 38 || this.fixedPosition === true) {
        this.fixedPosition = true;
        taskList.classList.add('task-fixed');
        taskList.classList.add('set-top-scroll-up');
        taskList.classList.remove('set-top-scroll-down');
        //currentTime.classList.add('fixed-time'); // to hide the cuurent time comment this

        // const container: any = document.getElementById('bayAllocation');
        // const currentTime: HTMLElement | null = container ? container.querySelectorAll('.vis-current-time')[0] : null;
        // // On Current Time, to remove the "Current time" text
        // const titleArr: string[] = currentTime.title.split(',');
        // currentTime.title = titleArr[1].concat(titleArr[2]);
      }
      if (this.st < 37 && this.fixedPosition === true && this.flag === 0) {
        this.fixedPosition = false;
        taskList.classList.remove('task-fixed');
        taskList.classList.remove('set-top-scroll-up');
        taskList.classList.remove('set-top-scroll-down');
      }
    }
    // for gantt page
    if (ganttList != null) {
      if (this.flag === 0) {
        if (this.fixedPositionGantt === true) {
          ganttList.classList.remove('scroll-up-gannt');
          ganttList.classList.add('scroll-down-gannt');
        }
      } else if (ganttList.getBoundingClientRect().top < 46 || this.fixedPositionGantt === true) {
        this.fixedPositionGantt = true;
        ganttList.classList.add('gantt-fixed');
        ganttList.classList.add('scroll-up-gannt');
        ganttList.classList.remove('scroll-down-gannt');
      }
      if (this.st < 40 && this.fixedPositionGantt === true && this.flag === 0) {
        this.fixedPositionGantt = false;
        ganttList.classList.remove('gantt-fixed');
        ganttList.classList.remove('scroll-up-gannt');
        ganttList.classList.remove('scroll-down-gannt');
      }
    }

    // for fsc Live status page
    if (fscLiveStatus != null) {
      if (this.flag === 0) {
        if (this.fixedPositionFsc === true) {
          fscLiveStatus.classList.remove('scroll-up-fsc');
          fscLiveStatus.classList.add('scroll-down-fsc');
        }
      } else if (fscLiveStatus.getBoundingClientRect().top < 35 || this.fixedPositionFsc === true) {
        this.fixedPositionFsc = true;
        fscLiveStatus.classList.add('fsc-fixed');
        fscLiveStatus.classList.add('scroll-up-fsc');
        fscLiveStatus.classList.remove('scroll-down-fsc');
      }
      if (this.st < 240 && this.fixedPositionFsc === true && this.flag === 0) {
        this.fixedPositionFsc = false;
        fscLiveStatus.classList.remove('fsc-fixed');
        fscLiveStatus.classList.remove('scroll-up-fsc');
        fscLiveStatus.classList.remove('scroll-down-fsc');
      }
    }
  }

  //function call for  the subscriptions events
  subscribeActions() {
    this.stateSubscription = this.appService.state.subscribe((action) => {
      this.setView = this.appService.getcookie('userView') ? this.appService.getcookie('userView') : 'LIST_VIEW'
      console.log('inside the subscribe', action);
      let obj = {
        action: this.setView,
        active: true
      };
      if (action == 'TIMELINE') {
        console.log('inside the timline subscriber function', obj);
        obj.active = false;
      }
      this.footerClick(obj);
    });

    this.disabledSubscription = this.appService.disable.subscribe((value) => {
      if (value === 'DISABLE-ADD') {
        this.disableAdd = true;
      }
      else {
        this.disableAdd = false;
      }

    })

    this.searchSubscription = this.appService.search.subscribe((value) => {
      if (value == 'FILTER') {
        this.searchEnd = true;
      }
      else {
        this.searchEnd = false;
      }
    });

    this.pageStatus = this.appService.data.subscribe((action) => {
      if (action === 'GANTT') {
        this.pageState = true;
      } else if (action !== 'GANTT') {
        this.pageState = false;
      }
    });

    this.pageAirprt = this.appService.airport.subscribe((action) => {
      if (action === 'AIRPORT') {
        this.pageState = true;
      } else if (action !== 'AIRPORT') {
        this.pageState = false;
      }
    })

    this.appService.nodata.subscribe((value) => {
      if (value === 'NODATA') {
        this.noRecord = true;
      }
      else {
        this.noRecord = false;
      }
    })

    this.appService.reset.subscribe((value) => {
      if (value === 'RESET') {
        this.subscribeTimer('change');
      }
    })


    // for Airport View
    this.appService.callbay.subscribe((value) => {
      if (value === 'CALLBAY') {
        this.getBayNumber();
      }
    })
    this.appService.map.subscribe((value) => {
      if (value === 'MAP') {
        this.getBayNumber();
        this.showDetails = false;
      }
      else {
        this.getBayNumber();
      }
    })

    this.movementAction = this.appService.track.subscribe((action) => {
      if (action == 'left') {
        this.stopLeft = true;
        this.stopRight = false;
      } else if (action == 'right') {
        this.stopLeft = false;
        this.stopRight = true;
      }
      if (action == '') {
        this.stopLeft = false;
        this.stopRight = false;
      }
      console.log(action);
    });
  }
  movementAction: any;


  ngOnDestroy() {
    this.movementAction.unsubscribe();
  }


  //api response to get timezone
  subscribeTimer(value) {
    const url = this.AppUrl.geturlfunction('GET_TIME_BY_ZONE');
    this.services.getAll(url).subscribe(res => {
      localStorage.setItem('userTime', res.datetime.toString());
      if (value == 'init') {
        console.log("do nothing")
      }
      else {
        this.appService.userTimeData = '';
      }
    }, error => {
      this.subscribeTimer('change')
      console.log('error')
    });

    this.appService.timer.subscribe(timer => {
      this.timer = timer;
    })

  }

  //function call to open final  approach bottomsheet
  openBottomSheet(fNumber) {
    this.bottomSheet.open(FinalApproachComponent, {
      data: {
        flightNumber: fNumber
      }
    });
  }
  //mqttt subscription for the era cron topic
  subETAaction() {
    let mqttTopic = this.currentStation.code + this.AppUrl.getMqttTopic('ETACRON');

    this.mqttService.observe(mqttTopic).subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
      let object = JSON.parse(this.message);
      if (object.flightNumber) {

        if (this.router.url !== '/auth/login') {
          this.openBottomSheet(object.flightNumber)
        }
        let obj = {}
        this.mqttService.unsafePublish(mqttTopic, JSON.stringify(obj), { qos: 0, retain: false });
      }
    })
  }

  //function  call for changing menu layouts based on routes
  subRouterEvents() {
    this.router.events.subscribe((route) => {
      if (route instanceof NavigationEnd) {
        this.getLayoutConfig();
        this.getCurrentMenuItems();
        this.getbayRefresh();
      }
    });
  }

  getLayoutConfig() {
    let routeConfig = this.routerService.getRouteData();
    this.layoutConfig = routeConfig.layout ? routeConfig.layout : { tools: [] };
  }

  getCurrentMenuItems() {
    this.curMenuItems = this.menuItems.filter(menuItem => {
      let state = '/' + menuItem.state;
      return (menuItem.type === 'link' && state === this.router.url) || (menuItem.type === 'sub' && this.router.url.indexOf(state) === 0);
    });
  }
  //subscription for the add button from master modules
  subscribeAddBtn() {
    this.appService.addBtn.subscribe((value) => {
      this.addBtn = value;
    });
  }

  //function call for the sub menu items
  setMenuItems() {
    const user = this.authService.user;
    const role = user.userRoleMasterList && user.userRoleMasterList[0] &&
      user.userRoleMasterList[0].name ? user.userRoleMasterList[0].name.toUpperCase() : 'ADMIN';
    if (role === 'ADMIN' || role === 'SECURITY SUPERVISOR' || role === 'DUTY MANAGER') {
      this.menuItems = [
        {
          state: 'station/dashboard',
          name: 'DASHBOARD',
          type: 'link',
          icon: 'dashboard'
        },
        {
          state: 'station/master',
          name: 'MASTER DATA',
          type: 'sub',
          icon: 'table_chart',
          children: [
            {
              state: 'flight-schedule',
              name: 'FLIGHT SCHEDULE',
            },

            {
              state: 'task',
              name: 'TASK INFO'
            },
            {
              state: 'delay_mapping',
              name: 'DELAY CODE MAPPING',
            },
            {
              state: 'bay',
              name: this.constants.bayTitle + ' INFO',
            },
            {
              state: 'aircraft',
              name: 'AIRCRAFT'
            }

            // {
            //   state: 'contracts',
            //   name: 'CONTRACTS'
            // }
          ]
        },
        {
          state: 'station/roster',
          name: 'STAFF ROSTER',
          type: 'sub',
          icon: 'contacts',
          children: [
            // {
            //   state: 'rostering',
            //   name: 'VIA FILE'
            // },
            {
              state: 'staff',
              name: 'STAFF MANAGEMENT',
            },
            {
              state: 'shift',
              name: 'SHIFT MANAGEMENT',
            },
            // {
            //   state: 'density',
            //   name: 'SCHEDULE DENSITY',
            // },
            {
              state: 'rosteringview',
              name: 'ROSTER'
            },
            {
              state: 'dailyroster',
              name: 'DAILY ROSTER'
            }
          ]
        },
        // {
        //   state: 'station/shift_assign',
        //   name: 'Shift Management',
        //   type: 'link',
        //   icon: 'equalizer'
        // },
        {
          state: 'station/flifo',
          name: 'DAY of OPS',
          type: 'sub',
          icon: 'flight_takeoff',
          children: [
            {
              state: 'live_status',
              name: 'LIVE STATUS'
            },
            {
              state: 'bay',
              name: this.constants.bayTitle + ' ALLOCATION'
            },
            {
              state: 'matrix',
              name: 'CONSOLIDATED VIEW'
            },
            {
              state: 'resource_map',
              name: 'STAFF LOCATION'
            },
            {
              state: 'airport_view',
              name: 'AIRPORT VIEW'
            }
            // {
            //   state: 'billing',
            //   name: 'HANDLING FORMS'
            // }

            // {
            // state:'task_assignment',
            // name:'TASK ASSIGNMENT'
            // },
            // {
            //   state:'gantt_chart',
            //   name:'GANTT CHART'
            // }
          ]
        },
        {
          state: 'station/reports',
          name: 'REPORTS',
          type: 'sub',
          icon: 'pie_chart',
          children: [
            {
              state: 'ddr',
              name: 'DDR',
            },
            {
              state: 'summary',
              name: 'TASK SUMMARY',
            },
            {
              state: 'fuel',
              name: 'FLIGHT SUMMARY',
            },
            {
              state: 'daily-status',
              name: 'CONSOLIDATED MATRIX',
            }
          ]
        },
        {
          state: 'station/rapid-analytics',
          name: 'ANALYTICS',
          type: 'sub',
          icon: 'tab',
          children: [
            {
              state: 'otp',
              name: 'OTP',
            },
            {
              state: 'turn-around',
              name: 'TURNAROUND',
            },
            {
              state: 'delay',
              name: 'DELAY',
            }
          ]
        },
        // {
        //   state: 'station/bill',
        //   name: 'BILLING',
        //   type: 'sub',
        //   icon: 'receipt',
        //   children: [
        //     {
        //       state: 'billing',
        //       name: 'HANDLING FORMS'
        //     },
        //     {
        //       state: 'contracts',
        //       name: 'CONTRACTS'
        //     }
        //   ]
        // },
        // {
        //   state: 'station/analytics',
        //   name: 'ANALYTICS',
        //   type: 'link',
        //   icon: 'dashboard'
        // },        
        {
          state: 'station/analytics-dashboard',
          name: 'INSIGHTS',
          type: 'sub',
          icon: 'assessment',
          children: [
            {
              state: 'analytics-perf-summary',
              name: 'PERFORMANCE SUMMARY'
            },
            {
              state: 'analytics-obd-analysis',
              name: 'OBD ANALYSIS'
            },
            {
              state: 'analytics-oper-summary',
              name: 'OPERATIONS SUMMARY'
            },
            {
              state: 'analytics-grnd-summary',
              name: 'GROUND SUMMARY'
            }
          ]
        },
        // {
        //   state: 'station/live/status',
        //   name: 'LIVE STATUS',
        //   type: 'link',
        //   icon: 'format_line_spacing'
        // }
      ];
    }
    if (role == this.defaultUser) {
      this.menuItems = [
        // {
        //   state: 'fsc/dashboard',
        //   name: 'DASHBOARD',
        //   type: 'link',
        //   icon: 'home'
        // },
        // {
        //   state: 'fsc/flight_status',
        //   name: 'FLIGHT STATUS',
        //   type: 'link',
        //   icon: 'flight_takeoff'
        // }
        {
          state: 'fsc',
          name: 'CONTROL CENTER',
          type: 'sub',
          icon: 'home',
          children: [
            {
              state: 'dashboard',
              name: 'DASHBOARD',
            },
            {
              state: 'live_status',
              name: 'LIVE STATUS',
            },
            {
              state: 'check_status',
              name: 'CHECK STATUS',
            },
            {
              state: 'noc_analytics',
              name: 'NOC ANALYTICS',
            }
          ]
        }
        // ,
        // {
        //   state: 'station/analytics-dashboard',
        //   name: 'ANALYTICS',
        //   type: 'sub',
        //   icon: 'assessment',
        //   children: [
        //     {
        //       state: 'analytics-perf-summary',
        //       name: 'PERFORMANCE SUMMARY'
        //     },
        //     {
        //       state: 'analytics-obd-analysis',
        //       name: 'OBD ANALYSIS'
        //     },
        //     {
        //       state: 'analytics-oper-summary',
        //       name: 'OPERATIONS SUMMARY'
        //     },
        //     {
        //       state: 'analytics-grnd-summary',
        //       name: 'GROUND SUMMARY'
        //     }
        //   ]
        // },
      ];
    }
  }

  //function call for mayfly upload from flight status page
  onUploadOutput(output: UploadOutput): void {
    console.log(output.type);
    switch (output.type) {
      case 'allAddedToQueue':
        if (!this.isValidFile()) {
          this.uploadInput.emit({ type: 'removeAll' });
          return;
        }
        const event: UploadInput = {
          type: 'uploadAll',
          url: this.AppUrl.geturlfunction('UPLOAD_MAYFLY'),
          method: 'POST',
          data: {}
        };
        console.log('Emittedone');
        this.uploadInput.emit(event);
        break;

      case 'addedToQueue':
        this.files.push(output.file);
        break;

      case 'removedAll':
        this.files = [];
        break;

      case 'done':
        this.uploadInput.emit({ type: 'removeAll' });
        this.appService.toast('', 'Mayfly uploaded successfully', 'success', 'success-mode');
        this.appService.clear.next('CLEAR');
        break;

      default:
        console.log('File Event ==> ', output.type);
    }

  }

  //function call to check valid format for  may fly upload
  isValidFile() {
    let extensions = ['xlx', 'xlsx'];
    for (let i = 0; i < this.files.length; i++) {
      let names = this.files[i].name.split('.');
      if (extensions.indexOf(names[names.length - 1]) === -1) {
        return false;
      }
    }
    return true;

  }

  selectedValue() {
    return this.selectedList;
  }

  //function call for the footer options to be triggered while click
  footerClick(tool: any) {
    this.selectedValue();
    switch (tool.action) {
      case 'PRINT':
        break;
      case 'LIST_VIEW':
        if (tool.active || !tool.active) {
          this.deactivateTool('GRID_VIEW');
          this.appService.setCookie('userView', 'LIST_VIEW');
        }
        this.appService.action.next('LIST_VIEW');
        break;
      case 'GRID_VIEW':
        if (tool.active || !tool.active) {
          this.deactivateTool('LIST_VIEW');
          console.log('grid');
          this.appService.setCookie('userView', 'GRID_VIEW');
        }
        this.appService.action.next('GRID_VIEW');
        break;
      case 'ADD':
        if (this.disableAdd === false) {
          this.appService.action.next('ADD');
        }
        break;
      case 'BAY':
        this.appService.action.next('BAY');
        break;
      case 'FLIGHT_TYPE':
        this.taskService.setCombo(this.selectedList);
        break;
      case 'BAY_TYPE':
        this.taskService.setCombo(this.selectedList);
        break;
      case 'EQUIPMENT_TYPE':
        this.taskService.setCombo(this.selectedList);
        break;
      case 'TIMELINE':
        this.appService.action.next('TIMELINE');
        tool.active = false
        break;
    }
  }

  //function call for the search text from station to other components
  filterSearch() {
    this.appService.filter.next(this.searchText);
    this.router.events.subscribe((val) => {
      this.searchText = '';
    });
  }


  //api call for getting list of equipments for task component
  getEquipmentList() {
    this.services.getAll(this.AppUrl.geturlfunction('EQUIPMENT_TYPE_SERVICE')).subscribe(res => {
      let equipment = new EquipmentList({});
      this.equipments = equipment.set(res.data);
      this.selectedList.flightType = 0;
      this.selectedList.bayType = 0;
      this.selectedList.equipmentTypeId = 1;
      this.modifiedList(this.selList, '');
    }, error => {

    });
  }

  //function call for selecting modified list for task components
  modifiedList(selectedList, data) {
    this.selList = selectedList;
    this.appService.action.next('EQUIPMENT_TYPE');
    this.appService.action.next('BAY_TYPE');
    this.appService.action.next('FLIGHT_TYPE');
  }

  //Airport view station Layout Start
  // function call to reset bay number and also for filter
  getbayRefresh() {
    if (this.router.url == '/station/flifo/airport_view') {
      this.getBayNumber();
      this.bayNumber = '';
      this.showDetails = false;
    }
  }
  // GET API call to load list the flight details on select input
  getBayNumber() {
    this.services.getAll(this.AppUrl.geturlfunction('FLIGHTS_BY_FROM_TO_UTC_FILTERED')).subscribe(res => {
      this.bayNumberList = res.data;
    })
  }
  // function call to change select option (flight details)
  modifiedBayList(bay) {
    if (bay === 0) {
      console.log("Bay value 0")
      this.showDetails = false;
      this.appService.bay.next(bay);
    } else {
      this.showDetails = true;
      console.log(this.bayNumberList);
      this.bay = this.bayNumberList.filter(
        number => number.bayId === bay);
      console.log(this.bay);
      this.fBay = this.bay[0].bayCode
      this.dlok = this.bay[0].destinationAirportCode;
      this.flok = this.bay[0].originAirportCode;
      this.appService.bay.next(bay);
    }
  }
  // event trigger for airport view component - color logic
  taskDelay() {
    this.appService.delay.next("DELAY");
  }
  allTask() {
    this.appService.delay.next("ALL")
  }
  taskAmber() {
    this.appService.delay.next("AMBER")
  }

  //Airport view Station Layout Ends
  // function call to display active/deactivate component 
  deactivateTool(action) {
    console.log('action called', action)
    for (let i = 0; i < this.layoutConfig.tools.length; i++) {
      if (this.layoutConfig.tools[i].action === action) {
        this.layoutConfig.tools[i].active = false;
      } else {
        this.layoutConfig.tools[i].active = true;
      }
    }
  }

  move(data) {
    this.appService.data.next(data);
  }

}
