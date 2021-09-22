import { Component } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastrService } from 'ngx-toastr';

import { cryptography, transactions } from '@liskhq/lisk-client';
const {  getLisk32AddressFromPublicKey, getLisk32AddressFromAddress, hexToBuffer } = cryptography;
const {  convertBeddowsToLSK } = transactions;

import { StorageService } from '../../service/storage.service';
import { TRANSFER_JSON } from '../../common/types';
import { getExplorerURL } from '../../common/utils';

@Component({
  selector: 'app-transaction',
  templateUrl: 'transaction.page.html',
  styleUrls: ['../../app.component.scss', './transaction.page.scss'],
})
export class TransactionPage {
  explorerUrl:string;
  transaction:TRANSFER_JSON;
  sender:string;
  recipient:string;
  amount:string;
  fee:string;
  data:string;

  constructor(private modalController: ModalController, private navParams: NavParams,
              private clipboard: Clipboard, private toastr: ToastrService, private storageService: StorageService) {
  }

  async ionViewWillEnter() {
    this.transaction = await this.storageService.getTransaction();
    this.sender = getLisk32AddressFromPublicKey(hexToBuffer(this.transaction.senderPublicKey));
    this.recipient = getLisk32AddressFromAddress(hexToBuffer(this.transaction.asset.recipientAddress));
    this.amount = convertBeddowsToLSK(this.transaction.asset.amount);
    this.fee = convertBeddowsToLSK(this.transaction.fee);
    this.data = this.transaction.asset.data||"";
    
    // set explorer URL
    const settings = await this.storageService.getSettings();
    this.explorerUrl = getExplorerURL(settings.network, settings.explorer);
  }

  async copy() {
    const result = await this.clipboard.copy(JSON.stringify(this.transaction));
    if (result) {
      this.toastr.info("copied.");
    } else {
      this.toastr.error("failed.");
    }
  }

  close() {
    this.modalController.dismiss("");
  }
}
