import { Routes } from '@angular/router';
import { DdrComponent } from './ddr/ddr.component';
import { TaskSummaryComponent } from './task-summary/task-summary.component';
import { FuelSummaryComponent } from './fuel-summary/fuel-summary.component';
import { DailyStatusComponent } from './daily-status/daily-status.component';

export const ReportsRoutes: Routes = [
    {
        path: '',
        redirectTo: 'ddr',
        pathMatch: 'full'
    },
    {
        path: 'ddr',
        component: DdrComponent
    },
    {
        path: 'summary',
        component: TaskSummaryComponent
    },
    {
        path: 'fuel',
        component: FuelSummaryComponent
    },
    {
        path: 'daily-status',
        component: DailyStatusComponent
    }];
