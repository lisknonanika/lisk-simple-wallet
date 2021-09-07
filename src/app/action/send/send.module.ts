import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SendPage } from './send.page';

import { SendPageRoutingModule } from './send-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SendPageRoutingModule
  ],
  declarations: [SendPage]
})
export class SendPageModule {}
