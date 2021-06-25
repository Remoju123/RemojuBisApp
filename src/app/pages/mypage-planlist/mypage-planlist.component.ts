import { Component, OnInit, OnDestroy } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { CommonService } from "../../service/common.service";
import { MypagePlanListService } from "../../service/mypageplanlist.service";
import { MyplanService } from '../../service/myplan.service';
import { IndexedDBService } from "../../service/indexeddb.service";
import { DataSelected, ComfirmDialogParam, MyPlanApp } from "../../class/common.class";
import { MypagePlanAppList } from "../../class/mypageplanlist.class";
import { Catch } from "../../class/log.class";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LangFilterPipe } from "../../utils/lang-filter.pipe";

@Component({
  selector: "app-mypage-planlist",
  templateUrl: "./mypage-planlist.component.html",
  styleUrls: ["./mypage-planlist.component.scss"]
})
export class MypagePlanListComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject();

  constructor(
    private commonService: CommonService,
    private mypagePlanListService: MypagePlanListService,
    private myplanService: MyplanService,
    private indexedDBService: IndexedDBService,
    private translate: TranslateService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  // マイページプラン一覧
  rows: MypagePlanAppList[];
  sortval = 12;

  $mSort: DataSelected[];

  // ページング
  p: number;
  pageSize: number;

  currentlang = this.lang;

  get lang() {
    return this.translate.currentLang;
  }

  /*------------------------------
   *
   * イベント
   *
   * -----------------------------*/
  ngOnInit() {
    this.currentlang = this.lang;
    // ソート取得
    this.getListSelected();
    // 一覧取得
    this.getMyPagePlanList();

    // 保存通知
    this.myplanService.PlanUserSaved$.pipe(takeUntil(this.onDestroy$)).subscribe(x => {
      // 保存されたプランが表示されている場合、最新を取得
      this.getPlanListDetail(x.planUserId);
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
  }

  // ページ送り
  pageChange() {
    // スクロール位置を設定
    this.commonService.scrollToTop();
    // 検索結果補完
    this.getPlanListDetail();
  }

  // 公開・非公開切り替え
  onClickRelease(row: MypagePlanAppList) {
    const param = new ComfirmDialogParam();
    // 公開⇒非公開
    if (row.isRelease) {
      param.title = "PrivateConfirm";
    }
    // 非公開⇒公開
    else {
      param.title = "ReleaseConfirm";
    }
    param.leftButton = "Cancel";
    param.rightButton = "OK";
    const dialog = this.commonService.confirmMessageDialog(param);
    dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
      if (d === "ok") {
        this.mypagePlanListService.registIsRelease(row.planUserId, !row.isRelease).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
          if (r) {
            row.isRelease = !row.isRelease;
            if (row.isRelease) {
              this.commonService.snackBarDisp("ReleaseSaved");
            } else {
              this.commonService.snackBarDisp("PrivateSaved");
            }
          }
        });
      }
    });        
  }

  // 削除する
  onClickDeletePlan(row: MypagePlanAppList) {
    // ログインチェック
    if(!this.commonService.loggedIn){
      // ログイン画面へ
      this.commonService.login();
      return;
    }

    // 確認ダイアログの表示
    const param = new ComfirmDialogParam();
    param.title = "PlanRemoveConfirm";
    param.leftButton = "Cancel";
    param.rightButton = "OK";
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

  onClickEditPlan(row: MypagePlanAppList){
    // プラン作成
    if (row.isCreation){
      this.checkEditPlan(row.planUserId);
    // プラン投稿
  } else {
      this.router.navigate(["/" + this.currentlang + "/post/" + row.planUserId]);
    }
  }

  /*------------------------------
   *
   * メソッド
   *
   * -----------------------------*/

  // 検索条件取得
  @Catch()
  getListSelected() {
    this.mypagePlanListService
      .getMypagePlanListSearchCondition()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(r => {
        if (!r) {
          this.router.navigate(["/" + this.currentlang + "/systemerror"]);
          return;
        }
        this.$mSort = r.mSort;
      });
  }

  // マイページプラン一覧取得
  getMyPagePlanList() {
    this.mypagePlanListService
      .getMypagePlanList()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(r => {
        if (!r) {
          this.router.navigate(["/" + this.currentlang + "/systemerror"]);
          return;
        }
        this.rows = r.mypagePlanAppList;
        this.pageSize = r.pageViewQty;
        this.p = 1;

        // ソート
        this.listsort(this.rows, this.sortval);
        // 検索結果補完
        this.getPlanListDetail();
      });
  }

  // マイページプラン一覧詳細取得
  getPlanListDetail(planUserId: number = 0) {
    const langpipe = new LangFilterPipe();
    const startidx = (this.p - 1) * this.pageSize;
    let end = startidx + this.pageSize;
    if (end > this.rows.length) {
      end = this.rows.length;
    }
    for (let i = startidx; i < end; i++) {
      if (planUserId && planUserId !== this.rows[i].planUserId){
        continue;
      }
      this.mypagePlanListService
        .getMypagePlanListDetail(this.rows[i])
        .pipe(takeUntil(this.onDestroy$))
        .subscribe(d => {
          if (!d) {
            this.router.navigate(["/" + this.currentlang + "/systemerror"]);
            return;
          } else {
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
   
          }
        });
    }
  }

  sortChange(e: { value: number }) {
    this.sortval = e.value;

    this.listsort(this.rows, e.value);
    this.getPlanListDetail();
  }

  listsort(rows: MypagePlanAppList[], v: number) {
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

  // 
  async checkEditPlan(planUserId: number){
    // 編集中のプランを取得
    let myPlan: any = await this.indexedDBService.getEditPlan();
    const myPlanApp: MyPlanApp = myPlan;

    // 編集中のプランIDが異なる場合
    if(myPlanApp && myPlanApp.planUserId !== planUserId && !myPlanApp.isSaved){
      // 確認ダイアログの表示
      const param = new ComfirmDialogParam();
      param.title = "EditPlanConfirmTitle";
      param.text = "EditPlanConfirmText";
      param.leftButton = "Cancel";
      param.rightButton = "OK";
      const dialog = this.commonService.confirmMessageDialog(param);
      dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((r: any) => {
        if (r === "ok") {
          // 編集中のプランを表示
          this.commonService.onNotifyIsShowCart(true);
        } else {
          // プランを取得してプラン作成に反映
          this.getPlan(planUserId);
        }
      });
    } else {
      // プランを取得してプラン作成に反映
      this.getPlan(planUserId);
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
      this.myplanService.onPlanUserChanged(r);
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
      const p = new MyPlanApp();
      this.myplanService.onPlanUserChanged(p);
    }
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