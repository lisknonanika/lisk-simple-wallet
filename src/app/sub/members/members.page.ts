import { Component } from '@angular/core';
import { Router } from "@angular/router";

import { StorageService } from '../../service/storage.service';
import { MultiSigMember } from '../../common/types';

@Component({
  selector: 'app-members',
  templateUrl: 'members.page.html',
  styleUrls: ['../../app.component.scss', './members.page.scss'],
})
export class MembersPage {
  multisignatureMembers:MultiSigMember[];

  constructor(private router: Router, private storageService: StorageService) {
  }

  async ionViewWillEnter() {
    const signinAccount = await this.storageService.getSignInAccount();
    this.multisignatureMembers = signinAccount.multisignatureMembers;
  }

  back() {
    this.router.navigateByUrl('/action/info', {replaceUrl: true});
  }
}
