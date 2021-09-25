import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { ModalController, LoadingController } from '@ionic/angular';
import { ToastrService } from 'ngx-toastr';

import { transactions, cryptography } from '@liskhq/lisk-client';
const { computeMinFee, convertBeddowsToLSK, convertLSKToBeddows } = transactions;
const { bufferToHex, getAddressFromLisk32Address, validateLisk32Address } = cryptography;

import { StorageService } from '../../service/storage.service';
import { PassphrasePage } from '../../dialog/passphrase/passphrase.page';
import { getTransferAssetSchema } from '../../common/utils';
import { createSignInAccount, sendTransferTransaction, transferValidation, sign } from '../../common/lisk-utils';
import { SignInAccount, TransferTransaction, TRANSFER_JSON } from '../../common/types';

@Component({
  selector: 'app-send',
  templateUrl: 'send.page.html',
  styleUrls: ['../../app.component.scss', './send.page.scss'],
})
export class SendPage {
  isView:boolean;
  model:SendModel;
  network:number;
  networkId:string;
  signinAccount:SignInAccount;
  address:string;
  balance:string;
  misc:string;
  fee:string;

  constructor(private router: Router, private modalController: ModalController, private LoadingController: LoadingController,
              private toastr: ToastrService, private storageService: StorageService) {
    this.isView = false;
    this.model = new SendModel("", null, "");
    this.fee = "0";
  }

  async ionViewWillEnter() {
    await this.storageService.removeTransaction();
    await this.reload(false);
  }

  async reload(isUpdate:boolean) {
    // get network
    this.network = await this.storageService.getNetwork();
    this.networkId = await this.storageService.getNetworkId();
    if (!this.networkId) {
      this.signOut();
      return;
    }

    // get signin account
    this.signinAccount = await this.storageService.getSignInAccount();
    if (!this.signinAccount) {
      this.signOut();
      return;
    }
    
    // get account
    const storeAccount = await this.storageService.getAccount(this.signinAccount.address);
    if (!storeAccount) {
      this.signOut();
      return;
    }

    // update signin account
    if (isUpdate) {
      this.signinAccount = await createSignInAccount(this.network, this.signinAccount.address, this.signinAccount.publicKey);
      await this.storageService.setSignInAccount(this.signinAccount);
    }
    
    // set fields
    this.address = this.signinAccount.address;
    this.balance = convertBeddowsToLSK(this.signinAccount.balance||"0");
    this.misc = storeAccount? storeAccount.misc: this.signinAccount.userName;

    // compute fee
    await this.computeFee();

    this.isView = true;
  }

  signOut() {
    this.toastr.info("sign out.");
    this.router.navigateByUrl('/home', {replaceUrl: true});
  }

  clear(type:number) {
    if (type === 0) {
      this.model.recipient = "";

    } else if (type === 1) {
      this.model.amount = null;

    } else if (type === 2) {
      this.model.data = "";
    }
  }

  createTransaction():TransferTransaction {
    const tx = new TransferTransaction();
    tx.nonce = this.signinAccount.nonce;
    tx.senderPublicKey = this.signinAccount.publicKey;
    tx.asset = {
      recipientAddress:  bufferToHex(getAddressFromLisk32Address(this.model.recipient)),
      amount: convertLSKToBeddows(this.model.amount.toString()),
      data: this.model.data
    }
    tx.fee = convertLSKToBeddows(this.fee);
    if (this.signinAccount.isMultisignature) {
      tx.signatures = this.signinAccount.multisignatureMembers.map(() => { return ""});
    } else {
      tx.signatures = [""];
    }
    return tx;
  }

  async computeFee() {
    try {
      this.fee = "0";
      if (!this.model.recipient || !validateLisk32Address(this.model.recipient.trim().toLocaleLowerCase())) return;
      if (this.model.amount === null || this.model.amount <= 0 || this.model.amount > 99999999.99999999) return;
      try { convertLSKToBeddows(this.model.amount.toString()); } catch(err) { return; }
      if (this.model.data.length > 64) return;

      const tx = this.createTransaction();
      const options = this.signinAccount.isMultisignature? {numberOfSignatures: this.signinAccount.numberOfSignatures}: {};
      const minFee = computeMinFee(getTransferAssetSchema(), tx.toJsObject(), options);
      this.fee = convertBeddowsToLSK(minFee.toString());

    } catch(err) {
      // none
    }
  }

  async continue() {
    let loading:HTMLIonLoadingElement;
    try {
      // loading
      loading = await this.LoadingController.create({ spinner: 'dots', message: 'please wait ...' });
      await loading.present();
      
      this.model.recipient = this.model.recipient.trim().toLowerCase();
      this.model.data = this.model.data.trim();

      if (!this.model.recipient) {
        this.toastr.error("recipient address is required.");
        return;
      }

      try {
        if (!validateLisk32Address(this.model.recipient)) {
          this.toastr.error("invalid recipient address.");
          return;
        }
      } catch(err) {
        this.toastr.error("invalid recipient address.");
        return;
      }

      if (this.model.amount === null) {
        this.toastr.error("amount is required.");
        return;
      }

      try {
        convertLSKToBeddows(this.model.amount.toString());
      } catch(err) {
        this.toastr.error("invalid amount.");
        return;
      }

      await this.reload(true);
      const tx = this.createTransaction();
      const transactionJSON = tx.toJSON();

      const message = transferValidation(this.signinAccount, tx.toJSON(), false);
      if (message) {
        this.toastr.error(message);
        return;
      }

      // update transaction
      await this.storageService.setTransaction(transactionJSON);

      // not ultisignature -> send
      if (!this.signinAccount.isMultisignature) {
        await loading.dismiss();
        const modal = await this.modalController.create({
          component: PassphrasePage,
          cssClass: 'dialog-custom-class',
          componentProps: { address: this.address }
        });
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if (!data) return;

        const result = await this.send(transactionJSON, data);
        if (!result) return;
        
        // update transaction
        transactionJSON.id = result;
        await this.storageService.setTransaction(transactionJSON);
        this.router.navigateByUrl(`/sub/complete?ref=0`, {replaceUrl: true});
        return;
      }
      this.router.navigateByUrl(`/sub/multiSign?ref=0`, {replaceUrl: true});

    } finally {
      await loading.dismiss();
    }
  }

  async send(transaction:TRANSFER_JSON, passphrase:string):Promise<string> {
    const signedTransaction = sign(transaction, this.signinAccount, passphrase, this.networkId);
    if (!signedTransaction) {
      this.toastr.error("failed to sign.");
      return "";
    }

    const result = await sendTransferTransaction(this.network, signedTransaction);
    if (!result) {
      this.toastr.error("failed to send the transaction.");
      return "";
    }
    return result;
  }
}

export class SendModel{
  constructor(
    public recipient: string,
    public amount: number,
    public data: string,
  ){}
}