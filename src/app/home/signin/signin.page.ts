import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { ModalController, LoadingController } from '@ionic/angular';
import { ToastrService } from 'ngx-toastr';

import { cryptography, passphrase } from '@liskhq/lisk-client';
const { getLisk32AddressFromPassphrase, getAddressAndPublicKeyFromPassphrase, bufferToHex } = cryptography;
const { Mnemonic }  = passphrase;

import { StorageService } from '../../service/storage.service';
import { getNetworkId, createSignInAccount } from '../../common/lisk-utils';
import { AboutPage } from '../../dialog/about/about.page';
import { CreateAccountPage } from '../../dialog/createAccount/createAccount.page';

@Component({
  selector: 'app-signin',
  templateUrl: 'signin.page.html',
  styleUrls: ['../../app.component.scss', './signin.page.scss'],
})
export class SignInPage {
  model:SignInModel;
  network:number;
  
  constructor(private router: Router, private modalController: ModalController, private LoadingController: LoadingController,
              private toastr: ToastrService, private storageService: StorageService) {
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
    let loading:HTMLIonLoadingElement;
    try {
      // loading
      loading = await this.LoadingController.create({ spinner: 'dots', message: 'please wait ...' });
      await loading.present();

      // check
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
      const networkId = await getNetworkId(network);
      if (!networkId) {
        this.toastr.error('network error.');
        return;
      }
      await this.storageService.setNetworkId(networkId);

      // set signin account
      const signinAccount = await createSignInAccount(network, address, publicKey);
      if (!signinAccount) {
        this.toastr.error('network error.');
        return;
      }
      await this.storageService.setSignInAccount(signinAccount);

      // register account
      const storeAccount = await this.storageService.getAccount(address);
      if (!storeAccount) await this.storageService?.setAccount(address, publicKey, signinAccount.userName);
      this.router.navigateByUrl('/action/info', {replaceUrl: true});

    } finally {
      await loading.dismiss();
    }
  }

  async openAbout() {
    const modal = await this.modalController.create({
      component: AboutPage,
      cssClass: 'dialog-custom-class'
    });
    await modal.present();
  }

  async createNewAccount() {
    const modal = await this.modalController.create({
      component: CreateAccountPage,
      cssClass: 'dialog-custom-class'
    });
    await modal.present();
  }
}

export class SignInModel{
  constructor(
    public passphrase: string,
  ){}
}