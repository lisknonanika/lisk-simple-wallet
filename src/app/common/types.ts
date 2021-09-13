export class Account {
  constructor(
    public address:string,
    public misc?:string,
    public sortNo?:number
  ){}
}

export class SignInAccount {
  constructor(
    public address: string,
    public bufferAddress: Buffer,
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