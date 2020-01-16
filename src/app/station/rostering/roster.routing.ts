import { Routes } from '@angular/router';
import { RosteringViewComponent } from './rostering-view.component';
import { StaffsComponent } from "./staff/staffs.component";
import { ShiftsComponent } from './shift/shifts.component';
// import { DensityComponent } from './density/density.component';
import { DailyRosterComponent } from './daily-roster/daily-roster.component'
export const RosterRoutes: Routes = [
  {
    path: '',
    redirectTo: 'staff',
    pathMatch: 'full',
  },
  // {
  //   path: 'rostering',
  //   redirectTo: 'staff',
  //   pathMatch: 'full',
  // },
  {
    path: 'rosteringview',
    component: RosteringViewComponent,
  },
  {
    path: 'dailyroster',
    component: DailyRosterComponent
  },
  {
    path: 'staff',
    component: StaffsComponent,
    data: {
      layout: {
        tools: [
          // {
          //   priority: 1,
          //   action: 'PRINT'
          // },
          {
            priority: 2,
            action: 'LIST_VIEW',
            active: true
          },
          {
            priority: 3,
            action: 'GRID_VIEW',
          },
          {
            priority: 4,
            action: 'ADD',
            align: 'RIGHT'
          }
        ]
      }
    }
  },
  {
    path: 'shift',
    component: ShiftsComponent,
    data: {
      layout: {
        tools: [
          // {
          //   priority: 1,
          //   action: 'PRINT'
          // },
          {
            priority: 2,
            action: 'LIST_VIEW',
            active: true
          },
          {
            priority: 3,
            action: 'GRID_VIEW'
          },
          {
            priority: 4,
            action: 'ADD',
            align: 'RIGHT'
          }
        ]
      }
    }
  },
];
