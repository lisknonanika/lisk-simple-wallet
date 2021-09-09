import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { HistoryPage } from './history.page';
import { HistoryPageRoutingModule } from './history-routing.module';


@NgModule({
  imports: [
    CommonModule,
    DragDropModule,
    FormsModule,
    IonicModule,
    HistoryPageRoutingModule
  ],
  declarations: [HistoryPage]
})
export class HistoryPageModule {}
