import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, AfterViewChecked, ViewChild, ElementRef } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { CommonService } from "../../service/common.service";
import { MypagePlanListService } from "../../service/mypageplanlist.service";
import { MyplanService } from '../../service/myplan.service';
import { IndexedDBService } from "../../service/indexeddb.service";
import { DataSelected, ComfirmDialogParam, MyPlanApp, PlanSpotCommon } from "../../class/common.class";
import { MypagePlanAppList, MyplanListCacheStore } from "../../class/mypageplanlist.class";
import { Catch } from "../../class/log.class";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UrlcopyDialogComponent } from "../../parts/urlcopy-dialog/urlcopy-dialog.component";
import { MemoDialogComponent } from "../../parts/memo-dialog/memo-dialog.component";
import { isPlatformBrowser, isPlatformServer } from "@angular/common";
import { makeStateKey, TransferState } from '@angular/platform-browser';

export const MYPLANLIST_KEY = makeStateKey<MyplanListCacheStore>('MYPLANLIST_KEY');

@Component({
  selector: "app-mypage-planlist",
  templateUrl: "./mypage-planlist.component.html",
  styleUrls: ["./mypage-planlist.component.scss"]
})
export class MypagePlanListComponent implements OnInit, OnDestroy, AfterViewChecked {
  private onDestroy$ = new Subject();
  private baseUrl:string;

  constructor(
    private commonService: CommonService,
    private mypagePlanListService: MypagePlanListService,
    private myplanService: MyplanService,
    private indexedDBService: IndexedDBService,
    private transferState: TransferState,
    private translate: TranslateService,
    private router: Router,
    public dialog: MatDialog,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.limit = 6;
    this.p = 1;

    if(isPlatformBrowser(this.platformId)){
      this.baseUrl = document.getElementsByTagName("base")[0].href;
      this.currentlang = localStorage.getItem("gml");
    }
  }

  @ViewChild('box') box:ElementRef;

  isMobile:boolean;

  rows: MypagePlanAppList[];
  details$: MypagePlanAppList[] = [];
  count: number = 0;

  $mSort: DataSelected[];
  sortval = 12;

  p: number;
  limit: number;
  end: number;
  offset: number;

  currentlang: string;

  get lang() {
    return this.translate.currentLang;
  }

  /*------------------------------
   *
   * イベント
   *
   * -----------------------------*/

  ngAfterViewChecked(): void {
    if (this.offset) {
      if (this.offset > 0) {
        window.scrollTo(0, this.offset);
      }

      if (this.offset === window.pageYOffset) {
        this.offset = 0;
      }
    }
  }

  ngOnInit() {
    this.isMobile = this.detectIsMobile(window.innerWidth);

    if (this.transferState.hasKey(MYPLANLIST_KEY)) {
      const cache = this.transferState.get<MyplanListCacheStore>(MYPLANLIST_KEY, null);
      //console.log(this.transferState);
      this.rows = cache.data;
      this.end = cache.end;
      this.offset = cache.offset;
      this.details$ = this.rows.slice(0, this.end);
      this.p = cache.p - 1;
      this.count = cache.data.length;

      this.transferState.remove(MYPLANLIST_KEY);

      this.getPlanListDetail(true);
    } else {
      this.getPlanList();
    }

    // 保存通知
    this.myplanService.PlanUserSaved$.pipe(takeUntil(this.onDestroy$)).subscribe(x => {
      this.getPlanList();
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
  }

  onScroll(e:any){
    console.log(e.target.scrollTop);
  }

  onScrollDown() {
    this.getPlanListDetail();
  }

  // 公開・非公開切り替え
  onClickRelease(row: MypagePlanAppList) {
    if (row.spots.length === 0) {
      return;
    }

    const param = new ComfirmDialogParam();
    // 公開⇒非公開
    if (row.isRelease) {
      param.title = "PrivateConfirm";
      const dialog = this.commonService.confirmMessageDialog(param);
      dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
        if (d === "ok") {
          this.mypagePlanListService.registIsRelease(row.planUserId, !row.isRelease, row.memo).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
            if (r) {
              row.isRelease = !row.isRelease;
              this.commonService.snackBarDisp("PrivateSaved");
            }
          });
        }
      });
    }
    // 非公開⇒公開
    else {
      // スポット数0の場合、エラー
      if (!row.spots) {
        this.commonService.messageDialog("ErrorMsgNoSpot");
        return;
      }

      const dialog = this.dialog.open(MemoDialogComponent, {
        id:"urlShare",
        maxWidth: "100%",
        width: "92vw",
        position: { top: "10px" },
        data: row.memo,
        autoFocus: false
      });
      dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
        if (d === "cancel") {
        } else {
          this.mypagePlanListService.registIsRelease(row.planUserId, !row.isRelease, d).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
            if (r) {
              row.isRelease = !row.isRelease;
              row.memo = d;
              this.commonService.snackBarDisp("ReleaseSaved");
            }
          });
        }
      });
    }
  }

  linktoSpot(planSpot: PlanSpotCommon){
    if (planSpot.type === 1) {
      this.setTransferState();
      this.router.navigate(["/" + this.lang + "/spots/detail/", planSpot.spotId]);
    } else {
      this.commonService.locationPlaceIdGoogleMap(this.lang, planSpot.latitude, planSpot.longitude, planSpot.googleSpot.place_id);
    }
  }

  // 削除する
  onClickDeletePlan(row: MypagePlanAppList) {
    // ログインチェック
    if(!this.commonService.loggedIn){
      const param = new ComfirmDialogParam();
      param.title = "LoginConfirmTitle";
      const dialog = this.commonService.confirmMessageDialog(param);
      dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
        if (d === "ok") {
          // ログイン画面へ
          this.commonService.login();
        }
      });
      return;
    }

    // 確認ダイアログの表示
    const param = new ComfirmDialogParam();
    param.title = "PlanRemoveConfirm";
    const dialog = this.commonService.confirmMessageDialog(param);
    dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
      // プランを削除する
      if (d === "ok") {
        this.mypagePlanListService
        .delPlan(row.planUserId)
        .pipe(takeUntil(this.onDestroy$))
        .subscribe(r => {
          if (r) {
            this.rows.splice(
              this.rows.findIndex(v => v.planUserId === row.planUserId),
              1
            );
            this.getPlanListDetail();
            this.commonService.snackBarDisp("PlanDeleted");
            scrollTo(0, 0);
          } else {
            this.router.navigate(["/" + this.currentlang + "/systemerror"]);
            return;
          }

          // プラン削除通知
          this.myplanService.onPlanUserRemoved();
        });
      }
    });

  }

  async onClickEditPlan(row: MypagePlanAppList){
    // 編集中のプランを取得
    let myPlan: any = await this.indexedDBService.getEditPlan();
    const myPlanApp: MyPlanApp = myPlan;

    // 編集中のプランIDが異なる場合
    if(myPlanApp && myPlanApp.planUserId !== row.planUserId && !myPlanApp.isSaved){
      // 確認ダイアログの表示
      const param = new ComfirmDialogParam();
      param.title = "EditPlanConfirmTitle";
      param.text = "EditPlanConfirmText";
      const dialog = this.commonService.confirmMessageDialog(param);
      dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((r: any) => {
        if (r === "ok") {
          // プランを取得してプラン作成に反映
          this.getPlan(row.planUserId);
        } else {
          // 編集中のプランを表示
          this.commonService.onNotifyIsShowCart(true);
        }
      });
    } else {
      // プランを取得してプラン作成に反映
      this.getPlan(row.planUserId);
    }
  }

  // プランを共有する
  onClickSharePlan(row: MypagePlanAppList) {
    if (!row.isShare) {
      // URL共有更新
      this.myplanService.registShare(row.planUserId).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
        if (r) {
          row.isShare = true;
          row.shareUrl = r;
          this.shareDialog(row);
        }
      });
    } else {
      this.shareDialog(row);
    }
  }
  /*------------------------------
   *
   * メソッド
   *
   * -----------------------------*/

  @Catch()

  detectIsMobile(w:any){
    if(w<1024){
      return true;
    }else{
      return false;
    }
  }

  getPlanList(){
    // 一覧取得
    this.mypagePlanListService
    .getMypagePlanList()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe(r => {
      this.rows = r;
      this.limit = 999;
      this.p = 1;

      // ソート
      this.listsort(this.rows, this.sortval);
      // 検索結果補完
      this.getPlanListDetail();
    });
  }

  // マイページプラン一覧詳細取得
  async getPlanListDetail(isFirst: boolean = false) {
    let startIndex = (this.p - 1) * this.limit;
    this.end = startIndex + this.limit;
    if (this.rows.length - startIndex < this.limit) {
      this.end = this.rows.length;
    }
    if (isFirst) {
      startIndex = 0;
    }
    const result = [];
    for (let i = startIndex; i < this.end; i++) {
      if (this.rows[i].isDetail) {
        this.details$ = this.rows.slice(0, this.end);
        continue;
      }
      result.push(this.getDetail(i));
    }
    this.p++;

    await Promise.all(result);

    if (isPlatformServer(this.platformId)) {
      this.setTransferState();
    }
  }

  getDetail(i: number) {
    return new Promise((resolve) => {
      this.mypagePlanListService
      .getMypagePlanListDetail(this.rows[i])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(d => {
          const idx = this.rows.findIndex(v => v.planUserId === d.planUserId);
          this.rows[idx] = d;
          if (d.spots && d.spots.length > 0){
            this.rows[idx].spots = d.spots.map((x, i) => {
              if (x.type === 1){
                x.spotName = this.commonService.isValidJson(x.spotName, this.lang);
              }
              return x;
            }, []);
          }
          this.details$ = this.rows.slice(0, this.end);
          resolve(true);
      });
    });
  }

  setTransferState() {
    const c = new MyplanListCacheStore();
    c.data = this.rows;
    c.p = this.p;
    c.end = this.end;
    c.offset = window.pageYOffset;

    this.transferState.set<MyplanListCacheStore>(MYPLANLIST_KEY, c);
  }

/*
  sortChange(e: { value: number }) {
    this.sortval = e.value;

    this.listsort(this.rows, e.value);
    this.getPlanListDetail();
  }
*/
  listsort(rows: MypagePlanAppList[], v: number) {
    if(rows){
      let temp: MypagePlanAppList[];
      switch (v) {
        case 12:
          temp = rows.sort((a, b) => {
            return a.updateDatetime < b.updateDatetime ? 1 : -1;
          });
          break;
        case 13:
          temp = rows.sort((a, b) => {
            return a.travelDate < b.travelDate ? 1 : -1;
          });
          break;
      }
    }
  }

  // プラン取得
  getPlan(userPlanId: number){
    // DBから取得
    this.myplanService.getPlanUser(userPlanId.toString()).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
      if (!r) {
        // this.router.navigate(["/" + this.currentlang + "/systemerror"]);
        // return;
      }
      // プラン作成に反映
      this.myplanService.onPlanUserEdit(r);
      // プラン保存
      this.indexedDBService.registPlan(r);
      // subject更新
      this.myplanService.FetchMyplanSpots();
      // マイプランパネルを開く
      this.commonService.onNotifyIsShowCart(true);
    });
  }

  // プラン作成画面をクリア
  async clearMyplan(delPlanUserId: number){
    // 編集中のプランを取得
    let myPlan: any = await this.indexedDBService.getEditPlan();
    const myPlanApp: MyPlanApp = myPlan;

    // 削除したプランと表示しているプランが同じ場合、クリアする
    if (myPlanApp && delPlanUserId === myPlanApp.planUserId){
      this.indexedDBService.clearMyPlan();
      // プラン作成に反映
      this.myplanService.onPlanUserRemoved();
    }
  }

  // URL共有ダイアログの表示
  shareDialog(row: MypagePlanAppList) {
    this.dialog.open(UrlcopyDialogComponent, {
      id:"urlShare",
      maxWidth: "100%",
      width: "92vw",
      position: { top: "10px" },
      data: this.baseUrl + this.lang + "/plans/detail/" + row.shareUrl,
      autoFocus: false
    });
  }

  /*------------------------------
   *
   * owl carousel option
   *
   * -----------------------------*/
  customOptions: any = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: [
      "<i class='material-icons' aria-hidden='true'>keyboard_arrow_left</i>",
      "<i class='material-icons' aria-hidden='true'>keyboard_arrow_right</i>"
    ],
    stagePadding: 30,
    margin: 10,
    responsive: {
      0: {
        items: 3
      },
      400: {
        items: 3
      },
      740: {
        items: 4
      },
      940: {
        items: 5
      }
    },
    nav: false,
    autoHeight: false
  };

}
