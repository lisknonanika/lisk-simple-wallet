import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { StorageService } from '../../service/storage.service';
import { LiskService } from '../../service/lisk.service';

import { Account } from '../../common/types';

@Component({
  selector: 'app-history',
  templateUrl: 'history.page.html',
  styleUrls: ['../../app.component.scss'],
})
export class HistoryPage {
  isView:boolean;
  model:HistoryModel;
  accounts:Account[];

  constructor(private router: Router, private storageService: StorageService, private liskService: LiskService) {
    this.model = new HistoryModel(false);
    this.liskService.init();
    this.isView = false;
  }

  async ionViewWillEnter() {
    this.model.network = await this.storageService.getNetwork() !== 0;
    this.accounts = await this.storageService?.getAccounts();
    this.isView = true;
  }

  async ionViewWillLeave() {
    this.isView = false;
  }
  
  async removeAccount(address:string) {
    await this.storageService?.removeAccount(address);
    this.accounts = await this.storageService?.getAccounts();
  }
  
  async drop(event: CdkDragDrop<Account[]>) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    for(const [index, account] of event.container.data.entries()) {
      await this.storageService?.setAccount(account.address, account.misc, index);
    }
  }

  signIn(address:string) {
    this.liskService.setSignInAddress(address);
    this.router.navigateByUrl('/action', {replaceUrl: true});
  }

  openAccountEdit(address:string) {
    this.router.navigateByUrl(`/sub/accountEdit/${address}?ref=0`, {replaceUrl: true});
  }

  async changeNetwork() {
    await this.storageService.setNetwork(this.model.network? 1: 0);
    this.accounts = await this.storageService?.getAccounts();
  }
}

export class HistoryModel{
  constructor(
    public network: boolean,
  ){}
}
