import { Component } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";

import { StorageService } from '../../service/storage.service';
import { LiskService } from '../../service/lisk.service';

import { MultiSigMember } from '../..//common/types';

@Component({
  selector: 'app-members',
  templateUrl: 'members.page.html',
  styleUrls: ['../../app.component.scss', './members.page.scss'],
})
export class MembersPage {
  multisignatureMembers:MultiSigMember[];

  constructor(private router: Router, private route: ActivatedRoute,
              private storageService: StorageService, private liskService: LiskService) {
  }

  async ionViewWillEnter() {
    const address = this.route.snapshot.params['address'];
    await this.liskService.setSignInAccount(await this.storageService.getNetwork(), address);
    const signinAccount = this.liskService.getSignInAccount();
    this.multisignatureMembers = signinAccount.multisignatureMembers;
  }

  back() {
    this.router.navigateByUrl('/action/info', {replaceUrl: true});
  }
}
