import { Component, OnInit, OnDestroy, Input, Inject, PLATFORM_ID } from "@angular/core";
import { ComfirmDialogParam, DataSelected } from "../../class/common.class";
import { TranslateService } from "@ngx-translate/core";
import { CommonService } from "../../service/common.service";
import { MypageFavoriteListService } from "../../service/mypagefavoritelist.service";
import { Router } from "@angular/router";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CacheStore, PlanSpotList, tarms } from "../../class/planspotlist.class";
import { PlanSpotListService } from "../../service/planspotlist.service";
import { MyplanService } from "../../service/myplan.service";
import { IndexedDBService } from "../../service/indexeddb.service";
import { ListSearchCondition } from "../../class/indexeddb.class";
import { makeStateKey, TransferState } from "@angular/platform-browser";
import { isPlatformServer } from "@angular/common";

export const MYFAVORITELIST_KEY = makeStateKey<CacheStore>('MYFAVORITELIST_KEY');

@Component({
  selector: "app-mypage-favoritelist",
  templateUrl: "./mypage-favoritelist.component.html",
  styleUrls: ["./mypage-favoritelist.component.scss"]
})
export class MypageFavoriteListComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject();

  constructor(
    private commonService: CommonService,
    private mypageFavoriteListService: MypageFavoriteListService,
    private translate: TranslateService,
    private router: Router,
    private planspots: PlanSpotListService,
    private myplanService: MyplanService,
    private indexedDBService: IndexedDBService,
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.limit = 6;
    this.p = 1;
    this.condition = new ListSearchCondition();
  }

  @Input() myFavorite:Boolean;

  // 初回表示制御
  guid: string;

  condition: ListSearchCondition;
  //listSelectMaster: ListSelectMaster;
  count: number = 0;
  rows: PlanSpotList[] = [];
  spots: PlanSpotList[] = [];
  plans: PlanSpotList[] = [];
  details$: PlanSpotList[] = [];
  $mSort: DataSelected[];
  optionKeywords: tarms;
  select:string;

  myPlanSpots:any;

  p: number;
  limit: number;
  end: number;
  offset: number;

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

  async ngOnInit() {
    // GUID取得
    this.guid = await this.commonService.getGuid();
    if (this.transferState.hasKey(MYFAVORITELIST_KEY)) {
      this.cacheRecoveryDataSet();
      this.mergeNextDataSet(true);
    } else {
      let condition: any = await this.indexedDBService.getListSearchConditionMyfav();
      if (condition){
        this.condition = condition;
      }

      this.getPlanSpotDataSet();
    }

    this.myplanService.FetchMyplanSpots();
    this.myplanService.MySpots$.subscribe(r=>{
      this.myPlanSpots = r;
    })
  }

  ngOnDestroy() {
    this.onDestroy$.next();
  }

  onScrollDown() {
    this.mergeNextDataSet();
  }

  /*------------------------------
   *
   * メソッド
   *
   * -----------------------------*/
  getPlanSpotDataSet() {
    this.mypageFavoriteListService.getMypageFavoritePlanList().pipe(takeUntil(this.onDestroy$))
    .subscribe(async (r) => {
      this.plans = r;
      this.isDetail();
    });
    this.mypageFavoriteListService.getMypageFavoriteSpotList().pipe(takeUntil(this.onDestroy$))
    .subscribe(async (r) => {
      this.spots = r;
      this.isDetail();
    });
  }

  isDetail() {
    if ((this.condition.select === 'plan' || this.spots.length > 0)
      && (this.condition.select === 'spot' || this.plans.length > 0)) {
        this.rows = this.planspots.getFilterbyCondition(this.spots.concat(this.plans),this.condition);
        this.count = this.rows.length;
        this.mergeNextDataSet();
      }
  }

  async mergeNextDataSet(isComplement: boolean = false){
    if(this.rows.length > 0){
      let startIndex = (this.p - 1) * this.limit;
      this.end = startIndex + this.limit;
      if(this.rows.length - startIndex < this.limit){
        this.end = this.rows.length;
      }
      if (isComplement) {
        startIndex = 0;
      }

      for (let i = startIndex; i < this.end; i++){
        if (this.rows[i].isDetail || this.rows[i].googleSpot) {
          continue;
        }

        (await this.planspots.fetchDetails(this.rows[i], this.guid))
          .pipe(takeUntil(this.onDestroy$))
          .subscribe(d => {
            const idx = this.rows.findIndex(v => v.id === d.id);

            // 掲載終了の場合は削除
            if (d.isEndOfPublication) {
              // this.temp.splice(this.temp.findIndex(x => x.id = this.rows[idx].id), 1);
              this.rows.splice(idx, 1);
              if (this.rows.length - startIndex < this.limit) {
                this.end = this.rows.length;
              }
            } else {
              this.rows[idx] = d;
              this.rows[idx].userName = this.commonService.isValidJson(this.rows[idx].userName, this.lang);
            }
            this.details$ = this.rows.slice(0,this.end);
            if (i === this.end -1 && isPlatformServer(this.platformId)) {
              this.setTransferState();
            }
          })
      }
      this.p++;
    }else{
      this.details$ = [];
    }
  }

  cacheRecoveryDataSet() {
    const cache = this.transferState.get<CacheStore>(MYFAVORITELIST_KEY, null);
    //console.log(this.transferState);
    this.rows = cache.data;
    this.end = cache.end;
    this.offset = cache.offset;
    this.details$ = this.rows.slice(0, this.end);
    this.p = cache.p - 1;
    this.condition.select = cache.select;
    this.condition.sortval = cache.sortval;
    this.condition.keyword = cache.keyword;
    this.$mSort = cache.mSort;
    this.count = cache.data.length;

    this.transferState.remove(MYFAVORITELIST_KEY);
  }

  linktoDetail(item:PlanSpotList){
    if (item.isPlan){
      this.setTransferState();
      this.router.navigate(["/" + this.lang + "/plans/detail",item.id]);
    } else if (item.googleSpot) {
      this.commonService.locationPlaceIdGoogleMap(this.lang, item.googleSpot.latitude, item.googleSpot.longitude, item.googleSpot.place_id);
    } else {
      this.setTransferState();
      this.router.navigate(["/" + this.lang + "/spots/detail",item.id]);
    }
  }

  setTransferState() {
    const c = new CacheStore();
    c.data = this.rows;
    c.p = this.p;
    c.end = this.end;
    c.offset = window.pageYOffset;
    c.select = this.condition.select;
    c.sortval = this.condition.sortval;
    c.mSort = this.$mSort;

    this.transferState.set<CacheStore>(MYFAVORITELIST_KEY, c);
  }

  // プランに追加
  async addMyPlan(item:PlanSpotList){
    const tempqty:number = item.isPlan ? item.spotQty : 1;
    if(await this.commonService.checkAddPlan(tempqty) === false) {
      const param = new ComfirmDialogParam();
      param.text = "ErrorMsgAddSpot";
      param.leftButton = "EditPlanProgress";
      const dialog = this.commonService.confirmMessageDialog(param);
      dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
        if(d === "ok"){
          // 編集中のプランを表示
          this.commonService.onNotifyIsShowCart(true);
        }
      });
      return;
    }

    this.planspots.addPlan(
      item.id,
      item.isPlan,
      item.isRemojuPlan
    ).then(result => {
      result.pipe(takeUntil(this.onDestroy$)).subscribe(
        async myPlanApp => {
          if (myPlanApp) {
            this.myplanService.onPlanUserChanged(myPlanApp);
            this.indexedDBService.registPlan(myPlanApp);
            this.myplanService.FetchMyplanSpots();
          }
        }
      )
    })
  }

  // お気に入り削除
  deleteFavorite(item:PlanSpotList) {
    // 確認ダイアログの表示
    const param = new ComfirmDialogParam();
    param.title = "FavoriteRemoveConfirm";
    const dialog = this.commonService.confirmMessageDialog(param);
    dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
      // お気に入りを削除する
      if (d === "ok") {
        this.planspots.registFavorite(
          item.id,
          item.isPlan,
          !item.isFavorite,
          item.isRemojuPlan,
          this.guid,
          item.googleSpot ? true: false
        )
        .pipe(takeUntil(this.onDestroy$))
        .subscribe(async ()=>{
          this.rows.splice(
            this.rows.findIndex(v => v.id === item.id),1
          )
          this.count = this.rows.length;
          this.commonService.snackBarDisp("FavoriteRemoved");

          if(!this.rows[this.end - 1].googleSpot){
            (await this.planspots.fetchDetails(this.rows[this.end - 1], this.guid))
            .pipe(takeUntil(this.onDestroy$))
            .subscribe(d => {
              this.rows[this.end - 1] = d;
              this.rows[this.end - 1].userName = this.commonService.isValidJson(this.rows[this.end - 1].userName, this.lang);
            })
          }
          this.details$ = this.rows.slice(0,this.end);
        });
      }
    });
  }

  // 表示順
  sortChange(v:any){
    this.condition.sortval = v;
    this.indexedDBService.registListSearchConditionMyfav(this.condition);
    this.getPlanSpotDataSet();
  }

  // プランスポット切り替え
  onPlanSpotChange(val:any){
    this.select = val;
    this.condition.select = val;
    this.indexedDBService.registListSearchConditionMyfav(this.condition);
    this.getPlanSpotDataSet();
  }
}
