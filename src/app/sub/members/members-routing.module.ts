import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MembersPage } from './members.page';

const routes: Routes = [
  { path: '', component: MembersPage, }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MembersPageRoutingModule {}
