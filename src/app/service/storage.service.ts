import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

import { Account, Settings } from '../common/types';

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
    const storeName = await this.getNetwork()? "testnet_accounts": "accounts";
    return await this.get(storeName)||[];
  }

  async getAccount(address:string):Promise<Account> {
    const accounts:Account[] = await this.getAccounts();
    return accounts.find((account) => {return account.address === address})||null;
  }

  async setAccount(address:string, misc?:string, sortNo?:number) {
    const storeName = await this.getNetwork()? "testnet_accounts": "accounts";
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

  async removeAccount(address:string) {
    const accounts = await this.getAccounts();
    if (!accounts) return;
    const newAccounts = accounts.filter((account) => {return account.address !== address})||[];
    newAccounts.sort((a, b) => {return (a.sortNo < b.sortNo) ? -1 : 1});
    for (const [index, newAccount] of newAccounts.entries()) {newAccount.sortNo = index}
    const storeName = await this.getNetwork()? "accounts": "testnet_accounts";
    await this.set(storeName, newAccounts);
  }

  async removeAccounts() {
    const storeName = await this.getNetwork()? "accounts": "testnet_accounts";
    await this.remove(storeName);
  }

  async setSignInAddress(address:string) {
    await this.set("signInAddress", address);
  }

  async getSignInAddress():Promise<string> {
    return await this.get("signInAddress")||"";
  }

  async getSettings():Promise<Settings> {
    return await this.get("settings")||new Settings(0, 0);
  }

  async setSettings(settings:Settings) {
    return await this.set("settings", settings);
  }

  async setNetwork(network:number) {
    const settings = await this.getSettings();
    settings.network = network;
    await this.setSettings(settings);
  }

  async getNetwork():Promise<number> {
    return (await this.getSettings()).network||0;
  }

  async setExplorer(explorer:number) {
    const settings = await this.getSettings();
    settings.explorer = explorer;
    await this.setSettings(settings);
  }

  async getExplorer():Promise<number> {
    return (await this.getSettings()).explorer||0;
  }
}