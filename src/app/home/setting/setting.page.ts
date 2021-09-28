import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { StorageService } from '../../service/storage.service';
import { ConfirmPage } from '../../dialog/confirm/confirm.page';

@Component({
  selector: 'app-setting',
  templateUrl: 'setting.page.html',
  styleUrls: ['../../app.component.scss', './setting.page.scss'],
})
export class SettingPage {
  model:SettingModel;

  constructor(private storageService: StorageService, private modalController: ModalController) {
    this.model = new SettingModel("0", "0");
  }

  async ionViewWillEnter() {
    const setting = await this.storageService.getSettings();
    this.model.network = setting.network.toString();
    this.model.explorer = setting.explorer.toString();
  }

  async changeNetwork() {
    await this.storageService.setNetwork(+this.model.network);
  }

  async changeExplorer() {
    await this.storageService.setExplorer(+this.model.explorer);
  }

  async initialize() {
    const modal = await this.modalController.create({
      component: ConfirmPage,
      cssClass: 'confirm-custom-class',
      componentProps: {
        msg: [
          "When you press OK, the settings, history and bookmark will be initialized.",
          "Do you want to initialize it?"
        ],
        type: 1 }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (!data) return;
    await this.storageService.removeAll();
    this.model = new SettingModel("0", "0");
  }
}

export class SettingModel{
  constructor(
    public network: string,
    public explorer: string,
  ){}
}