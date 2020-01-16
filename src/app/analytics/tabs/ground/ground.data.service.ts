import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from '@env/environment';

import * as _ from 'lodash';

import { GlobalDataService } from '../../global.data.service';

const routes = {
  /*perfSumm: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/ground-perf-summ-data/${period}`,
  deptPerf: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/ground-dept-perf-data/${period}`,
  crossStats: (period: ReportPeriod, dept: string, task: string) =>
    `${environment.analyticsApiUrl}/reports/ground-cross-stats-data/${period}/${dept}/${task}`,
  deptUniqueTasks: (period: ReportPeriod, dept: string) =>
    `${environment.analyticsApiUrl}/reports/ground-dept-tasks-data/${period}/${dept}`,
  deptShift: (period: ReportPeriod, dept: string) =>
    `${environment.analyticsApiUrl}/reports/ground-dept-shift-data/${period}/${dept}`,
  deptStaff: (period: ReportPeriod, dept: string) =>
    `${environment.analyticsApiUrl}/reports/ground-dept-staff-data/${period}/${dept}`,
  deptEquip: (period: ReportPeriod, dept: string) =>
    `${environment.analyticsApiUrl}/reports/ground-dept-equip-data/${period}/${dept}`,
  deptTaskEquip: (period: ReportPeriod, dept: string, task: string) =>
    `${environment.analyticsApiUrl}/reports/ground-dept-equip-data/${period}/${dept}/${task}`*/

  perfSumm: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/ground-perf-summ-data`,
  deptPerf: (period: ReportPeriod) => `${environment.analyticsApiUrl}/reports/ground-dept-perf-data`,
  crossStats: (period: ReportPeriod, dept: string, task: string) =>
    `${environment.analyticsApiUrl}/reports/ground-cross-stats-data`,
  deptUniqueTasks: (period: ReportPeriod, dept: string) =>
    `${environment.analyticsApiUrl}/reports/ground-dept-tasks-data`,
  deptShift: (period: ReportPeriod, dept: string) => `${environment.analyticsApiUrl}/reports/ground-dept-shift-data`,
  deptStaff: (period: ReportPeriod, dept: string) => `${environment.analyticsApiUrl}/reports/ground-dept-staff-data`,
  deptEquip: (period: ReportPeriod, dept: string) =>
    `${environment.analyticsApiUrl}/reports/ground-dept-equip-data/${period}/${dept}`,
  deptTaskEquip: (period: ReportPeriod, dept: string, task: string) =>
    `${environment.analyticsApiUrl}/reports/ground-dept-equip-data`
};

export interface ReportPeriod {
  // The report's period: '24 Hrs', '48 Hrs'...
  period: string;
  dept: string;
}

@Injectable()
export class GroundDataService {
  constructor(private httpClient: HttpClient, private globalDataService: GlobalDataService) {}

  getPerfSummData(context: ReportPeriod): Observable<any> {
    return (
      this.httpClient
        //.cache()
        //.get(routes.perfSumm(context));
        .post(routes.perfSumm(context), this.globalDataService.filterParams)
    );
  }

  getDeptPerfData(context: ReportPeriod): Observable<any> {
    return (
      this.httpClient
        //.cache()
        //.get(routes.deptPerf(context));
        .post(routes.deptPerf(context), this.globalDataService.filterParams)
    );
  }

  getDeptUniqueTasksData(context: ReportPeriod, dept: string): Observable<any> {
    let filterParams = this.globalDataService.filterParams;
    filterParams['dept'] = dept;
    return (
      this.httpClient
        //.cache()
        //.get(routes.deptUniqueTasks(context, dept));
        .post(routes.deptUniqueTasks(context, dept), filterParams)
    );
  }

  getCrossStatsData(context: ReportPeriod, dept: string, task: string): Observable<any> {
    let filterParams = this.globalDataService.filterParams;
    filterParams['dept'] = dept;
    filterParams['task'] = task;
    return (
      this.httpClient
        //.cache()
        //.get(routes.crossStats(context, dept, task));
        .post(routes.crossStats(context, dept, task), filterParams)
    );
  }

  getDeptShiftData(context: ReportPeriod, dept: string): Observable<any> {
    let filterParams = this.globalDataService.filterParams;
    filterParams['dept'] = dept;
    return (
      this.httpClient
        //.cache()
        //.get(routes.deptShift(context, dept));
        .post(routes.deptShift(context, dept), filterParams)
    );
  }

  getDeptStaffData(context: ReportPeriod, dept: string): Observable<any> {
    let filterParams = this.globalDataService.filterParams;
    filterParams['dept'] = dept;
    return (
      this.httpClient
        //.cache()
        //.get(routes.deptStaff(context, dept));
        .post(routes.deptStaff(context, dept), filterParams)
    );
  }

  getDeptEquipData(context: ReportPeriod, dept: string): Observable<any> {
    this.globalDataService.filterParams.dept = dept;
    return (
      this.httpClient
        //.cache()
        //.get(routes.deptEquip(context, dept));
        .post(routes.deptEquip(context, dept), this.globalDataService.filterParams)
    );
  }

  getDeptTaskEquipData(context: ReportPeriod, dept: string, task: string): Observable<any> {
    let filterParams = this.globalDataService.filterParams;
    filterParams['dept'] = dept;
    filterParams['task'] = task;
    return (
      this.httpClient
        //.cache()
        //.get(routes.deptTaskEquip(context, dept, task));
        .post(routes.deptTaskEquip(context, dept, task), filterParams)
    );
  }
}
