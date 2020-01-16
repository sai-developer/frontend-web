import { Component, OnInit, OnChanges, OnDestroy, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import * as _ from 'lodash';
//import * as jsPDF from 'jspdf';
//import * as html2canvas from 'html2canvas';

import { OBDDataService } from './obd.data.service';

import { GlobalDataService } from '../../global.data.service';

@Component({
  selector: 'tab-obd-analysis',
  templateUrl: './obd.analysis.component.html'
})
export class ObdAnalysisComponent implements OnInit {
  isLoading: boolean;
  navigationSubscription: any;
  sunburstData: any;
  obdTimeData: any;
  obdDayData: any;
  obdDayTimeOrigData: any;
  obdDayTimeData: any;
  obdWeekStatus: string = 'Ontime';
  obdWeekStatusList: any;
  obdBayData: any;
  obdArrFlightData: any;
  obdDepFlightData: any;

  @ViewChildren('chart') contents: QueryList<ElementRef>;

  constructor(
    private router: Router,
    private obdDataService: OBDDataService,
    private globalDataService: GlobalDataService
  ) {
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      this.obdWeekStatusList = [
        { name: 'OnTime', value: 'Ontime' },
        { name: 'Buffer', value: 'Buffer' },
        { name: 'Delay', value: 'Delay' }
      ];
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
    this.obdDataService
      .getOBDFlightData(this.globalDataService.period.value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((cards: any) => {
        var nodes: any = this.groupChildren(cards, 'ARR_STATUS');
        var groupChildren = this.groupChildren;
        nodes.forEach(function(node: any) {
          node.children = groupChildren(node.children, 'DEP_STATUS');
        });
        let classMap = {
          'Ontime(A)': 'ontime',
          'Buffer(A)': 'buffer',
          'Delay(A)': 'delay',
          'NA(A)': 'na',
          'Ontime(D)': 'ontime',
          'Buffer(D)': 'buffer',
          'Delay(D)': 'delay',
          'NA(D)': 'na',
          Base: 'base',
          Terminating: 'terminating'
        };
        this.sunburstData = {
          data: {
            name: 'FlighInfo',
            children: nodes
          },
          dispField: 'name',
          valField: 'value',
          classMap: classMap
        };
      });

    this.obdDataService
      .getOBDBayDepData(this.globalDataService.period.value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((cards: any) => {
        this.obdBayData = { data: cards };
      });

    this.obdDataService
      .getOBDFlightTypeArrData(this.globalDataService.period.value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((cards: any) => {
        this.obdArrFlightData = cards;
        /*this.obdArrFlightData.push({flt_type: "Total", ontime: _.sumBy(this.obdArrFlightData, "ontime"),
      								buffer: _.sumBy(this.obdArrFlightData, "buffer"),
      								delay: _.sumBy(this.obdArrFlightData, "delay")});*/
      });

    this.obdDataService
      .getOBDFlightTypeDepData(this.globalDataService.period.value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((cards: any) => {
        this.obdDepFlightData = cards;
        /*this.obdArrFlightData.push({flt_type: "Total", ontime: _.sumBy(this.obdArrFlightData, "ontime"),
      								buffer: _.sumBy(this.obdArrFlightData, "buffer"),
      								delay: _.sumBy(this.obdArrFlightData, "delay")});*/
      });

    this.obdDataService
      .getOBDTimeDepData(this.globalDataService.period.value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((cards: any) => {
        this.obdTimeData = { data: cards };
      });

    this.obdDataService
      .getOBDDayDepData(this.globalDataService.period.value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((cards: any) => {
        this.obdDayData = { data: cards };
      });

    this.obdDataService
      .getOBDWeekDepData(this.globalDataService.period.value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((cards: any) => {
        this.obdDayTimeOrigData = _.groupBy(cards, 'ONTIME_DEP_STATUS');
        this.obdDayTimeData = { data: this.obdDayTimeOrigData[this.obdWeekStatus] };
      });
  }

  updateWeekStatus() {
    this.obdDayTimeData = { data: this.obdDayTimeOrigData[this.obdWeekStatus] };
  }

  groupChildren(objArray: any, keyCol: any) {
    let stGroup = _.groupBy(objArray, function(obj) {
      return obj[keyCol];
    });
    var hier: any = [];
    _.keys(stGroup).forEach(function(key) {
      hier.push({ name: key, children: stGroup[key] });
    });
    return hier;
  }

  /*downloadPDF() {
    let doc = new jsPDF({ orientation: 'landscape', format: 'a3' });
    let contentLength = this.contents.length;

    this.contents.forEach(function(content: ElementRef, index: any) {
      let savePDF = index == contentLength - 1 ? true : false;
      let imageConf = { scale: 1.1 };
      html2canvas(content.nativeElement, imageConf)
        .then(function(canvas: any) {
          let img = canvas.toDataURL('image/png');
          doc.addImage(img, 'JPEG', 10, 10);
        })
        .then(function() {
          if (savePDF) {
            doc.save('OBD_Analysis.pdf');
          } else {
            //doc.addPage();
          }
        });
    });
  }*/
}
