import { Component, Input, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Animator } from '../../animations';

@Component({
  selector: 'card-comp',
  templateUrl: './card.component.html',
  animations: [Animator]
})
export class CardComponent implements OnInit {
  @Input() card: any;
  @Input() animationType: any;

  constructor() {}

  ngOnInit() {
    console.log(this.card);
  }
}
