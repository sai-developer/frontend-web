import {
  Component,
  OnInit,
  ElementRef,
  Input,
  Output,
  OnChanges,
  EventEmitter,
  ViewEncapsulation
} from '@angular/core';
import * as _ from 'lodash';

import { AnimateProgress } from '../../animations';

@Component({
  selector: 'chart-progress-bar',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  animations: [AnimateProgress]
})
export class ProgressBarComponent implements OnInit {
  @Input()
  input: any;

  @Input()
  chartId: string;

  @Input()
  chartTitle: string;

  @Input()
  progressPercent: number;

  @Input()
  callback: any;

  @Input()
  callbackParams: any;

  @Input()
  colorMap: any;

  @Output() compClicked: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
    //this.colorMap = { "100": "#19FE1E", "75": "#FEA319", "50": "#FA1516"  };
    this.colorMap = { '100': '#4caf50', '66': '#ffa000', '33': '#e81426' };
  }

  ngOnInit() {}

  getStyle() {
    return { width: this.progressPercent + '%', 'background-color': this.getColor(this.progressPercent) };
  }

  getColor(value: any) {
    let color = '';
    let map = this.colorMap;
    let keys = _.keys(map).reverse();
    keys.forEach(function(key: any) {
      //console.log(key);
      if (value <= parseInt(key)) {
        color = map[key];
      }
    });
    return color;
  }

  clicked() {
    if (this.input && this.input['callback']) {
      //this.input["callback"](this.callbackParams);
      this.compClicked.emit(this.callbackParams);
    }
  }

  getProgress() {
    return { value: '', params: { width: `${this.progressPercent}%` } };
  }
}
