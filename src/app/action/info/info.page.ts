import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { ModalController } from '@ionic/angular';
import { ToastrService } from 'ngx-toastr';

import { transactions } from '@liskhq/lisk-client';
const { convertBeddowsToLSK } = transactions;

import { MembersPage } from '../../dialog/members/members.page';
import { AccountEditPage } from '../../dialog/accountEdit/accountEdit.page';
import { StorageService } from '../../service/storage.service';
import { getExplorerURL } from '../../common/utils';

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
  misc:string;
  isMultisignature:boolean;

  constructor(private router: Router, private modalController: ModalController,
              private toastr: ToastrService, private storageService: StorageService) {
    this.isView = false;
  }

  async ionViewWillEnter() {
    await this.reload();
  }

  async reload() {
    const signinAccount = await this.storageService.getSignInAccount();
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

    // set fields
    this.address = signinAccount.address;
    this.balance = convertBeddowsToLSK(signinAccount.balance||"0");
    this.misc = storeAccount? storeAccount.misc: signinAccount.userName;
    this.isMultisignature = signinAccount.isMultisignature;

    this.isView = true;
  }

  signOut() {
    this.toastr.info("sign out.");
    this.router.navigateByUrl('/home', {replaceUrl: true});
  }

  async openAccountEdit(address:string) {
    const modal = await this.modalController.create({
      component: AccountEditPage,
      cssClass: 'dialog-custom-class',
      componentProps: { address: address, availableDelete: false }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) await this.reload();
  }

  async openMembers() {
    const modal = await this.modalController.create({
      component: MembersPage,
      cssClass: 'dialog-custom-class'
    });
    await modal.present();
  }
}
