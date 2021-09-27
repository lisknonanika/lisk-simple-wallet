import { Component } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { ToastrService } from 'ngx-toastr';

import { cryptography } from '@liskhq/lisk-client';
const {  getLisk32AddressFromPassphrase } = cryptography;

@Component({
  selector: 'app-passphrase',
  templateUrl: 'passphrase.page.html',
  styleUrls: ['../../app.component.scss', './passphrase.page.scss'],
})
export class PassphrasePage {
  address:string;
  passphrase:string;
  availableDelete:boolean;
  eye:boolean;

  constructor(private modalController: ModalController, private navParams: NavParams,
              private toastr: ToastrService) {
    this.address = this.navParams.data.address;
    this.passphrase = "";
    this.eye = false;
  }

  setPassphrase(val:string) {
    this.passphrase = val.replace(/\r/g, "").replace(/\n/g, " ").toLowerCase();
  }
  
  async sign() {
    this.passphrase = this.passphrase.trim().toLowerCase();
    if (!this.passphrase) {
      this.toastr.error("passphrase is required.");
      return;
    }

    if (this.address !== getLisk32AddressFromPassphrase(this.passphrase)) {
      this.toastr.error("passphrase is incorrect.");
      return;
    }
    this.modalController.dismiss(this.passphrase);
  }

  changeEye() {
    this.eye = !this.eye;
  }

  close() {
    this.modalController.dismiss("");
  }
}
