import { NgModule } from '@angular/core';
import { Component } from '@angular/core';
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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {MatExpansionModule} from '@angular/material/expansion';
import { NgDragDropModule } from 'ng-drag-drop';
import { AgmCoreModule } from '@agm/core';
import { NgGanttEditorModule } from 'ng-gantt';


import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

import { FlifoRoutes } from './flifo.routing';
import { BayAllocationComponent } from './bay_allocation/bay_allocation.component';
import { MatTableModule } from '@angular/material/table';
import { LiveStatusComponent } from './live_status/live_status.component';
import { TaskAssignmentComponent } from './task-assignment/task-assignment.component';
import { GanttChartComponent } from './gantt_chart/gantt-chart.component';
import { FlightStatusComponent } from './live_status/flight_status/flight_status.component';
import {MatSliderModule} from '@angular/material/slider';
import { AddFlightComponent } from './live_status/add-flight/add-flight.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { TextMaskModule } from 'angular2-text-mask';
import { ResourceMapComponent } from './resource-map/resource-map.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { GanttChartMatrixComponent } from './gantt-chart-matrix/gantt-chart-matrix.component';
import { ScrollHighlightModule } from 'app/scroll-highlight/scroll-highlight.module';
import { BillingComponent } from './billing/billing.component';
import { InvoiceComponent } from './billing/invoice/invoice.component';
// import { OwlMomentDateTimeModule, OWL_MOMENT_DATE_TIME_ADAPTER_OPTIONS } from 'ng-pick-datetime-moment';
import { TestComponent } from './airport-view/airport-test';
import { CriticalPathComponent } from './critical-path/critical-path-v2-component';
import { CriticalPathdataComponent } from './critical-path/critical-path-v3.component';
import { GanttChartV2Component } from './gantt-chart-v2/gantt-chart-v2.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(FlifoRoutes),
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
    MatDividerModule,
    MatExpansionModule,
    MatListModule,
    MatCheckboxModule,
    MatIconModule,
    MatDatepickerModule,
    NgDragDropModule.forRoot(),
    MatSliderModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    TextMaskModule,
    MatTooltipModule,
    ScrollHighlightModule,
    NgGanttEditorModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBtQQhZG8m6EA5qNPeg3rGZflQNwuI_kag'
    })
  ],
  providers: [
    // use french locale
    {provide: OWL_DATE_TIME_LOCALE, useValue: 'fr'},
  ],
  declarations: [
    BayAllocationComponent,
    LiveStatusComponent,
    TaskAssignmentComponent,
    GanttChartComponent,
    FlightStatusComponent,
    AddFlightComponent,
    ResourceMapComponent,
    GanttChartMatrixComponent,
    BillingComponent,
    InvoiceComponent,
    TestComponent,
    CriticalPathComponent,
    CriticalPathdataComponent,
    GanttChartV2Component
  ],
  entryComponents: [
    FlightStatusComponent,
    TaskAssignmentComponent,
    GanttChartComponent,
    AddFlightComponent,
    InvoiceComponent,
    CriticalPathdataComponent
  ],
//   providers: [
//     { provide: OWL_MOMENT_DATE_TIME_ADAPTER_OPTIONS, useValue: { useUtc: true } },
// ],
})

export class FlifoModule { }
