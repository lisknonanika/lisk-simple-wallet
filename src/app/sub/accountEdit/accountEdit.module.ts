import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AccountEditPage } from './accountEdit.page';
import { AccountEditPageRoutingModule } from './accountEdit-routing.module';


@NgModule({
  imports: [
    CommonModule,
    DragDropModule,
    FormsModule,
    IonicModule,
    AccountEditPageRoutingModule
  ],
  declarations: [AccountEditPage]
})
export class AccountEditPageModule {}
