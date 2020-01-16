import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'tab-list',
  templateUrl: './tab.component.html'
})
export class TabComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  redirectTo(routeLing: string) {
    this.router.navigate(['/dashboard/perf-summary'], { replaceUrl: true });
  }
}
