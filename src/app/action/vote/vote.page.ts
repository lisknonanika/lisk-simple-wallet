import { Component, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { ModalController, LoadingController, IonSlides } from '@ionic/angular';
import { ToastrService } from 'ngx-toastr';

import { transactions } from '@liskhq/lisk-client';
const { convertBeddowsToLSK } = transactions;

import { StorageService } from '../../service/storage.service';
import { createSignInAccount, getVoteInfo, getDelegates } from '../../common/lisk-utils';
import { SignInAccount, Vote } from '../../common/types';
import { EditVotePage } from '../../dialog/editVote/editVote.page';

@Component({
  selector: 'app-vote',
  templateUrl: 'vote.page.html',
  styleUrls: ['../../app.component.scss', './vote.page.scss'],
})
export class VotePage {
  isView:boolean;
  network:number;
  explorerUrl:string;
  address:string;
  balance:string;
  signinAccount:SignInAccount;
  selfVote: Vote;
  currentVote: Vote[];
  newVote: Vote[];
  delegates: Vote[];
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
    this.currentVote = [];
    this.newVote = [];
    this.delegates = [];
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
    this.network = settings.network;

    // update signin account
    if (isUpdate) {
      signinAccount = await createSignInAccount(this.network, signinAccount.address, signinAccount.publicKey);
      await this.storageService.setSignInAccount(signinAccount);
    }

    // set voteInfo
    const voteInfo = await getVoteInfo(this.network, signinAccount.address);
    this.selfVote = null;
    this.currentVote = [];
    for (const v of voteInfo.votes) {
      if (v.address === signinAccount.address) this.selfVote = v;
      else this.currentVote.push(v);
    }
    this.unlockCount = voteInfo.unlock.length;
    this.voteCount = voteInfo.votes.length + this.newVote.length;
    
    // set fields
    this.signinAccount = signinAccount;
    this.address = signinAccount.address;
    this.balance = convertBeddowsToLSK(signinAccount.balance||"0");

    // set transactions
    this.setDelegates();

    this.isView = true;
  }

  async setDelegates() {
    let loading:HTMLIonLoadingElement;
    try {
      const index = await this.slides?.getActiveIndex()||0;
      if (index !== 1 || this.delegates.length > 0) return;

      // loading
      loading = await this.LoadingController.create({ spinner: 'dots', message: 'please wait ...' });
      await loading.present();

      // get delegates
      const delegates = await getDelegates(this.network, 0);
      for (const delegate of delegates) {

        if (this.selfVote.address === delegate.summary.address) continue;
        if (this.currentVote.find(v => {return v.address === delegate.summary.address})) continue;
        if (this.newVote.find(v => {return v.address === delegate.summary.address})) continue;
        
        this.delegates.push({
          address: delegate.summary.address,
          userName: delegate.summary.username,
          amount: "0",
          afterAmount: "0",
          status: delegate.dpos.delegate.status,
          rank: delegate.dpos.delegate.rank
        });
      }
    } catch(err) {
      this.delegates = [];
    } finally {
      if (loading) await loading.dismiss();
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
    if (type === 3) params = this.delegates.find((v) => { return v.address === address });

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

    } else if (type === 3) {
      const updateDelegates:Vote[] = [];
      for (const vote of this.delegates) {
        if (vote.address === address && +data > 0) {
          vote.afterAmount = data;
          this.newVote.push(vote);
        } else {
          updateDelegates.push(vote);
        }
      }
      this.delegates = updateDelegates;
    }
  }
}
