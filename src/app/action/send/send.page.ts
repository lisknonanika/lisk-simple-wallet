import { Component } from '@angular/core';
import { Router } from "@angular/router";

import { transactions } from '@liskhq/lisk-client';

import { StorageService } from '../../service/storage.service';
import { LiskService } from '../../service/lisk.service';

@Component({
  selector: 'app-send',
  templateUrl: 'send.page.html',
  styleUrls: ['../../app.component.scss', './send.page.scss'],
})
export class SendPage {
  address:string;
  balance:string;

  constructor(private router: Router, private storageService: StorageService, private liskService: LiskService) {}

  async ionViewWillEnter() {
    this.address = await this.storageService.getSignInAddress();
    await this.liskService.setSignInAccount(await this.storageService.getNetwork(), this.address);
    const signinAccount = this.liskService.getSignInAccount();
    this.balance = transactions.convertBeddowsToLSK(signinAccount.balance||"0");
  }

  signOut() {
    this.router.navigateByUrl('/home', {replaceUrl: true});
  }

}
