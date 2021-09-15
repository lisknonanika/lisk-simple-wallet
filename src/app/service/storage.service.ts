import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

import { Account, Settings, SignInAccount } from '../common/types';

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

  async getAccountsStoreName():Promise<string> {
    return await this.getNetwork()? "testnet_accounts": "accounts";
  }

  async getAccounts():Promise<Account[]> {
    const storeName = await this.getAccountsStoreName();
    return await this.get(storeName)||[];
  }

  async setAccounts(accounts:Account[]) {
    const storeName = await this.getAccountsStoreName();
    await this.set(storeName, accounts);
  }

  async getAccount(address:string):Promise<Account> {
    const accounts:Account[] = await this.getAccounts();
    return accounts.find((account) => {return account.address === address})||null;
  }

  async setAccount(address:string, publicKey:Buffer, misc?:string, sortNo?:number) {
    const storeName = await this.getAccountsStoreName();
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
    accounts.push(new Account(address, publicKey, misc?misc:"", accounts.length));
    accounts.sort((a, b) => {return (a.sortNo < b.sortNo) ? -1 : 1});
    await this.set(storeName, accounts);
  }

  async removeAccount(address:string) {
    const accounts = await this.getAccounts();
    if (!accounts) return;
    const newAccounts = accounts.filter((account) => {return account.address !== address})||[];
    newAccounts.sort((a, b) => {return (a.sortNo < b.sortNo) ? -1 : 1});
    for (const [index, newAccount] of newAccounts.entries()) {newAccount.sortNo = index}
    const storeName = await this.getAccountsStoreName();
    await this.set(storeName, newAccounts);
  }

  async removeAccounts() {
    const storeName = await this.getAccountsStoreName();
    await this.remove(storeName);
  }

  async setSignInAccount(account:SignInAccount) {
    await this.set("signInAccount", account);
  }

  async getSignInAccount():Promise<SignInAccount> {
    return await this.get("signInAccount")||null;
  }

  async removeSignInAccount() {
    await this.remove("signInAccount");
  }

  async getSettings():Promise<Settings> {
    return await this.get("settings")||new Settings(0, 0);
  }

  async setSettings(settings:Settings) {
    return await this.set("settings", settings);
  }

  async setNetworkId(networkId:Buffer) {
    await this.set("networkId", networkId);
  }

  async getNetworkId():Promise<Buffer> {
    return await this.get("networkId");
  }

  async removeNetworkId() {
    await this.remove("networkId");
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