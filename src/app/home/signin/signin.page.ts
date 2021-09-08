import { Component } from '@angular/core';
import { StorageService } from '../../service/storage.service';

@Component({
  selector: 'app-signin',
  templateUrl: 'signin.page.html',
  styleUrls: ['../../app.component.scss'],
})
export class SignInPage {
  constructor(private storageService: StorageService) {}

  public set(key: string, value: any) {
    this.storageService?.set(key, value);
  }
  
  public async get(key: string) {
    const val = await this.storageService?.get(key);
    console.log(val);
    return val;
  }
  
  public async remove(key: string) {
    await this.storageService?.remove(key);
  }

}
