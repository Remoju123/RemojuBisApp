import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { CommonService } from "../../service/common.service";
import { IndexedDBService } from "../../service/indexeddb.service";
import { PlanListService } from "../../service/planlist.service";
import {
  DataSelected,
  ListSelectedPlan,
  CachePlans
} from "../../class/common.class";
import { ListSearchCondition } from "../../class/indexeddb.class";
import { PlanAppList,searchResult } from "../../class/planlist.class";
import { Catch } from "../../class/log.class";
import { MatDialog } from "@angular/material/dialog";
import { SearchDialogFormPlanComponent } from "../../parts/search-dialog-form-plan/search-dialog-form-plan.component";
import { Router } from "@angular/router";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoadingIndicatorService } from '../../service/loading-indicator.service';
import { isPlatformBrowser } from "@angular/common";
@Component({
  selector: "app-plan-list",
  templateUrl: "./plan-list.component.html",
  styleUrls: ["./plan-list.component.scss"]
})
export class PlanListComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject();

  constructor(
    private commonService: CommonService,
    private indexedDBService: IndexedDBService,
    private planListService: PlanListService,
    private translate: TranslateService,
    private router: Router,
    public dialog: MatDialog,
    private loading:LoadingIndicatorService,
    private activatedRoute: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId:Object  ) {}

  // プラン一覧
  rows: PlanAppList[] = [];
  temp:PlanAppList[] = [];
  details: PlanAppList[] = [];

  keyword: string;
  sortval = 11;

  areaNames: any;
  categoryNames: any;
  optionKeywords: string[];

  $mSort: DataSelected[];

  // 検索条件
  condition: ListSearchCondition;
  // 検索条件選択値
  listSelectedPlan: ListSelectedPlan;

  // ページング
  p: number;
  // スクロールした時に表示更新する件数
  pageSize: number = 4;
  // 最終表示位置
  end: number;
  // window.pageYOffset
  offset = 0;

  //GUID
  guid: string;

  isRemojuRecommended:boolean;
  isUserPost:boolean;

  // loadingObject refer
  ref:any;

  get lang() {
    return this.translate.currentLang;
  }

  idx = 0;

  opened:boolean;
  planId:number;

  
  /*------------------------------
   *
   * イベント
   *
   * -----------------------------*/

  async ngOnInit() {
    // URLパラメータ判定
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      if ((params.aid && params.aid.length > 0)
       || (params.era && params.era.length > 0)
       || (params.cat && params.cat.length > 0)
       || (params.rep && params.rep.length > 0)
       || (params.usp && params.usp.length > 0)) {
        this.recoveryQueryParams(params);
      }
      this.getPlanList();
    });
    
    if(isPlatformBrowser(this.platformId)){
      this.planListService.searchFilter.pipe(takeUntil(this.onDestroy$)).subscribe((result:searchResult)=>{
        this.rows = result.list;
        this.temp = [...this.rows];
        this.optionKeywords = result.searchTarm!="" ? result.searchTarm.split(","):[];
        if(result.searchParams.length>14){
          history.replaceState(
            "search_key",
            "",
            location.pathname.substring(1) + "?" + result.searchParams
          );
        } else {
          history.replaceState("search_key", "", location.pathname.substring(1));
        }
        // 条件更新
        this.recoveryQueryParams(result.searchParamsObj);
        // 詳細データを初期化
        this.p = 1;
        // キーワードをクリア
        this.keyword = "";
        // ソート->詳細取得
        this.listsort(this.sortval);
      })
    }
  }

  ngAfterViewChecked(){
    if(this.offset>0){
      window.scrollTo(0,this.offset); 
      setTimeout(() => {
        this.offset = 0;
      }, 300);
    }
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }

  linktoPlan(id:any){
    const c = new CachePlans();
    c.count = this.end;
    c.offset = window.pageYOffset;
    c.data = this.rows;
    c.keyword = this.keyword;
    sessionStorage.setItem("cachep",JSON.stringify(c));

    this.router.navigate(["/" + this.lang + "/plans/detail/", id]);
  }

  selectedChange(index: number){
    if(index === 0){
      this.router.navigate([location.pathname.replace("plans", "spots")]);
    }
  }

  recoveryQueryParams(params: any) {
    if (!this.condition){
      this.condition = new ListSearchCondition();
    }    
    this.condition.areaId =
      params.aid && params.aid.length > 0 ? params.aid.split(",").map(Number) : [];
    this.condition.areaId2 =
      params.era && params.era.length > 0 ? params.era.split(",").map(Number) : [];
    this.condition.searchCategories =
      params.cat && params.cat.length > 0 ? params.cat.split(",").map(Number) : [];
    // this.condition.searchOptions =
    //   params.opt.length > 0 ? params.opt.split(",").map(Number) : [];
    this.condition.isRemojuRecommended =
      params.rep ? true : false;
    this.condition.isUserPost =
      params.usp ? true : false;
    //　ボタン用フラグ
    this.isRemojuRecommended = params.rep ? true : false;
    this.isUserPost =  params.usp ? true : false;
    // 検索条件更新
    this.indexedDBService.registListSearchConditionPlan(this.condition);
  }

  // Remojuおすすめとユーザ投稿の選択
  onClickRemojuUser(isRemoju: boolean){
    // フラグを更新
    if(isRemoju){
      this.condition.isRemojuRecommended = !this.condition.isRemojuRecommended;
      this.isRemojuRecommended = !this.isRemojuRecommended;
    } else {
      this.condition.isUserPost = !this.condition.isUserPost;
      this.isUserPost = !this.isUserPost;
    }
    // 検索条件更新
    this.indexedDBService.registListSearchConditionPlan(this.condition);

    // フィルタデータ取得
    this.rows = this.planListService.filteringPlan(
      this.temp,
      this.condition
    );

    // 検索結果フィルタリング処理
    this.planListService.getSearchFilter(this.listSelectedPlan,this.condition);    

    //詳細データを初期化
    this.p = 1;

    // ローディング開始
    //this.ref = this.loading.show();

    // ソート、詳細補完
    this.listsort(this.sortval);
  }
  /*------------------------------
   *
   * メソッド
   *
   * -----------------------------*/
  // プラン一覧取得
  @Catch()
  async getPlanList() {
    let isTollSpot = false;

    // 有料スポットの場合、画像を表示
    const tollSpotUrl = this.commonService.getTollSpotUrl();
    if (tollSpotUrl){
      isTollSpot = true;
      this.sortval = 20;
    }

    // ロゴ変更通知
    this.commonService.onlogoChange();

    this.planListService.getPlanListSearchCondition(isTollSpot).pipe(takeUntil(this.onDestroy$)).subscribe(async r => {
      this.listSelectedPlan = r;
      this.listSelectedPlan.isList = true;
      this.$mSort = r.mSort;

      // 検索条件を取得
      let condition: any = await this.indexedDBService.getListSearchConditionPlan();
      if (condition){
        this.condition = condition;
      } else {
        this.condition = new ListSearchCondition();
      }

      // GUID取得
      this.guid = await this.commonService.getGuid();
      // // ローディング開始
      this.ref = this.loading.show();

      this.planListService.getPlanList(tollSpotUrl).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
        if (r.tollSpotAreaId){
          // 有料スポットの場合、エリアIDを設定、1ページ目を表示
          this.recoveryQueryParams({ aid: String(r.tollSpotAreaId) , era: "", cat: "", rep: 1});
        }
        this.rows = this.planListService.filteringPlan(
          r.planAppList,
          this.condition
        );
        this.temp = [...this.rows];
        this.p = 1;
        this.keyword = "";        

        // 検索処理用にlistSelected_classにプランリストデータを追加
        this.listSelectedPlan.planList = r.planAppList;
        
        // 検索結果フィルタリング処理
        this.planListService.getSearchFilter(this.listSelectedPlan,this.condition);
      });
    });
  }

  getDetails(){
    if(isPlatformBrowser(this.platformId)){
      let startidx = 0;

      const cache = sessionStorage.getItem("cachep");
      if(cache){
        let d: CachePlans = JSON.parse(cache);
        console.log(d);
        this.rows = d.data;
        this.p = Math.floor(d.count/this.pageSize);
        this.end = d.count;
        this.details = this.rows.slice(0,this.end);
        this.offset = d.offset;
        this.keyword = d.keyword;
        sessionStorage.removeItem("cachep");
        if(this.ref){
          this.ref.close();
        }
      } else {
        startidx = (this.p - 1) * this.pageSize;
        this.end = startidx + this.pageSize;
        // Residual processing
        if(this.rows.length - startidx < this.pageSize){
          this.end = this.rows.length;
        }      
      }
  
      // 詳細取得判定用（初期化）
      if(this.rows.length>0){
        let arr = [];
        for (let i = startidx; i < this.end; i++) {
          if (!this.rows[i].isDetail) {
            this.rows[i].guid = this.guid;
            this.planListService
              .getPlanListDetail(
                this.rows[i])
              .pipe(takeUntil(this.onDestroy$))
              .subscribe(d => {
                let ids: number[] = [];
                d.planSpotNames.map(x=>{
                  ids.push(x.spotId);
                });
                d.planSpotIds = ids;
                const idx = this.rows.findIndex(v => v.planId === d.planId);
                // 掲載終了の場合、削除する
                if (d.isEndOfPublication) {
                  this.temp.splice(this.temp.findIndex(x => x.planId = this.rows[idx].planId), 1);
                  this.rows.splice(idx, 1);
                  if(this.rows.length - startidx < this.pageSize){
                    this.end = this.rows.length;
                  }
                } else {
                  this.planListService.dataFormat(d);
                  this.rows[idx] = d;
                  this.rows.forEach(x => x.userName = this.commonService.isValidJson(x.userName, this.lang));
                }
                this.details = this.rows.slice(0,this.end);
                arr.push("x");
                this.commonService.onNotifyIsLoadingFinish(this.pageSize >= arr.length?true:false);
            });
          }
        }
        this.p++;
      } else {
        this.details = this.rows.slice(0,0);
      }
    
      // ローディング終了処理
      this.commonService.isloadfin$.subscribe(r=>{
        if(r){
          if(this.ref){
            this.ref.close();
          }
        }
      });
    }
    
  }

  onScrollDown() {
    this.getDetails();
  }

  openDialog(e: any) {
    this.listSelectedPlan.tabIndex = e;
    this.listSelectedPlan.isList = true;

    const dialogRef = this.dialog.open(SearchDialogFormPlanComponent, {
      maxWidth: "100%",
      width: "92vw",
      position: { top: "10px" },
      data: this.listSelectedPlan,
      autoFocus: false
      // maxHeight: "80vh"
    });

    dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe(result => {
      this.p = 1;
      this.rows = result;
      // ソート
      this.listsort(this.sortval);
    });
  }

  updateFilter(event:any) {
    const val = event.target.value.toLowerCase();
    const temp = this.temp.filter(function(d) {
      return d.seoKeyword.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.p = 1;
    this.rows = temp;
    // ソート、詳細補完
    this.listsort(this.sortval);
  }

  sortChange(e: { value: number }) {
    this.p = 1;
    this.sortval = e.value;
    // ソート、詳細補完
    this.listsort(e.value);
  }

  listsort(v: number) {
    let temp: PlanAppList[];
    switch (v) {
      case 7:
        temp = this.rows.sort((a, b) => {
          return a.pvQtyAll < b.pvQtyAll ? 1 : -1;
        });
        break;
      case 8:
        temp = this.rows.sort((a, b) => {
          return a.pvQtyWeek < b.pvQtyWeek ? 1 : -1;
        });
        break;
      case 9:
        temp = this.rows.sort((a, b) => {
          return a.planSpotQty < b.planSpotQty ? 1 : -1;
        });
        break;
      case 10:
        temp = this.rows.sort((a, b) => {
          return a.reviewAvg < b.reviewAvg ? 1 : -1;
        });
        break;
      case 11:
        temp = this.rows.sort((a, b) => {
          return a.releaseCreateDatetime < b.releaseCreateDatetime ? 1 : -1;
        });
        break;
      // 有料スポットのホテルからのおすすめ
      case 20:
        temp = this.rows.sort((a, b) => {
          if (a.isTollSpot && b.isTollSpot){
            return a.releaseCreateDatetime < b.releaseCreateDatetime ? 1 : -1;
          } else if (b.isTollSpot) {
            return 1;
          } else {
            return -1;
          }
        });
        break;
    }
    // 詳細補完
    this.getDetails();
  }

  onSwipeRight(event: any) {
    this.opened = false;
  }

  onSelectedId(e:number){
    this.opened = true;
    //console.log(e);
    this.planId = e;
  }

  
  
}
