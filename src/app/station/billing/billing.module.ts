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
import { MatDatepickerModule } from '@angular/material';
import { MatTableModule } from '@angular/material/table';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ScrollHighlightModule } from 'app/scroll-highlight/scroll-highlight.module';
// import { ReportSearch } from 'app/service/filter.pipe';
import { BillingRoutes } from './billing.routing';
import { BillingComponent } from './billing/billing.component';
import { InvoiceComponent } from './billing/invoice/invoice.component';
import { ContractComponent } from './contract/contract.component';
import { ContractDetComponent } from './contract/contract-det/contract-det.component';
import { ContractsComponent } from './contracts/contracts.component';
import {MatExpansionModule} from '@angular/material/expansion';
// import { EqpFilterPipe } from 'app/service/app.pipe';
import {MatStepperModule} from '@angular/material/stepper';
import {CdkStepperModule} from '@angular/cdk/stepper';



@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(BillingRoutes),
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
    MatStepperModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatDatepickerModule,
    MatExpansionModule,
    CdkStepperModule,
    MatAutocompleteModule,
    // OwlDateTimeModule,
    // OwlNativeDateTimeModule,
    // TextMaskModule,
    ScrollHighlightModule
  ],
  declarations: [
    // ReportSearch,
    BillingComponent,
    InvoiceComponent,
    ContractComponent,
    ContractDetComponent,
    ContractsComponent,
    // EqpFilterPipe
  ],
  entryComponents: [
    InvoiceComponent,
    ContractDetComponent
  ],
  providers:[
    // EqpFilterPipe
  ]
})

export class BillingModule { }
