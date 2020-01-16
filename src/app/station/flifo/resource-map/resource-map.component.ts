import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../service/app.api-service';
import { AppUrl } from '../../../service/app.url-service';
import { AppService, AuthService } from '../../../service/app.service';
import * as _ from 'underscore';
import * as moment from 'moment-timezone';
import { CookieService } from 'ngx-cookie-service';



export interface List {
  name: string;
  role: string;
  location: string;
  pin1: number;
  pin2: number;
}

@Component({
  selector: 'app-resource-map',
  templateUrl: './resource-map.component.html',
  styleUrls: ['./resource-map.component.scss']
})
export class ResourceMapComponent implements OnInit {
  load: Boolean = false;
  viewType: String = 'GRID_VIEW';
  currentStation: any;
  assignedUsers: any = [];
  liveUsers: any = [];
  userTimeZone: any;
  timer = 0;
  displayTimer = 60;
  staffListCounter = 0;
  actionSubscription: any;
  noRecord: Boolean;
  showTable: Boolean;

  constructor(private cookieService: CookieService, private services: ApiService, private appUrl: AppUrl, private auth: AuthService, private appService: AppService) {
    // current station id,code, location ID
    this.currentStation = {
      'id': this.auth.user.userAirportMappingList[0].id,
      'userId': this.auth.user.id, 'code': this.auth.user.userAirportMappingList[0].code
    };
  }

  ngOnInit() {
    this.getStaffList();
    const user = this.cookieService.get('user');
    const userJson = user ? JSON.parse(user) : {};
    this.userTimeZone = userJson.airport.timezone;
    this.appService.addBtn.next(true);
    this.subscribeActions();
    this.appService.state.next('REFRESH');
    this.appService.search.next('FILTER');
  }

  // subscribe action from station layout to staff location page
  subscribeActions() {
    this.actionSubscription = this.appService.action.subscribe((action) => {
      // REFRESH subscribe action to load the getstafflistby station api 
      if (action === 'REFRESH') {
        this.getStaffList()
      }
      // GRID & LIST subscribe action to show grid and list view of staff location But as of now only list view is used.
      if (action === 'GRID_VIEW' || action === 'LIST_VIEW') {
        this.viewType = action;
      }
    });
  }

  ngOnDestroy() {
    this.appService.addBtn.next(false);
    this.actionSubscription.unsubscribe();
    this.appService.search.next(' ');
  }

  // timer function that is running on TOP-RIGHT in our application
  startPolling() {
    const _self = this;
    this.timer = 0;
    setInterval(() => {
      if (_self.timer === 30) {
        _self.timer = 0;
        // console.log('refreshing...' + _self.timer);
        this.getStaffList();
      }
      _self.timer++;
      _self.displayTimer = 30 - _self.timer;
      // console.log('running...' + _self.timer);
    }, 1000);
  }

  getStaffList() {
    this.services.getAll(this.appUrl.geturlfunction('GET_STAFF_LOCATION')).subscribe(users => {
      console.log('Printing users');
      console.log(users);
      console.log(users.data);
      this.liveUsers = users.data;

      // if there is no user then no data image or text is displayed (INPROGRESS)
      if (this.liveUsers.length == 0) {
        this.noRecord = true;
        this.showTable = false;
      } else {
        this.noRecord = false;
        this.showTable = true;
      }
      let liveUsers = this.liveUsers;
      let liveUsersCopy = [];
      for (let index = 0; index < liveUsers.length; index++) {
        const element = liveUsers[index];
        element.state = (element.status == 1) ? 'ACTIVE' : 'INACTIVE';
        element.latitude = parseFloat(element.latitude);
        element.longitude = parseFloat(element.longitude);
        liveUsersCopy.push(element);
      }

      this.liveUsers = liveUsersCopy;
      console.log('after edit');
      console.log(this.liveUsers);


    })
  }
  //get stafflist by station API 
  getStaffListOld() {
    this.load = true;
    this.noRecord = false;
    let allUsers = [];
    const userId = [];

    // get staff list by station api along with latitude and longitude of users
    this.services.getAll(this.appUrl.geturlfunction('GET_STAFF_BY_STATION') + this.currentStation.code).subscribe(users => {
      allUsers = users.data;
      for (let index = 0; index < users.data.length; index++) {
        const element = users.data[index];
        userId.push(element.id);
      }
      const ids = userId.toString();
      let assignedUser = [];
      let assignedTasks = [];

      // get task schedule tes mapping mobile by user id API is called for users performing current task for the particular flights assigned to him
      this.services.getAll(this.appUrl.geturlfunction('GET_TASK_SCHEDULE_ALL_RESOUCE') + ids).subscribe(resource => {
        assignedTasks = resource.data;
        for (let index = 0; index < resource.data.length; index++) {
          const element = resource.data[index];
          assignedUser.push(element.userId);
        }
        assignedUser = _.uniq(assignedUser);
        this.assignedUsers = [];
        for (let index = 0; index < assignedUser.length; index++) {
          const element = assignedUser[index];
          const userIndex = _.findLastIndex(allUsers, {
            id: element
          });
          const userData = allUsers[userIndex];
          userData.completed = 0;
          userData.assigned = 0;
          this.assignedUsers.push(userData);
        }

        for (let index = 0; index < assignedTasks.length; index++) {
          const element = assignedTasks[index];
          const userIndex = _.findLastIndex(this.assignedUsers, { id: element.userId });
          if (element.taskActualEndTime != null) {
            this.assignedUsers[userIndex].completed = this.assignedUsers[userIndex].completed + 1;
          }
          this.assignedUsers[userIndex].assigned = this.assignedUsers[userIndex].assigned + 1;
        }

        /// if assigned user is perfoming any particular task, his exact location(LAT & LONG), current time, last seen status can be calculated.
        const tempAssignedUser = [];
        for (let index = 0; index < this.assignedUsers.length; index++) {
          const element = this.assignedUsers[index];
          element.latitude = parseFloat(element.latitude);
          element.longitude = parseFloat(element.longitude);
          const currentTime = moment().tz(this.userTimeZone);
          const lastSeenTime = moment(element.last_seen).tz(this.userTimeZone);
          element.last_seen = moment(element.last_seen).tz(this.userTimeZone).format('DD MMM YYYY HH:mm:ss');
          const difference = currentTime.diff(lastSeenTime, 'minutes');

          // if the user is not active for more than 30 minutes, the status change option
          if (difference > 30) {
            element.status = 'INACTIVE';
          } else {
            element.status = 'ACTIVE';
          }
          element.difference = currentTime.diff(lastSeenTime, 'minutes');
          tempAssignedUser.push(element);
        }
        this.load = false;

        if (this.staffListCounter === 0) {
          this.startPolling();
        }
        this.staffListCounter++;

        // if there is no user then no data image or text is displayed (INPROGRESS)
        if (assignedUser.length === 0) {
          this.noRecord = true;
          this.showTable = false;
        } else {
          this.noRecord = false;
          this.showTable = true;
        }

      });
    });
    // this.load = false;
  }
}



          //  const currentTime = moment().tz(this.userTimeZone);
          //  const lastSeenTime = moment(element.last_seen).tz(this.userTimeZone);
          //  element.last_seen = moment(element.last_seen).tz(this.userTimeZone).format('DD MMM YYYY HH:mm:ss');
          //  const difference = currentTime.diff(lastSeenTime, 'minutes');

          //  if the user is not active for more than 30 minutes, the status change option
          //  if (element.status > 30) {
          //    element.status = 'INACTIVE';
          //  } else {
          //    element.status = 'ACTIVE';
          //  }