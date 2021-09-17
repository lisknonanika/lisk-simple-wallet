import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MultiSignPage } from './multiSign.page';

const routes: Routes = [
  { path: '', component: MultiSignPage, }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MultiSignPageRoutingModule {}
