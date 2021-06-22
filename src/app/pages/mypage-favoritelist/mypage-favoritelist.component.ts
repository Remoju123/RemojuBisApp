import { Component, OnInit, OnDestroy } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { CommonService } from "../../service/common.service";
import { MypageFavoriteListService } from "../../service/mypagefavoritelist.service";
import { SpotService } from "../../service/spot.service";
import { SpotListService } from "../../service/spotlist.service";
import { PlanListService } from "../../service/planlist.service";
import { DataSelected } from "../../class/common.class";
import { SpotAppList } from "../../class/spotlist.class";
import { PlanAppList } from "../../class/planlist.class";
import { Catch } from "../../class/log.class";
import { LangFilterPipe } from "../../utils/lang-filter.pipe";
import { Local } from "protractor/built/driverProviders";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: "app-mypage-favoritelist",
  templateUrl: "./mypage-favoritelist.component.html",
  styleUrls: ["./mypage-favoritelist.component.scss"]
})
export class MypageFavoriteListComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject();
  constructor(
    private commonService: CommonService,
    private spotService: SpotService,
    private spotListService: SpotListService,
    private planListService: PlanListService,
    private mypageFavoriteListService: MypageFavoriteListService,
    private translate: TranslateService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  // マイページお気に入り一覧
  rowsPlan: PlanAppList[];
  rowsSpot: SpotAppList[];

  sortvalPlan = 15;
  sortvalSpot = 15;

  $mSortPlan: DataSelected[];
  $mSortSpot: DataSelected[];

  // ページング
  pPlan: number;
  pageSizePlan: number;
  pSpot: number;
  pageSizeSpot: number;

  // 初回表示制御
  plan: boolean;

  guid: string;

  get lang() {
    return this.translate.currentLang;
  }

  /*------------------------------
   *
   * イベント
   *
   * -----------------------------*/
  async ngOnInit() {
    // GUID取得
    this.guid = await this.commonService.getGuid();

    // ソート取得
    this.getListSelected();

    // 一覧取得
    this.getSpotList();
    this.getPlanList();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
  }

  // タブ変更(アクティブになっていないタブに画像を含めると幅が0になってしまう)
  tabChange($event: number) {
    if (!this.plan && $event === 1) {
      this.plan = true;
      this.getPlanList();
    }
  }

  // ページ送り(プラン)
  pageChangePlan() {
    // スクロール位置を設定
    this.commonService.scrollToTop();
    // 検索結果補完
    this.getPlanListDetail();
  }

  // ページ送り(スポット)
  pageChangeSpot() {
    // スクロール位置を設定
    this.commonService.scrollToTop();
    // 検索結果補完
    this.getSpotListDetail();
  }

  /*------------------------------
   *
   * メソッド
   *
   * -----------------------------*/
  // 検索条件取得
  @Catch()
  getListSelected() {
    this.mypageFavoriteListService.getMypageFavoriteSort()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(r => {
      this.$mSortPlan = r.mSort;
      this.$mSortSpot = r.mSort;
    });
  }
  
  /*------------------------------
   *
   * メソッド(プラン)
   *
   * -----------------------------*/

  // プラン一覧取得
  @Catch()
  getPlanList() {
    this.mypageFavoriteListService
      .getMypageFavoritePlanList()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(r => {
        this.rowsPlan =r.planAppList;

        this.pageSizePlan = r.pageViewQty;
        this.pPlan = 1;

        // ソート
        this.listsortPlan(this.rowsPlan, this.sortvalPlan);

        // 検索結果補完
        this.getPlanListDetail();
      });
  }

  // プラン一覧詳細取得
  @Catch()
  getPlanListDetail() {
    const startidx = (this.pPlan - 1) * this.pageSizePlan;
    let end = startidx + this.pageSizePlan;
    if (end > this.rowsPlan.length) {
      end = this.rowsPlan.length;
    }
    for (let i = startidx; i < end; i++) {
      this.planListService
        .getPlanListDetail(
          this.rowsPlan[i])
        .pipe(takeUntil(this.onDestroy$))
        .subscribe(d => {
          const idx = this.rowsPlan.findIndex(v => v.planId === d.planId);
          // 掲載終了の場合、削除する
          if (d.isEndOfPublication) {
            this.rowsPlan.splice(idx, 1);
            end++;
          } else {
            this.planListService.dataFormat(d);
            this.rowsPlan[idx] = d;
          }
        });
    }
  }

  sortChangePlan(e: { value: number }) {
    this.sortvalPlan = e.value;

    this.listsortPlan(this.rowsPlan, e.value);
    this.getPlanListDetail();
  }

  listsortPlan(rows: PlanAppList[], v: number) {
    let temp: PlanAppList[];
    switch (v) {
      case 15:
        temp = rows.sort((a, b) => {
          return a.releaseCreateDatetime < b.releaseCreateDatetime ? 1 : -1;
        });
        break;
    }
  }

  /*------------------------------
   *
   * メソッド(スポット)
   *
   * -----------------------------*/

  // スポット一覧取得
  @Catch()
  getSpotList() {
    const langpipe = new LangFilterPipe();
    this.mypageFavoriteListService
      .getMypageFavoriteSpotList()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(r => {
        this.rowsSpot = r.spotAppList;

        this.pageSizeSpot = r.pageViewQty;
        this.pSpot = 1;

        // 予算枠
        this.spotService.budgetFrame = r.budgetFrame;

        // 営業曜日
        this.spotService.businessday = r.businessDay;
        
        // ソート
        this.listsortSpot(this.rowsSpot, this.sortvalSpot);

        // 検索結果補完
        this.getSpotListDetail();

      });
  }

  // スポット一覧詳細取得
  getSpotListDetail() {
    const startidx = (this.pSpot - 1) * this.pageSizeSpot;
    let end = startidx + this.pageSizeSpot;
    if (end > this.rowsSpot.length) {
      end = this.rowsSpot.length;
    }
    for (let i = startidx; i < end; i++) {
      if (!this.rowsSpot[i].googleSpot) {
        this.spotListService
          .getSpotListDetail(
            this.rowsSpot[i])
            .pipe(takeUntil(this.onDestroy$))
            .subscribe(d => {
            if (!d) {
              this.router.navigate(["/" + this.lang + "/systemerror"]);
              return;
            } else {
              const idx = this.rowsSpot.findIndex(v => v.spotId === d.spotId);
              // 掲載終了の場合、削除する
              if (d.isEndOfPublication) {
                this.rowsPlan.splice(idx, 1);
              } else {
                this.spotListService.dataFormat(d);
                this.rowsSpot[idx] = d;
              }
            }
          });
      }
    }
  }

  sortChangeSpot(e: { value: number }) {
    this.sortvalSpot = e.value;

    this.listsortSpot(this.rowsSpot, e.value);
    this.getSpotListDetail();
  }

  listsortSpot(rows: SpotAppList[], v: number) {
    let temp: SpotAppList[];
    switch (v) {
      case 15:
        temp = rows.sort((a, b) => {
          return a.releaseCreateDatetime < b.releaseCreateDatetime ? 1 : -1;
        });
        break;
    }
  }
}
