import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SendPage } from './send.page';

const routes: Routes = [
  { path: '', component: SendPage, }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SendPageRoutingModule {}
