import { Routes } from '@angular/router';
import { BayAllocationComponent } from './bay_allocation/bay_allocation.component';
import { LiveStatusComponent } from './live_status/live_status.component';
import { TaskAssignmentComponent } from './task-assignment/task-assignment.component';
import { ResourceMapComponent } from './resource-map/resource-map.component';
import { GanttChartComponent } from './gantt_chart/gantt-chart.component';
import { GanttChartMatrixComponent } from './gantt-chart-matrix/gantt-chart-matrix.component';
import { TestComponent } from './airport-view/airport-test'
import { BillingComponent } from './billing/billing.component';
import { CriticalPathComponent } from './critical-path/critical-path-v2-component';
import { GanttChartV2Component } from './gantt-chart-v2/gantt-chart-v2.component';
export const FlifoRoutes: Routes = [
    {
        path: '',
        redirectTo: 'live_status',
        pathMatch: 'full'
    },
    {
        path: 'bay',
        component: BayAllocationComponent
    },
    {
        path: 'live_status',
        component: LiveStatusComponent,
        data: {
            layout: {
                tools: [
                    {
                        priority: 5,
                        action: 'TIMELINE',
                        active: false
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
        path: 'resource_map',
        component: ResourceMapComponent,
        // data: {
        //     layout: {
        //         tools: [
        //             // {
        //             //   priority: 1,
        //             //   action: 'PRINT'
        //             // },
        //             {
        //                 priority: 2,
        //                 action: 'GRID_VIEW',
        //                 active: true
        //             },
        //             {
        //                 priority: 3,
        //                 action: 'LIST_VIEW',
        //             },
        //             // {
        //             //   priority: 4,
        //             //   action: 'ADD',
        //             //   align: 'RIGHT'
        //             // }
        //         ]
        //     }
        // }
    },
    {
        path: 'airport_view',
        // component: AirportViewComponent,
        component: TestComponent,
        // data: {
        //     layout: {
        //         tools: [
        //             // {
        //             //   priority: 1,
        //             //   action: 'PRINT'
        //             // },
        //             {
        //                 priority: 1,
        //                 action: 'FLIGHT_NUMBER',
        //             },
        //             {
        //                 priority: 2,
        //                 action: 'FLIGHT_LOCATION',
        //             },
        //             {
        //                 priority: 3,
        //                 action: 'BAY_NUMBER',
        //             },
        //             {
        //                 priority: 4,
        //                 action: 'BAY_TASKS',
        //                 align: 'RIGHT'
        //             },
        //             // {
        //             //   priority: 4,
        //             //   action: 'ADD',
        //             //   align: 'RIGHT'
        //             // }
        //         ]
        //     }
        // }
    },
    {
        path: 'task_assignment',
        component: TaskAssignmentComponent
    },
    {
        path: 'gantt_chart/:id',
        component: GanttChartComponent
    },
    {
        path: 'gantt_chart_v2/:id',
        component: GanttChartV2Component
    },
    {
        path: 'matrix',
        component: GanttChartMatrixComponent
    },
    {
        path: 'path',
        component: CriticalPathComponent
    },
    {
        path: 'billing',
        component: BillingComponent
    },


];