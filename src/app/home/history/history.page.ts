import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { StorageService } from '../../service/storage.service';

import { Account } from '../../types';

@Component({
  selector: 'app-history',
  templateUrl: 'history.page.html',
  styleUrls: ['../../app.component.scss'],
})
export class HistoryPage {
  accounts:Promise<Account[]>;

  constructor(private storageService: StorageService) {
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
}
