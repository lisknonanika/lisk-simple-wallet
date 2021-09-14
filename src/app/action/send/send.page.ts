import { Component } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-send',
  templateUrl: 'send.page.html',
  styleUrls: ['../../app.component.scss'],
})
export class SendPage {

  constructor(private router: Router) {}

  signOut() {
    this.router.navigateByUrl('/home', {replaceUrl: true});
  }

}
