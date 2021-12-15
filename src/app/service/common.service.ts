import { Inject, Injectable,OnDestroy, PLATFORM_ID } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ComfirmDialogParam, MyPlanApp, PlanSpotCommon, ImageSize } from "../class/common.class";
import { ListSearchCondition } from "../class/indexeddb.class";
import { IndexedDBService } from "./indexeddb.service";
import { Guid } from "guid-typescript";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmMessageDialogComponent } from "../parts/confirm-message-dialog/confirm-message-dialog.component";
import { MessageDialogComponent } from "../parts/message-dialog/message-dialog.component";
import { LangFilterPipe } from "../utils/lang-filter.pipe";

import { OAuthService } from 'angular-oauth2-oidc';
import { Router,RouterStateSnapshot } from '@angular/router';
import { TranslateService } from "@ngx-translate/core";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
  providedIn: "root"
})
export class CommonService implements OnDestroy{
  private sharedSpotCondition = new Subject<ListSearchCondition>();
  public sharedSpotCondition$ = this.sharedSpotCondition.asObservable();

  private isshowHeader = new Subject<boolean>();
  public isshowHeader$ = this.isshowHeader.asObservable();

  // mypalan(cart)開閉プロパティ
  private isshowcart = new Subject<boolean>();
  public isshowcart$ = this.isshowcart.asObservable();

  // menu開閉プロパティ
  private isshowmenu = new Subject<boolean>();
  public isshowmenu$ = this.isshowmenu.asObservable();

  // loadingフラグ
  private isloadfin = new Subject<boolean>();
  public isloadfin$ = this.isloadfin.asObservable();

  // selected planId
  private selectedPlanId = new Subject<any>();
  public selectedPlanId$ = this.selectedPlanId.asObservable();

  // selected spotId
  private selectedSpotId = new Subject<number>();
  public selectedSpotId$ = this.selectedSpotId.asObservable();

  private logoChange = new Subject<boolean>();
  public logoChange$ = this.logoChange.asObservable();

  private isMobile = new Subject<boolean>();
  public isMobile$ = this.isMobile.asObservable();

  public loggedIn:boolean = false;

  private onDestroy$ = new Subject();

  constructor(
    private oauthService: OAuthService,
    private router:Router,
    private translate: TranslateService,
    private indexedDBService: IndexedDBService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    @Inject(PLATFORM_ID) private platformId:Object
  ) {}

  // Topへ戻るボタン
  scrollToTop() {
    (function smoothscroll() {
      const currentScroll =
        document.documentElement.scrollTop || document.body.scrollTop;
      if (currentScroll > 0) {
        window.requestAnimationFrame(smoothscroll);
        window.scrollTo(0, currentScroll - currentScroll / 3);
      }
    })();
  }

  /*----------------------------
   *
   * utility
   *
   *  ---------------------------*/
  // なにかチェックされているか
  isSome(ary: any) {
    return ary.controls.some((x: { get: (arg0: string) => { (): any; new(): any; value: boolean; }; }) => {
      return x.get("selected").value === true;
    });
  }
  // 全てがチェックされているか
  isEvery(ary: any) {
    return ary.controls.every((x: { get: (arg0: string) => { (): any; new(): any; value: boolean; }; }) => {
      return x.get("selected").value === true;
    });
  }
  // 全てのチェックがはずれているか
  isNotEvery(ary: any) {
    return ary.controls.every((x: { get: (arg0: string) => { (): any; new(): any; value: boolean; }; }) => {
      return x.get("selected").value === false;
    });
  }

  // Spot検索条件更新イベント
  public onSharedSpotConditionChange(updateed: any) {
    this.sharedSpotCondition.next(updateed);
  }

  // ヘッダプランパネル表示イベント
  public onNotifyIsShowHeader(update: boolean){
    this.isshowHeader.next(update);
  }

  // GUID取得
  async getGuid() {
    let guid = await this.indexedDBService.getGuid();
    if (!guid) {
      let guid = Guid.create().toString();
      this.indexedDBService.registGuid(String(guid));
    }
    return String(guid);
  }

  getGuidStatic(){
    let guid = this.indexedDBService.getGuid();
    if (!guid) {
      let guid = Guid.create().toString();
      this.indexedDBService.registGuid(String(guid));
    }
    return String(guid);
  }

  // スポットまたはプラン追加時のチェック
  // 戻り値 true: プランを追加する false:エラーなのでプランを追加しない
  async checkAddPlan(addSpotQty: number): Promise<boolean>{
    // 作成中プラン取得
    const myPlan: any = await this.indexedDBService.getEditPlan();
    if (!myPlan){
      return true;
    }
    const myPlanApp: MyPlanApp = myPlan;

    // 6スポットを超える場合
    if (myPlanApp.planSpots && myPlanApp.planSpots.length + addSpotQty > 6){
      return false;
    } else {
      return true;
    }
  }

  // 有料スポットURL取得
  getTollSpotUrl(){
    if(isPlatformBrowser(this.platformId)){
      const path = location.pathname.split("/");
      if (path.length === 4
      && (location.pathname.indexOf("spots") > -1
      || location.pathname.indexOf("plans") > -1)
      && location.pathname.indexOf("details") === -1){
        return path[2];
      }
    }
    return "";
  }

  // ロゴ変更
  public onlogoChange() {
    this.logoChange.next();
  }

  // 多言語項目を使用言語に切り替え
  setAddPlanLang(planSpot: PlanSpotCommon, lang: string){
    planSpot.spotName = this.isValidJson(planSpot.spotName, lang);
    planSpot.subheading = this.isValidJson(planSpot.subheading, lang);
    planSpot.overview = this.isValidJson(planSpot.overview, lang);
  }

  isValidJson(value: string, lang: string) {
    const langpipe = new LangFilterPipe();

    try {
      JSON.parse(value)
    } catch (e) {
      return value;
    }
    return langpipe.transform(value, lang);
  }

  // 違反報告完了通知
  reportComplete(result: boolean){
    if (result){
      this.snackBarDisp("ReportReviewComplete");
    } else {
      this.snackBarDisp("ReportedReviewComplete");
    }
  }

  /*----------------------------
   *
   * login service
   *
   *  ---------------------------*/

  // ログイン
  public login(){
    //const state = this.router.routerState.snapshot;
    this.oauthService.initImplicitFlow(this.router.url);
  }

  // ログアウト
  public async logout(currentlang: string){
    const myPlan: any = await this.indexedDBService.getEditPlan();
    const myPlanApp: MyPlanApp = myPlan;
    // 編集中のプランがある場合
    if(myPlanApp && !myPlanApp.isSaved){
      // 削除確認
      const param = new ComfirmDialogParam();
      param.title = "LogoutConfirmTitle";
      param.text = "LogoutConfirmText";
      const dialog = this.confirmMessageDialog(param);
      dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe(result => {
        // プランを破棄してログアウト
        if (result === "ok"){
          this.indexedDBService.clearMyPlan();
          localStorage.removeItem("iskeep");
          this.oauthService.logOut();
        // 編集中のプランを表示
        } else {
          // メニューを閉じる
          this.onNotifyIsShowMenu(false);
          // マイプランパネルを開く
          this.onNotifyIsShowCart(true);
          return;
        }
      });
      return;
    } else {
      this.indexedDBService.clearMyPlan();
      localStorage.removeItem("iskeep");
      this.oauthService.logOut();
    }
  }

  // アクセストークンを認可サーバーから取得
  public getToken() {
    if (!this.oauthService.hasValidAccessToken()) {
      console.log("Refreshing the token")
      this.oauthService.silentRefresh();
    }
    else
    {
      console.log("Token is still valid")
    };
  }

  // 表示名を取得
  public get name() {
    if(isPlatformBrowser(this.platformId)){
      const claims:any = this.oauthService.getIdentityClaims();
      if (!claims) {
        return null;
      }
      return claims['name'];
    }
  }

  // トークン中のemailを取得（ある場合）
  public get email() {
    if(isPlatformBrowser(this.platformId)){
      const claims:any = this.oauthService.getIdentityClaims();
      if (!claims) {
        return null;
      }
      return claims['email'];
    }
  }

  // // ユーザーの一意識別子を取得
  public get objectId(){
    //if(isPlatformBrowser(this.platformId)){
      const claims:any = this.oauthService.getIdentityClaims();
      if (!claims) {
        return null;
      }
      return claims['sub'];
    //}
  }

  // idpを取得
  public get idp(){
    if(isPlatformBrowser(this.platformId)){
      const claims:any = this.oauthService.getIdentityClaims();
      if (!claims) {
        return null;
      }
      return claims['idp'];
    }
  }

  // 画像URLを取得
  public get picture(){
    if(isPlatformBrowser(this.platformId)){
      const claims:any = this.oauthService.getIdentityClaims();
      if (!claims) {
        return null;
      }
      return claims['picture'];
    }
  }

  public get token(){
    if(isPlatformBrowser(this.platformId)){
      return this.oauthService.getIdentityClaims();
    }
    return null;
  }

  // アクセストークンpayloadを取得
  public get accessToken() {
    return this.oauthService.getAccessToken();
  }

  // IDトークン取得
  public get idToken(){
    return this.oauthService.getIdToken();
  }

  // トークンの有効期限を取得　ticks (numeric)
  public get tokenExpiration() {
    return new Date(this.oauthService.getAccessTokenExpiration());
  }

  // トークンの有効期限を取得(in date format)
  public get tokenExpirationDate() {
    return this.oauthService.getAccessTokenExpiration();
  }

  /* ---------------------------*/

  // 年代計算
  getAge(birthday: string) {
    if (birthday) {
      const birthDate = new Date(birthday);

      // 生年月日を
      const y2 = birthDate.getFullYear().toString().padStart(4, '0');
      const m2 = (birthDate.getMonth() + 1).toString().padStart(2, '0');
      const d2 = birthDate.getDate().toString().padStart(2, '0');

      // 今日の日付
      const today = new Date();
      const y1 = today.getFullYear().toString().padStart(4, '0');
      const m1 = (today.getMonth() + 1).toString().padStart(2, '0');
      const d1 = today.getDate().toString().padStart(2, '0');

      // 年齢
      let age = Math.floor((Number(y1 + m1 + d1) - Number(y2 + m2 + d2)) / 10000);

      // 年代
      if (age % 10 != 0)
      {
        age = age - age % 10;
      }
      return age;
    }
    return 0;
  }

  // 外部地図アプリまたはページへ連携
  locationGoogleMap(currentlang: any, latitude: number, longitude: number) {
    if(isPlatformBrowser(this.platformId)){
      if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)) {
        if (navigator.userAgent === "Android") {
          location.href = `https://maps.google.com/maps?saddr=&daddr=${latitude},${longitude}&z=16`;
        } else {
          location.href = `comgooglemaps://?saddr=&daddr=${latitude},${longitude}&z=16`;
        }
      } else {
        window.open(`https://www.google.co.jp/maps/dir/?api=1&hl=${currentlang}&destination=${latitude},${longitude}&z=16`, "_blank");
      }
    }
  }

  // 外部地図アプリまたはページへ連携
  locationPlaceIdGoogleMap(currentlang: any, latitude: string, longitude: string, placeId: string) {
    if(isPlatformBrowser(this.platformId)){
      if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)) {
        if (navigator.userAgent === "Android") {
          location.href = `https://maps.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${placeId}`;
        } else {
          location.href = `comgooglemapsurl://maps.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${placeId}`;
        }
      } else {
        window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${placeId}`, "_blank");
      }
    }
  }

  base64toBlob(base64: string) {
    // カンマで分割して以下のようにデータを分ける
    // tmp[0] : データ形式（data:image/png;base64）
    // tmp[1] : base64データ（iVBORw0k～）
    var tmp = base64.split(",");
    // base64データの文字列をデコード
    var data = atob(tmp[1]);
    // tmp[0]の文字列（data:image/png;base64）からコンテンツタイプ（image/png）部分を取得
    var mime = tmp[0].split(":")[1].split(";")[0];
    //  1文字ごとにUTF-16コードを表す 0から65535 の整数を取得
    var buf = new Uint8Array(data.length);
    for (var i = 0; i < data.length; i++) {
      buf[i] = data.charCodeAt(i);
    }
    // blobデータを作成
    var blob = new Blob([buf], { type: mime });
    return blob;
  }

  blobToFile(theBlob: Blob, fileName: string): File {
    var b: any = theBlob;
    // A Blob() is almost a File() - it's just missing the two properties below which we will add
    b.lastModifiedDate = new Date();
    b.name = fileName;
    // Cast to a File() type
    return <File>theBlob;
  }

  // 画像サイズ変更
  async imageSize(file: File): Promise<ImageSize>{
    return new Promise((resolve, reject) => {
      let result = new ImageSize();

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
        const ctx:any = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, dstWidth, dstHeight);
        // Canvas オブジェクトから Data URL を取得
        const resized = canvas.toDataURL("image/webp",0.75);
        result.previewUrl = resized;
        // blobに再変換
        var blob = this.base64toBlob(resized);
        // blob object array( fileに再変換 )
        result.file = this.blobToFile(blob, Date.now() + file.name);
        resolve(result);
      };
    });
  }

  // 通知
  snackBarDisp(message: string) {
    this.snackBar.open(
      this.translate.instant(message), "", {
        duration: 2000,
        verticalPosition:"top",
        panelClass:"custom-snackbar"
      });
  }

  // メッセージダイアログの表示
  messageDialog(message: string) {
    return this.dialog.open(MessageDialogComponent, {
      maxWidth: "100%",
      width: "92vw",
      position: { top: "10px" },
      data: message,
      autoFocus: false,
      id:"mesdlg"
    });
  }

  // 確認メッセージダイアログの表示
  confirmMessageDialog(param: ComfirmDialogParam) {
    return this.dialog.open(ConfirmMessageDialogComponent, {
      maxWidth: "100%",
      width: "92vw",
      position: { top: "10px" },
      data: param,
      autoFocus: false,
      id:"cmd"
    });
  }

  // マイプランパネル状態変更
  public onNotifyIsShowCart(state:boolean){
    this.isshowcart.next(state)
  }

  // menuパネル状態変更
  public onNotifyIsShowMenu(state:boolean){
    this.isshowmenu.next(state)
  }

  // ローディング状態（継続中 false 完了　true)
  public onNotifyIsLoadingFinish(state:boolean){
    this.isloadfin.next(state);
  }

  // プラン一覧　選択ID
  public onNotifySelectedPlanId(id:any){
    this.selectedPlanId.next(id);
  }

  // スポット一覧　選択ID
  public onNotifySelectedSpotId(id:number){
    this.selectedSpotId.next(id);
  }

  // モバイル判定（root検知）
  public onNotifyIsMobile(state:boolean){
    this.isMobile.next(state);
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }

}
