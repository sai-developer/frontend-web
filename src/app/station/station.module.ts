import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material';
import { MatInputModule } from '@angular/material';
import { MatRadioModule } from '@angular/material';
import { MatButtonModule } from '@angular/material';
import { MatProgressBarModule } from '@angular/material';
import { MatToolbarModule } from '@angular/material';
import { MatMenuModule } from '@angular/material';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { MatIconModule} from '@angular/material';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxUploaderModule } from 'ngx-uploader';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';

import {RoundProgressModule} from 'angular-svg-round-progressbar';

import { ChartsModule } from 'ng2-charts/ng2-charts';
import { NgxChartsModule} from '@swimlane/ngx-charts';

import { DashboardComponent } from './dashboard/dashboard.component'
// import {ShiftComponent} from './shift/shift.component';
// import {RosteringComponent} from './rostering/rostering.component';
// import {RosteringViewComponent} from './rostering/rostering-view.component';


import { StationRoutes } from './station.routing';
import {MasterModule} from './master/master.module';
import {ReportsModule} from './reports/reports.module';
import {FlifoModule} from './flifo/flifo.module';
import {RosterModule} from './rostering/roster.module';


import {MetarModal} from './dashboard/metar-modal/metar-modal';
import {NotamModal} from './dashboard/notam-modal/notam-modal';
import { BillingModule } from './billing/billing.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    RouterModule.forChild(StationRoutes),
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    MatProgressBarModule,
    MatToolbarModule,
    FlexLayoutModule,
    MatMenuModule,
    ChartsModule,
    NgxChartsModule,
    MatTabsModule,
    RoundProgressModule,
    MasterModule,
    MatDialogModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatSlideToggleModule,
    NgxUploaderModule,
    ProgressbarModule.forRoot()
  ],
  declarations: [
    DashboardComponent,
    // ShiftComponent,
    // RosteringComponent,
    // RosteringViewComponent,
    MetarModal,
    NotamModal,
  ],
  entryComponents: [
    MetarModal,
    NotamModal
  ]
})

export class StationModule {}
