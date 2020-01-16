import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TabComponent } from './tabs/tab.component';
import { LoaderComponent } from './loader/loader.component';
import { FilterComponent } from './filter/filter.component';

import { PerfSummComponent } from './tabs/performance/perf.summary.component';
import { ObdAnalysisComponent } from './tabs/obd/obd.analysis.component';
import { OperSummComponent } from './tabs/operations/oper.summary.component';
import { GroundSummComponent } from './tabs/ground/ground.summary.component';

import { GlobalDataService } from './global.data.service';
import { FilterDataService } from './filter/filter.data.service';
import { PerfDataService } from './tabs/performance/perf.data.service';
import { OBDDataService } from './tabs/obd/obd.data.service';
import { OperDataService } from './tabs/operations/oper.data.service';
import { GroundDataService } from './tabs/ground/ground.data.service';

import { CardComponent } from './charts/card/card.component';
import { BarLineChartComponent } from './charts/bar-line-chart/bar-line-chart.component';
import { HorzBarChartComponent } from './charts/horz-bar-chart/horz-bar-chart.component';

import { SunburstChartComponent } from './charts/sunburst-chart/sunburst-chart.component';
import { StackedBarChartComponent } from './charts/stacked-bar-chart/stacked-bar-chart.component';
import { HeatmapChartComponent } from './charts/heatmap-chart/heatmap-chart.component';
import { ObdTableComponent } from './tables/obd-table/obd-table.component';

import { DonutChartComponent } from './charts/donut-chart/donut-chart.component';
import { LineChartComponent } from './charts/line-chart/line-chart.component';

import { ProgressBarComponent } from './charts/progress-bar/progress-bar.component';
import { GrndSumTableComponent } from './tables/grnd-sum-table/grnd-sum-table.component';

import { AnalyticsRoutingModule } from './analytics-routing.module';
import { AnalyticsComponent } from './analytics.component';

@NgModule({
  imports: [CommonModule, FormsModule, AnalyticsRoutingModule],
  declarations: [
    AnalyticsComponent,
    TabComponent,
    LoaderComponent,
    FilterComponent,
    PerfSummComponent,
    ObdAnalysisComponent,
    OperSummComponent,
    GroundSummComponent,
    CardComponent,
    BarLineChartComponent,
    HorzBarChartComponent,
    SunburstChartComponent,
    StackedBarChartComponent,
    HeatmapChartComponent,
    ObdTableComponent,
    DonutChartComponent,
    LineChartComponent,
    ProgressBarComponent,
    GrndSumTableComponent
  ],
  providers: [GlobalDataService, FilterDataService, PerfDataService, OBDDataService, OperDataService, GroundDataService]
})
export class AnalyticsModule {}
