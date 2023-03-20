import { Component, OnInit, OnDestroy, ViewChild, Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { CommonService } from "../../service/common.service";
import { TranslateService } from "@ngx-translate/core";
import { UserService } from "../../service/user.service";
import { ImageCropperParam } from "../../class/common.class";
import { User } from "../../class/user.class";
import { LangFilterPipe } from "../../utils/lang-filter.pipe";
import { environment } from "../../../environments/environment";
import { UntypedFormBuilder,UntypedFormControl, FormGroupDirective, NgForm, Validators, UntypedFormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { isPlatformBrowser } from "@angular/common";
import { ImageCropperDialogComponent } from "../../parts/image-cropper-dialog/image-cropper-dialog.component";

export class MypageErrorStateMatcher implements ErrorStateMatcher{
  isErrorState(control:UntypedFormControl | null,form:FormGroupDirective | NgForm | null):boolean{
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
  _pictureUrl:string = "../../../assets/img/icon_who.svg";

  constructor(
    private commonService: CommonService,
    private translate: TranslateService,
    private userService: UserService,
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private dateAdapter:DateAdapter<NativeDateAdapter>,
    @Inject(PLATFORM_ID) private platformId:Object
  ) {
  }

  data: User;
  countryAll: any[];
  $country: any[];
  isPreview:boolean = true;
  currentlang:string;

  _coverUrl:any;

  get lang() {
    return this.translate.currentLang;
  }

  myForm:UntypedFormGroup;

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
    return this.myForm.get("email") as UntypedFormControl;
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
      }else{
        this.data = new User();
        this.data.pictureUrl = "";
      }
    });
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }

  onClickPreviewSwitch() {
    this.isPreview = !this.isPreview;
  }

  // カバー画像：ファイルを選択ボタンクリック時(見えているボタン)
  onClickCoverFileInputButton(): void {
    this.coverFileInput.nativeElement.click();
  }

  // カバー画像：ファイルを選択ボタンクリック時(見えていないボタン)
  async onChangeCoverFileInput(): Promise<void> {
    if (this.coverFileInput.nativeElement.files && this.coverFileInput.nativeElement.files[0]) {
      const file = this.coverFileInput.nativeElement.files[0];
      const img = await this.commonService.imageSize(file);
      this.data.coverFile = img.file;
      this.data.coverPreviewUrl = img.previewUrl;
    }
  }

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
  async onChangeFileInput(): Promise<void> {
    if (this.fileInput.nativeElement.files && this.fileInput.nativeElement.files[0]) {
      const file = this.fileInput.nativeElement.files[0];
      const img = await this.commonService.imageSize(file);
      this.data.pictureFile = img.file;
      this.data.picturePreviewUrl = img.previewUrl;
    }
  }

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

  onClickChangePassword() {
    //window.location.href = environment.pwdreset;
    if(isPlatformBrowser(this.platformId)){
      window.location.href = "https://remojuauth.b2clogin.com/remojuauth.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_PasswordReset&client_id=3e5bffaf-86d7-4a4c-bcde-6ba4d1cb52d3&nonce=defaultNonce&redirect_uri=" + window.location.origin + "&scope=openid&response_type=id_token&prompt=login";
    }
  }

  onClickUpdate() {
    if(this.myForm.valid){
      if (this.data.pictureFile) {
        this.data.pictureUrl = environment.blobUrl + "/" + this.data.object_id + "/profile" + Date.now() + ".webp";
      }
      if (this.data.coverFile){
        this.data.coverUrl = environment.blobUrl + "/" + this.data.object_id + "/cover" + Date.now() + ".webp";
      }

      this.userService.registUser(this.data).pipe(takeUntil(this.onDestroy$)).subscribe(async r => {
        if (r) {
          this.data.age = this.commonService.getAge(this.data.birthday);
          const result = [];
          if (this.data.pictureFile) {
            result.push(this.saveImagePlan(false,
              this.data.pictureUrl.substring(
              this.data.pictureUrl.lastIndexOf("/") + 1)));
          }
          if (this.data.coverFile){
            result.push(this.saveImagePlan(true,
              this.data.coverUrl.substring(
              this.data.coverUrl.lastIndexOf("/") + 1)));
          }
          await Promise.all(result);

          if (this.data.pictureFile) {
            this.onDeleteUserFile();
            this.commonService.onUpdHeader();
          }
          if (this.data.coverFile){
            this.onDeleteCoverFile();
          }
          this.userService.onupdUserName();

          this.commonService.snackBarDisp("UserProfileSaved");
        }
      });
    }else{
      this.commonService.scrollToTop();
    }
  }

  /*------------------------------
   *
   * メソッド
   *
   * -----------------------------*/
  saveImagePlan(isCover: boolean, fileName: string){
    return new Promise((resolve) => {
      this.userService.fileUpload(this.data, fileName, isCover).pipe(takeUntil(this.onDestroy$)).subscribe(() => {
          resolve(true);
      });
    });
  }
}
