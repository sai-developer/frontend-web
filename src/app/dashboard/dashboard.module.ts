import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule, MatCardModule, MatButtonModule, MatListModule, MatProgressBarModule, MatMenuModule } from '@angular/material';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatTabsModule} from '@angular/material/tabs';
import { FlexLayoutModule } from '@angular/flex-layout';

import {RoundProgressModule} from 'angular-svg-round-progressbar';
import { ProgressbarModule } from 'ngx-bootstrap';

import { ChartsModule } from 'ng2-charts/ng2-charts';
import { NgxChartsModule} from '@swimlane/ngx-charts';
import { AgmCoreModule } from '@agm/core';

import { DashboardComponent } from './dashboard.component';
import { DashboardRoutes } from './dashboard.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(DashboardRoutes),
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatProgressBarModule,
    MatMenuModule,
    ChartsModule,
    NgxChartsModule,
    FlexLayoutModule,
    MatTabsModule,
    AgmCoreModule.forRoot({apiKey: 'AIzaSyBtQQhZG8m6EA5qNPeg3rGZflQNwuI_kag'}),
    RoundProgressModule,
    ProgressbarModule.forRoot(),
    MatButtonToggleModule
  ],
  declarations: [ DashboardComponent ]
})

export class DashboardModule {}
