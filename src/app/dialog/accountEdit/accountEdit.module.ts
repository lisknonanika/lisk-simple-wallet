import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AccountEditPage } from './accountEdit.page';


@NgModule({
  imports: [
    CommonModule,
    ClipboardModule,
    FormsModule,
    IonicModule
  ],
  declarations: [AccountEditPage]
})
export class AccountEditPageModule {}
