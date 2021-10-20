import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VotePage } from './vote.page';

const routes: Routes = [
  { path: '', component: VotePage, }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VotePageRoutingModule {}
