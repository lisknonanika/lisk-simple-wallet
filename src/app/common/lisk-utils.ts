import { cryptography } from '@liskhq/lisk-client';
import { getApiURL } from './utils';
import { MultiSigMember, SignInAccount, SignStatus } from './types';

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

export const getSignStatus = (signAddress:string, signinAccount:SignInAccount, signatures:Buffer[], isIncludeSign:boolean):SignStatus => {
  const signStatus = new SignStatus();
  signStatus.numberOfSignatures = signinAccount.numberOfSignatures;
  signStatus.numberOfMandatory = signinAccount.multisignatureMembers.filter((m) => {return m.isMandatory}).length;
  signStatus.numberOfOptional = signinAccount.multisignatureMembers.length - signStatus.numberOfMandatory;
  signStatus.numberOfMandatorySigned = 0;
  signStatus.numberOfOptionalSigned = 0;
  signStatus.signedAddress = [];

  let mySignatureIndex:number = 0;
  const members = signinAccount.multisignatureMembers;
  for (const [index, m] of members.entries()) {
    if (m.address !== signAddress) continue;
    mySignatureIndex = index;
    break;
  }

  for (const [index, sig] of signatures.entries()) {
    if (sig.length > 0) signStatus.signedAddress.push(members[index].address);
    if (sig.length > 0 || (isIncludeSign && index === mySignatureIndex)) {
      if (signStatus.numberOfMandatory > 0 && index < signStatus.numberOfMandatory) signStatus.numberOfMandatorySigned += 1;
      else signStatus.numberOfOptionalSigned += 1;
    }
  }
  signStatus.numberOfMandatoryRemain = signStatus.numberOfMandatory - signStatus.numberOfMandatorySigned;
  signStatus.numberOfOptionalRemain = signStatus.numberOfOptional - signStatus.numberOfOptionalSigned;
  signStatus.isFullSign = signStatus.numberOfMandatorySigned + signStatus.numberOfOptionalSigned === signStatus.numberOfSignatures;
  signStatus.isOverSign = signStatus.numberOfMandatorySigned + signStatus.numberOfOptionalSigned > signStatus.numberOfSignatures;

  return signStatus;
}