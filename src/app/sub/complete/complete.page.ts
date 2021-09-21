import { Component } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { ToastrService } from 'ngx-toastr';

import { StorageService } from '../../service/storage.service';
import { getSendTransaction } from '../../common/lisk-utils';
import { TRANSFER_JSON } from 'src/app/common/types';

@Component({
  selector: 'app-complete',
  templateUrl: 'complete.page.html',
  styleUrls: ['../../app.component.scss', './complete.page.scss'],
})
export class CompletePage {
  ref:number;
  transaction:TRANSFER_JSON;
  transactionId:string;
  network:number;
  timeout:NodeJS.Timeout;

  constructor(private router: Router, private route: ActivatedRoute,
              private toastr: ToastrService, private storageService: StorageService) {
  }

  async ionViewWillEnter() {
    this.route.queryParams.subscribe((params) => {this.ref = +params.ref});
    this.transaction = await this.storageService.getTransaction();
    this.transactionId = this.transaction.id;
    this.network = await this.storageService.getNetwork();
    const ret = await this.reload(0);
    if (ret) {
      this.toastr.info("success!");
    } else {
      this.toastr.warning("failed to send the transaction...?");
    }
    await this.storageService.removeTransaction();
    this.close();
  }

  async reload(cnt:number):Promise<boolean> {
    if (cnt === 5) return false;
    const ret = await getSendTransaction(this.network, this.transaction.senderPublicKey, this.transaction.nonce);
    if (!ret) {
      await new Promise(resolve => {this.timeout = setTimeout(resolve, 3000)});
      return await this.reload(cnt+1);
    }
    return this.transactionId === ret.id;
  }

  close() {
    if (this.timeout) clearTimeout(this.timeout);
    if (this.ref === 0) {
      this.router.navigateByUrl('/action', {replaceUrl: true});
    } else {
      this.router.navigateByUrl('/home', {replaceUrl: true});
    }
  }
}