import { Component } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { MatSnackBar } from '@angular/material/snack-bar';

import { StorageService } from '../../service/storage.service';
import { SignInAccount } from 'src/app/common/types';

@Component({
  selector: 'app-send',
  templateUrl: 'passphrase.page.html',
  styleUrls: ['../../app.component.scss', './passphrase.page.scss'],
})
export class PassphrasePage {
  isView:boolean;
  model:PassphraseModel;
  signinAccount: SignInAccount;
  transaction: Record<string, unknown>;
  address:string;
  isMultisignature:boolean;
  isMandatory:boolean;
  visibleSend:boolean;
  visibleSign:boolean;
  visibleSkip:boolean;
  ref:number;

  constructor(private router: Router, private route: ActivatedRoute,
              private matSnackBar: MatSnackBar, private storageService: StorageService) {
    this.isView = false;
    this.model = new PassphraseModel("");
  }

  async ionViewWillEnter() {
    this.address = this.route.snapshot.params['address'];
    this.route.queryParams.subscribe((params) => {this.ref = +params.ref});
    this.signinAccount = await this.storageService.getSignInAccount();
    if (!this.signinAccount) {
      this.back();
      return;
    }

    this.transaction = await this.storageService.getTransaction();
    if (!this.transaction) {
      this.back();
      return;
    }

    this.visibleSend = true;
    this.visibleSign = false;
    this.visibleSkip = false;
    this.isMandatory = false;
    this.isMultisignature = this.signinAccount.isMultisignature;
    if (this.isMultisignature) {
      const member = this.signinAccount.multisignatureMembers.find((m) => {return m.address === this.address});
      if (!member) {
        this.skip();
        return;
      }
      this.isMandatory = member.isMandatory;

      let mySignatureIndex:number = 0;
      for (const [index, m] of this.signinAccount.multisignatureMembers.entries()) {
        if (m.address !== this.address) continue;
        mySignatureIndex = index;
        break;
      }

      const numberOfSignatures:number = this.signinAccount.numberOfSignatures;
      const numberOfMandatory:number = this.signinAccount.multisignatureMembers.filter((m) => {return m.isMandatory}).length;
      let numberOfMandatorySigned:number = 0;
      let numberOfOptionalSigned:number = 0;
      const signatures = this.transaction.signatures as Buffer[]||[];
      for (const [index, sig] of signatures.entries()) {
        console.log(sig.length)
        if (numberOfMandatory > 0 && index < numberOfMandatory) {
          if (sig.length > 0 || index === mySignatureIndex) numberOfMandatorySigned += 1;
          continue;
        }
        if (sig.length > 0 || index === mySignatureIndex) numberOfOptionalSigned += 1;
      }
      if (numberOfMandatorySigned + numberOfOptionalSigned > numberOfSignatures) {
        this.matSnackBar.open('cannot sign. exceeded the number of signatures.', 'close', { verticalPosition: 'top', duration: 2000 });
        this.back();
        return;
      }
      this.visibleSend = numberOfMandatory === numberOfMandatorySigned && numberOfSignatures === numberOfMandatorySigned + numberOfOptionalSigned;
      this.visibleSign = !this.visibleSend;
      this.visibleSkip = !this.visibleSend;
    }

    this.isView = true;
  }

  back() {
    if (this.ref === 0) {
      this.router.navigateByUrl('/action/send', {replaceUrl: true});
    } else {
      this.router.navigateByUrl('/home', {replaceUrl: true});
    }
  }

  clear() {
    this.model.passphrase = "";
  }

  send() {
    this.model.passphrase = "";
  }

  sign() {
    this.model.passphrase = "";
  }

  skip() {
    this.model.passphrase = "";
  }
}

export class PassphraseModel {
  constructor(
    public passphrase: string,
  ){}
}