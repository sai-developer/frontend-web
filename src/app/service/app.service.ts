import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRouteSnapshot, Router, CanActivate, RouterStateSnapshot } from '@angular/router';
import { MatDialog } from "@angular/material";
import * as moment from 'moment-timezone';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from "./app.api-service";
import { AppMessages } from '../service/app.messages';
import { AppUrl } from "./app.url-service";
import * as _ from 'underscore';
import { ToastrService, GlobalConfig } from 'ngx-toastr';
import { ToastComponent } from '../toast/toast.component';
import { CommonData } from './common-data';
import { Observable } from 'rxjs/Observable';
import { interval } from 'rxjs';
import { UserIdleService } from 'angular-user-idle';

@Injectable()
export class AppService {
  public addBtn = new Subject<boolean>();
  public uploadBtn = new Subject<boolean>();
  public action = new Subject<string>();
  public state = new Subject<string>();
  public clear = new Subject<string>();
  public bay = new Subject<string>();
  public map = new Subject<string>();
  public delay = new Subject<string>();
  public data = new Subject<string>();
  public filter = new Subject<string>();
  public search = new Subject<string>();
  public airport = new Subject<string>();
  public nodata = new Subject<string>();
  public callbay = new Subject<string>();
  public disable = new Subject<string>();
  public reset = new Subject<string>();
  public timer: Subject<any> = new Subject<any>();
  public track = new Subject<string>();
  public station_data = new Subject<string>();
  public counter: any;
  public userTimeData = '';
  // par:any;
  // public actionList=this.selectedValue(this.par);
  tz: string;
  value: any;
  public toasterOptions: GlobalConfig;

  constructor(private cookieService: CookieService, private toastr: ToastrService, private messages: AppMessages, private userIdle: UserIdleService) {
    let user = this.cookieService.get('user');
    let userJson = user ? JSON.parse(user) : {};
    this.toasterOptions = this.toastr.toastrConfig;
    if (user) {
      this.setTimeZone(userJson.airport.timezone);
    }
    this.counter = 0;


    //Start watching for user inactivity.
    this.userIdle.startWatching();
    // Start watching when user idle is starting.
    this.userIdle.onTimerStart().subscribe(count => {
    });
    // Start watch when time is up.
    this.userIdle.onTimeout().subscribe(() => {
      this.reset.next('RESET');
      this.restart();
    })

    this.asyncObservable().subscribe(data => {
      this.timer.next({
        tz: this.tz,
        local: moment(data).tz(this.tz).format(),
        utc: moment(data).tz(this.tz).utc().format(),
        zoneOffset: moment(data).tz(this.tz).format('Z')
      });
    })

  }


  restart() {
    this.userIdle.resetTimer();
  }


  setTimeZone(tz: string) {
    this.tz = tz;
  }
  // Function to Sort Alphabets
  sortName(data, key) {
    data.sort(function (a, b) {
      const nameA = a[key].toLowerCase(), nameB = b[key].toLowerCase()
      if (nameA < nameB)
        return -1
      if (nameA > nameB)
        return 1
      return 0
    });
    return data;
  }
  // Function to Sort Numbers
  sortNumber(data, key) {
    data = data.sort(function (a, b) {
      return +(a[key] - b[key]);
    });
    return data;
  }

  getHoursMin(timePermillisecond) {
    let hhmm;
    if (!!timePermillisecond) {
      hhmm = moment.unix(timePermillisecond / 1000).format("HH:mm")
      return hhmm;
    }
  }

  // Function to Sort Alpha Numerics
  sortAlphaNumeric(data, key) {
    // data = data.sort(function(a, b) {
    //   return a[key] - b[key];
    // });
    // return data;
    data = _.sortBy(data, key);
    return data;
  }
  // Function to Get & Set Cookie
  setCookie(key, value) {
    localStorage.setItem(key, value);
  }
  getcookie(key) {
    return localStorage.getItem(key);
  }

  toTitleCase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  toTitleCaseArray(array, key) {
    const arr = [];
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      const value = { id: element.id, type: element[key].charAt(0).toUpperCase() + element[key].slice(1).toLowerCase() }
      arr.push(value);
    }
    return arr;
  }
  // Function to decode frequency for flight schedules
  decodeFrequency(frequency: any) {
    let freqInString = [
      // { id: 127, name: 'Daily', flag: '' },
      { id: 1, name: 'S', flag: false },
      { id: 2, name: 'M', flag: false },
      { id: 4, name: 'T', flag: false },
      { id: 8, name: 'W', flag: false },
      { id: 16, name: 'T', flag: false },
      { id: 32, name: 'F', flag: false },
      { id: 64, name: 'S', flag: false },
    ];
    if (frequency == 127) {
      freqInString = [
        { id: 1, name: 'S', flag: true },
        { id: 2, name: 'M', flag: true },
        { id: 4, name: 'T', flag: true },
        { id: 8, name: 'W', flag: true },
        { id: 16, name: 'T', flag: true },
        { id: 32, name: 'F', flag: true },
        { id: 64, name: 'S', flag: true },
      ];
    }
    else {
      if ((frequency & 1) > 0) {
        // freqInString.push( { id: 1, name: 'S', flag: false });
        freqInString[0] = { id: 1, name: 'S', flag: true }
      }
      if ((frequency & 2) > 0) {
        // freqInString.push( { id: 2, name: 'M', flag: false })
        freqInString[1] = { id: 2, name: 'M', flag: true }
      }
      if ((frequency & 4) > 0) {
        // freqInString.push( { id: 4, name: 'T', flag: false })
        freqInString[2] = { id: 4, name: 'T', flag: true }
      }
      if ((frequency & 8) > 0) {
        // freqInString.push( { id: 8, name: 'W', flag: false })
        freqInString[3] = { id: 8, name: 'W', flag: true }
      }
      if ((frequency & 16) > 0) {
        // freqInString.push( { id: 16, name: 'T', flag: false })
        freqInString[4] = { id: 16, name: 'T', flag: true }
      }
      if ((frequency & 32) > 0) {
        // freqInString.push( { id: 32, name: 'F', flag: false })
        freqInString[5] = { id: 32, name: 'F', flag: true }
      }
      if ((frequency & 64) > 0) {
        // freqInString.push( { id: 64, name: 'S', flag: false })
        freqInString[6] = { id: 64, name: 'S', flag: true }
      }
    }
    return freqInString;
  }

  // setTimer() {
  //   let time;
  //  // this.counter++
  //   const _self = this;
  //   setInterval(function () {
  //     if (_self.tz) {
  //       // Check if local storage is set
  //       // Check if _self.userTimeData is not empty
  //       // then increase timer
  //       if(localStorage.getItem("userTime") != null){
  //         if(_self.userTimeData==''){
  //           _self.userTimeData = localStorage.getItem('userTime');
  //         }

  //         else {
  //         time = _self.userTimeData;
  //       let d = moment(time).tz(_self.tz).add(1, 'seconds').format();
  //       _self.userTimeData = d;
  //       // localStorage.setItem('userTime', _self.userTimeData.toString());
  //       _self.timer.next({
  //         tz: _self.tz,
  //         local: moment(d).tz(_self.tz).format(),
  //         utc: moment(d).tz(_self.tz).utc().format(),
  //         zoneOffset: moment(d).tz(_self.tz).format('Z')
  //       });
  //     }
  //       }
  //   }
  //   }, 1000);
  // }

  asyncObservable() {
    return new Observable(observer => {
      setInterval(() => {
        let time;
        const _self = this;
        if (_self.tz) {
          // Check if local storage is set
          // Check if _self.userTimeData is not empty
          // then increase timer
          if (localStorage.getItem("userTime") != null) {
            if (_self.userTimeData == '') {
              _self.userTimeData = localStorage.getItem('userTime');
            }
            else {
              time = _self.userTimeData;
              let d = moment(time).tz(_self.tz).add(1, 'seconds').format();
              _self.userTimeData = d;
              localStorage.setItem('userTime', _self.userTimeData.toString());
              observer.next(d);
            }
          }
        }
      }, 1000)
    })
  }


  showToast(message, data, state) {
    let msg = '';
    if (data === 'custom') {
      msg = message;
    } else {
      msg = this.messages.getMessage(message, data);
    }
    let toastState;
    if (state === 'warning') {
      toastState = { 'state': 'warning', 'mode': 'warning-mode' };
    } else {
      toastState = { 'state': 'success', 'mode': 'success-mode' };
    }
    this.toast('', msg, toastState.state, toastState.mode);
  }

  toast(title, msg, type = '', tClass = '') {
    this.toasterOptions.toastComponent = ToastComponent;
    this.toasterOptions.toastClass = tClass;
    this.toasterOptions.positionClass = 'toast-bottom-full-width';
    this.toasterOptions.closeButton = true;
    this.toasterOptions.extendedTimeOut = 3000;
    this.toasterOptions.maxOpened = 1;
    this.toasterOptions.autoDismiss = true;
    this.toastr.show(title, msg, this.toasterOptions, type);
  }
}

@Injectable()
export class AppRoutingService {

  constructor(private router: Router) { }

  getRouteData(): any {
    const root = this.router.routerState.snapshot.root;
    return this.lastChild(root).data;
  }

  private lastChild(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    if (route.firstChild) {
      return this.lastChild(route.firstChild);
    } else {
      return route;
    }
  }
}

@Injectable()
export class AuthService {

  user: any;
  timeZone: any;

  constructor(private router: Router, private apiServices: ApiService, private cookieService: CookieService, private appService: AppService, private common: CommonData) { }

  setUser(user) {
    this.user = user;
    this.timeZone = moment().tz(user.airport.timezone).format('Z');
    this.appService.setTimeZone(this.user.airport.timezone);
    //this.appUrl.getTimeZone()
    console.log(this.user)
  }

  removeUser() {
    this.user = null;
  }

  navigateUser() {
    if (this.user.userRoleMasterList && this.user.userRoleMasterList[0]) {
      switch (this.user.userRoleMasterList[0].name.toUpperCase()) {
        case 'ADMIN':
          this.router.navigate(['/station/dashboard']);
          break;
        case 'DUTY MANAGER':
          this.router.navigate(['/station/dashboard']);
          break;
        case 'SECURITY SUPERVISOR':
          this.router.navigate(['/station/dashboard']);
          break;
        case this.common.defaultUser:
          this.router.navigate(['/fsc/dashboard']);
          break;
      }
    }
  }

  logout(): void {
    this.user = null;
    this.cookieService.deleteAll();
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }
}

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private cookieService: CookieService, private authService: AuthService, private apiServices: ApiService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    //TODO: This block has to be enabled when authorization enable at the backend
    // let token = this.cookieService.get('token');
    // if (!token) {
    //   this.router.navigate(['/auth/login']);
    //   return false;
    // }
    if (this.authService.user) {
      return true;
    }

    this.router.navigate(['/auth/login']);
    return false;

    //TODO: This block has to be enabled when authorization enable at the backend
    /*this.apiServices.getAll(AppUrl.LOGIN_USER).subscribe(res => {
      if(!res.status){
        return false;
      }
      this.cookieService.set('token', res.data.token);
      this.authService.setUser(res.data);
      return true;
    }, error => {
      console.log("error")
    });*/

  }
}

@Injectable({ providedIn: 'root' })
export class NoAuthGuard implements CanActivate {

  constructor(private router: Router, private cookieService: CookieService, private authService: AuthService, private apiServices: ApiService) {

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let _self = this;
    if (this.authService.user) {
      this.authService.navigateUser();
      return false;
    }
    return true;
  }
}

@Injectable()
export class TaskService {
  combo = { flightType: 1, bayType: 1, equipmentTypeId: 1 };
  modCombo: any;
  constructor(private router: Router) { }
  setCombo(combo) {
    console.log(combo)
    this.combo = combo;
  }

  getCombo() {
    return this.combo
  }
}
