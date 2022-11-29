import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  AfterViewChecked,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../service/common.service';
import { MypagePlanListService } from '../../service/mypageplanlist.service';
import { MyplanService } from '../../service/myplan.service';
import { IndexedDBService } from '../../service/indexeddb.service';
import {
  DataSelected,
  ComfirmDialogParam,
  MyPlanApp,
  PlanSpotCommon,
} from '../../class/common.class';
import {
  MypagePlanAppList,
  MyplanListCacheStore,
} from '../../class/mypageplanlist.class';
import { Catch } from '../../class/log.class';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UrlcopyDialogComponent } from '../../parts/urlcopy-dialog/urlcopy-dialog.component';
import { isPlatformBrowser } from '@angular/common';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { makeStateKey, TransferState } from '@angular/platform-browser';

export const MYPLANLIST_KEY =
  makeStateKey<MyplanListCacheStore>('MYPLANLIST_KEY');

@Component({
  selector: 'app-mypage-planlist',
  templateUrl: './mypage-planlist.component.html',
  styleUrls: ['./mypage-planlist.component.scss'],
})
export class MypagePlanListComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  private onDestroy$ = new Subject();
  private baseUrl: string;

  constructor(
    public commonService: CommonService,
    private mypagePlanListService: MypagePlanListService,
    private myplanService: MyplanService,
    private indexedDBService: IndexedDBService,
    private translate: TranslateService,
    private transferState: TransferState,
    private router: Router,
    public dialog: MatDialog,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.limit = 6;
    this.p = 1;

    if (isPlatformBrowser(this.platformId)) {
      this.baseUrl = document.getElementsByTagName('base')[0].href;
      this.currentlang = localStorage.getItem('gml');
    }
  }

  @ViewChild('box') box: ElementRef;
  @ViewChild('owlElement') owlElement: OwlOptions;

  isMobile: boolean;

  $releaseDestination: DataSelected[];
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
    if (typeof this.offset !== 'undefined') {
      if (this.offset) {
        if (this.offset > 0) {
          window.scrollTo(0, this.offset);
        }

        if (this.offset === window.pageYOffset) {
          this.offset = 0;
        }
      }
    }
  }

  ngOnInit() {
    this.isMobile = this.detectIsMobile(window.innerWidth);

    this.mypagePlanListService
      .getDataSelected()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((r) => {
        //console.log(r);
        this.$releaseDestination = r;
      });

    /*  
    if (this.transferState.hasKey(MYPLANLIST_KEY)) {
      const cache = this.transferState.get<MyplanListCacheStore>(
        MYPLANLIST_KEY,
        null
      );
      this.rows = cache.data;
      this.end = cache.end;
      this.offset = cache.offset;
      this.details$ = this.rows.slice(0, this.end);
      this.p = cache.p - 1;
      this.count = cache.data.length;

      this.transferState.remove(MYPLANLIST_KEY);

      this.getPlanListDetail(true);
    } else {
      //this.getPlanList();
    }
    */

    this.getPlanList();

    // 新規保存時
    this.myplanService.PlanUserSaved$.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((x) => {
      this.getPlanList();
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
  }

  onScroll(e: any) {
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
    if (!row.isRelease) {
      param.title = 'PrivateConfirm';
      const dialog = this.commonService.confirmMessageDialog(param);
      dialog
        .afterClosed()
        .pipe(takeUntil(this.onDestroy$))
        .subscribe((d: any) => {
          if (d === 'ok') {
            this.mypagePlanListService
              .registIsRelease(row.planUserId, row.isRelease, false)
              .pipe(takeUntil(this.onDestroy$))
              .subscribe((r) => {
                if (r) {
                  this.commonService.snackBarDisp('PrivateSaved');
                }
              });
          } else {
            row.isRelease = !row.isRelease;
          }
        });
    }
    // 非公開⇒公開
    else {
      // スポット数0の場合、エラー
      if (!row.spots) {
        this.commonService.messageDialog('ErrorMsgNoSpot');
        return;
      }

      const param = new ComfirmDialogParam();
      param.title = 'ReleaseConfirmTitle';
      if (row.isStartEnd) {
        param.text = 'ReleaseStartEndSpotDeleteConfirmText';
      } else {
        param.text = 'ReleaseConfirmText';
      }
      param.leftButton = 'ReleaseButton';
      const dialog = this.commonService.confirmMessageDialog(param);
      dialog
        .afterClosed()
        .pipe(takeUntil(this.onDestroy$))
        .subscribe((d: any) => {
          if (d === 'ok') {
            this.mypagePlanListService
              .registIsRelease(row.planUserId, row.isRelease, row.isStartEnd)
              .pipe(takeUntil(this.onDestroy$))
              .subscribe((r) => {
                if (r) {
                  row.isStartEnd = false;
                  this.commonService.snackBarDisp('ReleaseSaved');
                }
              });
          } else {
            row.isRelease = !row.isRelease;
          }
        });
    }
  }

  linktoSpot(planSpot: PlanSpotCommon) {
    if (planSpot.type === 1) {
      this.setSessionStorage();
      this.router.navigate([
        '/' + this.lang + '/spots/detail/',
        planSpot.spotId,
      ]);
    } else {
      this.commonService.locationPlaceIdGoogleMap(
        this.lang,
        planSpot.latitude,
        planSpot.longitude,
        planSpot.googleSpot.place_id
      );
    }
  }

  // 削除する
  async onClickDeletePlan(row: MypagePlanAppList) {
    // ログインチェック
    if (!this.commonService.loggedIn) {
      const param = new ComfirmDialogParam();
      param.title = 'LoginConfirmTitle';
      param.text = 'LoginConfirmText';
      const dialog = this.commonService.confirmMessageDialog(param);
      dialog
        .afterClosed()
        .pipe(takeUntil(this.onDestroy$))
        .subscribe((d: any) => {
          if (d === 'ok') {
            // ログイン画面へ
            this.commonService.login();
          }
        });
      return;
    }

    // 編集中のプランを取得
    let myPlan: any = await this.indexedDBService.getEditPlan();
    const myPlanApp: MyPlanApp = myPlan;

    // 確認ダイアログの表示
    const param = new ComfirmDialogParam();
    param.title = 'PlanRemoveConfirmTitle';
    param.text = 'PlanRemoveConfirmText';
    const dialog = this.commonService.confirmMessageDialog(param);
    dialog
      .afterClosed()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((d: any) => {
        // プランを削除する
        if (d === 'ok') {
          this.mypagePlanListService
            .delPlan(row.planUserId)
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((r) => {
              if (r) {
                this.rows.splice(
                  this.rows.findIndex((v) => v.planUserId === row.planUserId),
                  1
                );
                this.details$.splice(
                  this.details$.findIndex(
                    (v) => v.planUserId === row.planUserId
                  ),
                  1
                );
                this.getPlanListDetail();
                this.commonService.snackBarDisp('PlanDeleted');
                scrollTo(0, 0);
              } else {
                this.router.navigate(['/' + this.currentlang + '/systemerror']);
                return;
              }

              // プラン削除通知
              this.myplanService.onPlanUserRemoved(row.planUserId);
            });
        }
      });
  }

  async onClickPlanCopy(row: MypagePlanAppList) {
    // 編集中のプランを取得
    let myPlan: any = await this.indexedDBService.getEditPlan();
    const myPlanApp: MyPlanApp = myPlan;

    // 編集中のプランIDが異なる場合
    if (
      myPlanApp &&
      myPlanApp.planUserId !== row.planUserId &&
      !myPlanApp.isSaved
    ) {
      // 確認ダイアログの表示
      const param = new ComfirmDialogParam();
      param.title = 'EditPlanConfirmTitle';
      param.text = 'EditPlanConfirmText';
      const dialog = this.commonService.confirmMessageDialog(param);
      dialog
        .afterClosed()
        .pipe(takeUntil(this.onDestroy$))
        .subscribe((r: any) => {
          if (r === 'ok') {
            // プランを取得してプラン作成に反映
            this.getPlan(row.planUserId, true);
          } else {
            // 編集中のプランを表示
            this.commonService.onNotifyIsShowCart(true);
          }
        });
    } else {
      // プランを取得してプラン作成に反映
      this.getPlan(row.planUserId, true);
    }
  }

  async onClickPreview(row: MypagePlanAppList) {
    this.setSessionStorage();
    this.router.navigate(['/' + this.lang + '/plans/detail', row.planUserId]);
  }

  async onClickEditPlan(row: MypagePlanAppList) {
    // 編集中のプランを取得
    let myPlan: any = await this.indexedDBService.getEditPlan();
    const myPlanApp: MyPlanApp = myPlan;

    // 編集中のプランIDが異なる場合
    if (
      myPlanApp &&
      myPlanApp.planUserId !== row.planUserId &&
      !myPlanApp.isSaved
    ) {
      // 確認ダイアログの表示
      const param = new ComfirmDialogParam();
      param.title = 'EditPlanConfirmTitle';
      param.text = 'EditPlanConfirmText';
      const dialog = this.commonService.confirmMessageDialog(param);
      dialog
        .afterClosed()
        .pipe(takeUntil(this.onDestroy$))
        .subscribe((r: any) => {
          if (r === 'ok') {
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
      this.myplanService
        .registShare(row.planUserId)
        .pipe(takeUntil(this.onDestroy$))
        .subscribe((r) => {
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
  detectIsMobile(w: any) {
    if (w < 1024) {
      return true;
    } else {
      return false;
    }
  }

  getPlanList() {
    // 一覧取得
    this.mypagePlanListService
      .getMypagePlanList()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((r) => {
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
  async getPlanListDetail(isDetail: boolean = false) {
    let startIndex = (this.p - 1) * this.limit;
    this.end = startIndex + this.limit;
    if (this.rows.length - startIndex < this.limit) {
      this.end = this.rows.length;
    }
    if (isDetail) {
      startIndex = 0;
    }
    for (let i = startIndex; i < this.end; i++) {
      if (this.rows[i].isDetail) {
        this.details$ = this.rows.slice(0, this.end);
        continue;
      }
      this.mypagePlanListService
        .getMypagePlanListDetail(this.rows[i])
        .pipe(takeUntil(this.onDestroy$))
        .subscribe(async (d) => {
          let idx = this.rows.findIndex((v) => v.planUserId === d.planUserId);
          this.rows[idx] = d;
          if (d.spots && d.spots.length > 0) {
            this.rows[idx].spots = await d.spots.map((x, i) => {
              if (x.type === 1) {
                x.spotName = this.commonService.isValidJson(
                  x.spotName,
                  this.lang
                );
              }
              return x;
            }, []);
          }

          // const idx = this.rows.findIndex(v => v.planUserId === d.planUserId);
          // this.rows[idx] = d;
          // if (d.spots && d.spots.length > 0){
          //   this.rows[idx].spots = d.spots.map((x, i) => {
          //     if (x.type === 1){
          //       x.spotName = this.commonService.isValidJson(x.spotName, this.lang);
          //     }
          //     return x;
          //   }, []);
          // }
          this.details$ = this.rows.slice(0, this.end);
        });
    }
    this.p++;
  }

  setSessionStorage() {
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
    if (rows) {
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
  getPlan(userPlanId: number, isCopy = false) {
    // DBから取得
    this.myplanService
      .getPlanUser(userPlanId.toString())
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((r) => {
        if (!r) {
          // this.router.navigate(["/" + this.currentlang + "/systemerror"]);
          // return;
        }
        if (isCopy) {
          r.isSaved = false;
          r.planUserId = 0;
          r.isRelease = false;
          r.isShare = false;
          r.shareUrl = null;
          r.planName =
            '(' + this.translate.instant('CopyPlan') + ')' + r.planName;
        }

        // プラン作成に反映
        this.myplanService.onPlanUserEdit(r);
        // プラン保存
        this.indexedDBService.registPlan(r);
        // subject更新
        this.myplanService.FetchMyplanSpots();
        // マイプランパネルを開く
        this.commonService.onNotifyIsShowCart(true);
        this.commonService.snackBarDisp('InPlanBox');
      });
  }

  // URL共有ダイアログの表示
  shareDialog(row: MypagePlanAppList) {
    this.dialog.open(UrlcopyDialogComponent, {
      id: 'urlShare',
      maxWidth: '100%',
      width: '92vw',
      position: { top: '10px' },
      data: this.baseUrl + this.lang + '/plans/detail/' + row.shareUrl,
      autoFocus: false,
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
    //skip_validateItems:true,
    //lazyLoad:true,
    //autoWidth:true,
    navText: [
      "<i class='material-icons' aria-hidden='true'>keyboard_arrow_left</i>",
      "<i class='material-icons' aria-hidden='true'>keyboard_arrow_right</i>",
    ],
    stagePadding: 30,
    margin: 10,
    responsive: {
      0: {
        items: 3,
      },
      400: {
        items: 3,
      },
      740: {
        items: 4,
      },
      940: {
        items: 5,
      },
    },
    nav: false,
    autoHeight: false,
  };
}
