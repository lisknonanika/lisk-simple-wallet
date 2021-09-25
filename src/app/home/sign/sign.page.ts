import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { LoadingController } from '@ionic/angular';
import { ToastrService } from 'ngx-toastr';

import { cryptography } from '@liskhq/lisk-client';
const { getLisk32AddressFromPublicKey, hexToBuffer } = cryptography;

import { StorageService } from '../../service/storage.service';
import { getNetworkId, createSignInAccount, transferValidation } from '../../common/lisk-utils';
import { TransferTransaction, TRANSFER_JSON } from 'src/app/common/types';

@Component({
  selector: 'app-sign',
  templateUrl: 'sign.page.html',
  styleUrls: ['../../app.component.scss', './sign.page.scss'],
})
export class SignPage {
  model:SignModel;

  constructor(private router: Router, private LoadingController: LoadingController,
              private toastr: ToastrService, private storageService: StorageService) {
    this.model = new SignModel("");
  }

  async ionViewWillEnter() {
    await this.storageService.removeTransaction();
    await this.storageService.removeSignInAccount();
    await this.storageService.removeNetworkId();
  }

  ionViewWillLeave() {
    this.model.transaction = "";
  }

  async continue() {
    let loading:HTMLIonLoadingElement;
    try {
      // loading
      loading = await this.LoadingController.create({ spinner: 'dots', message: 'please wait ...' });
      await loading.present();
      
      // check
      this.model.transaction = this.model.transaction.trim();
      if (!this.model.transaction) {
        this.toastr.error('transaction is required.');
        return;
      }
      
      let transferTransaction:TransferTransaction;
      let address:string;
      try {
        const json = JSON.parse(this.model.transaction);
        transferTransaction = new TransferTransaction(json);
        address = getLisk32AddressFromPublicKey(hexToBuffer(transferTransaction.senderPublicKey));
      } catch(err) {
        this.toastr.error('invalid transaction.');
        return;
      }

      // set networkId
      const network = await this.storageService.getNetwork();
      const networkId = await getNetworkId(network);
      if (!networkId) {
        this.toastr.error('network error.');
        return;
      }
      await this.storageService.setNetworkId(networkId);

      // set signin account
      const signinAccount = await createSignInAccount(network, address, transferTransaction.senderPublicKey);
      if (!signinAccount) {
        this.toastr.error('network error.');
        return;
      }
      await this.storageService.setSignInAccount(signinAccount);

      if (!signinAccount.isMultisignature) {
        this.toastr.error('sender account is not multisignature account.');
        return;
      }

      // validation
      const tx:TRANSFER_JSON = transferTransaction.toJSON();
      const message = transferValidation(signinAccount, tx, true);
      if (message) {
        this.toastr.error(message);
        return;
      }

      // set transaction
      await this.storageService.setTransaction(tx);

      this.router.navigateByUrl(`/sub/multiSign?ref=1`, {replaceUrl: true});

    } finally {
      await loading.dismiss();
    }
  }
}

export class SignModel {
  constructor(
    public transaction: string,
  ){}
}