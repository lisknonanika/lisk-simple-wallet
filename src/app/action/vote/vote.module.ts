import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { VotePage } from './vote.page';
import { VotePageRoutingModule } from './vote-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VotePageRoutingModule
  ],
  declarations: [VotePage]
})
export class VotePageModule {}
