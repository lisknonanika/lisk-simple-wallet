import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { StorageService } from '../../service/storage.service';
import { LiskService } from '../../service/lisk.service';

import { cryptography, passphrase } from '@liskhq/lisk-client';

@Component({
  selector: 'app-signin',
  templateUrl: 'signin.page.html',
  styleUrls: ['../../app.component.scss', '../home.page.scss', './signin.page.scss'],
})
export class SignInPage {
  model:SignInModel;
  
  constructor(private router: Router, private storageService: StorageService, private liskService: LiskService) {
    this.model = new SignInModel("", false);
    this.liskService.init();
  }

  async ionViewWillEnter() {
    const network = await this.storageService.getNetwork();
    this.model.network = network !== 0;
  }

  ionViewWillLeave() {
    this.model.passphrase = "";
  }

  clear() {
    this.model.passphrase = "";
  }

  async signIn() {
    if (!this.model.passphrase) return;
    if (!passphrase.Mnemonic.validateMnemonic(this.model.passphrase)) return;
    const address = cryptography.getLisk32AddressFromPassphrase(this.model.passphrase);

    // set signin account
    await this.liskService.setSignInAccount(this.model.network? 1: 0, address);
    const signinAccount = this.liskService.getSignInAccount();
    if (!signinAccount.address) return;
    
    // register account
    const storeAccount = await this.storageService.getAccount(address);
    if (!storeAccount) await this.storageService?.setAccount(address, signinAccount.userName);

    this.router.navigateByUrl('/action', {replaceUrl: true});
  }

  async changeNetwork() {
    await this.storageService.setNetwork(this.model.network? 1: 0);
  }
}

export class SignInModel{
  constructor(
    public passphrase: string,
    public network: boolean,
  ){}
}