import { Routes } from '@angular/router';
import { OtpComponent } from './otp/otp.component';
import { TurnAroundComponent } from './turn-around/turn-around.component';
import { DelayComponent } from './delay/delay.component';

export const RapidAnalyticsRoutingModule: Routes = [
  {
    path: '',
    redirectTo: 'otp',
    pathMatch: 'full'
  },
  {
    path: 'otp',
    component: OtpComponent
  },
  {
    path: 'turn-around',
    component: TurnAroundComponent
  },
  {
    path: 'delay',
    component: DelayComponent
  }
];
