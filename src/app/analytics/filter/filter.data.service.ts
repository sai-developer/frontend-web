import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { environment } from '@env/environment';

import * as _ from 'lodash';

@Injectable()
export class FilterDataService {
  filterData: any;

  constructor(private httpClient: HttpClient) {
    console.log('Loading Filer Data...');
    this.httpClient
      .get(`${environment.analyticsApiUrl}/reports/filter-data`)
      .pipe(finalize(() => {}))
      .subscribe((data: any) => {
        this.filterData = data;
        this.filterData.YEAR = _.uniq(_.map(data.QUARTER, 'YEAR'));
        console.log(_.map(data.QUARTER, 'YEAR'));
        console.log(this.filterData);
      });
  }

  getFilterData(type: any) {
    return this.filterData[type];
  }
}
