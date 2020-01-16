import { Component, OnInit, OnChanges, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import * as _ from 'lodash';

import { GroundDataService } from './ground.data.service';

import { GlobalDataService } from '../../global.data.service';

@Component({
  selector: 'tab-ground-summ',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './ground.summary.component.html'
})
export class GroundSummComponent implements OnInit {
  isLoading: boolean;
  isLoadingDept: boolean;
  isLoadingCrossTask: boolean = true;
  isLoadingTask: boolean = true;
  navigationSubscription: any;

  period: any;
  deptStaffData: any;
  taskDepDelayData: any;
  groundPerfData: any;
  deptPerfData: any;
  crossTaskDepData: any;
  selectedDepartment: string = '';
  selectedDeptName: string = '';
  taskList: any;
  selectedTask: string = '';
  selectedTaskName: string = '';
  deptCallback: any;
  deptEquipOrigData: any;
  deptEquipTableData: any;

  constructor(
    private router: Router,
    private groundDataService: GroundDataService,
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
    this.selectedDepartment = null;
    this.groundDataService
      .getPerfSummData(this.globalDataService.period.value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((cards: any) => {
        this.groundPerfData = {
          data: cards,
          dispField: 'GROUND_CATEGORY',
          valField: 'PERCENT',
          toolTipSuffix: '%',
          clickEnabled: true,
          callback: this.clikAlert,
          margin: { top: 0, right: 50, bottom: 30, left: 0 },
          toolTipList: [
            { label: ' Category :', value: 'GROUND_CATEGORY' },
            { label: ' Percent % :', value: 'PERCENT' },
            { label: ' Duration :', value: 'DURATION' }
          ]
        };
      });
    this.groundDataService
      .getDeptPerfData(this.globalDataService.period.value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((cards: any) => {
        this.deptPerfData = {
          data: cards,
          callback: this.selectDepartment,
          idField: 'DEPT_SK',
          nameField: 'DEPT_NAME',
          valField: 'DEPT_PERF'
        };
      });

    this.deptCallback = { callback: this.selectDepartment };
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

  selectDepartment(id: string) {
    this.selectedDepartment = id;
    this.selectedDeptName = _.find(this.deptPerfData.data, function(data: any) {
      return data.DEPT_SK == id;
    }).DEPT_NAME;
    let selectedDept = id;
    this.isLoadingDept = true;
    this.isLoadingCrossTask = true;
    this.isLoadingTask = true;
    this.groundDataService
      .getDeptUniqueTasksData(this.globalDataService.period.value, selectedDept)
      .pipe(
        finalize(() => {
          this.isLoadingDept = false;
        })
      )
      .subscribe((tasks: any) => {
        this.taskList = tasks;
        this.selectedTask = this.taskList[0] ? this.taskList[0].TASK_SK : '';
        this.selectTask();
      });
    this.groundDataService
      .getDeptShiftData(this.globalDataService.period.value, this.selectedDepartment)
      .pipe(
        finalize(() => {
          this.isLoadingDept = false;
        })
      )
      .subscribe((cards: any) => {
        this.taskDepDelayData = {
          data: cards,
          margin: { top: 60, right: 20, bottom: 10, left: 160 },
          toolTipList: [{ label: 'Task Performance % :', value: 'TASK_PERFORMANCE_PERCENT' }],
          valField: 'TASK_PERFORMANCE_PERCENT',
          rowField: 'TASK_NAME',
          colField: 'SHIFT'
        };
      });

    this.groundDataService
      .getDeptStaffData(this.globalDataService.period.value, this.selectedDepartment)
      .pipe(
        finalize(() => {
          this.isLoadingDept = false;
        })
      )
      .subscribe((cards: any) => {
        this.deptStaffData = {
          //data: _.orderBy(cards, ['value'], ['asc']),
          data: cards,
          xField: 'TASK_PERF',
          xFieldLabel: 'On Time Performance %',
          xFieldSuffix: '%',
          yField: 'USER_NAME',
          yFieldLabel: 'USER_NAME',
          margin: { top: 20, right: 80, bottom: 30, left: 120 }
        };
      });
  }

  selectTask() {
    if (this.selectedTask) {
      this.isLoadingCrossTask = true;
      this.isLoadingTask = true;
      let selectedTask = this.selectedTask;
      this.selectedTaskName = _.find(this.taskList, function(data: any) {
        return data.TASK_SK == selectedTask;
      }).TASK_NAME;

      this.groundDataService
        .getCrossStatsData(
          this.globalDataService.period.value,
          this.selectedDepartment,
          encodeURIComponent(this.selectedTask)
        )
        .pipe(
          finalize(() => {
            //this.isLoadingCrossTask = false;
          })
        )
        .subscribe((cards: any) => {
          this.crossTaskDepData = {
            data: cards,
            xField: 'flight',
            xFieldLabel: 'Flight',
            yField: 'CROSS_TASK_INTERVAL',
            yFieldLabel: 'Time (in mins)'
          };
          this.isLoadingCrossTask = false;
        });

      this.groundDataService
        .getDeptTaskEquipData(this.globalDataService.period.value, this.selectedDepartment, this.selectedTask)
        .pipe(
          finalize(() => {
            this.isLoadingTask = false;
          })
        )
        .subscribe((cards: any) => {
          this.deptEquipOrigData = cards;
          this.deptEquipTableData = { data: cards };
        });
    } else {
      this.crossTaskDepData = {
        data: [],
        xField: 'flight',
        xFieldLabel: 'Flight',
        yField: 'value',
        yFieldLabel: 'Time (in mins)'
      };
      this.deptEquipTableData = { data: [] };
      this.isLoadingTask = false;
      this.isLoadingCrossTask = false;
    }
  }
}
