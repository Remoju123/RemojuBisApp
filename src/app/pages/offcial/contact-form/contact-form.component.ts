import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ComfirmDialogParam } from 'src/app/class/common.class';
import { CommonService } from "../../../service/common.service";
import { EmailService } from 'src/app/service/email.service';

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
    private emailService: EmailService
  ) {
    this.contactForm = this.builder.group({
      fullName: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      confirmEmail: ['', Validators.required],
      title: ['', Validators.required],
      message: ['', Validators.required],
      agree: [false, Validators.requiredTrue],
      createDate: [''],
      ipAddress: ['']
    })
  }

  ngOnInit(): void {
    this.optionSelect = [
      { value: 'contact', label: 'お問い合わせ' },
      { value: 'member', label: '会員登録について' },
      { value: 'post', label: '問題のある投稿の報告' },
      { value: 'image', label: '問題のある画像の報告' },
      { value: 'advertising', label: '広告掲載について' },
      { value: 'publication', label: '取材・掲載について' },
      { value: 'feature', label: '機能改善要望' },
      { value: 'other', label: 'その他' },
    ]

    //this.dumiForm();
  }

  get email(): FormControl {
    return this.contactForm.get('email') as FormControl
  }

  get title(): FormControl {
    return this.contactForm.get('title') as FormControl
  }

  sendMail() {
    const confirm = this.emailService.createHtmlBody(this.contactForm)
    const param = new ComfirmDialogParam();
    param.title = "お問い合わせ内容";
    param.text = `${confirm}<div>以上の内容で送信しますか？</div>`;
    const dialog = this.commonService.confirmMessageDialog(param);
    dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
      if (d === "ok") {
        const msg = this.emailService.createMailBody(this.contactForm)
        //console.log(msg)
        this.emailService.sendMailCallable(this.email.value, this.title.value, msg).then(()=>{
          this.commonService.snackBarDisp("送信しました。");
        });
      }

    });
    return;

  }

  dumiForm(): void {
    this.contactForm.patchValue({
      fullName: "村本光治",
      email: "mitsu@metier.co.jp",
      confirmEmail: "mitsu@metier.co.jp",
      title: "contact",
      message: "しかもその信用は初対面の時からの仲好でした。日本人、ことによると生涯で一番気楽かも知れないが、おれのいうのは一体誰の事だいと兄が聞いた。",
      agree: true
    })
  }


}
