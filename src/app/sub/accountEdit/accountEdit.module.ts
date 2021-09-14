import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AccountEditPage } from './accountEdit.page';
import { AccountEditPageRoutingModule } from './accountEdit-routing.module';


@NgModule({
  imports: [
    CommonModule,
    ClipboardModule,
    MatSnackBarModule,
    FormsModule,
    IonicModule,
    AccountEditPageRoutingModule
  ],
  declarations: [AccountEditPage]
})
export class AccountEditPageModule {}
