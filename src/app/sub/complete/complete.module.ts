import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CompletePage } from './complete.page';
import { CompletePageRoutingModule } from './complete-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CompletePageRoutingModule
  ],
  declarations: [CompletePage]
})
export class CompletePageModule {}
