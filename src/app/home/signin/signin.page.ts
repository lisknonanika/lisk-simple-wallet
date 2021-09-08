import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { StorageService } from '../../service/storage.service';

@Component({
  selector: 'app-signin',
  templateUrl: 'signin.page.html',
  styleUrls: ['../../app.component.scss'],
})
export class SignInPage {
  model:SignInModel;
  
  constructor(private storageService: StorageService, private router: Router) {
    this.model = new SignInModel("");
  }

  ionViewWillLeave(){
    this.model = new SignInModel("");
  }

  async setAccount(address:string) {
    await this.storageService?.setAccount(address);
  }
  
  async remove() {
    await this.storageService?.remove("accounts");
  }

  async signIn() {
    console.log(this.model.passphrase);
    this.router.navigateByUrl('/action', {replaceUrl: true});
  }
}

export class SignInModel{
  constructor(
    public passphrase: string
  ){}
}