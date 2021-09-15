import { Component } from '@angular/core';
import { Router } from "@angular/router";

import { transactions } from '@liskhq/lisk-client';

import { StorageService } from '../../service/storage.service';
import { LiskService } from '../../service/lisk.service';

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

  constructor(private router: Router, private storageService: StorageService, private liskService: LiskService) {
    this.isView = false;
    this.liskService.init();
  }

  async ionViewWillEnter() {
    this.address = await this.storageService.getSignInAddress();
    if (!this.address) {
      this.signOut();
      return;
    }

    // set signin account
    await this.liskService.setSignInAccount(await this.storageService.getNetwork(), this.address);
    const signinAccount = this.liskService.getSignInAccount();
    if (!signinAccount.address) {
      this.signOut();
      return;
    }
    
    // register account
    const storeAccount = await this.storageService.getAccount(this.address);
    if (!storeAccount) await this.storageService?.setAccount(this.address, signinAccount.userName);

    // set fields
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

  openMembers(address:string) {
    this.router.navigateByUrl(`/sub/members/${address}`, {replaceUrl: true});
  }
}
