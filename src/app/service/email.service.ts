import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders, HttpParams } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

const httpOptions = {
  headers: new HttpHeaders({
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json;charset=utf-8"
  })
};

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor(private http:HttpClient) { }

  createConfirmBody(form:FormGroup){
    const optionSelect = [
      {value:'contact',label:'お問い合わせ'},
      {value:'member',label:'ユーザー会員登録'},
      {value:'problem',label:'問題のある投稿・画像の報告'},
      {value:'advertising',label:'広告掲載について'},
      {value:'publication',label:'取材・掲載について'},
      {value:'functions',label:'アプリ機能改善要望'},
    ];
    
    const cf:FormGroup = form;
    const name = cf.get('lastName')?.value + cf.get('firstName')?.value;
    const furi = cf.get('lastFuri')?.value + cf.get('firstFuri')?.value;;
    const address = '〒' + cf.get('zipCode')?.value + ' ' + cf.get('address1')?.value + cf.get('address2')?.value;
    const phone = cf.get('phone')?.value;
    const fax = cf.get('fax')?.value;
    const email = cf.get('email')?.value;
    const subject = optionSelect.find((v)=>v.value === cf.get('subject')?.value)?.label;
    const message = cf.get('message')?.value;

    const body = `
      <table style='text-align:left;font-size:14px;'>
      <tr><td nowrap>お名前</td><td>${name}</td></tr>
      <tr><td nowrap>ふりがな</td><td>${furi}</td></tr>
      <tr><td nowrap>住所</td><td>${address}</td></tr>
      <tr><td nowrap>電話番号</td><td>${phone}</td></tr>
      <tr><td nowrap>ファックス番号</td>${fax}<td></td></tr>
      <tr><td nowrap>メールアドレス</td><td>${email}</td></tr>
      <tr><td nowrap>お問い合わせ種別　</td><td>${subject}</td></tr>
      <tr><td colspan=2 style='border-bottom: 1px solid #ccc;'></td></tr>
      <tr><td nowrap>お問い合わせ内容　</td><td style='white-space:pre-wrap;'>${message}</td></tr>
      <tr><td colspan=2 style='border-bottom: 1px solid #ccc;'></td></tr>
      </table>
    `
    return body;
  }

  createMailBody(form:FormGroup){

    const body = this.createConfirmBody(form);
    
    const header = `
    <h4>お問い合わせありがとうございました。</h4>
    <p>改めて担当者よりご連絡させていただきます。</p>
    `
    const footer = `
    <p style='font-size:14px;'>
    このメールは、配信専用アドレスからの連絡です。<br/>
    このメールにお心当たりない場合は下記までご連絡ください。<br/><br/>
    </p>
    `
    return header + body + footer;
  }
}
