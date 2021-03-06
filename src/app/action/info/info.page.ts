import { Component, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { Clipboard } from '@angular/cdk/clipboard';
import { ModalController, LoadingController, IonSlides } from '@ionic/angular';
import { ToastrService } from 'ngx-toastr';

import { transactions } from '@liskhq/lisk-client';
const { convertBeddowsToLSK } = transactions;

import { MembersPage } from '../../dialog/members/members.page';
import { EditAccountPage } from '../../dialog/editAccount/editAccount.page';
import { BookmarkPage } from '../../dialog/bookmark/bookmark.page';
import { StorageService } from '../../service/storage.service';
import { getExplorerURL } from '../../common/utils';
import { getTransactions, createSignInAccount } from '../../common/lisk-utils';
import { SignInAccount, TransactionRow } from '../../common/types';

@Component({
  selector: 'app-info',
  templateUrl: 'info.page.html',
  styleUrls: ['../../app.component.scss', './info.page.scss'],
})
export class InfoPage {
  isView:boolean;
  explorerUrl:string;
  address:string;
  balance:string;
  signinAccount:SignInAccount;
  misc:string;
  hasBookmark:boolean;
  transactions: TransactionRow[];
  slideOpts = {
    initialSlide: 0,
    speed: 400
  }
  @ViewChild("slides") slides: IonSlides;

  constructor(private router: Router, private modalController: ModalController, private LoadingController: LoadingController,
              private clipboard: Clipboard, private toastr: ToastrService,
              private storageService: StorageService) {
    this.isView = false;
    this.transactions = [];
  }

  async ionViewWillEnter() {
    await this.reload(true);
  }

  async reflesh(event) {
    await this.reload(true);
    event.target.complete();
  }

  async changeSlide() {
    await this.reload(false);
  }

  async reload(isUpdate:boolean) {
    let signinAccount = await this.storageService.getSignInAccount();
    if (!signinAccount) {
      this.signOut();
      return;
    }
    
    // get account
    const storeAccount = await this.storageService.getAccount(signinAccount.address);
    if (!storeAccount) {
      this.signOut();
      return;
    }
    
    // set explorer URL
    const settings = await this.storageService.getSettings();
    this.explorerUrl = getExplorerURL(settings.network, settings.explorer);

    // update signin account
    if (isUpdate) {
      signinAccount = await createSignInAccount(settings.network, signinAccount.address, signinAccount.publicKey);
      await this.storageService.setSignInAccount(signinAccount);
    }

    // set fields
    this.signinAccount = signinAccount;
    this.address = signinAccount.address;
    this.balance = convertBeddowsToLSK(signinAccount.balance||"0");
    this.misc = storeAccount? storeAccount.misc: signinAccount.userName;
    this.hasBookmark = (await this.storageService.getBookmarks()).length > 0;

    // set transactions
    this.setTransactions();

    this.isView = true;
  }

  async setTransactions() {
    let loading:HTMLIonLoadingElement;
    try {
      const index = await this.slides?.getActiveIndex()||0;
      if (index !== 1) return;

      // loading
      loading = await this.LoadingController.create({ spinner: 'dots', message: 'please wait ...' });
      await loading.present();

      // get transactions
      const newTransactions:TransactionRow[] = [];
      const network = await this.storageService.getNetwork();
      const txs = await getTransactions(network, this.address);
      if (txs) {
        for (const tx of txs) {
          const dt = new Date();
          dt.setTime((+tx.block.timestamp) * 1000);
          const row = new TransactionRow(tx.moduleAssetId, tx.moduleAssetName, tx.id, dt.toLocaleString());
          if (tx.moduleAssetId === "2:0") {
            row.amount = convertBeddowsToLSK(tx.asset.amount);
            if (tx.sender.address === this.address) {
              row.address = tx.asset.recipient.address;
              row.sendOrReceive = 0;
            } else {
              row.address = tx.sender.address;
              row.sendOrReceive = 1;
            }
          }
          newTransactions.push(row);
        }
      }
      this.transactions = newTransactions;
    } catch(err) {
      this.transactions = [];
    } finally {
      if (loading) await loading.dismiss();
    }
  }

  signOut() {
    this.toastr.info("sign out.");
    this.router.navigateByUrl('/home', {replaceUrl: true});
  }

  async openAccountEdit(address:string) {
    const modal = await this.modalController.create({
      component: EditAccountPage,
      cssClass: 'dialog-custom-class',
      componentProps: { address: address, availableDelete: false, type: 0 }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) await this.reload(false);
  }

  async openMembers() {
    const modal = await this.modalController.create({
      component: MembersPage,
      cssClass: 'dialog-custom-class'
    });
    await modal.present();
  }

  async openBookmarks() {
    const modal = await this.modalController.create({
      component: BookmarkPage,
      cssClass: 'dialog-custom-class',
      componentProps: { type: 0 }
    });
    await modal.present();
  }

  async copy(val) {
    const result = await this.clipboard.copy(val);
    if (result) {
      this.toastr.info("copied.");
    } else {
      this.toastr.error("failed.");
    }
  }
}
