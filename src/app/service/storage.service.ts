import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

import { Account } from '../common/types';

@Injectable({
  providedIn: 'root'
})

export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }
  
  async get(key:string):Promise<any> {
    return await this._storage?.get(key);
  }

  async set(key:string, value:any) {
    await this._storage?.set(key, value);
  }
  
  async remove(key:string) {
    await this._storage?.remove(key);
  }

  async getAccounts():Promise<Account[]> {
    const storeName = await this.getNetwork()? "accounts": "testnet_accounts";
    return await this.get(storeName)||[];
  }

  async getAccount(address:string):Promise<Account> {
    const accounts:Account[] = await this.getAccounts();
    return accounts.find((account) => {return account.address === address})||null;
  }

  async setAccount(address:string, misc?:string, sortNo?:number) {
    const storeName = await this.getNetwork()? "accounts": "testnet_accounts";
    const accounts = await this.getAccounts();
    if (accounts.length > 0) {
      const account = accounts.find((account) => {return account.address === address});

      // update account
      if (account) {
        if (misc === undefined && sortNo === undefined) return;
        if (misc !== undefined) account.misc = misc;
        if (sortNo !== undefined) account.sortNo = sortNo;
        const newAccounts = accounts.filter((account) => {return account.address !== address})||[];
        newAccounts.push(account);
        newAccounts.sort((a, b) => {return (a.sortNo < b.sortNo) ? -1 : 1});

        await this.set(storeName, newAccounts);
        return;
      }
    }

    // insert account
    accounts.push(new Account(address, misc?misc:"", accounts.length));
    accounts.sort((a, b) => {return (a.sortNo < b.sortNo) ? -1 : 1});
    await this.set(storeName, accounts);
  }

  async removeAccount(address:string):Promise<Account[]> {
    const accounts = await this.getAccounts();
    if (!accounts) return;
    const newAccounts = accounts.filter((account) => {return account.address !== address})||[];
    newAccounts.sort((a, b) => {return (a.sortNo < b.sortNo) ? -1 : 1});
    for (const [index, newAccount] of newAccounts.entries()) {newAccount.sortNo = index}
    const storeName = await this.getNetwork()? "accounts": "testnet_accounts";
    await this.set(storeName, newAccounts);
  }

  async setNetwork(network:number) {
    await this.set("network", network);
  }

  async getNetwork():Promise<number> {
    return await this.get("network")||0;
  }
}