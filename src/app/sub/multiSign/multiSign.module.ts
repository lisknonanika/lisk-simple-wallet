import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MultiSignPage } from './multiSign.page';
import { MultiSignPageRoutingModule } from './multiSign-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MultiSignPageRoutingModule
  ],
  declarations: [MultiSignPage]
})
export class MultiSignPageModule {}
