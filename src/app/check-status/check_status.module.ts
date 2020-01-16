import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule, MatCardModule, MatButtonModule, MatListModule, MatProgressBarModule, MatMenuModule, MatAutocompleteModule, MatInputModule } from '@angular/material';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatTabsModule} from '@angular/material/tabs';
import { FlexLayoutModule } from '@angular/flex-layout';
import {NgxPaginationModule} from 'ngx-pagination';
import {RoundProgressModule} from 'angular-svg-round-progressbar';
import { ProgressbarModule } from 'ngx-bootstrap';
import { MatSelectModule } from '@angular/material/select';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { NgxChartsModule} from '@swimlane/ngx-charts';
import { AgmCoreModule } from '@agm/core';
import {ReactiveFormsModule} from '@angular/forms';
import { CheckStatusComponent } from './check_status.component';
import { CheckStatusRoutes } from './check_status.routing';
import { FormsModule } from '@angular/forms';
import { CheckPipe } from 'app/service/app.pipe';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(CheckStatusRoutes),
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatProgressBarModule,
    MatMenuModule,
    ChartsModule,
    NgxChartsModule,
    MatSelectModule,
    NgxPaginationModule,
    FlexLayoutModule,
    MatTabsModule,
    AgmCoreModule.forRoot({apiKey: 'AIzaSyBtQQhZG8m6EA5qNPeg3rGZflQNwuI_kag'}),
    RoundProgressModule,
    ProgressbarModule.forRoot(),
    MatButtonToggleModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule
  ],
  declarations: [ CheckStatusComponent, CheckPipe ]
})

export class CheckStatusModule {}
