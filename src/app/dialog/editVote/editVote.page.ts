import { Component } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { ToastrService } from 'ngx-toastr';

import { transactions } from '@liskhq/lisk-client';
const { convertLSKToBeddows } = transactions;

import { Vote } from 'src/app/common/types';

@Component({
  selector: 'app-editVote',
  templateUrl: 'editVote.page.html',
  styleUrls: ['../../app.component.scss', './editVote.page.scss'],
})
export class EditVotePage {
  params:Vote;
  beforeAmount:string;
  afterAmount:string;

  constructor(private modalController: ModalController, private navParams: NavParams,
              private toastr: ToastrService) {
    this.params = this.navParams.data.params;
    this.beforeAmount = this.params.afterAmount;
    this.afterAmount = this.params.afterAmount;
  }

  setAmount(val:string) {
    this.afterAmount = val.length === 0? "0": val;
  }
  
  ok() {
    try {
      if (this.afterAmount.length === 0) {
        this.toastr.error("Invalid amount.");
        return;
      }

      convertLSKToBeddows(this.afterAmount);

      const num = +this.afterAmount;
      if (num < 0) {
        this.toastr.error("Invalid amount. (min: 0)");
        return;
      }

      if (num%10 !== 0) {
        this.toastr.error("Must be a multiple of 10.");
        return;
      }

      this.modalController.dismiss(num.toString());

    } catch (err) {
      this.toastr.error("Invalid amount.");
    }
  }
  
  reset() {
    this.afterAmount = this.params.amount;
  }

  close() {
    this.modalController.dismiss(this.beforeAmount);
  }
}
