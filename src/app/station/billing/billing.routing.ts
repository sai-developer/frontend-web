import { Routes } from '@angular/router';
import { BillingComponent } from './billing/billing.component';
import { ContractComponent } from './contract/contract.component';
import { ContractsComponent } from './contracts/contracts.component';

export const BillingRoutes: Routes = [
{
    path: '',
    redirectTo: 'billing',
    pathMatch: 'full'
},
{
    path: 'billing',
    component: BillingComponent
},
{
    path:'contracts',
    component: ContractsComponent
}
];
