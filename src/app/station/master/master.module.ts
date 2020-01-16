import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material';
import { MatInputModule } from '@angular/material';
import { MatRadioModule } from '@angular/material';
import { MatButtonModule } from '@angular/material';
import { MatProgressBarModule } from '@angular/material';
import { MatExpansionModule } from '@angular/material/expansion';

import { MatToolbarModule } from '@angular/material';
import { MatMenuModule } from '@angular/material';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatDividerModule} from '@angular/material/divider';


import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AircraftComponent } from "./aircraft/aircraft.component";

import { MasterRoutes } from "./master.routing";
import { BaysComponent } from "./bay/bays.component";
import { DelayMappingsComponent } from "./delay-mapping/delay-mappings.component";
import { DelayMappingComponent } from "./delay-mapping/dealy-mapping/delay-mapping.component";
import { flightSchedulesComponent } from "./flight-schedule/flight-schedules.component";
import { flightScheduleComponent } from "./flight-schedule/flight-schedule/flight-schedule.component";
import { BayComponent } from "./bay/bay/bay.component";
import { TasksComponent } from "./tasks/tasks.component";
import { TaskComponent } from './tasks/task/task.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
// import { RegistrationComponent } from './registration/registration.component';
import { TextMaskModule } from 'angular2-text-mask';
import { MatDatepickerModule } from '@angular/material';
import {FilterPipe} from '../../service/app.pipe';
import {MatTooltipModule} from '@angular/material/tooltip';
import { AircraftsComponent } from './aircraft/aircrafts/aircrafts.component';
import { ScrollHighlightComponent } from '../../scroll-highlight/scroll-highlight.component';
import { ScrollHighlightModule } from 'app/scroll-highlight/scroll-highlight.module';
import { MasterSearch } from 'app/service/filter.pipe';
import { ContractsComponent } from './contracts/contracts.component';
// import { EqpFilterPipe } from 'app/service/app.pipe';
import {MatStepperModule} from '@angular/material/stepper';
import {CdkStepperModule} from '@angular/cdk/stepper';
import { MatTableModule } from '@angular/material/table';
import {MatAutocompleteModule} from '@angular/material/autocomplete';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    RouterModule.forChild(MasterRoutes),
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
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    ReactiveFormsModule,
    MatExpansionModule,
    TextMaskModule,
    MatDatepickerModule,
    MatTooltipModule,
    ScrollHighlightModule,
    MatDividerModule,
    MatStepperModule,
    CdkStepperModule,
    MatTableModule,
    MatAutocompleteModule
  ],
  declarations: [
    // ScrollHighlightComponent,
    AircraftComponent,
    BaysComponent,
    DelayMappingsComponent,
    DelayMappingComponent,
    flightSchedulesComponent,
    flightScheduleComponent,
    BayComponent,
    TasksComponent,
    TaskComponent,
    // RegistrationComponent,
    FilterPipe,
    AircraftsComponent,
    MasterSearch,
    ContractsComponent,
    // EqpFilterPipe
  ],
  entryComponents: [
    DelayMappingComponent,
    flightScheduleComponent,
    BayComponent,
    TaskComponent,
    AircraftsComponent
  ],
  providers:[MasterSearch]
})

export class MasterModule { }
