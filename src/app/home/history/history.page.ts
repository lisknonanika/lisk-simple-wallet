import { Component } from '@angular/core';
import { StorageService } from '../../service/storage.service';

@Component({
  selector: 'app-history',
  templateUrl: 'history.page.html',
  styleUrls: ['../../app.component.scss'],
})
export class HistoryPage {
  accounts:Promise<any[]>;

  constructor(private storageService: StorageService) {
  }

  ionViewWillEnter(){
    this.accounts = this.storageService?.getAccounts();
  }

  public async setAccount(address:string, name?:string, sortNo?:number) {
    await this.storageService?.setAccount(address, name, sortNo);
  }
  
  public async removeAccount(address:string) {
    await this.storageService?.removeAccount(address);
  }
}
