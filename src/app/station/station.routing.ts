import { Routes } from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component';
// import {ShiftComponent} from './shift/shift.component';
// import {RosteringComponent} from './rostering/rostering.component';
// import {RosteringViewComponent} from './rostering/rostering-view.component';
import {AuthGuard} from '../service/app.service';

export const StationRoutes: Routes = [
  // parent station layout Module - redirected to dashboard (default)
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  //child station layout module - redirecting to each sub modules.
  {
    path: '',
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'master',
        loadChildren: './master/master.module#MasterModule'
      },
      {
        path: 'roster',
        loadChildren: './rostering/roster.module#RosterModule'
      },
      {
        path: 'reports',
        loadChildren: './reports/reports.module#ReportsModule'
      },
      {
        path: 'flifo',
        loadChildren: './flifo/flifo.module#FlifoModule'
      },
      {
        path: 'analytics-dashboard',
        loadChildren: '../analytics/analytics.module#AnalyticsModule'
      },
      {
        path: 'rapid-analytics',
        loadChildren: './rapid-analytics/rapid-analytics.module#RapidAnalyticsModule'
      },
      // {
      //   path: 'bill',
      //   loadChildren: './billing/billing.module#BillingModule'
      // },
      // {
      //   path: 'analytics-dashboard',
      //   loadChildren: './analytics-dashboard/analytics-dashboard.module#AnalyticsDashboardModule'
      // },
    ],
    canActivate: [AuthGuard]
  },
];
