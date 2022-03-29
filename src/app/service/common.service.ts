import { Inject, Injectable, OnDestroy, PLATFORM_ID } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ComfirmDialogParam, MyPlanApp, PlanSpotCommon, ImageSize, Location } from "../class/common.class";
import { IndexedDBService } from "./indexeddb.service";
import { Guid } from "guid-typescript";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmMessageDialogComponent } from "../parts/confirm-message-dialog/confirm-message-dialog.component";
import { MessageDialogComponent } from "../parts/message-dialog/message-dialog.component";
import { LangFilterPipe } from "../utils/lang-filter.pipe";
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { TranslateService } from "@ngx-translate/core";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
  providedIn: "root"
})
export class CommonService implements OnDestroy {
  private isshowHeader = new Subject<boolean>();
  public isshowHeader$ = this.isshowHeader.asObservable();

  private isupdHeader = new Subject<boolean>();
  public isupdHeader$ = this.isupdHeader.asObservable();

  private isshowcart = new Subject<boolean>();
  public isshowcart$ = this.isshowcart.asObservable();

  private isshowmenu = new Subject<boolean>();
  public isshowmenu$ = this.isshowmenu.asObservable();

  private isloadfin = new Subject<boolean>();
  public isloadfin$ = this.isloadfin.asObservable();

  private isMobile = new Subject<boolean>();
  public isMobile$ = this.isMobile.asObservable();

  public loggedIn: boolean = false;

  private onDestroy$ = new Subject();

  constructor(
    private oauthService: OAuthService,
    private router: Router,
    private translate: TranslateService,
    private indexedDBService: IndexedDBService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  /*----------------------------
   *
   * 通知
   *
   *  ---------------------------*/
  public onNotifyIsShowHeader(update: boolean) {
    this.isshowHeader.next(update);
  }

  public onUpdHeader() {
    this.isupdHeader.next();
  }

  public onNotifyIsShowCart(state: boolean) {
    this.isshowcart.next(state)
  }

  public onNotifyIsShowMenu(state: boolean) {
    this.isshowmenu.next(state)
  }

  public onNotifyIsLoadingFinish(state: boolean) {
    this.isloadfin.next(state);
  }

  public onNotifyIsMobile(state: boolean) {
    this.isMobile.next(state);
  }

  /*----------------------------
   *
   * login service
   *
   *  ---------------------------*/

  public login() {
    //const state = this.router.routerState.snapshot;
    this.oauthService.initImplicitFlow(this.router.url);
  }

  public async logout() {
    const myPlan: any = await this.indexedDBService.getEditPlan();
    const myPlanApp: MyPlanApp = myPlan;
    if (myPlanApp && !myPlanApp.isSaved) {
      const param = new ComfirmDialogParam();
      param.title = "LogoutConfirmTitle";
      param.text = "LogoutConfirmText";
      const dialog = this.confirmMessageDialog(param);
      dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe(result => {
        if (result === "ok") {
          this.indexedDBService.clearMyPlan();
          localStorage.removeItem("iskeep");
          this.oauthService.logOut();
        } else {
          this.onNotifyIsShowMenu(false);
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

  public getToken() {
    if (!this.oauthService.hasValidAccessToken()) {
      console.log("Refreshing the token")
      this.oauthService.silentRefresh();
    }
    else {
      console.log("Token is still valid")
    };
  }

  public get name() {
    if (isPlatformBrowser(this.platformId)) {
      const claims: any = this.oauthService.getIdentityClaims();
      if (!claims) {
        return null;
      }
      return claims['name'];
    }
  }

  public get email() {
    if (isPlatformBrowser(this.platformId)) {
      const claims: any = this.oauthService.getIdentityClaims();
      if (!claims) {
        return null;
      }
      return claims['email'];
    }
  }

  public get objectId() {
    if (isPlatformBrowser(this.platformId)) {
      const claims: any = this.oauthService.getIdentityClaims();
      if (!claims) {
        return null;
      }
      return claims['sub'];
    }
  }

  public get idp() {
    if (isPlatformBrowser(this.platformId)) {
      const claims: any = this.oauthService.getIdentityClaims();
      if (!claims) {
        return null;
      }
      return claims['idp'];
    }
  }

  public get picture() {
    if (isPlatformBrowser(this.platformId)) {
      const claims: any = this.oauthService.getIdentityClaims();
      if (!claims) {
        return null;
      }
      return claims['picture'];
    }
  }

  public get token() {
    if (isPlatformBrowser(this.platformId)) {
      return this.oauthService.getIdentityClaims();
    }
    return null;
  }

  public get accessToken() {
    return this.oauthService.getAccessToken();
  }

  public get idToken() {
    return this.oauthService.getIdToken();
  }

  public get tokenExpiration() {
    return new Date(this.oauthService.getAccessTokenExpiration());
  }

  public get tokenExpirationDate() {
    return this.oauthService.getAccessTokenExpiration();
  }
  /*----------------------------
   *
   * utility
   *
   *  ---------------------------*/

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

  isSome(ary: any) {
    return ary.controls.some((x: { get: (arg0: string) => { (): any; new(): any; value: boolean; }; }) => {
      return x.get("selected").value === true;
    });
  }

  isEvery(ary: any) {
    return ary.controls.every((x: { get: (arg0: string) => { (): any; new(): any; value: boolean; }; }) => {
      return x.get("selected").value === true;
    });
  }

  isNotEvery(ary: any) {
    return ary.controls.every((x: { get: (arg0: string) => { (): any; new(): any; value: boolean; }; }) => {
      return x.get("selected").value === false;
    });
  }

  async getGuid() {
    let guid = await this.indexedDBService.getGuid();
    if (!guid) {
      guid = Guid.create().toString();
      this.indexedDBService.registGuid(String(guid));
    }
    return String(guid);
  }

  async checkAddPlan(addSpotQty: number): Promise<boolean> {
    const myPlan: any = await this.indexedDBService.getEditPlan();
    if (!myPlan) {
      return true;
    }
    const myPlanApp: MyPlanApp = myPlan;

    if (myPlanApp.planSpots && myPlanApp.planSpots.length + addSpotQty > 6) {
      return false;
    } else {
      return true;
    }
  }

  setAddPlanLang(planSpot: PlanSpotCommon, lang: string) {
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

  reportComplete(result: boolean) {
    if (result) {
      this.snackBarDisp("ReportReviewComplete");
    } else {
      this.snackBarDisp("ReportedReviewComplete");
    }
  }

  // 年代計算
  getAge(birthday: string) {
    if (birthday) {
      const birthDate = new Date(birthday);

      const y2 = birthDate.getFullYear().toString().padStart(4, '0');
      const m2 = (birthDate.getMonth() + 1).toString().padStart(2, '0');
      const d2 = birthDate.getDate().toString().padStart(2, '0');

      const today = new Date();
      const y1 = today.getFullYear().toString().padStart(4, '0');
      const m1 = (today.getMonth() + 1).toString().padStart(2, '0');
      const d1 = today.getDate().toString().padStart(2, '0');

      let age = Math.floor((Number(y1 + m1 + d1) - Number(y2 + m2 + d2)) / 10000);

      if (age % 10 != 0) {
        age = age - age % 10;
      }
      return age;
    }
    return 0;
  }

  getGeoLocation() {
    return new Promise<Location>((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const data = position.coords;
            let location: Location = new Location();
            location = {
              latitude: data.latitude,
              longitude: data.longitude,
              errorCd: 0
            };
            resolve(location);
          },
          error => {
            const location: Location = new Location();
            location.errorCd = error.code;

            resolve(location);
          }
        );
        return location;
      } else {
        const location: Location = new Location();
        location.errorCd = 9;

        reject(location);
        return location;
      }
    });
  }

  locationGoogleMap(currentlang: any, latitude: number, longitude: number) {
    if (isPlatformBrowser(this.platformId)) {
      /*if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)) {
        if (navigator.userAgent === "Android") {
          location.href = `https://maps.google.com/maps?saddr=&daddr=${latitude},${longitude}&z=16`;
        } else {
          location.href = `comgooglemaps://?saddr=&daddr=${latitude},${longitude}&z=16`;
        }
      } else {*/
      window.open(`https://www.google.co.jp/maps/dir/?api=1&hl=${currentlang}&destination=${latitude},${longitude}&z=16`, "_blank");
      //}
    }
  }

  locationPlaceIdGoogleMap(currentlang: any, latitude: string, longitude: string, placeId: string) {
    if (isPlatformBrowser(this.platformId)) {
      /*if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)) {
        if (navigator.userAgent === "Android") {
          location.href = `https://maps.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${placeId}`;
        } else {
          location.href = `comgooglemapsurl://maps.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${placeId}`;
        }
      } else {*/
      window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${placeId}`, "_blank");
      //}
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

  async imageSize(file: File): Promise<ImageSize> {
    return new Promise((resolve, reject) => {
      let result = new ImageSize();

      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        // 縮小後のサイズを計算。ここでは横幅 (width) を指定
        const dstWidth = 800;
        const scale = dstWidth / width;
        const dstHeight = height * scale;
        // Canvas オブジェクトを使い、縮小後の画像を描画
        const canvas = document.createElement("canvas");
        canvas.width = dstWidth;
        canvas.height = dstHeight;
        const ctx: any = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, dstWidth, dstHeight);
        // Canvas オブジェクトから Data URL を取得
        const resized = canvas.toDataURL("image/webp", 0.75);
        result.previewUrl = resized;
        // blobに再変換
        var blob = this.base64toBlob(resized);
        // blob object array( fileに再変換 )
        result.file = this.blobToFile(blob, Date.now() + file.name);
        resolve(result);
      };
    });
  }

  snackBarDisp(message: string) {
    this.snackBar.open(
      this.translate.instant(message), "", {
      duration: 2000,
      verticalPosition: "top",
      panelClass: "custom-snackbar"
    });
  }

  messageDialog(message: string) {
    return this.dialog.open(MessageDialogComponent, {
      maxWidth: "100%",
      width: "92vw",
      position: { top: "10px" },
      data: message,
      autoFocus: false,
      id: "mesdlg"
    });
  }

  confirmMessageDialog(param: ComfirmDialogParam) {
    return this.dialog.open(ConfirmMessageDialogComponent, {
      maxWidth: "100%",
      width: "92vw",
      position: { top: "10px" },
      data: param,
      autoFocus: false,
      id: "cmd"
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
  }

}
