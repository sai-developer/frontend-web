import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
//import { extract } from '@app/core';

import { AnalyticsComponent } from './analytics.component';

import { PerfSummComponent } from './tabs/performance/perf.summary.component';
import { ObdAnalysisComponent } from './tabs/obd/obd.analysis.component';
import { OperSummComponent } from './tabs/operations/oper.summary.component';
import { GroundSummComponent } from './tabs/ground/ground.summary.component';

const routes: Routes = [
  { path: 'station/analytics-dashboard', redirectTo: 'station/analytics-dashboard/analytics-perf-summary', pathMatch: 'prefix' },
  { path: 'analytics-perf-summary', component: PerfSummComponent },
  { path: 'analytics-obd-analysis', component: ObdAnalysisComponent },
  { path: 'analytics-oper-summary', component: OperSummComponent },
  { path: 'analytics-grnd-summary', component: GroundSummComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalyticsRoutingModule {}
