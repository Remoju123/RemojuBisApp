import { Component, OnDestroy, OnInit, PLATFORM_ID, Inject} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ListSearchCondition } from 'src/app/class/indexeddb.class';
import { IndexedDBService } from "../../service/indexeddb.service";
import { ListSelectMaster } from 'src/app/class/common.class';
import { PlanSpotListService } from 'src/app/service/planspotlist.service';
import { CacheStore, PlanSpotList } from 'src/app/class/planspotlist.class';
import { isPlatformBrowser } from '@angular/common';
import { CommonService } from 'src/app/service/common.service';
import { TranslateService } from '@ngx-translate/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';

export const PLANSPOT_KEY = makeStateKey<CacheStore>('PLANSPOT_KEY');
@Component({
  selector: 'app-planspot',
  templateUrl: './planspot.component.html',
  styleUrls: ['./planspot.component.scss']
})
export class PlanspotComponent implements OnInit,OnDestroy {
  private onDestroy$ = new Subject();

  condition: ListSearchCondition;
  isRemojuRecommended: boolean;
  isUserPost: boolean;

  listSelectMaster: ListSelectMaster;

  rows: PlanSpotList[] = [];
  temp: PlanSpotList[] = [];

  details$:PlanSpotList[] = [];

  result:Observable<PlanSpotList>[] = [];

  p: number;
  limit: number;
  end: number;
  offset:number;

  sortval:number;
  optionKeywords: string[];
  
  get lang() {
    return this.translate.currentLang;
  }

  constructor(
    private translate: TranslateService,
    private commonService: CommonService,
    private planspots: PlanSpotListService,
    private activatedRoute: ActivatedRoute,
    private indexedDBService: IndexedDBService,
    private transferState: TransferState,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
    ) {
      this.limit = 6;
      this.p = 1;
      this.sortval = 11;
      this.condition = new ListSearchCondition();
    }

  async ngOnInit() {

    // QueryParam判定して検索条件取得
    this.recoveryQueryParams(); //get listSearchCondition

    // プランスポット一覧データセットを取得してフィルタ、並べ替え処理
    this.getPlanSpotDataSet();
    
    // マージセットSubjectの中継開始
    this.planspots.searchFilter
    .pipe(takeUntil(this.onDestroy$))
    .subscribe(result => {
      this.rows = result.list;
      this.temp = [...this.rows];
      this.optionKeywords = result.searchTarm!="" ? result.searchTarm.split(","):[];
      this.historyReplace(result.searchParams);
    })

    console.log(this.transferState)
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }

  ngAfterViewChecked(){
    //window.scrollTo(0,this.offset);
    console.log(window.pageYOffset);
  }

  onScrollDown() {
    this.mergeNextDataSet();
  }

  recoveryQueryParams() {
    this.activatedRoute.queryParams.pipe(takeUntil(this.onDestroy$)).subscribe((params:Params) => {
      if ((params.aid && params.aid.length > 0)
       || (params.era && params.era.length > 0)
       || (params.cat && params.cat.length > 0)
       || (params.rep && params.rep.length > 0)
       || (params.usp && params.usp.length > 0))
      {
        this.condition.areaId =
          params.aid && params.aid.length > 0 ? params.aid.split(",").map(Number) : [];
        this.condition.areaId2 =
          params.era && params.era.length > 0 ? params.era.split(",").map(Number) : [];
        this.condition.searchCategories =
          params.cat && params.cat.length > 0 ? params.cat.split(",").map(Number) : [];
        this.condition.searchOptions =
          params.opt && params.opt.length > 0 ? params.opt.split(",").map(Number) : [];
        this.condition.isRemojuRecommended =
          params.rep ? true : false;
        this.condition.isUserPost =
          params.usp ? true : false;
        //　ボタン用フラグ
        this.isRemojuRecommended = params.rep ? true : false;
        this.isUserPost =  params.usp ? true : false;
        this.indexedDBService.registListSearchConditionPlan(this.condition);
      }
    })
  }
  
  async getPlanSpotDataSet() {
    this.planspots.getPlanSpotListSearchCondition().pipe(takeUntil(this.onDestroy$)).subscribe(async r => {
      this.listSelectMaster = r;
      this.listSelectMaster.isList = true;

      // 検索条件を再取得
      let condition: any = await this.indexedDBService.getListSearchConditionPlan();
      if (condition){
        this.condition = condition;
      }

      this.planspots.getPlanSpotList().pipe(takeUntil(this.onDestroy$)).subscribe(r => {
        // フィルタリング処理
        this.planspots.filteringData(r,this.condition,this.listSelectMaster);

        // 詳細データを初期化
        this.p = 1;
        // ソート->詳細取得
        this.mergeNextDataSetAfterSorting(this.sortval);
      });
    })
  }

  mergeNextDataSetAfterSorting(v:number){
    switch (v) {
      case 7:
        this.rows.sort((a, b) => {
          return a.pvQtyAll < b.pvQtyAll ? 1 : -1
        })
        break;
      case 10:
        this.rows.sort((a, b) => {
          return a.reviewAvg < b.reviewAvg ? 1 : -1;
        });
        break;
      case 11:
        this.rows.sort((a, b) => {
          return a.releaseCreateDatetime < b.releaseCreateDatetime ? 1 : -1;
        });
        break;
    }
    this.mergeNextDataSet();
  }

  async mergeNextDataSet(){
    let startIndex = (this.p - 1) * this.limit;
    this.end = startIndex + this.limit;

    if(this.rows.length - startIndex < this.limit){
      this.end = this.rows.length;
    }

    if(this.rows.length > 0){
      for (let i = startIndex; i < this.end; i++){
        (await this.planspots.fetchDetails(this.rows[i]))
          .pipe(takeUntil(this.onDestroy$))
          .subscribe(d => {
            // 非同期で戻された結果セットの順番を維持するための処理
            const idx = this.rows.findIndex(v => v.id === d.id);

            // 掲載終了の場合は削除
            if(d.isEndOfPublication){
              // 削除処理
              this.temp.splice(this.temp.findIndex(x => x.id = this.rows[idx].id), 1);
              this.rows.splice(idx, 1);
                if(this.rows.length - startIndex < this.limit){
                  this.end = this.rows.length;
                }
            }else{
              this.rows[idx] = d;
              this.rows.forEach(x => x.userName = this.commonService.isValidJson(x.userName, this.lang));
            }
            this.details$ = this.rows.slice(0,this.end);
          })
      }
      this.p++;      
    }
  }

  historyReplace(searchParams:string):void{
    if(isPlatformBrowser(this.platformId)){
      if(searchParams.length>14){
        history.replaceState(
          "search_key",
          "",
          location.pathname.substring(1) + "?" + searchParams
        );
      } else {
        history.replaceState("search_key", "", location.pathname.substring(1));
      }
    }
  }

  linktoDetail(id:number){
    const c = new CacheStore();
    c.details = this.details$;
    c.page = this.p - 1;
    c.offset = window.pageYOffset;
    c.keyword = "";
    this.transferState.set<CacheStore>(PLANSPOT_KEY,c);

    this.router.navigate(["/" + this.lang + "/plans/detail",id]);
  }
}
