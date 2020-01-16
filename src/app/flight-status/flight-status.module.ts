import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule, MatCardModule, MatButtonModule, MatListModule, MatProgressBarModule, MatMenuModule,MatExpansionModule, MatTooltipModule } from '@angular/material';
import {MatTabsModule} from '@angular/material/tabs';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDialogModule } from '@angular/material';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { NgxChartsModule} from '@swimlane/ngx-charts';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FSCGanttChartComponent } from './fsc-ganntchart.component';
import { FlightStatusComponent } from './flight-status.component';
import { FlightStatusRoutes } from './flight-status.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(FlightStatusRoutes),
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatMenuModule,
    ChartsModule,
    NgxChartsModule,
    NgxDatatableModule,
    FlexLayoutModule,
    MatExpansionModule,
    MatTabsModule,
    MatDialogModule
  ],
  declarations: [
    FlightStatusComponent,
    FSCGanttChartComponent
  ],
  entryComponents: [
    FSCGanttChartComponent,
  ],
})

export class FlightStatusModule {}
