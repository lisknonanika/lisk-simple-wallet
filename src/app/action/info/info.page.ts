import { Component } from '@angular/core';
import { Router } from "@angular/router";

import { transactions } from '@liskhq/lisk-client';

import { StorageService } from '../../service/storage.service';

@Component({
  selector: 'app-info',
  templateUrl: 'info.page.html',
  styleUrls: ['../../app.component.scss', './info.page.scss'],
})
export class InfoPage {
  isView:boolean;
  address:string;
  balance:string;
  misc:string;
  isMultisignature:boolean;

  constructor(private router: Router, private storageService: StorageService) {
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

    // set fields
    this.address = signinAccount.address;
    this.balance = transactions.convertBeddowsToLSK(signinAccount.balance||"0");
    this.misc = storeAccount? storeAccount.misc: signinAccount.userName;
    this.isMultisignature = signinAccount.isMultisignature;

    this.isView = true;
  }

  signOut() {
    this.router.navigateByUrl('/home', {replaceUrl: true});
  }

  openAccountEdit(address:string) {
    this.router.navigateByUrl(`/sub/accountEdit/${address}?ref=1`, {replaceUrl: true});
  }

  openMembers() {
    this.router.navigateByUrl("/sub/members");
  }
}
