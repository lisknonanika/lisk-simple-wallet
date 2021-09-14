import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MembersPage } from './members.page';
import { MembersPageRoutingModule } from './members-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MembersPageRoutingModule
  ],
  declarations: [MembersPage]
})
export class MembersModule {}
