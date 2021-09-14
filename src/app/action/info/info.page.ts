import { Component } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';

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
  userName:string;
  isDelegate:boolean;
  isMultisignature:boolean;

  constructor(private router: Router, private route: ActivatedRoute, private matSnackBar: MatSnackBar, private clipboard: Clipboard,
              private storageService: StorageService,private liskService: LiskService) {
    this.liskService.init();
    this.isView = false;
  }

  async ionViewWillEnter() {
    this.address = this.route.snapshot.params['address'];

    // set signin account
    await this.liskService.setSignInAccount(await this.storageService.getNetwork(), this.address);
    const signinAccount = this.liskService.getSignInAccount();
    
    // register account
    const storeAccount = await this.storageService.getAccount(this.address);
    if (!storeAccount) await this.storageService?.setAccount(this.address, signinAccount.userName);

    // set fields
    this.balance = transactions.convertBeddowsToLSK(signinAccount.balance||"0");
    this.userName = signinAccount.userName||"";
    this.isDelegate = this.userName.length > 0;
    this.isMultisignature = signinAccount.isMultisignature;

    this.isView = true;
  }

  async copy() {
    const result = await this.clipboard.copy(this.address);
    this.matSnackBar.open(result? 'copied': 'failed', 'close', { verticalPosition: 'top', duration: 1000 });
  }

  signOut() {
    this.router.navigateByUrl('/home', {replaceUrl: true});
  }
}
