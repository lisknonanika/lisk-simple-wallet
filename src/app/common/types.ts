import { Type } from '@angular/core';
import { cryptography } from '@liskhq/lisk-client';

export class Settings {
  constructor(
    public network:number,
    public explorer:number
  ){}
}

export class Account {
  constructor(
    public address:string,
    public publicKey: string,
    public misc?:string,
    public sortNo?:number
  ){}
}

export class SignInAccount {
  constructor(
    public address: string,
    public publicKey: string,
    public nonce: string,
    public balance: string,
    public isMultisignature: boolean,
    public multisignatureMembers: MultiSigMember[],
    public numberOfSignatures: number,
    public userName:string,
  ){}
}

export class MultiSigMember {
  constructor(
    public address: string,
    public publicKey: string,
    public isMandatory: boolean
  ){}
}

export type TRANSFER_JSON = {
  moduleID: number,
  assetID: number,
  senderPublicKey: string,
  nonce: string,
  fee: string,
  signatures: string[],
  asset: {
    amount: string,
    recipientAddress: string,
    data:string
  },
  id: string
};
export type TRANSFER_JS = {
  moduleID: number,
  assetID: number,
  senderPublicKey: Buffer,
  nonce: bigint,
  fee: bigint,
  signatures: Buffer[],
  asset: {
    amount: bigint,
    recipientAddress: Buffer,
    data:string
  },
  id: Buffer
};

export class TransferTransaction {
  public moduleID:number;
  public assetID:number;
  public nonce:string;
  public fee:string;
  public senderPublicKey:string;
  public asset: {
    amount:string,
    recipientAddress:string,
    data:string
  }
  public signatures:string[];
  public id:string;

  constructor(transaction?:TRANSFER_JSON){
    this.moduleID = 2;
    this.assetID = 0;
    if (!transaction) {
      this.senderPublicKey = "";
      this.nonce = "0";
      this.fee = "10000000";
      this.signatures = [];
      this.asset = {amount: "0", recipientAddress: "", data: ""}
      this.id = "";

    } else {
      this.senderPublicKey = transaction.senderPublicKey.trim().toLocaleLowerCase();
      this.nonce = transaction.nonce.trim().toLocaleLowerCase().replace("n", "");
      this.fee = transaction.fee.trim().toLocaleLowerCase().replace("n", "");
      this.signatures = transaction.signatures?transaction.signatures.map((signature) => {return signature.trim().toLocaleLowerCase()}):[];
      this.asset = {
        amount: transaction.asset.amount.trim().toLocaleLowerCase().replace("n", ""),
        recipientAddress: transaction.asset.recipientAddress.trim().toLocaleLowerCase(),
        data: transaction.asset.data.trim()
      }
      this.id = transaction.id?transaction.id.trim().toLocaleLowerCase():"";
    }
  }

  toJsObject():TRANSFER_JS {
    return {
      moduleID: this.moduleID,
      assetID: this.assetID,
      senderPublicKey: cryptography.hexToBuffer(this.senderPublicKey),
      nonce: BigInt(this.nonce),
      fee: BigInt(this.fee),
      signatures: this.signatures.map((signature) => {return signature? cryptography.hexToBuffer(signature):Buffer.from("", "hex")})||[],
      asset: {
        amount: BigInt(this.asset.amount),
        recipientAddress: cryptography.hexToBuffer(this.asset.recipientAddress),
        data: this.asset.data
      },
      id: this.id? cryptography.hexToBuffer(this.id): Buffer.from("", "hex")
    }
  }

  toJSON():TRANSFER_JSON {
    return {
      moduleID: this.moduleID,
      assetID: this.assetID,
      senderPublicKey: this.senderPublicKey,
      nonce: this.nonce,
      fee: this.fee,
      signatures: this.signatures,
      asset: this.asset,
      id: this.id
    }
  }

  object2JSON(transaction:TRANSFER_JS):TRANSFER_JSON {
    return {
      moduleID: transaction.moduleID,
      assetID: transaction.assetID,
      senderPublicKey: cryptography.bufferToHex(transaction.senderPublicKey),
      nonce: transaction.nonce.toString(),
      fee: transaction.fee.toString(),
      signatures: transaction.signatures.map((signature) => {return cryptography.bufferToHex(signature)}),
      asset: {
        amount: transaction.asset.amount.toString(),
        recipientAddress: cryptography.bufferToHex(transaction.asset.recipientAddress),
        data: transaction.asset.data.toString()
      },
      id: cryptography.bufferToHex(transaction.id)
    }
  }
}

export class SignStatus {
  public numberOfSignatures: number;
  public numberOfMandatory: number;
  public numberOfOptional: number;
  public numberOfMandatorySigned: number;
  public numberOfOptionalSigned: number;
  public numberOfMandatoryRemain: number;
  public numberOfOptionalRemain: number;
  public signedAddress: string[];
  public isFullSign: boolean;
  public isOverSign: boolean;
  constructor(){}
}