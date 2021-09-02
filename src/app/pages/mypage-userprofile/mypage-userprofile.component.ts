import { Component, OnInit, OnDestroy, ViewChild, Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { CommonService } from "../../service/common.service";
import { TranslateService } from "@ngx-translate/core";
import { UserService } from "../../service/user.service";
import { ImageCropperParam } from "../../class/common.class";
import { User } from "../../class/user.class";
import { LangFilterPipe } from "../../utils/lang-filter.pipe";
import { environment } from "../../../environments/environment";
import { MatSnackBar } from "@angular/material/snack-bar";
import {FormBuilder,FormControl, FormGroupDirective, NgForm, Validators, FormGroup} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { isPlatformBrowser } from "@angular/common";
import { ImageCropperDialogComponent } from "../../parts/image-cropper-dialog/image-cropper-dialog.component";

export class MypageErrorStateMatcher implements ErrorStateMatcher{
  isErrorState(control:FormControl | null,form:FormGroupDirective | NgForm | null):boolean{
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

// DatePickerの日本語日付表示修正用
@Injectable()
export class MyDateAdapter extends NativeDateAdapter{
  getDateNames(): string[] {
    const dateNames: string[] = [];
    for (let i = 0; i < 31; i++) {
      dateNames[i] = String(i + 1);
    }
    return dateNames;
  }
}

@Component({
  selector: "app-mypage-userprofile",
  templateUrl: "./mypage-userprofile.component.html",
  styleUrls: ["./mypage-userprofile.component.scss"],
  providers:[
    {provide:DateAdapter,useClass:MyDateAdapter}
  ]
})
export class MypageUserprofileComponent implements OnInit,OnDestroy {
  @ViewChild("fileInput") fileInput: { nativeElement: { click: () => void; files: any[]; }; };
  @ViewChild("coverFileInput") coverFileInput: { nativeElement: { click: () => void; files: any[]; }; };

  private onDestroy$ = new Subject();

  constructor(
    private commonService: CommonService,
    private translate: TranslateService,
    private userService: UserService,
    private router: Router,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dateAdapter:DateAdapter<NativeDateAdapter>,
    @Inject(PLATFORM_ID) private platformId:Object
  ) {
  }

  // 編集データ
  data: User;
  // 国リスト
  countryAll: any[];
  $country: any[];
  // プレビューモード
  isPreview = true;
  currentlang:string;

  _coverUrl:any;

  get lang() {
    return this.translate.currentLang;
  }

  myForm:FormGroup;

  get diplayName():any{
    return this.myForm.get("displayName");
  }

  get gender():any{
    return this.myForm.get("gender");
  }

  get country():any{
    return this.myForm.get("country");
  }

  get email():any{
    return this.myForm.get("email");
  }

  createForm(){
   this.myForm = this.fb.group({
      displayName: ["",[Validators.required]],
      gender: ["",[Validators.required,Validators.minLength(1)]],
      country: [""],
      aboutMe: [""],
      birthday: ["",[Validators.required]],
      givenName: [""],
      surname: [""],
      email:[{value:"",disabled:true},[Validators.email]],
      password:[{value:"********",disabled:true}]
   })

   this.myForm.controls["displayName"].valueChanges.pipe(takeUntil(this.onDestroy$)).subscribe((v)=>{
     this.data.displayName = v;
   })

   this.myForm.controls["gender"].valueChanges.pipe(takeUntil(this.onDestroy$)).subscribe((v)=>{
      this.data.gender = v;
    })

    this.myForm.controls["country"].valueChanges.pipe(takeUntil(this.onDestroy$)).subscribe((v)=>{
      this.data.country = v;
    })

    this.myForm.controls["aboutMe"].valueChanges.pipe(takeUntil(this.onDestroy$)).subscribe((v)=>{
      this.data.aboutMe = v;
    })

    this.myForm.controls["birthday"].valueChanges.pipe(takeUntil(this.onDestroy$)).subscribe((v)=>{
      this.data.birthday = v;
    })

    this.myForm.controls["givenName"].valueChanges.pipe(takeUntil(this.onDestroy$)).subscribe((v)=>{
      this.data.givenName = v;
    })

    this.myForm.controls["surname"].valueChanges.pipe(takeUntil(this.onDestroy$)).subscribe((v)=>{
      this.data.surname = v;
    })
/* ご確認ください this.data.surnameになっています。
    this.myForm.controls["email"].valueChanges.pipe(takeUntil(this.onDestroy$)).subscribe((v)=>{
      this.data.surname = v;
    })

    this.myForm.controls["password"].valueChanges.pipe(takeUntil(this.onDestroy$)).subscribe((v)=>{
      this.data.surname = v;
    })*/
  }

  /*------------------------------
   *
   * イベント
   *
   * -----------------------------*/

  ngOnInit() {

    if(isPlatformBrowser(this.platformId)){
      this.currentlang = localStorage.getItem("gml");
    }

    this.createForm();
    // 国選択データ取得
    const langpipe = new LangFilterPipe();

    if(this.currentlang!=="ja"){
      this.dateAdapter.setLocale('en-EN'); //暫定、日本語以外は英語表記に
    }

    this.userService.getDataSelected().pipe(takeUntil(this.onDestroy$)).subscribe(r => {
      this.countryAll = r;
      let _ja = r.filter(x=>x.id===86).map((e)=>{
        return(
          {
            id:e.id,
            name:langpipe.transform(e.name,this.lang),
            selected:e.selected
          }
        )
      });

      let temp = r.filter(x=>x.id!==86).map((e)=>{
        return(
          {
            id:e.id,
            name:langpipe.transform(e.name,this.lang),
            selected:e.selected
          }
        )
      })

      let _world = temp.sort((a,b)=>{
        return a.name.localeCompare(b.name,this.lang)
      })

      this.$country = [..._ja,..._world];
    });

    // ユーザ情報取得
    this.userService.getUser().pipe(takeUntil(this.onDestroy$)).subscribe(r =>{
      this.data = r;

      if(r){
        this.myForm.patchValue({
          displayName:r.displayName,
          gender:r.gender,
          country:r.country,
          aboutMe:r.aboutMe,
          birthday:r.birthday,
          givenName:r.givenName,
          surname:r.surname,
          email:this.commonService.email
        })
      }
    });
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }

  // プレビュー表示切り替え
  onClickPreviewSwitch() {

    this.isPreview = !this.isPreview;
  }

  // カバー画像：ファイルを選択ボタンクリック時(見えているボタン)
  onClickCoverFileInputButton(): void {
    this.coverFileInput.nativeElement.click();
  }

  // カバー画像：ファイルを選択ボタンクリック時(見えていないボタン)
  onChangeCoverFileInput(): void {
    if (this.coverFileInput.nativeElement.files && this.coverFileInput.nativeElement.files[0]) {
      const file = this.coverFileInput.nativeElement.files[0];
      this.imageSize(file, true);
    }
  }

  // カバー写真を削除
  onDeleteCoverFile():void{
    if(this.data.coverImageCropped){
      this.data.coverImageCropped = null;
    }
    this.data.coverPreviewUrl = this.data.coverUrl;
    this.data.coverFile=null;
  }

  onClickCropCover(): void {
    let param = new ImageCropperParam();
    param.isAspectRatio = false;
    param.aspectRatio = "16 / 9";
    param.cropperPosition = this.data.coverCropperPosition;
    param.imageCropped = this.data.coverImageCropped;
    param.pictureFile = this.data.coverFile;
    param.picturePreviewUrl = this.data.coverPreviewUrl;
    const dialogRef = this.dialog.open(ImageCropperDialogComponent, {
      id:"imgcrop",
      maxWidth: "100%",
      width: "92vw",
      position: { top: "10px" },
      data: param,
      autoFocus: false
    });
    dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((r: any) => {
      if (r && r !== "cancel"){
        this.data.coverImageCropped = r.imageCropped;
        this.data.coverCropperPosition = r.cropperPosition;
      }
    });
  }

  // プロフィール画像：ファイルを選択ボタンクリック時(見えているボタン)
  onClickFileInputButton(): void {
    this.fileInput.nativeElement.click();
  }

  // プロフィール画像：ファイルを選択ボタンクリック時(見えていないボタン)
  onChangeFileInput(): void {
    if (this.fileInput.nativeElement.files && this.fileInput.nativeElement.files[0]) {
      const file = this.fileInput.nativeElement.files[0];
      this.imageSize(file, false);
    }
  }

  // プロフィール写真を削除
  onDeleteUserFile():void{
    if(this.data.imageCropped){
      this.data.imageCropped = null;
    }
    this.data.picturePreviewUrl = this.data.pictureUrl;
    this.data.pictureFile=null;
  }

  onClickCropUser(): void {
    let param = new ImageCropperParam();
    param.roundCropper = true;
    param.aspectRatio = "1 / 1";
    param.cropperPosition = this.data.cropperPosition;
    param.imageCropped = this.data.imageCropped;
    param.pictureFile = this.data.pictureFile;
    param.picturePreviewUrl = this.data.picturePreviewUrl;
    const dialogRef = this.dialog.open(ImageCropperDialogComponent, {
      id: "imgcrop",
      maxWidth: "100%",
      width: "92vw",
      position: { top: "10px" },
      data: param,
      autoFocus: false
    });

    dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((r: any) => {
      if (r && r !== "cancel"){
        this.data.imageCropped = r.imageCropped;
        this.data.cropperPosition = r.cropperPosition;
      }
    });
  }

  // パスワードを変更クリック時
  onClickChangePassword() {
    //window.location.href = environment.pwdreset;
    if(isPlatformBrowser(this.platformId)){
      window.location.href = "https://remojuauth.b2clogin.com/remojuauth.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_PasswordReset&client_id=3e5bffaf-86d7-4a4c-bcde-6ba4d1cb52d3&nonce=defaultNonce&redirect_uri=" + window.location.origin + "&scope=openid&response_type=id_token&prompt=login";
    }
  }

  // 登録ボタンクリック時
  onClickUpdate() {
    if(this.myForm.valid){
      if (this.data.pictureFile) {
        // プロフィール画像URLを設定
        this.data.pictureUrl = environment.blobUrl + "/" + this.data.object_id + "/" + this.data.pictureFile.name;
        // プロフィール画像アップロード
        this.userService.fileUpload(this.data, false).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
          if (r) {
            // アップロードデータを削除
            this.data.picturePreviewUrl = null;
            this.data.pictureFile = null;
          }
        });
      }
      if (this.data.coverFile){
        // カバー画像URLを設定
        this.data.coverUrl = environment.blobUrl + "/" + this.data.object_id + "/" + this.data.coverFile.name;
        // カバー画像アップロード
        this.userService.fileUpload(this.data, true).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
          if (r) {
            this.data.coverPreviewUrl = null;
            this.data.coverFile = null;
          }
        });
      }
      // ユーザ情報更新
      this.updateUser();
    }else{
      this.commonService.scrollToTop();
    }
  }

  /*------------------------------
   *
   * メソッド
   *
   * -----------------------------*/

  // 画像サイズ変更
  imageSize(file: File, isCover: boolean){
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      // 縮小後のサイズを計算。ここでは横幅 (width) を指定
      const dstWidth = 1024;
      const scale = dstWidth / width;
      const dstHeight = height * scale;
      // Canvas オブジェクトを使い、縮小後の画像を描画
      const canvas = document.createElement("canvas");
      canvas.width = dstWidth;
      canvas.height = dstHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, dstWidth, dstHeight);
      // Canvas オブジェクトから Data URL を取得
      const resized = canvas.toDataURL("image/webp",0.75);
      if (isCover){
        this.data.coverPreviewUrl = resized;
      } else{
        this.data.picturePreviewUrl = resized;
      }
      // blobに再変換
      var blob = this.commonService.base64toBlob(resized);
      // blob object array( fileに再変換 )
      if (isCover){
        this.data.coverFile = this.commonService.blobToFile(blob, Date.now() + file.name + ".webp");
      } else{
        this.data.pictureFile = this.commonService.blobToFile(blob, Date.now() + file.name + ".webp");
      }
    };
  }

  // ユーザ情報更新
  updateUser(){
    this.userService.registUser(this.data).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
      if (r) {
        // 年代計算
        this.data.age = this.commonService.getAge(this.data.birthday);
        this.commonService.snackBarDisp("UserProfileSaved");
      }
    });
  }
}
