import { Component } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';

import { cryptography } from '@liskhq/lisk-client';

@Component({
  selector: 'app-passphrase',
  templateUrl: 'passphrase.page.html',
  styleUrls: ['../../app.component.scss', './passphrase.page.scss'],
})
export class PassphrasePage {
  address:string;
  passphrase:string;
  availableDelete:boolean;

  constructor(private modalController: ModalController, private navParams: NavParams,
              private clipboard: Clipboard, private matSnackBar: MatSnackBar) {
    this.address = this.navParams.data.address;
    this.passphrase = "";
  }

  setPassphrase(val:string) {
    this.passphrase = val;
  }

  async copy() {
    const result = await this.clipboard.copy(this.address);
    this.matSnackBar.open(result? 'copied': 'failed', 'close', { verticalPosition: 'top', duration: 3000 });
  }
  
  async sign() {
    this.passphrase = this.passphrase.trim().toLowerCase();
    if (!this.passphrase) {
      this.matSnackBar.open('passphrase is required.', 'close', { verticalPosition: 'top', duration: 3000 });
      return;
    }

    if (this.address !== cryptography.getLisk32AddressFromPassphrase(this.passphrase)) {
      this.matSnackBar.open('passphrase is incorrect.', 'close', { verticalPosition: 'top', duration: 3000 });
      return;
    }
    this.modalController.dismiss(this.passphrase);
  }

  close() {
    this.modalController.dismiss("");
  }
}
