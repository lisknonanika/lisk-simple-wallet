import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SignPage } from './sign.page';

import { SignPageRoutingModule } from './sign-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignPageRoutingModule
  ],
  declarations: [SignPage]
})
export class SignPageModule {}
