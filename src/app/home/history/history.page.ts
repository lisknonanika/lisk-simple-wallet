import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { StorageService } from '../../service/storage.service';
import { Account } from '../../common/types';

@Component({
  selector: 'app-history',
  templateUrl: 'history.page.html',
  styleUrls: ['../../app.component.scss', './history.page.scss'],
})
export class HistoryPage {
  isView:boolean;
  accounts:Account[];

  constructor(private router: Router, private storageService: StorageService) {
    this.isView = false;
  }

  async ionViewWillEnter() {
    await this.storageService.setSignInAddress("");
    this.accounts = await this.storageService?.getAccounts();
    this.isView = true;
  }

  async ionViewWillLeave() {
    this.isView = false;
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
    await this.storageService.setSignInAddress(address);
    this.router.navigateByUrl('/action/info', {replaceUrl: true});
  }

  openAccountEdit(address:string) {
    this.router.navigateByUrl(`/sub/accountEdit/${address}?ref=0`, {replaceUrl: true});
  }
}
