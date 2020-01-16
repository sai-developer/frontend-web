import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalDataService } from '../global.data.service';
import { FilterDataService } from './filter.data.service';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'analytics-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  @Output() filtered: EventEmitter<any> = new EventEmitter<any>();
  @Output() downloader: EventEmitter<any> = new EventEmitter<any>();

  isCustom: boolean = false;
  filterOption: any;
  filterMenuVisible: boolean = false;
  filterDisabled: boolean = false;
  DISPLAY_TIME_FORMAT: any = 'DD-MM-YYYY HH:mm';

  customData: any = {
    custYear: null,
    custQuarter: null,
    custMonth: null,
    custWeek: null,
    custDay: null,
    custFrom: null,
    custTo: null
  };

  filter: any = {
    custom: false,
    type: 'RANGE',
    option: null,
    value: null,
    from: null,
    to: null,
    customData: this.customData
  };

  filterTypes: any = [
    { id: 'YEAR', name: 'Year' },
    { id: 'QUARTER', name: 'Quarter' },
    { id: 'MONTH', name: 'Month' },
    { id: 'WEEK', name: 'Week' },
    { id: 'DAY', name: 'Day' },
    { id: 'RANGE', name: 'Range' }
  ];

  constructor(
    private router: Router,
    private globalDataService: GlobalDataService,
    private filterDataService: FilterDataService
  ) {
    globalDataService.filter = globalDataService.filter ? globalDataService.filter : this.filter;
    this.filter = globalDataService.filter;
    this.isCustom = this.filter.custom;
    this.filterOption = this.filter.option;
    this.customData = this.filter.customData;
    globalDataService.period = globalDataService.period ? globalDataService.period : this.periodFilter[0];
    this.filterDisabled = false;
    console.log(globalDataService.period);
    if (globalDataService.period.value==0) {
	    let filter = this.filter;
	    let setDefFilter = this.setDefaultFilter;
	    setTimeout(function() {
	      setDefFilter(filter, filterDataService);
	    }, 1000);
    }
  }

  ngOnInit() {}

  setDefaultFilter(filter: any, filterDataService: any) {
    filter.to = moment();
    //filter.to = filterDataService.getFilterData('RANGE')[0].TO_DATE_SK;
    filter.from = filterDataService.getFilterData('RANGE')[0].FROM_DATE_SK;
  }

  get periodFilter(): any {
    const periods = [
      { name: 'All', value: 0 },
      { name: 'Last 24 Hrs', value: 24 },
      { name: 'Last 48 Hrs', value: 48 },
      { name: 'Custom', value: -1 }
    ];
    return periods;
  }

  showFilterMenu() {
    this.filterMenuVisible = !this.filterMenuVisible;
  }

  hideFilterMenu() {
    this.filterMenuVisible = false;
  }

  setPeriod(period: any) {
    this.globalDataService.period = period;
    if (period.name == 'Custom') {
      this.isCustom = true;
    } else {
      //this.router.navigate([`${this.router.routerState.snapshot.url}`]);
      this.filtered.emit();
      this.filter.custom = false;
      this.isCustom = false;
      let now = moment();
      this.filter.to = now.format(this.DISPLAY_TIME_FORMAT);
      if (period.value > 0) {
        this.filter.from = now.subtract(period.value, 'hours').format(this.DISPLAY_TIME_FORMAT);
      } else {
        this.filter.from = this.filterDataService.getFilterData('RANGE')[0].FROM_DATE_SK;
      }
    }
    this.hideFilterMenu();
  }

  get currentPeriod(): any {
    return this.globalDataService.period;
  }

  setType(filterType: any) {
    this.filter.type = filterType;
  }

  get updatedTime(): any {
    return moment(this.filterDataService.getFilterData('LAST_LOAD'))
      .utc()
      .format(this.DISPLAY_TIME_FORMAT);
  }

  get yearFilter(): any {
    return this.filterDataService.getFilterData('YEAR');
  }

  get quarterFilter(): any {
    let quartFilter = _.filter(this.filterDataService.getFilterData('QUARTER'), { YEAR: this.customData.custYear });
    return quartFilter;
  }

  get monthFilter(): any {
    let monthFilter = _.filter(this.filterDataService.getFilterData('MONTH'), { YEAR: this.customData.custYear });
    return monthFilter;
  }

  get weekFilter(): any {
    let custYear = this.customData.custYear;
    let weekFilter = _.filter(this.filterDataService.getFilterData('WEEK'), function(week: any) {
      return Math.floor(week.WEEK_SK / 100) == custYear;
    });
    return weekFilter;
  }

  get rangeFilter(): any {
    let rangeFilter = this.filterDataService.getFilterData('RANGE');
    return rangeFilter[0];
  }

  hide() {
    this.isCustom = false;
  }

  setDate(form: any) {
    this.filterDisabled = true;
    switch (this.filter.type) {
      case 'YEAR':
        this.setYearFilter(form);
        break;
      case 'QUARTER':
        this.setQuarterFilter(form);
        break;
      case 'MONTH':
        this.setMonthFilter(form);
        break;
      case 'WEEK':
        this.setWeekFilter(form);
        break;
      case 'DAY': {
        this.setDayFilter(form);
        break;
      }
      case 'RANGE':
        this.setRangeFilter(form);
        break;
    }
    this.filter.custom = this.isCustom;
    this.filter.option = this.filterOption;
    this.filter.customData = {
      custOption: form.value.option,
      custYear: form.value.custYear,
      custQuarter: form.value.custQuarter,
      custMonth: form.value.custMonth,
      custWeek: form.value.custWeek,
      custDay: form.value.custDay,
      custFrom: form.value.custFrom,
      custTo: form.value.custTo
    };
    this.globalDataService.filter = this.filter;
    this.filtered.emit();
    this.filterDisabled = false;
  }

  setYearFilter(form: any) {
    let start = 0,
      end = 0;
    switch (form.value.option) {
      case '0': {
        break;
      }
      case '1': {
        start = 1;
        end = 1;
        break;
      }
      case '2': {
        start = end =
          moment()
            //.utc()
            .year() - form.value.custYear;
        break;
      }
    }
    this.filter.from = moment()
      //.utc()
      .subtract(start, 'years')
      .format('YYYY-01-01 00:00:00');
    this.filter.to = moment()
      //.utc()
      .subtract(end, 'years')
      .format('YYYY-12-31 23:59:59');
  }

  setQuarterFilter(form: any) {
    let filteredQuarter = null;
    switch (form.value.option) {
      case '0': {
        let qtrYear = moment()
          //.utc()
          .year();
        let quarter = moment()
          //.utc()
          .quarter();
        let quarterFilter = this.filterDataService.getFilterData('QUARTER');
        filteredQuarter = _.filter(quarterFilter, { QTR_DESC: 'Q' + quarter + "' " + (qtrYear % 100) })[0];
        break;
      }
      case '1': {
        let qtrYear = moment()
          //.utc()
          .subtract(3, 'months')
          .year();
        let quarter = moment()
          //.utc()
          .subtract(3, 'months')
          .quarter();
        let quarterFilter = this.filterDataService.getFilterData('QUARTER');
        filteredQuarter = _.filter(quarterFilter, { QTR_DESC: 'Q' + quarter + "' " + (qtrYear % 100) })[0];
        break;
      }
      case '2': {
        filteredQuarter = form.value.custQuarter;
        break;
      }
    }
    this.filter.from = moment(filteredQuarter ? filteredQuarter.FROM_DATE : '1900-01-01').format('YYYY-MM-DD HH:mm:ss');
    this.filter.to = moment(filteredQuarter ? filteredQuarter.TO_DATE : '1900-01-01').format('YYYY-MM-DD 23:59:59');
  }

  setMonthFilter(form: any) {
    let filteredMonth = null;
    switch (form.value.option) {
      case '0': {
        let monthYear = moment()
          //.utc()
          .year();
        let month =
          moment()
            //.utc()
            .month() + 1;
        let monthFilter = this.filterDataService.getFilterData('MONTH');
        filteredMonth = _.filter(monthFilter, { MONTH_SK: monthYear * 100 + month })[0];
        break;
      }
      case '1': {
        let monthYear = moment()
          //.utc()
          .year();
        let month = moment()
          //.utc()
          .month();
        let monthFilter = this.filterDataService.getFilterData('MONTH');
        filteredMonth = _.filter(monthFilter, { MONTH_SK: monthYear * 100 + month })[0];
        break;
      }
      case '2': {
        filteredMonth = form.value.custMonth;
        break;
      }
    }
    this.filter.from = moment(filteredMonth ? filteredMonth.FROM_DATE : '1900-01-01').format('YYYY-MM-DD HH:mm:ss');
    this.filter.to = moment(filteredMonth ? filteredMonth.TO_DATE : '1900-01-01').format('YYYY-MM-DD 23:59:59');
  }

  setWeekFilter(form: any) {
    let filteredWeek = null;
    switch (form.value.option) {
      case '0': {
        let weekYear = moment()
          //.utc()
          .year();
        let week =
          moment()
            //.utc()
            .week() + 1;
        let weekFilterData = this.filterDataService.getFilterData('WEEK');
        filteredWeek = _.filter(weekFilterData, { WEEK_SK: weekYear * 100 + week })[0];
        break;
      }
      case '1': {
        let weekYear = moment()
          //.utc()
          .year();
        let week = moment()
          //.utc()
          .week();
        let weekFilterData = this.filterDataService.getFilterData('WEEK');
        filteredWeek = _.filter(weekFilterData, { WEEK_SK: weekYear * 100 + week })[0];
        break;
      }
      case '2': {
        filteredWeek = form.value.custWeek;
        break;
      }
    }
    this.filter.from = moment(filteredWeek ? filteredWeek.FROM_DATE : '1900-01-01').format('YYYY-MM-DD HH:mm:ss');
    this.filter.to = moment(filteredWeek ? filteredWeek.TO_DATE : '1900-01-01').format('YYYY-MM-DD 23:59:59');
  }

  setDayFilter(form: any) {
    let start = 0,
      end = 0;
    switch (form.value.option) {
      case 'Today': {
        break;
      }
      case 'Yesterday': {
        start = 1;
        end = 1;
        break;
      }
      case 'Last': {
        start = form.value.custDay;
        end = 1;
        break;
      }
    }
    /*this.filter.from = moment()
      .utc()
      .subtract(start, 'days')
      .format('YYYY-MM-DD 00:00:00');
    this.filter.to = moment()
      .utc()
      .subtract(end, 'days')
      .format('YYYY-MM-DD 23:59:59');*/
    this.filter.from = moment(moment().format('YYYY-MM-DD 00:00:00'))
      //.utc()
      .subtract(start, 'days')
      .format('YYYY-MM-DD HH:mm:ss');
    this.filter.to = moment(moment().format('YYYY-MM-DD 23:59:59'))
      //.utc()
      .subtract(end, 'days')
      .format('YYYY-MM-DD HH:mm:ss');
  }

  setRangeFilter(form: any) {
    this.filter.from = moment(form.value.custFrom)
      //.utc()
      .format('YYYY-MM-DD HH:mm:ss');
    this.filter.to = moment(form.value.custTo)
      //.utc()
      .format('YYYY-MM-DD HH:mm:ss');
  }

  formatDisplayTime(time: any) {
    return time ? moment(time).format(this.DISPLAY_TIME_FORMAT) : '';
  }

  initDownload() {
    this.downloader.emit();
  }
}
