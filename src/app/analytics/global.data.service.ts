import { Injectable } from '@angular/core';

import { Observable, BehaviorSubject, of } from 'rxjs';

import * as moment from 'moment';

 

//import { Logger } from './logger.service';

 

//const log = new Logger('GlobalDataService');

 

@Injectable()

export class GlobalDataService {

  defaultPeriod: any;

  private currPeriod: BehaviorSubject<any> = new BehaviorSubject('');

  filter: any;

 

  constructor() {

    this.defaultPeriod = { name: 'All', value: 0 };

  }

 

  /**

   * Initializes Global Data for the application.

   * @param defaultPeriod The default report period to use.

   */

  init(defaultPeriod: string) {

    this.defaultPeriod = defaultPeriod;

  }

 

  /**

   * Sets the current language.

   * Note: The current language is saved to the local storage.

   * If no parameter is specified, the language is loaded from local storage (if present).

   * @param language The IETF language code to set.

   */

  set period(period: any) {

    //log.debug(`Period set to ${period}`);

    this.defaultPeriod = period;

    this.currPeriod = period;

    console.log(period);

    console.log(period.value);

  }

 

  /**

   * Gets the current period.

   * @return The current period.

   */

  get period(): any {

    return this.defaultPeriod;

  }

 

  currentPeriod(): Observable<any> {

    return this.currPeriod;

  }

 

  setFilter(filter: any) {

    this.filter = filter;

  }

 

  getFilter(): any {

    return this.filter;

  }

 

  get station(): any {

    return localStorage.getItem('analyticsParams')

      ? JSON.parse(localStorage.getItem('analyticsParams')).station : 'all';

  }

 

  get filterParams(): any {

    // if(this.filter.from == null){

    //   this.filter.from=moment().subtract(1, 'months').format();

    // }

    var x ;

    if (this.period.value == 0) {

      x = {

        station: this.station == undefined || this.station.toString().toLowerCase() == 'all' ? -1 : this.station,

        period: -1,

        from: '2019-08-01 05:30:00',

        to: '2019-09-15 23:59:59'

      }

    }

    else {

      x = {

        station: this.station == undefined || this.station.toString().toLowerCase() == 'all' ? -1 : this.station,

        period: this.period.value,

        from: this.filter.from,

        to: this.filter.to

      }

    }

    let filter = x;

    return filter;

  }

}

 