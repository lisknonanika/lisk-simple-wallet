import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ModalController, NavParams } from '@ionic/angular';

import { StorageService } from '../../service/storage.service';
import { Account } from '../../common/types';
import { EditAccountPage } from '../../dialog/editAccount/editAccount.page';

@Component({
  selector: 'app-bookmark',
  templateUrl: 'bookmark.page.html',
  styleUrls: ['../../app.component.scss', './bookmark.page.scss'],
})
export class BookmarkPage {
  isView:boolean;
  type:number;
  bookmarks:Account[];

  constructor(private modalController: ModalController, private navParams: NavParams,
              private storageService: StorageService) {
    this.type = this.navParams.data.type;
    this.isView = false;
  }

  async ionViewWillEnter() {
    await this.reload();
  }

  async reload() {
    this.bookmarks = await this.storageService?.getBookmarks();
    this.isView = true;
  }
  
  async drop(event: CdkDragDrop<Account[]>) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    const accounts:Account[] = [];
    for(const [index, account] of event.container.data.entries()) {
      const orgAccount = await this.storageService.getBookmark(account.address);
      orgAccount.sortNo = index;
      accounts.push(orgAccount);
    }
    this.storageService.setBookmarks(accounts);
  }

  async openBookmarkEdit(address:string) {
    const modal = await this.modalController.create({
      component: EditAccountPage,
      cssClass: 'dialog-custom-class',
      componentProps: { address: address, availableDelete: true, type: 1 }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) await this.reload();
  }

  async setAddress(address:string) {
    if (this.type === 0) return;
    this.modalController.dismiss(address);
  }

  close() {
    this.modalController.dismiss("");
  }
}
