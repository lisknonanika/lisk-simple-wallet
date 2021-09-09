import { Injectable } from '@angular/core';

import { cryptography } from '@liskhq/lisk-client';

@Injectable({
  providedIn: 'root'
})

export class LiskService {
  private _signInAddress: string;
  private _signInBufferAddress: Buffer;
  private _networkId: Buffer;

  constructor() {
    this.init();
  }

  async init() {
    this._signInAddress = "";
    this._signInBufferAddress = null;
    this._networkId = null;
  }

  setSignInAddress(address: string) {
    this._signInAddress = "";
    this._signInBufferAddress = null;
    try {
      if (address && cryptography.validateBase32Address(address)) {
        this._signInAddress = address;
        this._signInBufferAddress = cryptography.getAddressFromLisk32Address(address);
      }
    } catch(err) {
      // none
    }
  }

  getSignInAddress():string {
    return this._signInAddress;
  }

  getSignInBufferAddress():Buffer {
    return this._signInBufferAddress;
  }

  setNetworkId(networkId:string) {
    this._networkId = Buffer.from(networkId, "hex");
  }

  getNetworkId():Buffer {
    return this._networkId;
  }
}