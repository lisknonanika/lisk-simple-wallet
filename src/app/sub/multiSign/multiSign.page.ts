import { Component } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { Clipboard } from '@angular/cdk/clipboard';
import { ModalController } from '@ionic/angular';
import { ToastrService } from 'ngx-toastr';

import { StorageService } from '../../service/storage.service';
import { PassphrasePage } from '../../dialog/passphrase/passphrase.page';
import { SignInAccount, SignStatus, TransferTransaction, TRANSFER_JSON } from '../../common/types';
import { createSignInAccount, getSignStatus, transferValidation, sendTransferTransaction, sign } from '../../common/lisk-utils';

@Component({
  selector: 'app-multiSign',
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
              private clipboard: Clipboard, private modalController: ModalController,
              private toastr: ToastrService, private storageService: StorageService) {
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
      this.close();
      return;
    }

    // get transaction
    this.transaction = await this.storageService.getTransaction();
    if (!this.transaction) {
      this.close();
      return;
    }

    // get signin account
    this.signinAccount = await this.storageService.getSignInAccount();
    if (!this.signinAccount) {
      this.close();
      return;
    }

    // update signin account
    this.signinAccount = await createSignInAccount(this.network, this.signinAccount.address, this.signinAccount.publicKey);
    await this.storageService.setSignInAccount(this.signinAccount);

    // get signed status
    this.signedStatus = getSignStatus(this.signinAccount, this.transaction.signatures);

    // over sign?
    if (this.signedStatus.isOverSign) {
      this.toastr.error('over the number of signatures.');
      this.close();
      return;
    }

    // set member status
    const senderAddress = this.signinAccount.address;
    const multisignatureMembers = this.signinAccount.multisignatureMembers;

    // set sender status
    const sender = multisignatureMembers.find((m) => {return m.address === senderAddress});
    if(!sender) {
      this.senderStatus = new MemberStatus(senderAddress, "", false, false, 9);
    } else {
      this.senderStatus = new MemberStatus(senderAddress, sender.publicKey, true, sender.isMandatory, 0);
      if (this.signedStatus.signedAddress.includes(senderAddress)) {
        this.senderStatus.status = 1;
      } else if ((this.senderStatus.isMandatory && this.signedStatus.numberOfMandatoryRemain <= 0) ||
                 (!this.senderStatus.isMandatory && this.signedStatus.numberOfOptionalRemain <= 0)) {
        this.senderStatus.status = 9;
      }
    }
    
    const mandatories = multisignatureMembers.filter((m) => {return m.address !== senderAddress && m.isMandatory})||[];
    this.mandatoryStatus = mandatories.map((m) => {return new MemberStatus(m.address, m.publicKey, true, true, 0)})||[];
    for (const status of this.mandatoryStatus) {
      if (this.signedStatus.signedAddress.includes(status.address)) {
        this.senderStatus.status = 1;
      } else if (this.signedStatus.numberOfMandatoryRemain <= 0) {
        this.senderStatus.status = 9;
      }
    }

    const optionals = multisignatureMembers.filter((m) => {return m.address !== senderAddress && !m.isMandatory})||[];
    this.optionalStatus = optionals.map((m) => {return new MemberStatus(m.address, m.publicKey, true, false, 0)})||[];
    for (const status of this.optionalStatus) {
      if (this.signedStatus.signedAddress.includes(status.address)) {
        this.senderStatus.status = 1;
      } else if (this.signedStatus.numberOfOptionalRemain <= 0) {
        this.senderStatus.status = 9;
      }
    }

    // set params
    this.isView = true;
  }

  async copy() {
    const result = await this.clipboard.copy(JSON.stringify(this.transaction));
    if (result) {
      this.toastr.info('copied.');
    } else {
      this.toastr.error('failed.');
    }
  }

  close() {
    if (this.ref === 0) {
      this.router.navigateByUrl('/action/send');
    } else {
      this.router.navigateByUrl('/home', {replaceUrl: true});
    }
  }

  async sign(address:string) {
    if (this.signedStatus.signedAddress.includes(address)) return;

    // validation
    await this.reload();
    const message = await transferValidation(this.signinAccount, this.transaction, true);
    if (message) {
      this.toastr.error(message);
      return;
    }

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
    const signedTransaction = sign(this.transaction, this.signinAccount, data, this.networkId);
    if (!signedTransaction) {
      this.toastr.error('failed to sign.');
      return;
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
      this.toastr.error('failed to send the transaction.');
      return;
    }
    console.log(result);
  }
}

class MemberStatus {
  constructor(
    public address: string,
    public publicKey: string,
    public isMember:boolean,
    public isMandatory: boolean,
    public status: number
  ) {}
}