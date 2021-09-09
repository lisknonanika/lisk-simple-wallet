import { Component } from '@angular/core';
import { LiskService } from '../../service/lisk.service';

@Component({
  selector: 'app-info',
  templateUrl: 'info.page.html',
  styleUrls: ['../../app.component.scss'],
})
export class InfoPage {

  constructor(private liskService: LiskService) {}

  getSignInAddress() {
    return this.liskService.getSignInAddress();
  }
}
