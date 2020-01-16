import { Routes } from '@angular/router';

import { FlightStatusComponent } from './flight-status.component';

export const FlightStatusRoutes: Routes = [{
  path: '',
  component: FlightStatusComponent,
  data: {
    layout: {
      tools: [
        {
          priority: 1,
          action: 'UPLOAD',
          label: 'UPLOAD MAYFLY',
          align: 'RIGHT'
        }
      ]
    }
  }
}];
