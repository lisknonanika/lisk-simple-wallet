import { Component } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { MatSnackBar } from '@angular/material/snack-bar';

import { cryptography } from '@liskhq/lisk-client';

import { StorageService } from '../../service/storage.service';
import { SignInAccount, TRANSFER_JSON } from '../../common/types';
import { getSignStatus, sendTransferTransaction, signTransaction } from '../../common/lisk-utils';

@Component({
  selector: 'app-send',
  templateUrl: 'passphrase.page.html',
  styleUrls: ['../../app.component.scss', './passphrase.page.scss'],
})
export class PassphrasePage {
  isView:boolean;
  model:PassphraseModel;
  signinAccount: SignInAccount;
  transaction: TRANSFER_JSON;
  network:number;
  networkId:string;
  address:string;
  isMultisignature:boolean;
  isMandatory:boolean;
  visibleSend:boolean;
  visibleSign:boolean;
  visibleSkip:boolean;
  ref:number;

  constructor(private router: Router, private route: ActivatedRoute,
              private matSnackBar: MatSnackBar, private storageService: StorageService) {
    this.isView = false;
    this.model = new PassphraseModel("");
  }

  async ionViewWillEnter() {
    this.address = this.route.snapshot.params['address'];
    this.route.queryParams.subscribe((params) => {this.ref = +params.ref});
    this.isMandatory = false;
    this.visibleSend = true;
    this.visibleSign = false;
    this.visibleSkip = false;

    // get signin account
    this.signinAccount = await this.storageService.getSignInAccount();
    if (!this.signinAccount) {
      this.back();
      return;
    }

    // get transaction
    this.transaction = await this.storageService.getTransaction();
    if (!this.transaction) {
      this.back();
      return;
    }

    // get networkId
    this.network = await this.storageService.getNetwork();
    this.networkId = await this.storageService.getNetworkId();
    if (!this.networkId) {
      this.back();
      return;
    }

    // multisignature?
    if (!this.signinAccount.isMultisignature) {
      this.isView = true;
      return;
    }

    // member?
    const member = this.signinAccount.multisignatureMembers.find((m) => {return m.address === this.address});
    if (!member) {
      this.skip();
      return;
    }

    // over sign?
    const signedStatus = getSignStatus(this.address, this.signinAccount, this.transaction.signatures, true);
    if (signedStatus.isOverSign) {
      this.matSnackBar.open('over the number of signatures.', 'close', { verticalPosition: 'top', duration: 2000 });
      this.back();
      return;
    }

    // set params
    this.isMandatory = member.isMandatory;
    this.visibleSend = signedStatus.isFullSign;
    this.visibleSign = !this.visibleSend;
    this.visibleSkip = !this.visibleSend;
    this.isView = true;
  }

  back() {
    if (this.ref === 0) {
      this.router.navigateByUrl('/action/send', {replaceUrl: true});
    } else {
      this.router.navigateByUrl('/home', {replaceUrl: true});
    }
  }

  clear() {
    this.model.passphrase = "";
  }

  async send() {
    this.model.passphrase = this.model.passphrase.trim().toLowerCase();
    if (!this.model.passphrase) {
      this.matSnackBar.open('passphrase is required.', 'close', { verticalPosition: 'top', duration: 2000 });
      return;
    }

    if (this.address !== cryptography.getLisk32AddressFromPassphrase(this.model.passphrase)) {
      this.matSnackBar.open('passphrase is incorrect.', 'close', { verticalPosition: 'top', duration: 2000 });
      return;
    }
    const signedTransaction = signTransaction(this.transaction, this.signinAccount, this.model.passphrase, this.networkId);
    if (!signedTransaction) {
      if (this.ref === 0) {
        this.router.navigateByUrl('/action/send', {replaceUrl: true});
      } else {
        this.router.navigateByUrl('/home', {replaceUrl: true});
      }
      return;
    }
    const result = await sendTransferTransaction(this.network, signedTransaction);
    if (!result) {
      this.matSnackBar.open('failed to send the transaction.', 'close', { verticalPosition: 'top', duration: 2000 });
      return;
    }
    
    this.matSnackBar.open(`sent the transaction. transactionId=${result}`, 'close', { verticalPosition: 'top', duration: 2000 });
    if (this.ref === 0) {
      this.router.navigateByUrl('/action/send', {replaceUrl: true});
    } else {
      this.router.navigateByUrl('/home', {replaceUrl: true});
    }
  }

  sign() {
    this.model.passphrase = "";
  }

  skip() {
    this.model.passphrase = "";
  }
}

export class PassphraseModel {
  constructor(
    public passphrase: string,
  ){}
}