import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { ToastrService } from 'ngx-toastr';

import { cryptography, passphrase } from '@liskhq/lisk-client';
const { getLisk32AddressFromPassphrase, getAddressAndPublicKeyFromPassphrase, bufferToHex } = cryptography;
const { Mnemonic }  = passphrase;

import { StorageService } from '../../service/storage.service';
import * as liskUtils from '../../common/lisk-utils';

@Component({
  selector: 'app-signin',
  templateUrl: 'signin.page.html',
  styleUrls: ['../../app.component.scss', './signin.page.scss'],
})
export class SignInPage {
  model:SignInModel;
  network:number;
  
  constructor(private router: Router, private toastr: ToastrService, private storageService: StorageService) {
    this.model = new SignInModel("");
  }

  async ionViewWillEnter() {
    await this.storageService.removeTransaction();
    await this.storageService.removeSignInAccount();
    await this.storageService.removeNetworkId();
    this.network = await this.storageService.getNetwork();
  }

  ionViewWillLeave() {
    this.model.passphrase = "";
  }

  async signIn() {
    this.model.passphrase = this.model.passphrase.trim().toLowerCase();
    if (!this.model.passphrase) {
      this.toastr.error('passphrase is required.');
      return;
    }
    if (!Mnemonic.validateMnemonic(this.model.passphrase)) {
      this.toastr.error('invalid passphrase.');
      return;
    }
    const address = getLisk32AddressFromPassphrase(this.model.passphrase);
    const publicKey = bufferToHex(getAddressAndPublicKeyFromPassphrase(this.model.passphrase).publicKey);

    // set networkId
    const network = await this.storageService.getNetwork();
    const networkId = await liskUtils.getNetworkId(network);
    if (!networkId) {
      this.toastr.error('network error.');
      return;
    }
    await this.storageService.setNetworkId(networkId);

    // set signin account
    const signinAccount = await liskUtils.createSignInAccount(network, address, publicKey);
    if (!signinAccount) {
      this.toastr.error('network error.');
      return;
    }
    await this.storageService.setSignInAccount(signinAccount);

    // register account
    const storeAccount = await this.storageService.getAccount(address);
    if (!storeAccount) await this.storageService?.setAccount(address, publicKey, signinAccount.userName);
    this.router.navigateByUrl('/action/info', {replaceUrl: true});
  }
}

export class SignInModel{
  constructor(
    public passphrase: string,
  ){}
}