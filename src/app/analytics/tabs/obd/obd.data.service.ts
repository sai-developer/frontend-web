import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from '@env/environment';

import * as _ from 'lodash';

import { GlobalDataService } from '../../global.data.service';

const routes = {
  /*obdBayDep: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/obd-bay-dep-data/${period}`,
  obdFlightTypeArr: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/obd-flytype-arr-data/${period}`,
  obdFlightTypeDep: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/obd-flytype-dep-data/${period}`,
  obdTimeDep: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/obd-time-dep-data/${period}`,
  obdDayDep: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/obd-day-dep-data/${period}`,
  obdWeekDep: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/obd-week-dep-data/${period}`,
  obdFlight: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/obd-flights-data/${period}`,*/

  obdBayDep: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/obd-bay-dep-data/`,
  obdFlightTypeArr: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/obd-flytype-arr-data`,
  obdFlightTypeDep: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/obd-flytype-dep-data`,
  obdTimeDep: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/obd-time-dep-data`,
  obdDayDep: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/obd-day-dep-data`,
  obdWeekDep: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/obd-week-dep-data`,
  obdFlight: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/obd-flights-data`
};

export interface ReportPeriod {
  // The report's period: '24 Hrs', '48 Hrs'...
  period: string;
}

@Injectable()
export class OBDDataService {
  constructor(private httpClient: HttpClient, private globalDataService: GlobalDataService) {}

  getOBDBayDepData(context: ReportPeriod): Observable<any> {
    return (
      this.httpClient
        //.cache()
        //.get(routes.obdBayDep(context));
        .post(routes.obdBayDep(context), this.globalDataService.filterParams)
    );
  }

  getOBDFlightTypeArrData(context: ReportPeriod): Observable<any> {
    return (
      this.httpClient
        //.cache()
        //.get(routes.obdFlightTypeArr(context));
        .post(routes.obdFlightTypeArr(context), this.globalDataService.filterParams)
    );
  }

  getOBDFlightTypeDepData(context: ReportPeriod): Observable<any> {
    return (
      this.httpClient
        //.cache()
        //.get(routes.obdFlightTypeDep(context));
        .post(routes.obdFlightTypeDep(context), this.globalDataService.filterParams)
    );
  }

  getOBDTimeDepData(context: ReportPeriod): Observable<any> {
    return (
      this.httpClient
        //.cache()
        //.get(routes.obdTimeDep(context));
        .post(routes.obdTimeDep(context), this.globalDataService.filterParams)
    );
  }

  getOBDDayDepData(context: ReportPeriod): Observable<any> {
    return (
      this.httpClient
        //.cache()
        //.get(routes.obdDayDep(context));
        .post(routes.obdDayDep(context), this.globalDataService.filterParams)
    );
  }

  getOBDWeekDepData(context: ReportPeriod): Observable<any> {
    return (
      this.httpClient
        //.cache()
        //.get(routes.obdWeekDep(context));
        .post(routes.obdWeekDep(context), this.globalDataService.filterParams)
    );
  }

  getOBDFlightData(context: ReportPeriod): Observable<any> {
    return (
      this.httpClient
        //.cache()
        //.get(routes.obdFlight(context));
        .post(routes.obdFlight(context), this.globalDataService.filterParams)
    );
  }
}
