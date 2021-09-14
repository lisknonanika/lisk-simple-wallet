import { Component } from '@angular/core';
import { StorageService } from './service/storage.service';
import { LiskService } from './service/lisk.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private storageService: StorageService, private liskService: LiskService) {
    this.storageService.init();
    this.liskService.init();
  }
}
