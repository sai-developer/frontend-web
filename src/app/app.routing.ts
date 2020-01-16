import { Routes } from '@angular/router';

// import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { StationLayoutComponent } from './layouts/station/station-layout.component';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';

export const AppRoutes: Routes = [

  // routing to auth file for login
  {
    path:'',
    redirectTo:'auth',
    pathMatch:'full'
  },
  
  // routing to FSC dashboard, if it FSC user
  {
    path:'fsc',
    redirectTo:'fsc/dashboard',
    pathMatch:'full'
  },

  // routing to auth layout component - session -> login -> login component
  {
    path: '',
    component: AuthLayoutComponent,
    children:[
      {
        path:'auth',
        loadChildren:'./session/session.module#SessionModule'
      }
    ],
    // redirectTo: 'login',
    // pathMatch: 'full',
  },

  //routing to fsc user component to dashboard and flight status
  {
    path: 'fsc',
    component: StationLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: './dashboard/dashboard.module#DashboardModule'
      },
      {
        path: 'live_status',
        loadChildren: './flight-status/flight-status.module#FlightStatusModule'
      },
      {
        path: 'check_status',
        loadChildren: './check-status/check_status.module#CheckStatusModule'
      },
      {
        path: 'noc_analytics',
        loadChildren: './noc-analytics/noc-analytics.module#NocAnalyticsModule'
      }
    ]
  },

  //routing to station layout - layouts -> station -> station component
  {
    path: '',
    component: StationLayoutComponent,
    children: [
      {
        path: 'station',
        loadChildren: './station/station.module#StationModule'
      }
    ]
  }
];
