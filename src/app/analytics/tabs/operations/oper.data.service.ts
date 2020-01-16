import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from '@env/environment';

import * as _ from 'lodash';

import { GlobalDataService } from '../../global.data.service';

const routes = {
  equipStats: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/oper-equip-stats-data`,
  flightsOTP: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/oper-flight-delay-data`,
  taskDepDelay: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/oper-task-dep-delay-data`,
  delayCat: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/oper-delay-cat-data`,
  taskOT: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/oper-task-ot-data`

  /*equipStats: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/oper-equip-stats-data/${period}`,
  flightsOTP: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/oper-flight-delay-data/${period}`,
  taskDepDelay: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/oper-task-dep-delay-data/${period}`,
  delayCat: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/oper-delay-cat-data/${period}`,
  taskOT: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/oper-task-ot-data/${period}`*/
};

export interface ReportPeriod {
  // The report's period: '24 Hrs', '48 Hrs'...
  period: string;
}

@Injectable()
export class OperDataService {
  constructor(private httpClient: HttpClient, private globalDataService: GlobalDataService) {}

  getEquipStatsData(context: ReportPeriod): Observable<any> {
    return (
      this.httpClient
        //.cache()
        //.get(routes.equipStats(context));
        .post(routes.equipStats(context), this.globalDataService.filterParams)
    );
  }

  getFlightsOTPData(context: ReportPeriod): Observable<any> {
    return (
      this.httpClient
        //.cache()
        //.get(routes.flightsOTP(context));
        .post(routes.flightsOTP(context), this.globalDataService.filterParams)
    );
  }

  getTaskDepDelayData(context: ReportPeriod): Observable<any> {
    return (
      this.httpClient
        //.cache()
        //.get(routes.taskDepDelay(context));
        .post(routes.taskDepDelay(context), this.globalDataService.filterParams)
    );
  }

  getDelayCatData(context: ReportPeriod): Observable<any> {
    return (
      this.httpClient
        //.cache()
        //.get(routes.delayCat(context));
        .post(routes.delayCat(context), this.globalDataService.filterParams)
    );
  }

  getTaskOTData(context: ReportPeriod): Observable<any> {
    return (
      this.httpClient
        //.cache()
        //.get(routes.taskOT(context));
        .post(routes.taskOT(context), this.globalDataService.filterParams)
    );
  }
}
