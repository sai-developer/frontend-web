import { Component, OnInit, Input, OnChanges, ViewEncapsulation } from '@angular/core';

import { Animator } from '../../animations';

@Component({
  selector: 'obd-table',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './obd-table.component.html',
  styleUrls: ['./obd-table.component.scss'],
  animations: [Animator]
})
export class ObdTableComponent implements OnInit {
  @Input() animationType: any;

  @Input()
  input: any;

  constructor() {}

  ngOnInit() {}
}
