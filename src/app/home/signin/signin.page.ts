import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { MatSnackBar } from '@angular/material/snack-bar';

import { cryptography, passphrase } from '@liskhq/lisk-client';

import { StorageService } from '../../service/storage.service';
import { LiskService } from '../../service/lisk.service';

@Component({
  selector: 'app-signin',
  templateUrl: 'signin.page.html',
  styleUrls: ['../../app.component.scss', './signin.page.scss'],
})
export class SignInPage {
  model:SignInModel;
  
  constructor(private router: Router, private matSnackBar: MatSnackBar,
              private storageService: StorageService, private liskService: LiskService) {
    this.model = new SignInModel("");
    this.liskService.init();
  }

  async ionViewWillEnter() {
    await this.storageService.setSignInAddress("");
  }

  ionViewWillLeave() {
    this.model.passphrase = "";
  }

  clear() {
    this.model.passphrase = "";
  }

  async signIn() {
    this.model.passphrase = this.model.passphrase.trim().toLowerCase();
    if (!this.model.passphrase) {
      this.matSnackBar.open('passphrase is required.', 'close', { verticalPosition: 'top', duration: 1000 });
      return;
    }
    if (!passphrase.Mnemonic.validateMnemonic(this.model.passphrase)) {
      this.matSnackBar.open('invalid passphrase.', 'close', { verticalPosition: 'top', duration: 1000 });
      return;
    }
    const address = cryptography.getLisk32AddressFromPassphrase(this.model.passphrase);
    await this.storageService.setSignInAddress(address);

    // register account
    const storeAccount = await this.storageService.getAccount(address);
    if (!storeAccount) {
      await this.liskService.setSignInAccount(await this.storageService.getNetwork(), address);
      const signinAccount = this.liskService.getSignInAccount();
      const publicKey = cryptography.getAddressAndPublicKeyFromPassphrase(this.model.passphrase).publicKey;
      await this.storageService?.setAccount(address, publicKey, signinAccount.userName);
    }

    this.router.navigateByUrl('/action/info', {replaceUrl: true});
  }
}

export class SignInModel{
  constructor(
    public passphrase: string,
  ){}
}