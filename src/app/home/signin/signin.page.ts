import { Component } from '@angular/core';
import { StorageService } from '../../service/storage.service';

@Component({
  selector: 'app-signin',
  templateUrl: 'signin.page.html',
  styleUrls: ['../../app.component.scss'],
})
export class SignInPage {
  constructor(private storageService: StorageService) {}

  public async getAccounts() {
    const val = await this.storageService?.getAccounts();
    console.log(val);
    return val;
  }

  public async setAccount(address:string) {
    await this.storageService?.setAccount(address);
  }
  
  public async removeAccount(address:string) {
    await this.storageService?.removeAccount(address);
  }
  
  public async remove() {
    await this.storageService?.remove("accounts");
  }

}
