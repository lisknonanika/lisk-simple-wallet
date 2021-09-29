import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { ModalController, LoadingController } from '@ionic/angular';
import { ToastrService } from 'ngx-toastr';

import { transactions, cryptography } from '@liskhq/lisk-client';
const { computeMinFee, convertBeddowsToLSK, convertLSKToBeddows } = transactions;
const { bufferToHex, getAddressFromLisk32Address, validateLisk32Address } = cryptography;

import { StorageService } from '../../service/storage.service';
import { PassphrasePage } from '../../dialog/passphrase/passphrase.page';
import { EditAccountPage } from '../../dialog/editAccount/editAccount.page';
import { BookmarkPage } from '../../dialog/bookmark/bookmark.page';
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
  fee:string;

  constructor(private router: Router, private modalController: ModalController, private LoadingController: LoadingController,
              private toastr: ToastrService, private storageService: StorageService) {
    this.isView = false;
    this.model = new SendModel("", null, "", true);
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
      
      // validation
      if (!this.inputValidation()) return;
      await this.reload(true);
      const tx = this.createTransaction();
      const transactionJSON = tx.toJSON();
      const message = transferValidation(this.signinAccount, transactionJSON, false);
      if (message) {
        this.toastr.error(message);
        return;
      }

      // set transaction
      await this.storageService.setTransaction(transactionJSON);
      
      // add bookmark & open edit bookmark
      const bookmark = await this.storageService.getBookmark(this.model.recipient);
      if (this.model.addBookmark && !bookmark) {
        await this.storageService.setBookmark(this.model.recipient);
        await loading.dismiss();
        await this.openBookmarkEdit();
        loading = await this.LoadingController.create({ spinner: 'dots', message: 'please wait ...' });
        await loading.present();
      }

      // not ultisignature -> send
      if (!this.signinAccount.isMultisignature) {
        await loading.dismiss();
        const data = await this.openPassphrase();
        console.log(data)
        if (!data) return;
        loading = await this.LoadingController.create({ spinner: 'dots', message: 'please wait ...' });
        await loading.present();

        // send
        if (!(await this.send(transactionJSON, data))) return;
        this.router.navigateByUrl(`/sub/complete?ref=0`, {replaceUrl: true});
        return;
      }
      this.router.navigateByUrl(`/sub/multiSign?ref=0`, {replaceUrl: true});

    } finally {
      await loading.dismiss();
    }
  }

  inputValidation():boolean {
    this.model.recipient = this.model.recipient.trim().toLowerCase();
    this.model.data = this.model.data.trim();

    if (!this.model.recipient) {
      this.toastr.error("recipient address is required.");
      return false;
    }

    try {
      if (!validateLisk32Address(this.model.recipient)) {
        this.toastr.error("invalid recipient address.");
        return false;
      }
    } catch(err) {
      this.toastr.error("invalid recipient address.");
      return false;
    }

    if (this.model.amount === null) {
      this.toastr.error("amount is required.");
      return false;
    }

    try {
      convertLSKToBeddows(this.model.amount.toString());
    } catch(err) {
      this.toastr.error("invalid amount.");
      return false;
    }
    return true;
  }

  async send(transaction:TRANSFER_JSON, passphrase:string):Promise<boolean> {
    // sign transaction
    const signedTransaction = sign(transaction, this.signinAccount, passphrase, this.networkId);
    if (!signedTransaction) {
      this.toastr.error("failed to sign.");
      return false;
    }

    // send transaction
    const result = await sendTransferTransaction(this.network, signedTransaction);
    if (!result) {
      this.toastr.error("failed to send the transaction.");
      return false;
    }
    
    // update transaction
    transaction.id = result;
    await this.storageService.setTransaction(transaction);

    return true;
  }

  async openBookmarks() {
    const modal = await this.modalController.create({
      component: BookmarkPage,
      cssClass: 'dialog-custom-class',
      componentProps: { type: 1 }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (!data) return;
    this.model.recipient = data;
  }

  async openBookmarkEdit() {
    const modal = await this.modalController.create({
      component: EditAccountPage,
      cssClass: 'dialog-custom-class',
      componentProps: { address: this.model.recipient, availableDelete: false, type: 1 }
    });
    await modal.present();
    await modal.onDidDismiss();
  }

  async openPassphrase():Promise<any> {
    const modal = await this.modalController.create({
      component: PassphrasePage,
      cssClass: 'dialog-custom-class',
      componentProps: { address: this.address }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    return data;
  }
}

export class SendModel{
  constructor(
    public recipient: string,
    public amount: number,
    public data: string,
    public addBookmark: boolean
  ){}
}