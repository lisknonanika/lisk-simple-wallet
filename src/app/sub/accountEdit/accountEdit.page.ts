import { Component } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { StorageService } from '../../service/storage.service';

import { Account } from '../../common/types';

@Component({
  selector: 'app-accountEdit',
  templateUrl: 'accountEdit.page.html',
  styleUrls: ['../../app.component.scss', './accountEdit.page.scss'],
})
export class AccountEditPage {
  model:AccountModel;
  address:string;
  ref:number;

  constructor(private router: Router, private route: ActivatedRoute, private storageService: StorageService) {
    this.model = new AccountModel("");
  }

  async ionViewWillEnter() {
    this.address = this.route.snapshot.params['address'];
    this.route.queryParams.subscribe((params) => {this.ref = +params.ref});
    const account = await this.storageService?.getAccount(this.address);
    this.model.misc = account.misc||"";
  }
  
  async removeAccount() {
    await this.storageService?.removeAccount(this.address);
    if (this.ref === 0) {
      this.router.navigateByUrl('/home/history', {replaceUrl: true});
    }
  }
  
  async save() {
    await this.storageService?.setAccount(this.address, this.model.misc);
    if (this.ref === 0) {
      this.router.navigateByUrl('/home/history', {replaceUrl: true});
    }
  }

  clear() {
    this.model.misc = "";
  }

  copy() {
    
  }

  back() {
    if (this.ref === 0) {
      this.router.navigateByUrl('/home/history', {replaceUrl: true});
    }
  }
}

export class AccountModel{
  constructor(
    public misc:string,
  ){}
}
