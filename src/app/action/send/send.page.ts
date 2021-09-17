import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { MatSnackBar } from '@angular/material/snack-bar';

import { transactions, cryptography } from '@liskhq/lisk-client';
import Swal, { SweetAlertOptions } from 'sweetalert2';

import { StorageService } from '../../service/storage.service';
import { getTransferAssetSchema } from '../../common/utils';
import { sendTransferTransaction, signTransaction } from '../../common/lisk-utils';
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

  constructor(private router: Router, private matSnackBar: MatSnackBar, private storageService: StorageService) {
    this.isView = false;
    this.model = new SendModel("", null, "");
    this.fee = "0";
  }

  async ionViewWillEnter() {
    await this.storageService.removeTransaction();
    await this.reload();
  }

  async reload() {
    this.network = await this.storageService.getNetwork();
    this.networkId = await this.storageService.getNetworkId();
    if (!this.networkId) {
      this.signOut();
      return;
    }

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
    
    // set fields
    this.address = this.signinAccount.address;
    this.balance = transactions.convertBeddowsToLSK(this.signinAccount.balance||"0");
    this.misc = storeAccount? storeAccount.misc: this.signinAccount.userName;

    // compute fee
    await this.computeFee();

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

  createTransaction():TransferTransaction {
    const tx = new TransferTransaction();
    tx.nonce = this.signinAccount.nonce;
    tx.senderPublicKey = this.signinAccount.publicKey;
    tx.asset = {
      recipientAddress:  cryptography.bufferToHex(cryptography.getAddressFromLisk32Address(this.model.recipient)),
      amount: transactions.convertLSKToBeddows(this.model.amount.toString()),
      data: this.model.data
    }
    return tx;
  }

  async computeFee() {
    try {
      this.fee = "0";
      if (!this.model.recipient || !cryptography.validateBase32Address(this.model.recipient.trim().toLocaleLowerCase())) return;
      if (this.model.amount === null || this.model.amount <= 0) return;
      if (this.model.data.length > 64) return;

      const tx = this.createTransaction();
      const options = this.signinAccount.isMultisignature? {numberOfSignatures: this.signinAccount.numberOfSignatures}: {};
      const minFee = transactions.computeMinFee(getTransferAssetSchema(), tx.toJsObject(), options);
      this.fee = transactions.convertBeddowsToLSK(minFee.toString());

    } catch(err) {
      // none
    }
  }

  async continue() {
    this.model.recipient = this.model.recipient.trim().toLowerCase();
    this.model.data = this.model.data.trim();

    if (!this.model.recipient) {
      this.matSnackBar.open('recipient address is required.', 'close', { verticalPosition: 'top', duration: 3000 });
      return;
    }

    try {
      if (!cryptography.validateBase32Address(this.model.recipient)) {
        this.matSnackBar.open('invalid recipient address.', 'close', { verticalPosition: 'top', duration: 3000 });
        return;
      }
    } catch(err) {
      this.matSnackBar.open('invalid recipient address.', 'close', { verticalPosition: 'top', duration: 3000 });
      return;
    }

    if (this.model.amount === null) {
      this.matSnackBar.open('amount is required.', 'close', { verticalPosition: 'top', duration: 3000 });
      return;
    }

    if (this.model.amount <= 0) {
      this.matSnackBar.open('invalid amount.', 'close', { verticalPosition: 'top', duration: 3000 });
      return;
    }

    if (this.model.data.length > 64) {
      this.matSnackBar.open('data exceeds the maximum number of characters (Max:64).', 'close', { verticalPosition: 'top', duration: 3000 });
      return;
    }

    await this.reload();
    const balance = BigInt(this.signinAccount.balance||"0");
    const amount = BigInt(transactions.convertLSKToBeddows(this.model.amount.toString()));
    const fee = BigInt(transactions.convertLSKToBeddows(this.fee));
    const minBalance = BigInt(transactions.convertLSKToBeddows("0.05"));
    if ((balance - amount - fee) < minBalance) {
      this.matSnackBar.open('not enough balance. At least 0.05LSK should be left.', 'close', { verticalPosition: 'top', duration: 3000 });
      return;
    }

    // create transaction
    const tx = this.createTransaction();
    tx.fee = transactions.convertLSKToBeddows(this.fee);
    const transactionJSON = tx.toJSON();
    await this.storageService.setTransaction(transactionJSON);

    // not ultisignature -> send
    if (!this.signinAccount.isMultisignature) {
      const options:SweetAlertOptions = {
        title: "Enter Passphrase",
        showCancelButton: true,
        input: 'password',
        inputPlaceholder: 'Enter Passphrase',
      }
      const confirmDialog = Swal.mixin({...options});
      const { isConfirmed, value } = await confirmDialog.fire({
        didOpen() {
          confirmDialog.getInput().value = "";
        }
      });
      if (!isConfirmed) return;
      const result = await this.send(transactionJSON, value);
      console.log(result)
      return;
    }
    this.router.navigateByUrl(`/sub/multiSign/${this.address}?ref=0`);
  }

  async send(transaction:TRANSFER_JSON, passphrase:string):Promise<string> {
    passphrase = passphrase.trim().toLowerCase();
    if (!passphrase) {
      this.matSnackBar.open('passphrase is required.', 'close', { verticalPosition: 'top', duration: 3000 });
      return "";
    }

    if (this.address !== cryptography.getLisk32AddressFromPassphrase(passphrase)) {
      this.matSnackBar.open('passphrase is incorrect.', 'close', { verticalPosition: 'top', duration: 3000 });
      return "";
    }

    const signedTransaction = signTransaction(transaction, this.signinAccount, passphrase, this.networkId);
    if (!signedTransaction) {
      this.matSnackBar.open('failed to sign.', 'close', { verticalPosition: 'top', duration: 3000 });
      return "";
    }

    const result = await sendTransferTransaction(this.network, signedTransaction);
    if (!result) {
      this.matSnackBar.open('failed to send the transaction.', 'close', { verticalPosition: 'top', duration: 3000 });
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