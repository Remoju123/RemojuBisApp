import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ComfirmDialogParam } from 'src/app/class/common.class';
import { CommonService } from "../../../service/common.service";

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent implements OnInit {
  private onDestroy$ = new Subject();
  contactForm: FormGroup;
  disabledSubmitButton: boolean = true;
  optionSelect: Array<any> | undefined;

  onSubmit(arg0: any) {
    throw new Error('Method not implemented.');
  }

  constructor(
    private builder: FormBuilder,
    public commonService: CommonService,
  ) { 
    this.contactForm = this.builder.group({
      Fullname: ['', Validators.required],
      Email: ['', Validators.compose([Validators.required, Validators.email])],
      confirmEmail: ['', Validators.required],
      title: ['', Validators.required],
      Comment: ['', Validators.required],
      Agree: [false, Validators.requiredTrue],
      createDate: [''],
      ipAddress: ['']
    })
  }

  ngOnInit(): void {
    this.optionSelect = [
      {value:'contact',label:'お問い合わせ'},
      {value:'member',label:'会員登録について'},
      {value:'post',label:'問題のある投稿の報告'},
      {value:'image',label:'問題のある画像の報告'},
      {value:'advertising',label:'広告掲載について'},
      {value:'publication',label:'取材・掲載について'},
      {value:'feature',label:'機能改善要望'},
      {value:'other',label:'その他'},
    ]
  }

  sendMail() {
    const param = new ComfirmDialogParam();
    param.title = "ContactFormTitle";
    param.text = "ContactFormText";
    const dialog = this.commonService.confirmMessageDialog(param);
    dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
      if (d === "ok") {

      }
    });
    return;

  }



}
