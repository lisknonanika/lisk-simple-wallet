import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { PassphrasePage } from './passphrase.page';
import { PassphrasePageRoutingModule } from './passphrase-routing.module';


@NgModule({
  imports: [
    CommonModule,
    MatSnackBarModule,
    FormsModule,
    IonicModule,
    PassphrasePageRoutingModule
  ],
  declarations: [PassphrasePage]
})
export class PassphrasePageModule {}
