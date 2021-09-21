import { transactions, cryptography } from '@liskhq/lisk-client';
const { signMultiSignatureTransaction, signTransaction, convertLSKToBeddows, getBytes } = transactions;
const { bufferToHex, hexToBuffer, getLisk32AddressFromAddress, validateLisk32Address } = cryptography;

import { getApiURL, getTransferAssetSchema } from './utils';
import { SignInAccount, SignStatus, TransferTransaction ,TRANSFER_JSON, TRANSFER_JS } from './types';

export const createSignInAccount = async(network:number, address:string, publicKey:string):Promise<SignInAccount> => {
  try {
    const signInAccount = new SignInAccount("", "", "0", "0", false, [], 0, "");

    // set enter address
    signInAccount.address = address;
    signInAccount.publicKey = publicKey;

    // set lisk account
    const account = await getAccount(network, address);
    if (!account) return;
    signInAccount.nonce = account.sequence.nonce;
    signInAccount.balance = account.summary.balance;
    if (account.summary.isMultisignature) {
      signInAccount.isMultisignature = true;
      for (const member of account.keys.members) {
        signInAccount.multisignatureMembers.push({
          address: member.address,
          publicKey: member.publicKey,
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

export const getNetworkId = async(network:number):Promise<string> => {
  try {
    const res = await fetch(`${getApiURL(network)}/status`);
    const json = await res.json();
    return json.networkId;
  } catch (err) {
    return null;
  }
}

export const getSignStatus = (signinAccount:SignInAccount, signatures:string[]):SignStatus => {
  const signStatus = new SignStatus();
  signStatus.numberOfSignatures = signinAccount.numberOfSignatures;
  signStatus.numberOfMandatory = signinAccount.multisignatureMembers.filter((m) => {return m.isMandatory}).length;
  signStatus.numberOfOptional = signinAccount.multisignatureMembers.length - signStatus.numberOfMandatory;
  signStatus.numberOfMandatorySigned = 0;
  signStatus.numberOfOptionalSigned = 0;
  signStatus.signedAddress = [];

  const members = signinAccount.multisignatureMembers;
  for (const [index, sig] of signatures.entries()) {
    if (sig.length > 0) {
      signStatus.signedAddress.push(members[index].address);
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

export const sign = (transaction:TRANSFER_JSON, signinAccount:SignInAccount, passphrase:string, networkId:string):TRANSFER_JS => {
  try {
    const tx = new TransferTransaction(transaction).toJsObject();
    if (signinAccount.isMultisignature) {
      const mandatories = signinAccount.multisignatureMembers.filter((m) => {return m.isMandatory})||[];
      const optionals = signinAccount.multisignatureMembers.filter((m) => {return !m.isMandatory})||[];
      const keys = {
        mandatoryKeys: mandatories.map((member) => {return hexToBuffer(member.publicKey)})||[],
        optionalKeys: optionals.map((member) => {return hexToBuffer(member.publicKey)})||[]
      }
      return signMultiSignatureTransaction(getTransferAssetSchema(), tx, hexToBuffer(networkId), passphrase, keys, false) as TRANSFER_JS;
    }
    return signTransaction(getTransferAssetSchema(), tx, hexToBuffer(networkId), passphrase) as TRANSFER_JS;
  } catch(err) {
    console.log(err)
    return null;
  }
}

export const sendTransferTransaction = async(network:number, transaction:TRANSFER_JS):Promise<string> => {
  try {
    const payload = bufferToHex(getBytes(getTransferAssetSchema(), transaction));
    const res = await fetch(`${getApiURL(network)}/v2/transactions?transaction=${payload}`,{
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
    });
    const json = await res.json();
    if (json.error) return null;
    return json.transactionId;
  } catch (err) {
    return null;
  }
}

export const transferValidation = (signinAccount: SignInAccount, transaction:TRANSFER_JSON, isNonceCheck:boolean):string => {
  const recipient = transaction.asset.recipientAddress;
  if (!recipient) return "recipient address is required.";

  try {
    if (!validateLisk32Address(getLisk32AddressFromAddress(hexToBuffer(recipient)))) return "invalid recipient address.";
  } catch(err) {
    return "invalid recipient address.";
  }

  const amount = transaction.asset.amount;
  if (!amount) return "amount is required.";

  try {
    if (BigInt(amount) <= 0) return "invalid amount." ;
  } catch(err) {
    return "invalid amount.";
  }

  const balance = BigInt(signinAccount.balance||"0");
  const minBalance = BigInt(convertLSKToBeddows("0.05"));
  if ((balance - BigInt(amount) - BigInt(transaction.fee)) < minBalance) return "not enough balance. at least 0.05LSK should be left.";

  const data = transaction.asset.data;
  if (data.length > 64) return "data exceeds the maximum number of characters (Max:64).";

  if (isNonceCheck && transaction.nonce !== signinAccount.nonce) return "nonce missmatch.";
  
  return "";
}