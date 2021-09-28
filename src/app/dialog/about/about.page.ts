import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastrService } from 'ngx-toastr';

import { VERSION } from '../../common/config';

@Component({
  selector: 'app-about',
  templateUrl: 'about.page.html',
  styleUrls: ['../../app.component.scss', './about.page.scss'],
})
export class AboutPage {
  version:string;

  constructor(private modalController: ModalController, private clipboard: Clipboard,
              private toastr: ToastrService) {
    this.version = VERSION;
  }

  async copy(address:string) {
    const result = await this.clipboard.copy(address);
    if (result) {
      this.toastr.info("copied.");
    } else {
      this.toastr.error("failed.");
    }
  }

  close() {
    this.modalController.dismiss();
  }
}
