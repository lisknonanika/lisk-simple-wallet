import { Component } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastrService } from 'ngx-toastr';

import { StorageService } from '../../service/storage.service';

@Component({
  selector: 'app-editAccount',
  templateUrl: 'editAccount.page.html',
  styleUrls: ['../../app.component.scss', './editAccount.page.scss'],
})
export class EditAccountPage {
  address:string;
  misc:string;
  availableDelete:boolean;
  type: number;

  constructor(private modalController: ModalController, private navParams: NavParams,
              private clipboard: Clipboard, private toastr: ToastrService,
              private storageService: StorageService) {
    this.address = this.navParams.data.address||"";
    this.availableDelete = this.navParams.data.availableDelete||false;
    this.type = this.navParams.data.type||0;
  }

  async ionViewWillEnter() {
    if (this.type === 0) {
      const account = await this.storageService?.getAccount(this.address);
      this.misc = account.misc||"";
    } else {
      const bookmark = await this.storageService?.getBookmark(this.address);
      this.misc = bookmark.misc||"";
      if (!this.availableDelete) await this.storageService?.removeBookmark(this.address);
    }
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
    if (this.type === 0) {
      const account = await this.storageService?.getAccount(this.address);
      await this.storageService?.setAccount(account.address, account.publicKey, this.misc);
    } else {
      await this.storageService?.setBookmark(this.address, this.misc);
    }
    this.toastr.info("saved.");
    this.modalController.dismiss(true);
  }
  
  async delete() {
    if (this.type === 0) {
      await this.storageService?.removeAccount(this.address);
    } else {
      await this.storageService?.removeBookmark(this.address);
    }
    this.toastr.info("deleted.");
    this.modalController.dismiss(true);
  }

  close() {
    this.modalController.dismiss(false);
  }
}
