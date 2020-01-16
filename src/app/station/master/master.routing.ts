import { Routes } from '@angular/router';
import { AircraftComponent } from './aircraft/aircraft.component';
import { BaysComponent } from './bay/bays.component';
import {flightSchedulesComponent} from './flight-schedule/flight-schedules.component';
import { DelayMappingsComponent } from './delay-mapping/delay-mappings.component';
import { TasksComponent } from './tasks/tasks.component';
import { ContractsComponent } from './contracts/contracts.component';
// import { RegistrationComponent } from './registration/registration.component'

export const MasterRoutes: Routes = [
  {
    path: '',
    redirectTo: 'master/flight-schedule',
    pathMatch: 'full',
  },
  {
    path: 'master',
    redirectTo: 'master/flight-schedule',
    pathMatch: 'full',
  },
  {
    path: 'aircraft',
    component: AircraftComponent,
    data: {
      layout: {
        tools: [
          // {
          //   priority: 1,
          //   action: 'PRINT'
          // },
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
    path: 'flight-schedule',
    component: flightSchedulesComponent,
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
  {
    path: 'task',
    component: TasksComponent,
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
          },
        ]
      }
    }
  },
  {
    path: 'delay_mapping',
    component: DelayMappingsComponent,
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
  {
    path: 'bay',
    component: BaysComponent,
    data: {
      layout: {
        tools: [
          // {
          //   priority: 1,
          //   action: 'PRINT'
          // },
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
    path: 'contracts',
    component: ContractsComponent
},
];