import { AbstractControl, ValidatorFn } from '@angular/forms';

export class CustomValidator{
  static matchEmail(ac:AbstractControl){
    const email = ac.get('email')?.value;
    const emailConfirm = ac.get('confirmEmail')?.value;

    if (email !== emailConfirm) {
      ac.get('confirmEmail')?.setErrors({ notMatchEmail: true });
    }
  }
}