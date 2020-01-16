import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RapidAnalyticsRoutingModule } from './rapid-analytics-routing.module';
import { OtpComponent } from './otp/otp.component';
import { FormsModule } from '@angular/forms';
import { MatIconModule, MatCardModule, MatInputModule, MatRadioModule, MatButtonModule, MatProgressBarModule, MatToolbarModule, MatMenuModule, MatTabsModule, MatDialogModule, MatDatepickerModule, MatAutocompleteModule, MatSelectModule, MatSlideToggleModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ChartsModule } from 'ng2-charts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { MasterModule } from '../master/master.module';
import { NgxUploaderModule } from 'ngx-uploader';
import { ProgressbarModule } from 'ngx-bootstrap';
import { TurnAroundComponent } from './turn-around/turn-around.component';
import { DelayComponent } from './delay/delay.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(RapidAnalyticsRoutingModule),
    CommonModule,
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
  declarations: [OtpComponent, TurnAroundComponent, DelayComponent]
})
export class RapidAnalyticsModule { }
