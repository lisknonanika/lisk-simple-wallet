import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { MatSnackBar } from '@angular/material/snack-bar';

import { transactions, cryptography } from '@liskhq/lisk-client';

import { StorageService } from '../../service/storage.service';
import { LiskService } from '../../service/lisk.service';
import { getTransferAssetSchema } from '../../common/utils';
import { SignInAccount, TransferTransaction } from '../../common/types';

@Component({
  selector: 'app-send',
  templateUrl: 'send.page.html',
  styleUrls: ['../../app.component.scss', './send.page.scss'],
})
export class SendPage {
  isView:boolean;
  model:SendModel;
  signinAccount:SignInAccount;
  address:string;
  balance:string;
  isMultisignature:boolean;
  publicKey:Buffer;
  fee:string;

  constructor(private router: Router, private matSnackBar: MatSnackBar,
              private storageService: StorageService, private liskService: LiskService) {
    this.isView = false;
    this.liskService.init();
    this.model = new SendModel("", null, "");
    this.fee = "0";
  }

  async ionViewWillEnter() {
    this.address = await this.storageService.getSignInAddress();
    if (!this.address) {
      this.signOut();
      return;
    }
    
    // get account
    const storeAccount = await this.storageService.getAccount(this.address);
    if (!storeAccount) {
      this.signOut();
      return;
    }

    await this.liskService.setSignInAccount(await this.storageService.getNetwork(), this.address);
    this.signinAccount = this.liskService.getSignInAccount();
    if (!this.signinAccount.address) {
      this.signOut();
      return;
    }

    this.balance = transactions.convertBeddowsToLSK(this.signinAccount.balance||"0");
    this.isMultisignature = this.signinAccount.isMultisignature;
    this.publicKey = storeAccount.publicKey;

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
      this.fee = "0";
      if (!this.model.recipient || !cryptography.validateBase32Address(this.model.recipient)) return;
      if (this.model.amount === null || this.model.amount <= 0) return;
      if (this.model.data.length > 64) return;

      const tx = new TransferTransaction();

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