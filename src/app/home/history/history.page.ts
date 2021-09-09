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
  accounts:Promise<Account[]>;

  constructor(private router: Router, private storageService: StorageService, private liskService: LiskService) {
    this.liskService.init();
  }

  ionViewWillEnter(){
    this.accounts = this.storageService?.getAccounts();
  }

  async setAccount(address:string, misc?:string, sortNo?:number) {
    await this.storageService?.setAccount(address, misc, sortNo);
  }
  
  async removeAccount(address:string) {
    await this.storageService?.removeAccount(address);
    this.accounts = this.storageService?.getAccounts();
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
}
