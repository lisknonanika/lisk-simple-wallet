import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { StorageService } from '../../service/storage.service';
import { MultiSigMember } from '../../common/types';
import { getExplorerURL } from '../../common/utils';

@Component({
  selector: 'app-members',
  templateUrl: 'members.page.html',
  styleUrls: ['../../app.component.scss', './members.page.scss'],
})
export class MembersPage {
  multisignatureMembers:MultiSigMember[];
  explorerUrl:string;

  constructor(private modalController: ModalController, private storageService: StorageService) {
  }

  async ionViewWillEnter() {
    const signinAccount = await this.storageService.getSignInAccount();
    this.multisignatureMembers = signinAccount.multisignatureMembers;
    
    // set explorer URL
    const settings = await this.storageService.getSettings();
    this.explorerUrl = getExplorerURL(settings.network, settings.explorer);
  }

  close() {
    this.modalController.dismiss();
  }
}
