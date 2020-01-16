import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule, MatIconModule } from '@angular/material';
import { MatInputModule } from '@angular/material';
import { MatRadioModule } from '@angular/material';
import { MatButtonModule, MatTooltipModule } from '@angular/material';
import { MatProgressBarModule } from '@angular/material';
import { MatToolbarModule } from '@angular/material';
import { MatMenuModule } from '@angular/material';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material';
import { NgxUploaderModule } from 'ngx-uploader';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';



import { ReportsRoutes } from './reports.routing';
import { DdrComponent } from './ddr/ddr.component';
import { MatTableModule } from '@angular/material/table';
import { ViewDdrComponent} from './ddr/view-ddr/view-ddr.component';
import {SendDdrComponent} from './ddr/send-ddr/send-ddr.component';
import { TaskSummaryComponent } from './task-summary/task-summary.component';
import { SummaryComponent } from './task-summary/summary/summary.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { TextMaskModule } from 'angular2-text-mask';
import { EditSummaryComponent } from './task-summary/summary/edit-summary/edit-summary.component';
import { FuelSummaryComponent } from './fuel-summary/fuel-summary.component';
import { ScrollHighlightModule } from 'app/scroll-highlight/scroll-highlight.module';
import { ReportSearch } from 'app/service/filter.pipe';
import { MatExpansionModule } from '@angular/material/expansion';
import { ViewEqpsComponent } from './ddr/view-eqps/view-eqps.component';
import { DailyStatusComponent } from './daily-status/daily-status.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ReportsRoutes),
    MatTableModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    MatProgressBarModule,
    MatToolbarModule,
    FlexLayoutModule,
    MatMenuModule,
    MatTabsModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatDatepickerModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    TextMaskModule,
    ScrollHighlightModule,
    MatExpansionModule,
    MatTooltipModule
  ],
  declarations: [
    DdrComponent,
    ViewDdrComponent,
    TaskSummaryComponent,
    SummaryComponent,
    EditSummaryComponent,
    FuelSummaryComponent,
    ReportSearch,
    ViewEqpsComponent,
    DailyStatusComponent,
    SendDdrComponent
  ],
  entryComponents: [
    ViewDdrComponent,
    SummaryComponent,
    EditSummaryComponent,
    ViewEqpsComponent,
    SendDdrComponent

  ],
  providers:[ReportSearch]
})

export class ReportsModule { }
