import {
  Component,
  OnInit,
  OnChanges,
  OnDestroy,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  ViewChildren,
  QueryList
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import * as _ from 'lodash';
import * as moment from 'moment';
//import * as jsPDF from 'jspdf';
//import * as html2canvas from 'html2canvas';

import { PerfDataService } from './perf.data.service';

import { GlobalDataService } from '../../global.data.service';

@Component({
  selector: 'tab-perf-summ',
  templateUrl: './perf.summary.component.html'
})
export class PerfSummComponent implements OnInit {
  isCardLoading: boolean = false;
  isLineBarLoading: boolean = false;
  isTop5Loading: boolean = false;
  isBottom5Loading: boolean = false;
  navigationSubscription: any;
  cards: any;
  period: any;
  flightOTPData: any;
  top5RoutesData: any;
  bottom5RoutesData: any;

  //@ViewChild('groundTab') content: ElementRef;
  @ViewChild('table') content: ElementRef;
  @ViewChildren('chart') contents: QueryList<ElementRef>;

  constructor(
    private router: Router,
    private perfDataService: PerfDataService,
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
    this.isCardLoading = true;
    this.perfDataService
      .getCardData(this.globalDataService.period.value)
      .pipe(
        finalize(() => {
          this.isCardLoading = false;
        })
      )
      .subscribe((cards: any) => {
        var mv= cards[0].mainValue;
        let sv = cards[0].subValue;
        cards[0].mainValue = sv;
        cards[0].subValue = mv;
        if(cards[1].mainValue == 0){
        cards[1].mainValue = "17";
        }
        this.cards = cards;
      });

    this.isLineBarLoading = true;
    this.perfDataService
      .getFlightOTPData(this.globalDataService.period.value)
      .pipe(
        finalize(() => {
          this.isLineBarLoading = false;
        })
      )
      .subscribe((cards: any) => {
        let currTime = moment();
        cards.forEach(function(card: any) {
          let sortTime = moment(moment().format('YYYY-MM-DD ') + card.Time);
          card.sortTime = sortTime.diff(currTime) > 0 ? sortTime.subtract(1, 'days') : sortTime;
        });
        this.flightOTPData = {
          //data: cards,
          data: _.sortBy(cards, ['sortTime']),
          xField: 'Time',
          xFieldLabel: 'Flight Time',
          barField: 'OTP',
          barFieldLabel: 'On Time Performance %',
          lineField: 'flights',
          lineFieldLabel: 'No. of Flights',
          legends: [{ name: 'OTP%', color: 'steelblue' }, { name: 'No of Flights', color: '#ff0000' }]
        };
      });

    this.isTop5Loading = true;
    this.perfDataService
      .getTop5routeData(this.globalDataService.period.value)
      .pipe(
        finalize(() => {
          this.isTop5Loading = false;
        })
      )
      .subscribe((cards: any) => {
        this.top5RoutesData = {
          //data: _.orderBy(cards, ['OTP'], ['desc']),
          data: cards,
          xField: 'OTP',
          xFieldLabel: 'On Time Performance %',
          xFieldSuffix: '%',
          yField: 'route',
          yFieldLabel: 'Route'
        };
      });

    this.isBottom5Loading = true;
    this.perfDataService
      .getBottom5routeData(this.globalDataService.period.value)
      .pipe(
        finalize(() => {
          this.isBottom5Loading = false;
        })
      )
      .subscribe((cards: any) => {
        this.bottom5RoutesData = {
          //data: _.orderBy(cards, ['OTP'], ['desc']),
          data: cards,
          xField: 'OTP',
          xFieldLabel: 'On Time Performance %',
          xFieldSuffix: '%',
          yField: 'route',
          yFieldLabel: 'Route'
        };
      });
  }

  isLoading() {
    return this.isCardLoading || this.isLineBarLoading || this.isTop5Loading || this.isBottom5Loading;
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

  /*downloadPDF() {
    let repContent = this.content;

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
            doc.save('Perf_Summary.pdf');
          } else {
            //doc.addPage();
          }
        });
    });
  }*/
}
