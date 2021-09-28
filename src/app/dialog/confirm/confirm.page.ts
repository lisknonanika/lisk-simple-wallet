import { Component } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-confirm',
  templateUrl: 'confirm.page.html',
  styleUrls: ['../../app.component.scss', './confirm.page.scss'],
})
export class ConfirmPage {
  msg:string[];
  type:number;

  constructor(private modalController: ModalController, private navParams: NavParams) {
    this.msg = this.navParams.data.msg;
    this.type = this.navParams.data.type;
  }
  
  ok() {
    this.modalController.dismiss(true);
  }

  close() {
    this.modalController.dismiss(false);
  }
}
