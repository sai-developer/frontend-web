import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NocAnalyticsComponent } from './noc-analytics.component';
import { RouterModule } from '@angular/router';
import { NocAnalyticsRoutes } from './noc-analytics.routing';
import { FormsModule } from '@angular/forms';
import { MatIconModule, MatCardModule, MatInputModule, MatRadioModule, MatButtonModule, MatProgressBarModule, MatToolbarModule, MatMenuModule, MatTabsModule, MatDialogModule, MatDatepickerModule, MatAutocompleteModule, MatSelectModule, MatSlideToggleModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { NgxChartsModule} from '@swimlane/ngx-charts';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { NgxUploaderModule } from 'ngx-uploader';
import { ProgressbarModule } from 'ngx-bootstrap';
import { MasterModule } from 'app/station/master/master.module';



@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(NocAnalyticsRoutes),
    FormsModule,
    MatIconModule,
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
  declarations: [NocAnalyticsComponent]
})
export class NocAnalyticsModule { }
