import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastrService } from 'ngx-toastr';

import { passphrase, cryptography } from '@liskhq/lisk-client';
const { Mnemonic } = passphrase;
const { getLisk32AddressFromPassphrase, getAddressAndPublicKeyFromPassphrase, bufferToHex } = cryptography;

@Component({
  selector: 'app-createAccount',
  templateUrl: 'createAccount.page.html',
  styleUrls: ['../../app.component.scss', './createAccount.page.scss'],
})
export class CreateAccountPage {
  network: number;
  account: { address:string, passphrase:string, publicKey:string };

  constructor(private modalController: ModalController, private clipboard: Clipboard,
              private toastr: ToastrService) {
    this.createAccount();
  }

  createAccount() {
    const passphrase = Mnemonic.generateMnemonic();
    const address = getLisk32AddressFromPassphrase(passphrase);
    const publicKey = getAddressAndPublicKeyFromPassphrase(passphrase).publicKey;
    this.account = {address: address, passphrase: passphrase, publicKey: bufferToHex(publicKey)}
  }

  async copy() {
    const result = await this.clipboard.copy(JSON.stringify(this.account, null, 2));
    if (result) {
      this.toastr.info("copied.");
    } else {
      this.toastr.error("failed.");
    }
  }

  close() {
    this.modalController.dismiss(false);
  }
}
