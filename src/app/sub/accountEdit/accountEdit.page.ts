import { Component } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';

import { StorageService } from '../../service/storage.service';

@Component({
  selector: 'app-accountEdit',
  templateUrl: 'accountEdit.page.html',
  styleUrls: ['../../app.component.scss', './accountEdit.page.scss'],
})
export class AccountEditPage {
  model:AccountModel;
  address:string;
  ref:number;

  constructor(private router: Router, private route: ActivatedRoute, private storageService: StorageService,
              private clipboard: Clipboard, private matSnackBar: MatSnackBar) {
    this.model = new AccountModel("");
  }

  async ionViewWillEnter() {
    this.address = this.route.snapshot.params['address'];
    this.route.queryParams.subscribe((params) => {this.ref = +params.ref});
    const account = await this.storageService?.getAccount(this.address);
    this.model.misc = account.misc||"";
  }
  
  async delete() {
    await this.storageService?.removeAccount(this.address);
    if (this.ref === 0) {
      this.router.navigateByUrl('/home/history', {replaceUrl: true});
    }
  }
  
  async save() {
    await this.storageService?.setAccount(this.address, this.model.misc);
    if (this.ref === 0) {
      this.matSnackBar.open('success', 'close', { verticalPosition: 'top', duration: 1000 });
      this.router.navigateByUrl('/home/history', {replaceUrl: true});
    }
  }

  clear() {
    this.model.misc = "";
  }

  async copy() {
    const result = await this.clipboard.copy(this.address);
    this.matSnackBar.open(result? 'copied': 'failed', 'close', { verticalPosition: 'top', duration: 1000 });
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
