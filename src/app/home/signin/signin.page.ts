import { Component } from '@angular/core';
import { StorageService } from '../../service/storage.service';

@Component({
  selector: 'app-signin',
  templateUrl: 'signin.page.html',
  styleUrls: ['../../app.component.scss'],
})
export class SignInPage {
  constructor(private storageService: StorageService) {}

  public async setAccount(address:string) {
    await this.storageService?.setAccount(address);
  }
  
  public async remove() {
    await this.storageService?.remove("accounts");
  }

}
