import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountEditPage } from './accountEdit.page';

const routes: Routes = [
  { path: '', component: AccountEditPage, }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountEditPageRoutingModule {}
