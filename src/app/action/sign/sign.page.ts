import { Component } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-sign',
  templateUrl: 'sign.page.html',
  styleUrls: ['../../app.component.scss'],
})
export class SignPage {

  constructor(private router: Router) {}

  signOut() {
    this.router.navigateByUrl('/home', {replaceUrl: true});
  }

}
