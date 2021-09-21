import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompletePage } from './complete.page';

const routes: Routes = [
  { path: '', component: CompletePage, }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompletePageRoutingModule {}
