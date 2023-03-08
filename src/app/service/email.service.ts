import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { EmailClient } from '@azure/communication-email';
import { CommonService } from './common.service';

const connectionString =
  'endpoint=https://rj-communication-resource.communication.azure.com/;accesskey=eoJ5CZ+uvNj6XdaIMLFfNCalmhxqI2xjgbaYyQqDKZBA/zO/cyqx31j9/QIf6AoDaDy8uXNh2MRGTOcg3D0IQw==';
const client = new EmailClient(connectionString);
const sender = 'DoNotReply@b558a3b3-99ab-4787-be1a-c2b6a44024fc.azurecomm.net';
@Injectable({
  providedIn: 'root',
})
export class EmailService {
  constructor(private http: HttpClient, private commonService: CommonService) {}

  createHtmlBody(form: FormGroup) {
    const optionSelect = [
      { value: 'contact', label: 'お問い合わせ' },
      { value: 'member', label: 'ユーザー会員登録' },
      { value: 'problem', label: '問題のある投稿・画像の報告' },
      { value: 'advertising', label: '広告掲載について' },
      { value: 'publication', label: '取材・掲載について' },
      { value: 'functions', label: 'アプリ機能改善要望' },
    ];

    const cf: FormGroup = form;
    const name = cf.get('fullName')?.value;
    const email = cf.get('email')?.value;
    const title = optionSelect.find(
      (v) => v.value === cf.get('title')?.value
    )?.label;
    const message = cf.get('message')?.value;

    const body = `
      <table style='text-align:left;font-size:14px;' class='dlgtbl'>
      <tr><td nowrap>お名前</td><td>${name}</td></tr>
      <tr><td nowrap>メールアドレス</td><td>${email}</td></tr>
      <tr><td nowrap>お問い合わせ種別　</td><td>${title}</td></tr>
      <tr><td colspan=2 style='border-bottom: 1px solid #ccc;'></td></tr>
      <tr><td nowrap>お問い合わせ内容　</td><td style='white-space:pre-wrap;'>${message}</td></tr>
      <tr><td colspan=2 style='border-bottom: 1px solid #ccc;'></td></tr>
      </table><br/><br/>
    `;
    return body;
  }

  createMailBody(form: FormGroup) {
    const body = this.createHtmlBody(form);

    const header = `
    <h4>お問い合わせありがとうございました。</h4>
    <p>改めて担当者よりご連絡させていただきます。</p>
    `;
    const footer = `
    <p style='font-size:14px;'>
    このメールは、配信専用アドレスからの連絡です。<br/>
    このメールにお心当たりない場合は下記までご連絡ください。<br/><br/>
    </p>
    `;
    return header + body + footer;
  }

  async sendMailCallable(to: any, subject: any, msg: any) {
    const toReceipents = {
      to: [{ email: to, displayName: '<RECIPIENT_DISPLAY_NAME>' }],
      bCC: [
        { email: 'public@remoju.com', displayName: '<RECIPIENT_DISPLAY_NAME>' },
      ],
    };

    try {
      const emailMessage = {
        sender: sender,
        content: {
          subject: subject,
          html: msg,
        },
        recipients: toReceipents,
      };
      const SendEmailResult = await client.send(emailMessage);

      if (SendEmailResult && SendEmailResult.messageId) {
        // check mail status, wait for 5 seconds, check for 60 seconds.
        const messageId = SendEmailResult.messageId;
        if (messageId === null) {
          console.log('Message Id not found.');
          return;
        }

        console.log('Send email success, MessageId :', messageId);

        let counter = 0;
        const statusInterval = setInterval(async function () {
          counter++;
          try {
            const response = await client.getSendStatus(messageId);
            if (response) {
              console.log(
                `Email status for {${messageId}} : [${response.status}]`
              );
              if (response.status.toLowerCase() !== 'queued' || counter > 12) {
                clearInterval(statusInterval);
              }
            }
          } catch (e) {
            console.log('Error in checking send mail status: ', e);
          }
        }, 5000);
      } else {
        console.error(
          'Something went wrong when trying to send this email: ',
          SendEmailResult
        );
      }
    } catch (e) {
      console.log(
        '################### Exception occoured while sending email #####################',
        e
      );
    }
  }
}
