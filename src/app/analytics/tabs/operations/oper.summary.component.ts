import { Component, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import * as _ from 'lodash';

import { OperDataService } from './oper.data.service';

import { GlobalDataService } from '../../global.data.service';

@Component({
  selector: 'tab-oper-summ',
  templateUrl: './oper.summary.component.html',
  styleUrls: ['./oper.summary.component.scss']
})
export class OperSummComponent implements OnInit {
  isLoading: boolean = true;
  navigationSubscription: any;

  period: any;
  equipTypeData: any;
  flightsOTPData: any;
  taskDepDelayData: any;
  delayCatData: any;
  taskAnalysisData: any = [];

  constructor(
    private router: Router,
    private operDataService: OperDataService,
    private globalDataService: GlobalDataService
  ) {
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.myInit();
      }
    });
  }

  ngOnInit() {
    //this.myInit();
  }

  myInit() {
    this.isLoading = true;
    this.operDataService
      .getEquipStatsData(this.globalDataService.period.value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((cards: any) => {
        this.equipTypeData = cards;
      });

    this.operDataService
      .getFlightsOTPData(this.globalDataService.period.value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((cards: any) => {
        this.flightsOTPData = {
          //data: _.orderBy(cards, ['value'], ['asc']),
          data: cards,
          xField: 'FLIGHT_COUNT',
          xFieldLabel: 'On Time Performance %',
          xFieldSuffix: '',
          yField: 'DELAYED_FLIGHTS_CATEGORY',
          yFieldLabel: 'Route',
          margin: { top: 20, right: 30, bottom: 30, left: 150 }
        };
      });

    this.operDataService
      .getTaskDepDelayData(this.globalDataService.period.value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((cards: any) => {
        this.taskDepDelayData = {
          data: cards,
          margin: { top: 60, right: 50, bottom: 20, left: 150 },
          toolTipList: [{ label: ' Flight Count :', value: 'NUMBER_OF_FLIGHTS' }],
          valField: 'NUMBER_OF_FLIGHTS',
          rowField: 'TASK_NAME',
          colField: 'TASK_DELAY_RANGE'
        };
      });

    this.operDataService
      .getDelayCatData(this.globalDataService.period.value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((cards: any) => {
        this.delayCatData = {
          data: cards,
          dispField: 'DELAY_CATEGORY',
          valField: 'DELAY_CATEGORY_PERCENT',
          toolTipSuffix: '',
          clickEnabled: true,
          callback: this.clikAlert,
          toolTipList: [
            { label: ' Category :', value: 'DELAY_CATEGORY' },
            { label: ' Count :', value: 'CATEGORY_COUNT' },
            { label: ' Percent % :', value: 'DELAY_CATEGORY_PERCENT' }
          ]
        };
      });

    this.operDataService
      .getTaskOTData(this.globalDataService.period.value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((cards: any) => {
        this.taskAnalysisData = [];
        let taskAnalysisData = this.taskAnalysisData;
        var nodes: any = _.groupBy(cards, 'TASK_NAME');
        _.keys(nodes).forEach(function(key: any) {
          var subNode = _.groupBy(nodes[key], 'FLIGHT_TYPE');
          taskAnalysisData.push({ taskName: key, flights: subNode });
        });
      });
  }

  ngOnChanges(changes: any) {}

  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  clikAlert(id: string) {
    //alert(id);
  }

  getEquipStatus(value: number) {
    if (value <= 0) {
      return 'label-primary';
    } else if (value <= 20) {
      return 'label-warning';
    } else {
      return 'label-danger';
    }
  }

  getOTTaskCellData(object: any, key: string) {
    if (object) {
      return (parseFloat(object[0][key]) * 1).toFixed(0) + '%';
    }
    return '';
  }

  getOverallTaskCellData(object: any, key: string) {
    if (object) {
      let countOfAvg = (object.BASE ? 1 : 0) + (object.TRANSIT ? 1 : 0) + (object.TURNAROUND ? 1 : 0);
      let sumOfAvg = object.BASE ? parseFloat(object.BASE[0][key]) : 0;
      sumOfAvg += object.TRANSIT ? parseFloat(object.TRANSIT[0][key]) : 0;
      sumOfAvg += object.TURNAROUND ? parseFloat(object.TURNAROUND[0][key]) : 0;
      return (sumOfAvg / countOfAvg).toFixed(0) + '%';
    }
    return '';
  }
}
