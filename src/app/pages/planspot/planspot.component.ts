import { Component, OnDestroy, OnInit, PLATFORM_ID, Inject,AfterViewChecked} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ListSearchCondition } from 'src/app/class/indexeddb.class';
import { IndexedDBService } from "../../service/indexeddb.service";
import { DataSelected, ListSelectMaster } from 'src/app/class/common.class';
import { PlanSpotListService } from 'src/app/service/planspotlist.service';
import { CacheStore, PlanSpotList } from 'src/app/class/planspotlist.class';
import { isPlatformBrowser } from '@angular/common';
import { CommonService } from 'src/app/service/common.service';
import { TranslateService } from '@ngx-translate/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { SearchDialogComponent } from './components/search-dialog/search-dialog.component';

export const PLANSPOT_KEY = makeStateKey<CacheStore>('PLANSPOT_KEY');@Component({
  selector: 'app-planspot',
  templateUrl: './planspot.component.html',
  styleUrls: ['./planspot.component.scss']
})
export class PlanspotComponent implements OnInit,OnDestroy, AfterViewChecked {
  private onDestroy$ = new Subject();

  condition: ListSearchCondition;

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

  $mSort: DataSelected[];
  sortval:number;
  optionKeywords: string[];

  isList:boolean = true;
  select:string;


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
    public dialog: MatDialog,
    @Inject(PLATFORM_ID) private platformId: object
    ) {
      this.limit = 6;
      this.p = 1;
      this.condition = new ListSearchCondition();
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
    this.recoveryQueryParams();

    if(this.transferState.hasKey(PLANSPOT_KEY)){
      this.cacheRecoveryDataSet();
    }else{
      this.getPlanSpotDataSet();
    }

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

  async getPlanSpotDataSet() {
    this.planspots.getPlanSpotListSearchCondition().pipe(takeUntil(this.onDestroy$)).subscribe(async r => {
      this.listSelectMaster = r;
      this.listSelectMaster.isList = true;
      this.$mSort = r.mSort;

      let condition: any = await this.indexedDBService.getListSearchCondition();
      if (condition){
        this.condition = condition;
      }

      this.planspots.getPlanSpotList().pipe(takeUntil(this.onDestroy$)).subscribe(r => {
        this.planspots.filteringData(r,this.condition,this.listSelectMaster);
        this.mergeNextDataSet();
      });
    })
  }

  async mergeNextDataSet(){
    if(this.rows.length > 0){
      this.isList = true;
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
    }else{
      this.isList = false;
      if(this.condition.select !== 'plan'){
        const keyword = this.condition.keyword;
        if(keyword !== null){
          (await this.planspots.getGoogleSpotList(keyword)).subscribe(g => {
            this.details$ = g;
            this.count = g.length;
          })
        }
      }else{
        this.details$ = [];
      }
    }
  }

  cacheRecoveryDataSet(){
    const cache = this.transferState.get<CacheStore>(PLANSPOT_KEY,null);
    this.rows = cache.data;
    this.end = cache.end;
    this.offset = cache.offset;
    this.details$ = this.rows.slice(0,this.end);
    this.p = cache.p;
    this.condition.select = cache.select;
    this.condition.sortval = cache.sortval;
    this.condition.keyword = cache.keyword;
    this.$mSort = cache.mSort;
    this.count = cache.data.length;
    this.isList = cache.isList; //change
    
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

  // キーワード検索
  keywordSearch(v:any){
    console.log(v);
    this.condition.keyword = v;
    this.indexedDBService.registListSearchCondition(this.condition);
    this.getPlanSpotDataSet();
    this.p = 1;
  }

  // 表示順
  sortChange(v:any){
    this.condition.sortval = v;
    this.indexedDBService.registListSearchCondition(this.condition);
    this.getPlanSpotDataSet();
    this.p = 1;
  }

  // プランスポット切り替え
  onPlanSpotChange(val:any){
    this.select = val;
    this.condition.select = val;
    this.indexedDBService.registListSearchCondition(this.condition);
    this.getPlanSpotDataSet();
    this.p = 1;
  }

  // プラン/スポット詳細リンク
  linktoDetail(id:number){
    const c = new CacheStore();
    c.data = this.rows;
    c.p = this.p;
    c.end = this.end;
    c.offset = window.pageYOffset;
    c.select = this.condition.select;
    c.sortval =this.condition.sortval;
    c.mSort = this.$mSort;
    c.keyword = this.condition.keyword;
    c.isList = this.isList;
    this.transferState.set<CacheStore>(PLANSPOT_KEY,c);
    // 5digits or more is Plan
    if(id > 10000){
      this.router.navigate(["/" + this.lang + "/spots/detail",id]);
    }else{
      this.router.navigate(["/" + this.lang + "/plans/detail",id]);
    }
  }

  // 検索パネル
  openDialog(e:any){
    this.listSelectMaster.tabIndex = e;
    this.listSelectMaster.planSpotList = this.rows;

    const dialogRef = this.dialog.open(SearchDialogComponent, {
      maxWidth: "100%",
      width: "92vw",
      position: { top: "10px" },
      data: this.listSelectMaster,
      autoFocus: false
    });

    dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe(result => {
      this.getPlanSpotDataSet();
      this.p = 1;
    });
  }
  
}
