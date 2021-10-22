import { Component, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { Clipboard } from '@angular/cdk/clipboard';
import { ModalController, LoadingController, IonSlides } from '@ionic/angular';
import { ToastrService } from 'ngx-toastr';

import { transactions } from '@liskhq/lisk-client';
const { convertBeddowsToLSK } = transactions;

import { StorageService } from '../../service/storage.service';
import { createSignInAccount, getVoteInfo } from '../../common/lisk-utils';
import { SignInAccount, Vote } from '../../common/types';

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
  otherVote: Vote[];
  newVote: Vote[];
  unlockCount:number;
  voteCount:number;
  slideOpts = {
    initialSlide: 0,
    speed: 400
  }
  @ViewChild("slides") slides: IonSlides;

  constructor(private router: Router, private modalController: ModalController, private LoadingController: LoadingController,
              private clipboard: Clipboard, private toastr: ToastrService,
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
    const voteInfo = await getVoteInfo(settings.network, signinAccount.address);
    this.selfVote = null;
    this.otherVote = [];
    for (const v of voteInfo.votes) {
      if (v.address === signinAccount.address) this.selfVote = v;
      else this.otherVote.push(v);
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

  async copy(val) {
    const result = await this.clipboard.copy(val);
    if (result) {
      this.toastr.info("copied.");
    } else {
      this.toastr.error("failed.");
    }
  }
}
