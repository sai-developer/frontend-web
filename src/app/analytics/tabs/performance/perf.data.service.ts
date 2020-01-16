import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from '@env/environment';

import { GlobalDataService } from '../../global.data.service';

const routes = {
  period: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/otp-card-data/${period}`,
  cardData: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/otp-card-data`,
  //flightOTP: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/otp-flight-data/${period}`,
  //top5Route: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/top5-otp-route-data/${period}`,
  //bottom5Route: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/bottom5-otp-route-data/${period}`
  flightOTP: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/otp-flight-data`,
  top5Route: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/top5-otp-route-data`,
  bottom5Route: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/bottom5-otp-route-data`
};

export interface ReportPeriod {
  // The report's period: '24 Hrs', '48 Hrs'...
  period: string;
}

@Injectable()
export class PerfDataService {
  constructor(private httpClient: HttpClient, private globalDataService: GlobalDataService) {}

  getCardData(context: ReportPeriod): Observable<any> {
    console.log(this.globalDataService.period.value);
    return this.httpClient.post(routes.cardData(context), this.globalDataService.filterParams);
    /*return this.httpClient
    		//.cache()
    		.get(routes.period(context));*/
  }

  getTop5routeData(context: ReportPeriod): Observable<any> {
    return (
      this.httpClient
        //.cache()
        //.get(routes.top5Route(context));
        .post(routes.top5Route(context), this.globalDataService.filterParams)
    );
  }

  getBottom5routeData(context: ReportPeriod): Observable<any> {
    return (
      this.httpClient
        //.cache()
        //.get(routes.bottom5Route(context));
        .post(routes.bottom5Route(context), this.globalDataService.filterParams)
    );
  }

  getFlightOTPData(context: ReportPeriod): Observable<any> {
    return (
      this.httpClient
        //.cache()
        //.get(routes.flightOTP(context));
        .post(routes.flightOTP(context), this.globalDataService.filterParams)
    );
  }
}
