import { Component } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastrService } from 'ngx-toastr';

import { StorageService } from '../../service/storage.service';

@Component({
  selector: 'app-accountEdit',
  templateUrl: 'accountEdit.page.html',
  styleUrls: ['../../app.component.scss', './accountEdit.page.scss'],
})
export class AccountEditPage {
  address:string;
  misc:string;
  availableDelete:boolean;

  constructor(private modalController: ModalController, private navParams: NavParams,
              private clipboard: Clipboard,  private toastr: ToastrService,
              private storageService: StorageService) {
    this.address = this.navParams.data.address;
    this.availableDelete = this.navParams.data.availableDelete;
  }

  async ionViewWillEnter() {
    const account = await this.storageService?.getAccount(this.address);
    this.misc = account.misc||"";
  }

  setMisc(val:string) {
    this.misc = val;
  }

  async copy() {
    const result = await this.clipboard.copy(this.address);
    if (result) {
      this.toastr.info("copied.");
    } else {
      this.toastr.error("failed.");
    }
  }
  
  async save() {
    const account = await this.storageService?.getAccount(this.address);
    await this.storageService?.setAccount(account.address, account.publicKey, this.misc);
    this.toastr.info("saved.");
    this.modalController.dismiss(true);
  }
  
  async delete() {
    await this.storageService?.removeAccount(this.address);
    this.toastr.info("deleted.");
    this.modalController.dismiss(true);
  }

  close() {
    this.modalController.dismiss(false);
  }
}
