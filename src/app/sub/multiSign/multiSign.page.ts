import { Component } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModalController } from '@ionic/angular';

import { transactions, cryptography } from '@liskhq/lisk-client';

import { StorageService } from '../../service/storage.service';
import { PassphrasePage } from '../../dialog/passphrase/passphrase.page';
import { SignInAccount, SignStatus, TransferTransaction, TRANSFER_JSON } from '../../common/types';
import { createSignInAccount, getSignStatus, sendTransferTransaction, signTransaction } from '../../common/lisk-utils';

@Component({
  selector: 'app-send',
  templateUrl: 'multiSign.page.html',
  styleUrls: ['../../app.component.scss', './multiSign.page.scss'],
})
export class MultiSignPage {
  isView:boolean;
  signinAccount: SignInAccount;
  signedStatus: SignStatus;
  senderStatus: MemberStatus;
  mandatoryStatus: MemberStatus[];
  optionalStatus: MemberStatus[];
  transaction: TRANSFER_JSON;
  network:number;
  networkId:string;
  ref:number;

  constructor(private router: Router, private route: ActivatedRoute,
              private matSnackBar: MatSnackBar, private modalController: ModalController,
              private storageService: StorageService) {
    this.isView = false;
  }

  async ionViewWillEnter() {
    this.route.queryParams.subscribe((params) => {this.ref = +params.ref});
    await this.reload();
  }

  async reload() {
    // get networkId
    this.network = await this.storageService.getNetwork();
    this.networkId = await this.storageService.getNetworkId();
    if (!this.networkId) {
      this.back();
      return;
    }

    // get transaction
    this.transaction = await this.storageService.getTransaction();
    if (!this.transaction) {
      this.back();
      return;
    }

    // get signin account
    this.signinAccount = await this.storageService.getSignInAccount();
    if (!this.signinAccount) {
      this.back();
      return;
    }

    // update signin account
    this.signinAccount = await createSignInAccount(this.network, this.signinAccount.address, this.signinAccount.publicKey);
    await this.storageService.setSignInAccount(this.signinAccount);

    // get signed status
    this.signedStatus = getSignStatus(this.signinAccount, this.transaction.signatures);

    // over sign?
    if (this.signedStatus.isOverSign) {
      this.matSnackBar.open('over the number of signatures.', 'close', { verticalPosition: 'top', duration: 3000 });
      this.back();
      return;
    }

    // set member status
    const senderAddress = this.signinAccount.address;
    const multisignatureMembers = this.signinAccount.multisignatureMembers;
    const sender = multisignatureMembers.find((m) => {return m.address === senderAddress});
    const mandatories = multisignatureMembers.filter((m) => {return m.address !== senderAddress && m.isMandatory})||[];
    const optionals = multisignatureMembers.filter((m) => {return m.address !== senderAddress && !m.isMandatory})||[];
    this.senderStatus = new MemberStatus(sender.address, sender.publicKey, sender.isMandatory, this.signedStatus.signedAddress.includes(sender.address));
    this.mandatoryStatus = mandatories.map((m) => {return new MemberStatus(m.address, m.publicKey, true, this.signedStatus.signedAddress.includes(m.address))})||[];
    this.optionalStatus = optionals.map((m) => {return new MemberStatus(m.address, m.publicKey, false, this.signedStatus.signedAddress.includes(m.address))})||[];

    // set params
    this.isView = true;
  }

  back() {
    if (this.ref === 0) {
      this.router.navigateByUrl('/action/send');
    } else {
      this.router.navigateByUrl('/home', {replaceUrl: true});
    }
  }

  async sign(address:string) {
    if (this.signedStatus.signedAddress.includes(address)) return;

    // validation
    if (!(await this.transferValidation())) return;

    // create transaction
    const tx:TransferTransaction = new TransferTransaction(this.transaction);
    const transactionJSON = tx.toJSON();
    await this.storageService.setTransaction(transactionJSON);

    // open dialog
    const modal = await this.modalController.create({
      component: PassphrasePage,
      cssClass: 'dialog-custom-class',
      componentProps: { address: address }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (!data) return;

    // sign transaction
    const signedTransaction = signTransaction(this.transaction, this.signinAccount, data, this.networkId);
    if (!signedTransaction) {
      this.matSnackBar.open('failed to sign.', 'close', { verticalPosition: 'top', duration: 3000 });
      return "";
    }

    // update transaction
    const newTransaction = new TransferTransaction();
    this.storageService.setTransaction(newTransaction.object2JSON(signedTransaction));
    console.log(newTransaction.object2JSON(signedTransaction));

    // reload
    await this.reload();
  }

  async send():Promise<string> {
    const tx = new TransferTransaction(this.transaction);
    const result = await sendTransferTransaction(this.network, tx.toJsObject());
    if (!result) {
      this.matSnackBar.open('failed to send the transaction.', 'close', { verticalPosition: 'top', duration: 3000 });
      return;
    }
    console.log(result);
  }

  async transferValidation() {
    const recipient = this.transaction.asset.recipientAddress;
    if (!recipient) {
      this.matSnackBar.open('recipient address is required.', 'close', { verticalPosition: 'top', duration: 3000 });
      return false;
    }

    try {
      if (!cryptography.validateLisk32Address(cryptography.getLisk32AddressFromAddress(cryptography.hexToBuffer(recipient)))) {
        this.matSnackBar.open('invalid recipient address.', 'close', { verticalPosition: 'top', duration: 3000 });
        return false;
      }
    } catch(err) {
      this.matSnackBar.open('invalid recipient address.', 'close', { verticalPosition: 'top', duration: 3000 });
      return false;
    }

    const amount = this.transaction.asset.amount;
    if (!amount) {
      this.matSnackBar.open('amount is required.', 'close', { verticalPosition: 'top', duration: 3000 });
      return false;
    }

    try {
      if (BigInt(amount) <= 0) {
        this.matSnackBar.open('invalid amount.', 'close', { verticalPosition: 'top', duration: 3000 });
        return false;
      }
    } catch(err) {
      this.matSnackBar.open('invalid amount.', 'close', { verticalPosition: 'top', duration: 3000 });
      return false;
    }

    const data = this.transaction.asset.data;
    if (data.length > 64) {
      this.matSnackBar.open('data exceeds the maximum number of characters (Max:64).', 'close', { verticalPosition: 'top', duration: 3000 });
      return false;
    }

    await this.reload();
    const balance = BigInt(this.signinAccount.balance||"0");
    const minBalance = BigInt(transactions.convertLSKToBeddows("0.05"));
    if ((balance - BigInt(amount) - BigInt(this.transaction.fee)) < minBalance) {
      this.matSnackBar.open('not enough balance. At least 0.05LSK should be left.', 'close', { verticalPosition: 'top', duration: 3000 });
      return false;
    }

    if (this.transaction.nonce !== this.signinAccount.nonce) {
      this.matSnackBar.open('nonce missmatch.', 'close', { verticalPosition: 'top', duration: 3000 });
      return false;
    }
    return true;
  }
}

class MemberStatus {
  constructor(
    public address: string,
    public publicKey: string,
    public isMandatory: boolean,
    public isSigned: boolean
  ) {}
}