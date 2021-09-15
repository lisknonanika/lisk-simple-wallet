import { cryptography } from '@liskhq/lisk-client';
import { getApiURL } from './utils';
import { SignInAccount } from './types';

export const createSignInAccount = async(network:number, address:string):Promise<SignInAccount> => {
  try {
    const signInAccount = new SignInAccount("", null, BigInt(0), "0", false, [], 0, "");

    // set enter address
    signInAccount.address = address;
    signInAccount.bufferAddress = cryptography.getAddressFromLisk32Address(address);

    // set lisk account
    const account = await getAccount(network, address);
    if (!account) return;
    signInAccount.nonce = BigInt(account.sequence.nonce);
    signInAccount.balance = account.summary.balance;
    if (account.summary.isMultisignature) {
      signInAccount.isMultisignature = true;
      for (const member of account.keys.members) {
        signInAccount.multisignatureMembers.push({
          address: member.address,
          publicKey: Buffer.from(member.publicKey, "hex"),
          isMandatory: member.isMandatory
        });
      }
      signInAccount.numberOfSignatures = account.keys.numberOfSignatures;
    }
    if (account.summary.isDelegate) signInAccount.userName = account.dpos.delegate.username;
    return signInAccount;

  } catch(err) {
    return null;
  }
}



export const getAccount = async(network:number, address:string):Promise<any> => {
  try {
    const res = await fetch(`${getApiURL(network)}/v2/accounts?address=${address}`);
    const json = await res.json();
    return json.data[0];
  } catch (err) {
    return null;
  }
}


export const getNetworkId = async(network:number):Promise<Buffer> => {
  try {
    const res = await fetch(`${getApiURL(network)}/status`);
    const json = await res.json();
    return Buffer.from(json.networkId, "hex");
  } catch (err) {
    return null;
  }
}