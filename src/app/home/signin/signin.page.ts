import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { StorageService } from '../../service/storage.service';
import { LiskService } from '../../service/lisk.service';

import { cryptography, passphrase } from '@liskhq/lisk-client';

@Component({
  selector: 'app-signin',
  templateUrl: 'signin.page.html',
  styleUrls: ['../../app.component.scss'],
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

  async setAccount(address:string) {
    await this.storageService?.setAccount(address);
  }

  async signIn() {
    if (!this.model.passphrase) return;
    if (!passphrase.Mnemonic.validateMnemonic(this.model.passphrase)) return;
    const address = cryptography.getLisk32AddressFromPassphrase(this.model.passphrase);
    this.liskService.setSignInAddress(address);
    if (!this.liskService.getSignInAddress) return;
    await this.setAccount(address);

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