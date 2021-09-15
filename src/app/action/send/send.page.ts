import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { MatSnackBar } from '@angular/material/snack-bar';

import { transactions } from '@liskhq/lisk-client';

import { StorageService } from '../../service/storage.service';
import { LiskService } from '../../service/lisk.service';

@Component({
  selector: 'app-send',
  templateUrl: 'send.page.html',
  styleUrls: ['../../app.component.scss', './send.page.scss'],
})
export class SendPage {
  isView:boolean;
  model:SendModel;
  address:string;
  balance:string;
  isMultisignature:boolean;

  constructor(private router: Router, private matSnackBar: MatSnackBar,
              private storageService: StorageService, private liskService: LiskService) {
    this.isView = false;
    this.liskService.init();
    this.model = new SendModel("", "", "");
  }

  async ionViewWillEnter() {
    this.address = await this.storageService.getSignInAddress();
    await this.liskService.setSignInAccount(await this.storageService.getNetwork(), this.address);
    const signinAccount = this.liskService.getSignInAccount();
    this.balance = transactions.convertBeddowsToLSK(signinAccount.balance||"0");
    this.isMultisignature = signinAccount.isMultisignature;

    this.isView = true;
  }

  signOut() {
    this.router.navigateByUrl('/home', {replaceUrl: true});
  }

  clear(type:number) {
    if (type === 0) {
      this.model.recipient = "";

    } else if (type === 1) {
      this.model.amount = "";

    } else if (type === 2) {
      this.model.data = "";
    }
  }

  continue() {
    this.matSnackBar.open('invalid passphrase.', 'close', { verticalPosition: 'top', duration: 1000 });
  }
}

export class SendModel{
  constructor(
    public recipient: string,
    public amount: string,
    public data: string,
  ){}
}