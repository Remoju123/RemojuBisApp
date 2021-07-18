import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ListSelectedPlan, ListSelectMaster } from 'src/app/class/common.class';
import { ListSearchCondition } from 'src/app/class/indexeddb.class';
import { PlanSpotList,searchResult } from 'src/app/class/planspotlist.class';
import { CommonService } from 'src/app/service/common.service';
import { IndexedDBService } from 'src/app/service/indexeddb.service';
import { PlanSpotListService } from 'src/app/service/planspotlist.service';

@Component({
  selector: 'app-planspot-list',
  templateUrl: './planspot-list.component.html',
  styleUrls: ['./planspot-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanspotListComponent implements OnInit,OnDestroy {
  private onDestroy$ = new Subject();

  get lang() {
    return this.translate.currentLang;
  }

  constructor(
    private commonService: CommonService,
    private indexedDBService: IndexedDBService,
    private planspotListService: PlanSpotListService,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId:Object  ) {
      //this.condition = new ListSearchCondition();
    }


  condition: ListSearchCondition;
  isRemojuRecommended: boolean;
  isUserPost: boolean;

  listSelectMaster: ListSelectMaster;

  //GUID
  guid: string;

  p: number;
  // スクロールした時に表示更新する件数
  pageSize: number = 6;
  // 最終表示位置
  end: number;

  sortval = 11;

  
  // プランスポット一覧
  rows: PlanSpotList[] = [];
  temp: PlanSpotList[] = [];
  details:PlanSpotList[] = [];

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  ngOnInit(): void {

    this.recoveryQueryParams();

    this.getPlanSpotList();
    
    // Read Subject
    this.planspotListService.searchFilter.pipe(takeUntil(this.onDestroy$)).subscribe((result:searchResult)=>{
      this.rows = result.list;
      this.temp = [...this.rows];
    })
  }

  getConditionMaster(): Observable<ListSelectMaster>{
    return this.planspotListService.getPlanSpotListSearchCondition();
  }

  getData(): Observable<PlanSpotList[]>{
    return this.planspotListService.getPlanSpotList();
  }

  async getPlanSpotList() {
    this.planspotListService.getPlanSpotListSearchCondition().pipe(takeUntil(this.onDestroy$)).subscribe(async r => {
      this.listSelectMaster = r;
      this.listSelectMaster.isList = true;
      

      // 検索条件を取得
      let condition: any = await this.indexedDBService.getListSearchConditionPlan();
      if (condition){
        this.condition = condition;
      } else {
        this.condition = new ListSearchCondition();
      }

      // // ローディング開始
      // this.ref = this.loading.show();

      this.planspotListService.getPlanSpotList().pipe(takeUntil(this.onDestroy$)).subscribe(r => {
        this.planspotListService.filteringData(r,this.condition,this.listSelectMaster);

        // 条件更新
        //this.recoveryQueryParams(result.searchParamsObj);
        // 詳細データを初期化
        this.p = 1;
        // ソート->詳細取得
        this.listsort(this.sortval);
      });
    });
  }

  listsort(v:number){
    this.rows.sort((a, b) => {
      return a.releaseCreateDatetime < b.releaseCreateDatetime ? 1 : -1;
    });

    this.getDetails();
  }

  getDetails(){
    
    //let startidx = 0;
    let startidx = (this.p - 1) * this.pageSize;
    this.end = startidx + this.pageSize;

    if(this.rows.length - startidx < this.pageSize){
      this.end = this.rows.length;
    }

    if(this.rows.length>0){
      for (let i = startidx; i < this.end; i++) {
        this.planspotListService.fetchDetails2(this.rows[i])
          .pipe(takeUntil(this.onDestroy$))
          .subscribe(d => {
            const idx = this.rows.findIndex(v => v.id === d.id);
            this.rows[idx] = d;
            this.rows.forEach(x => x.userName = this.commonService.isValidJson(x.userName, this.lang));
          });
          this.details = this.rows.slice(0,this.end);
      }
      this.p++;
    }
  }

  
  onScrollDown() {
    this.getDetails();
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
      }
    })
    this.indexedDBService.registListSearchConditionPlan(this.condition);
    // this.condition.areaId =
    //   params.aid && params.aid.length > 0 ? params.aid.split(",").map(Number) : [];
    // this.condition.areaId2 =
    //   params.era && params.era.length > 0 ? params.era.split(",").map(Number) : [];
    // this.condition.searchCategories =
    //   params.cat && params.cat.length > 0 ? params.cat.split(",").map(Number) : [];
    // // this.condition.searchOptions =
    // //   params.opt.length > 0 ? params.opt.split(",").map(Number) : [];
    // this.condition.isRemojuRecommended =
    //   params.rep ? true : false;
    // this.condition.isUserPost =
    //   params.usp ? true : false;
    // //　ボタン用フラグ
    // this.isRemojuRecommended = params.rep ? true : false;
    // this.isUserPost =  params.usp ? true : false;
    // // 検索条件更新
    // this.indexedDBService.registListSearchConditionPlan(this.condition);
  }

}
