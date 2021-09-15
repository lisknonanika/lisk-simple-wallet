import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SendPage } from './send.page';
import { SendPageRoutingModule } from './send-routing.module';


@NgModule({
  imports: [
    CommonModule,
    MatSnackBarModule,
    FormsModule,
    IonicModule,
    SendPageRoutingModule
  ],
  declarations: [SendPage]
})
export class SendPageModule {}
