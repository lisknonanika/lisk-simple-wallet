import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { MatSnackBar } from '@angular/material/snack-bar';

import { transactions, cryptography } from '@liskhq/lisk-client';

import { StorageService } from '../../service/storage.service';
import { getTransferAssetSchema } from '../../common/utils';
import { Account, SignInAccount, TransferTransaction } from '../../common/types';

@Component({
  selector: 'app-send',
  templateUrl: 'send.page.html',
  styleUrls: ['../../app.component.scss', './send.page.scss'],
})
export class SendPage {
  isView:boolean;
  model:SendModel;
  storeAccount:Account;
  signinAccount:SignInAccount;
  address:string;
  balance:string;
  fee:string;

  constructor(private router: Router, private matSnackBar: MatSnackBar, private storageService: StorageService) {
    this.isView = false;
    this.model = new SendModel("", null, "");
    this.fee = "0";
  }

  async ionViewWillEnter() {
    await this.reload();
  }

  async reload() {
    this.signinAccount = await this.storageService.getSignInAccount();
    if (!this.signinAccount) {
      this.signOut();
      return;
    }
    
    // get account
    this.storeAccount = await this.storageService.getAccount(this.signinAccount.address);
    if (!this.storeAccount) {
      this.signOut();
      return;
    }

    this.address = this.signinAccount.address;
    this.balance = transactions.convertBeddowsToLSK(this.signinAccount.balance||"0");

    this.isView = true;
  }

  signOut() {
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

  async computeFee() {
    try {
      console.log("computeFee")
      this.fee = "0";
      if (!this.model.recipient || !cryptography.validateBase32Address(this.model.recipient)) return;
      if (this.model.amount === null || this.model.amount <= 0) return;
      if (this.model.data.length > 64) return;

      const tx = new TransferTransaction();
      tx.nonce = this.signinAccount.nonce;
      tx.senderPublicKey = this.storeAccount.publicKey;
      tx.asset = {
        recipientAddress: cryptography.getAddressFromLisk32Address(this.model.recipient),
        amount: BigInt(transactions.convertLSKToBeddows(this.model.amount.toString())),
        data: this.model.data
      }

      const options = this.signinAccount.isMultisignature? {numberOfSignatures: this.signinAccount.numberOfSignatures}: {};
      const minFee = transactions.computeMinFee(getTransferAssetSchema(), tx.toJSON(), options);
      this.fee = transactions.convertBeddowsToLSK(minFee.toString());

    } catch(err) {
      // none
    }
  }

  continue() {
    this.model.recipient = this.model.recipient.trim().toLowerCase();
    this.model.data = this.model.data.trim();

    if (!this.model.recipient) {
      this.matSnackBar.open('recipient address is required.', 'close', { verticalPosition: 'top', duration: 1000 });
      return;
    }

    try {
      if (!cryptography.validateBase32Address(this.model.recipient)) {
        this.matSnackBar.open('invalid recipient address.', 'close', { verticalPosition: 'top', duration: 1000 });
        return;
      }
    } catch(err) {
      this.matSnackBar.open('invalid recipient address.', 'close', { verticalPosition: 'top', duration: 1000 });
      return;
    }

    if (this.model.amount === null) {
      this.matSnackBar.open('amount is required.', 'close', { verticalPosition: 'top', duration: 1000 });
      return;
    }

    if (this.model.amount <= 0) {
      this.matSnackBar.open('invalid amount.', 'close', { verticalPosition: 'top', duration: 1000 });
      return;
    }

    if (this.model.data.length > 64) {
      this.matSnackBar.open('data exceeds the maximum number of characters (Max:64).', 'close', { verticalPosition: 'top', duration: 1000 });
      return;
    }
  }
}

export class SendModel{
  constructor(
    public recipient: string,
    public amount: number,
    public data: string,
  ){}
}