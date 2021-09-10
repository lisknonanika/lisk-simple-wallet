import { Component } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { StorageService } from '../../service/storage.service';

import { Account } from '../../common/types';

@Component({
  selector: 'app-accountEdit',
  templateUrl: 'accountEdit.page.html',
  styleUrls: ['../../app.component.scss'],
})
export class AccountEditPage {
  account:Promise<Account>;
  address:string;
  ref:number;

  constructor(private router: Router, private route: ActivatedRoute, private storageService: StorageService) {
  }

  ionViewWillEnter() {
    this.address = this.route.snapshot.params['address'];
    this.account = this.storageService?.getAccount(this.address);
    this.route.queryParams.subscribe((params) => {this.ref = +params.ref});
  }

  async setAccount() {
    await this.storageService?.setAccount(this.address);
  }
  
  async removeAccount() {
    await this.storageService?.removeAccount(this.address);
    if (this.ref === 0) {
      this.router.navigateByUrl('/home/history', {replaceUrl: true});
    }
  }

  back() {
    if (this.ref === 0) {
      this.router.navigateByUrl('/home/history', {replaceUrl: true});
    }
  }
}
