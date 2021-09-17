import Swal, { SweetAlertOptions, SweetAlertCustomClass } from 'sweetalert2';

export class PassphraseDialog {
  passphraseDialog: typeof Swal;

  constructor(public address: string){
    const customClass:SweetAlertCustomClass = {
      popup: 'swal2-custom-popup',
      input: 'swal2-custom-input',
      title: 'swal2-custom-title',
      htmlContainer: 'swal2-custom-htmlContainer',
      cancelButton: 'swal2-custom-cancelButton',
      confirmButton: 'swal2-custom-confirmButton'
    }
    const options:SweetAlertOptions = {
      title: 'Enter Passphrase',
      html: `<style>` +
            `.swal2-custom-popup {color:#ffffff; background-color:rgba(85,120,180,0.75); width:calc(100vw - 40px); max-wdth:600px}` +
            `.swal2-custom-input {color:#ffffff; background-color:rgb(59,59,59);}` +
            `.swal2-custom-title {color:#ffffff;}` +
            `.swal2-custom-htmlContainer {color:#ffffff;}` +
            `.swal2-custom-cancelButton {width:calc(50vw - 60px); height:40px; background-color:#ed576b !important; border-radius:10px !important;}` +
            `.swal2-custom-confirmButton {width:calc(50vw - 60px); height:40px; background-color:#3171e0 !important; border-radius:10px !important;}` +
            `</style>` +
            `<img src="https://lisk-avator.ysdev.work/${address}?size=130"/>` +
            `<div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${address}</div>`,
      showCancelButton: true,
      input: 'password',
      inputPlaceholder: 'Enter Passphrase',
      customClass: customClass
    }
    this.passphraseDialog = Swal.mixin({...options});
  }

  async openDialog():Promise<{isConfirmed:boolean, value:string}> {
    const { isConfirmed, value } = await this.passphraseDialog.fire();
    return {isConfirmed: isConfirmed, value: value};
  }
}