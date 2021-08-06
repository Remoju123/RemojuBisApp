import { Component, OnDestroy, OnInit, PLATFORM_ID, Inject,AfterViewChecked} from '@angular/core';
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

export const PLANSPOT_KEY = makeStateKey<CacheStore>('PLANSPOT_KEY');@Component({
  selector: 'app-planspot',
  templateUrl: './planspot.component.html',
  styleUrls: ['./planspot.component.scss']
})
export class PlanspotComponent implements OnInit,OnDestroy, AfterViewChecked {
  private onDestroy$ = new Subject();

  condition: ListSearchCondition;
  // isRemojuRecommended: boolean;
  // isUserPost: boolean;

  listSelectMaster: ListSelectMaster;
  master: any;

  rows: PlanSpotList[] = [];
  temp: PlanSpotList[] = [];
  details$:PlanSpotList[] = [];
  count: number;

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
      this.condition = new ListSearchCondition();
      // this.condition.sortval='11';
    }

  ngAfterViewChecked(): void {
    if(this.offset){
      if(this.offset > 0){
        window.scrollTo(0,this.offset);
      }
      
      if(this.offset === window.pageYOffset){
        this.offset = 0;
      }
    }
  }

  async ngOnInit() {
    // QueryParam判定して検索条件取得
    this.recoveryQueryParams(); //get listSearchCondition

    // プランスポット一覧データセットを取得してフィルタ、並べ替え処理
    if(this.transferState.hasKey(PLANSPOT_KEY)){
      this.cacheRecoveryDataSet();
    }else{
      this.getPlanSpotDataSet();
    }

    // マージセットSubjectの中継開始
    this.planspots.searchFilter
    .pipe(takeUntil(this.onDestroy$))
    .subscribe(result => {
      this.rows = result.list;
      this.temp = [...this.rows];
      this.optionKeywords = result.searchTarm!="" ? result.searchTarm.split(","):[];
      this.historyReplace(result.searchParams);
      this.count = result.list.length;
    })
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }

  onScrollDown() {
    this.mergeNextDataSet();
  }

  recoveryQueryParams() {
    this.activatedRoute.queryParams.pipe(takeUntil(this.onDestroy$)).subscribe((params:Params) => {
      if ((params.aid && params.aid.length > 0)
       || (params.era && params.era.length > 0)
       || (params.cat && params.cat.length > 0)
       || (params.srt && params.srt.length > 0)
       || (params.lst && params.lst.length > 0)
      )
      {
        this.condition.areaId =
          params.aid && params.aid.length > 0 ? params.aid.split(",").map(Number) : [];
        this.condition.areaId2 =
          params.era && params.era.length > 0 ? params.era.split(",").map(Number) : [];
        this.condition.searchCategories =
          params.cat && params.cat.length > 0 ? params.cat.split(",").map(Number) : [];
        this.condition.searchOptions =
          params.opt && params.opt.length > 0 ? params.opt.split(",").map(Number) : [];
        this.condition.sortval = params.srt;
        this.condition.select = params.lst;
        
        this.indexedDBService.registListSearchCondition(this.condition);
      }
    })
  }

  onPlanSpotChange(val:any){
    this.condition.select = val;
    this.indexedDBService.registListSearchCondition(this.condition);
    this.getPlanSpotDataSet();
    this.p = 1;
  }

  async getPlanSpotDataSet() {
    this.planspots.getPlanSpotListSearchCondition().pipe(takeUntil(this.onDestroy$)).subscribe(async r => {
      this.listSelectMaster = r;
      this.listSelectMaster.isList = true;

      // 検索条件を再取得
      let condition: any = await this.indexedDBService.getListSearchCondition();
      if (condition){
        this.condition = condition;
      }

      this.planspots.getPlanSpotList().pipe(takeUntil(this.onDestroy$)).subscribe(r => {
        // フィルタリング処理
        this.planspots.filteringData(r,this.condition,this.listSelectMaster);

        // ソート->詳細取得
        //this.mergeNextDataSetAfterSorting(this.sortval);
        this.mergeNextDataSet();
      });
    })
  }

  async mergeNextDataSet(){
    //let startIndex = 0;
    let startIndex = (this.p - 1) * this.limit;
    this.end = startIndex + this.limit;
    if(this.rows.length - startIndex < this.limit){
      this.end = this.rows.length;
    }

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

  cacheRecoveryDataSet(){
    const cache = this.transferState.get<CacheStore>(PLANSPOT_KEY,null);
    this.rows = cache.data;
    this.end = cache.end;
    this.offset = cache.offset;
    this.details$ = this.rows.slice(0,this.end);
    this.p = cache.p;
    this.condition.select = cache.select;
    this.count = cache.data.length;

    this.transferState.remove(PLANSPOT_KEY);
  }

  historyReplace(searchParams:string):void{
    if(isPlatformBrowser(this.platformId)){
      if(searchParams.length>19){
        history.replaceState(
          "search_key",
          "",
          location.pathname.substring(1) + "?" + searchParams
        );
      } else {
        history.replaceState("search_key", "", location.pathname.substring(1));
      }
      // history back desabled
      history.pushState(null,null,null);
      window.onpopstate = () =>{
        history.pushState(null,null,null);
      }
    }
  }

  // プラン/スポット詳細リンク
  linktoDetail(id:number){
    const c = new CacheStore();
    c.data = this.rows;
    c.p = this.p;
    c.end = this.end;
    c.offset = window.pageYOffset;
    c.select = this.condition.select;
    c.keyword = "";
    this.transferState.set<CacheStore>(PLANSPOT_KEY,c);
    // idで切り替え
    if(id > 10000){
      this.router.navigate(["/" + this.lang + "/spots/detail",id]);
    }else{
      this.router.navigate(["/" + this.lang + "/plans/detail",id]);
    }
  }

  // 表示順
  sortChange(v:any){
    this.condition.sortval=v;
    this.indexedDBService.registListSearchCondition(this.condition);
    this.getPlanSpotDataSet();
    this.p = 1;
  }
  
}
