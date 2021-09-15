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
    await this.storageService.setSignInAddress("");
    this.model.network = (await this.storageService.getNetwork()).toString();
  }

  async changeNetwork() {
    await this.storageService.setNetwork(+this.model.network);
  }

  async changeExplorer() {
    await this.storageService.setExplorer(+this.model.explorer);
  }
}

export class SettingModel{
  constructor(
    public network: string,
    public explorer: string,
  ){}
}