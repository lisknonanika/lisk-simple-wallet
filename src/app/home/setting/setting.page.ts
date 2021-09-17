import { Component } from '@angular/core';
import { StorageService } from '../../service/storage.service';

@Component({
  selector: 'app-setting',
  templateUrl: 'setting.page.html',
  styleUrls: ['../../app.component.scss', './setting.page.scss'],
})
export class SettingPage {
  model:SettingModel;

  constructor(private storageService: StorageService) {
    this.model = new SettingModel("0", "0");
  }

  async ionViewWillEnter() {
    this.model.network = (await this.storageService.getNetwork()).toString();
  }

  async changeNetwork() {
    await this.storageService.setNetwork(+this.model.network);
  }

  async changeExplorer() {
    await this.storageService.setExplorer(+this.model.explorer);
  }

  async initialize() {
    await this.storageService.removeAllAccounts();
    await this.storageService.setNetwork(0);
    await this.storageService.setExplorer(0);
    this.model = new SettingModel("0", "0");
  }
}

export class SettingModel{
  constructor(
    public network: string,
    public explorer: string,
  ){}
}