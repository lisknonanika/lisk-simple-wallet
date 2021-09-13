import { Injectable } from '@angular/core';

import { cryptography } from '@liskhq/lisk-client';
import { LISK } from '../common/config';
import { SignInAccount } from '../common/types';

@Injectable({
  providedIn: 'root'
})

export class LiskService {
  private _networkId: Buffer;
  private _signInAccount: SignInAccount;

  constructor() {
    this.init();
  }

  async init() {
    this._networkId = null;
    this._signInAccount = new SignInAccount("", null, "0", false, [], 0, "");
  }

  async setSignInAccount(network:number, address:string,) {
    try {
      this._signInAccount = new SignInAccount("", null, "0", false, [], 0, "");

      // set networkId
      await this.setNetworkId(network);
      if (!this._networkId) return;

      // set enter address
      if (address && cryptography.validateBase32Address(address)) {
        this._signInAccount.address = address;
        this._signInAccount.bufferAddress = cryptography.getAddressFromLisk32Address(address);
      }

      // set lisk account
      const account = await this.getAccount(network, address);
      if (!account) return;
      this._signInAccount.balance = account.summary.balance;
      if (account.summary.isMultisignature) {
        this._signInAccount.isMultisignature = true;
        for (const member of account.keys.members) {
          this._signInAccount.multisignatureMembers.push({
            address: member.address,
            publicKey: Buffer.from(member.publicKey, "hex"),
            isMandatory: member.isMandatory
          });
        }
        this._signInAccount.numberOfSignatures = account.keys.numberOfSignatures;
      }
      if (account.summary.isDelegate) this._signInAccount.userName = account.dpos.delegate.username;

    } catch(err) {
      // none
    }
  }

  getSignInAccount():SignInAccount {
    return this._signInAccount;
  }

  async setNetworkId(network:number) {
    try {
      const res = await fetch(`${LISK.API[network]}/status`);
      const json = await res.json();
      this._networkId = Buffer.from(json.networkId, "hex");
    } catch (err) {
      this._networkId = null;
    }
  }

  getNetworkId():Buffer {
    return this._networkId;
  }

  async getAccount(network:number, address:string) {
    try {
      const res = await fetch(`${LISK.API[network]}/v2/accounts?address=${address}`);
      const json = await res.json();
      return json.data[0];
    } catch (err) {
      return null;
    }
  }
}