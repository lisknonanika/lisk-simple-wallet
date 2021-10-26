import { Component, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { ModalController, LoadingController, IonSlides } from '@ionic/angular';
import { ToastrService } from 'ngx-toastr';

import { transactions } from '@liskhq/lisk-client';
const { convertBeddowsToLSK } = transactions;

import { StorageService } from '../../service/storage.service';
import { createSignInAccount, getVoteInfo } from '../../common/lisk-utils';
import { SignInAccount, Vote } from '../../common/types';
import { EditVotePage } from '../../dialog/editVote/editVote.page';

@Component({
  selector: 'app-vote',
  templateUrl: 'vote.page.html',
  styleUrls: ['../../app.component.scss', './vote.page.scss'],
})
export class VotePage {
  isView:boolean;
  explorerUrl:string;
  address:string;
  balance:string;
  signinAccount:SignInAccount;
  selfVote: Vote;
  currentVote: Vote[];
  newVote: Vote[];
  unlockCount:number;
  voteCount:number;
  slideOpts = {
    initialSlide: 0,
    speed: 400
  }
  @ViewChild("slides") slides: IonSlides;

  constructor(private router: Router, private modalController: ModalController, private LoadingController: LoadingController,
              private toastr: ToastrService,
              private storageService: StorageService) {
    this.isView = false;
  }

  async ionViewWillEnter() {
    await this.reload(true);
  }

  async reflesh(event) {
    await this.reload(true);
    event.target.complete();
  }

  async changeSlide() {
    await this.reload(false);
  }

  async reload(isUpdate:boolean) {
    let signinAccount = await this.storageService.getSignInAccount();
    if (!signinAccount) {
      this.signOut();
      return;
    }
    
    // get account
    const storeAccount = await this.storageService.getAccount(signinAccount.address);
    if (!storeAccount) {
      this.signOut();
      return;
    }
    
    // get settings
    const settings = await this.storageService.getSettings();

    // update signin account
    if (isUpdate) {
      signinAccount = await createSignInAccount(settings.network, signinAccount.address, signinAccount.publicKey);
      await this.storageService.setSignInAccount(signinAccount);
    }

    // set voteInfo
    // const voteInfo = await getVoteInfo(settings.network, signinAccount.address);
    const voteInfo = await getVoteInfo(settings.network, "lskbps7ge5n9y7f8nk4222c77zkqcntrj7jyhmkwp");
    this.selfVote = null;
    this.newVote = [];
    this.currentVote = [];
    for (const v of voteInfo.votes) {
      // if (v.address === signinAccount.address) this.selfVote = v;
      if (v.address === "lskbps7ge5n9y7f8nk4222c77zkqcntrj7jyhmkwp") this.selfVote = v;
      else this.currentVote.push(v);
    }
    this.unlockCount = voteInfo.unlock.length;
    this.voteCount = voteInfo.votes.length;
    
    // set fields
    this.signinAccount = signinAccount;
    this.address = signinAccount.address;
    this.balance = convertBeddowsToLSK(signinAccount.balance||"0");

    // set transactions
    this.setDelegates();

    this.isView = true;
  }

  async setDelegates() {
    try {
      const index = await this.slides?.getActiveIndex()||0;
      if (index !== 1) return;
    } catch(err) {
    }
  }

  async continue() {
    let loading:HTMLIonLoadingElement;
    try {
      // loading
      loading = await this.LoadingController.create({ spinner: 'dots', message: 'please wait ...' });
      await loading.present();
      
    } finally {
      await loading.dismiss();
    }
  }

  signOut() {
    this.toastr.info("sign out.");
    this.router.navigateByUrl('/home', {replaceUrl: true});
  }

  async openVote(address:string, type:number) {
    let params:Vote = null;
    if (type === 0) params = this.selfVote;
    if (type === 1) params = this.currentVote.find((v) => { return v.address === address });
    if (type === 2) params = this.newVote.find((v) => { return v.address === address });

    const modal = await this.modalController.create({
      component: EditVotePage,
      cssClass: 'dialog-custom-class',
      componentProps: { params: params }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (type === 0) {
      this.selfVote.afterAmount = data;

    } else if (type === 1) {
      for (const vote of this.currentVote) {
        if (vote.address !== address) continue;
        vote.afterAmount = data;
        break;
      }
    } else if (type === 2) {
      const updatedNewVote:Vote[] = [];
      for (const vote of this.newVote) {
        if (vote.address !== address) {
          updatedNewVote.push(vote);

        } else if (+data > 0) {
          vote.afterAmount = data;
          updatedNewVote.push(vote);
        }
      }
      this.newVote = updatedNewVote;
    }
  }
}
