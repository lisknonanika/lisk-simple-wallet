export class Settings {
  constructor(
    public network:number,
    public explorer:number
  ){}
}

export class Account {
  constructor(
    public address:string,
    public publicKey: Buffer,
    public misc?:string,
    public sortNo?:number
  ){}
}

export class SignInAccount {
  constructor(
    public address: string,
    public bufferAddress: Buffer,
    public nonce: BigInt,
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
    public publicKey: Buffer,
    public isMandatory: boolean
  ){}
}

export class TransferTransaction {
  public moduleID:number;
  public assetID:number;
  public nonce:BigInt;
  public fee:BigInt;
  public senderPublicKey:Buffer;
  public asset: {
    amount:BigInt,
    recipientAddress:Buffer,
    data:string
  }

  constructor(){
    this.moduleID = 2;
    this.assetID = 0;
    this.nonce = BigInt(0);
    this.fee = BigInt(10000000);
    this.senderPublicKey = null;
    this.asset = {amount: BigInt(0), recipientAddress: null, data: ""}
  }

  toJSON(): Record<string, unknown> {
    return {
      moduleID: this.moduleID,
      assetID: this.assetID,
      nonce: this.nonce,
      fee: this.fee,
      senderPublicKey: this.senderPublicKey,
      asset: this.asset
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