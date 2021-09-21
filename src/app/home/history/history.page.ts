import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ModalController, LoadingController } from '@ionic/angular';
import { ToastrService } from 'ngx-toastr';

import { StorageService } from '../../service/storage.service';
import { Account } from '../../common/types';
import * as liskUtils from '../../common/lisk-utils';
import { AccountEditPage } from '../../dialog/accountEdit/accountEdit.page';

@Component({
  selector: 'app-history',
  templateUrl: 'history.page.html',
  styleUrls: ['../../app.component.scss', './history.page.scss'],
})
export class HistoryPage {
  isView:boolean;
  accounts:Account[];

  constructor(private router: Router, private modalController: ModalController, private LoadingController: LoadingController,
              private toastr: ToastrService, private storageService: StorageService) {
    this.isView = false;
  }

  async ionViewWillEnter() {
    await this.reload();
  }

  async reload() {
    await this.storageService.removeTransaction();
    await this.storageService.removeSignInAccount();
    await this.storageService.removeNetworkId();
    this.accounts = await this.storageService?.getAccounts();
    this.isView = true;
  }
  
  async delete(address:string) {
    await this.storageService?.removeAccount(address);
    this.accounts = await this.storageService?.getAccounts();
  }
  
  async drop(event: CdkDragDrop<Account[]>) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    const accounts:Account[] = [];
    for(const [index, account] of event.container.data.entries()) {
      const orgAccount = await this.storageService.getAccount(account.address);
      orgAccount.sortNo = index;
      accounts.push(orgAccount);
    }
    this.storageService.setAccounts(accounts);
  }

  async signIn(address:string) {
    let loading:HTMLIonLoadingElement;
    try {
      // loading
      loading = await this.LoadingController.create({ spinner: 'dots', message: 'please wait ...' });
      loading.present();
      
      // set networkId
      const network = await this.storageService.getNetwork();
      const networkId = await liskUtils.getNetworkId(network);
      if (!networkId) {
        this.toastr.error('network error.');
        return;
      }
      await this.storageService.setNetworkId(networkId);

      const storeAccount = await this.storageService.getAccount(address);

      // set signin account
      const signinAccount = await liskUtils.createSignInAccount(network, address, storeAccount.publicKey);
      if (!signinAccount) {
        this.toastr.error('network error.');
        return;
      }
      await this.storageService.setSignInAccount(signinAccount);
      
      this.router.navigateByUrl('/action/info', {replaceUrl: true});
      
    } finally {
      await loading.dismiss();
    }
  }

  async openAccountEdit(address:string) {
    const modal = await this.modalController.create({
      component: AccountEditPage,
      cssClass: 'dialog-custom-class',
      componentProps: {
        address: address,
        availableDelete: true
      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) await this.reload();
  }
}
