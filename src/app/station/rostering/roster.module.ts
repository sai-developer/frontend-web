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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxUploaderModule } from 'ngx-uploader';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

// import { RosteringComponent } from './rostering.component';
import { RosteringViewComponent } from './rostering-view.component';
import { RosterRoutes } from './roster.routing';
import { StaffsComponent } from "./staff/staffs.component";
import { StaffComponent } from "./staff/staff/staff.component";
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ShiftsComponent } from "./shift/shifts.component";
import { ShiftComponent } from "./shift/shift/shift.component";
// import { DensityComponent } from './density/density.component';
import { DailyRosterComponent } from './daily-roster/daily-roster.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgDragDropModule } from 'ng-drag-drop';
import { TextMaskModule } from 'angular2-text-mask';
import { ScrollHighlightComponent } from '../../scroll-highlight/scroll-highlight.component';
import { ScrollHighlightModule } from 'app/scroll-highlight/scroll-highlight.module';
import { SearchPipe } from 'app/service/filter.pipe';
import { ShiftDialogComponent } from './shift-dialog/shift-dialog';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    RouterModule.forChild(RosterRoutes),
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
    MatDatepickerModule,
    NgxUploaderModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    ChartsModule,
    NgxChartsModule,
    MatExpansionModule,
    TextMaskModule,
    NgDragDropModule.forRoot(),
    ScrollHighlightModule
  ],
  declarations: [
    // ScrollHighlightComponent,
    RosteringViewComponent,
    // RosteringComponent,
    StaffsComponent,
    StaffComponent,
    ShiftsComponent,
    ShiftComponent,
    // DensityComponent,
    DailyRosterComponent,
    SearchPipe,
    ShiftDialogComponent
  ],
  entryComponents: [
    StaffComponent,
    ShiftComponent,
    DailyRosterComponent,
    ScrollHighlightComponent,
    ShiftDialogComponent
  ],
  bootstrap: [DailyRosterComponent],
})

export class RosterModule { }
