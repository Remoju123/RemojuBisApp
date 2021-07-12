import { Component, OnDestroy, OnInit, PLATFORM_ID, APP_ID, Inject} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { forkJoin, of, Subject, Subscription } from 'rxjs';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ListSearchCondition } from 'src/app/class/indexeddb.class';
import { IndexedDBService } from "../../service/indexeddb.service";
import { ListSelectMaster } from 'src/app/class/common.class';
import { PlanSpotListService } from 'src/app/service/planspotlist.service';
import { PlanSpotList } from 'src/app/class/planspotlist.class';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { searchResult } from 'src/app/class/spotlist.class';
import { flatten } from '@angular/compiler';

const STATE_KEY_ITEMS = makeStateKey('items');

@Component({
  selector: 'app-planspot',
  templateUrl: './planspot.component.html',
  styleUrls: ['./planspot.component.scss']
})
export class PlanspotComponent implements OnInit,OnDestroy {
  private onDestroy$ = new Subject();

  subsc: Subscription;
  condition: ListSearchCondition;
  isRemojuRecommended: boolean;
  isUserPost: boolean;

  rows: PlanSpotList[] = [];
  temp: PlanSpotList[] = [];

  details$:any = new Array();

  p: number;
  limit: number;
  end: number;

  sortval:number;
  
  items: any = [];
  loaded: boolean;

  constructor(
    private planspots: PlanSpotListService,
    private activatedRoute: ActivatedRoute,
    private indexedDBService: IndexedDBService,
    private state: TransferState,
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(APP_ID) private appId: string
    ) {
      this.loaded = false;
      this.condition = new ListSearchCondition();
      this.limit = 6;
      this.p = 1;
      this.sortval = 11;
    }

  async ngOnInit() {

    this.recoveryQueryParams(); //get listSearchCondition -> this.condition

    forkJoin([
      this.getData(), //get listData
      this.getConditionMaster() //get listSelectMaster
    ])
    .pipe(takeUntil(this.onDestroy$))
    .subscribe(result => {
      result[1].isList = true;
      this.planspots.filteringData(result[0],this.condition,result[1])
    })

    this.planspots.searchFilter
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(result => {
        console.log(result);
        this.rows = result.list;

        this.listsort(11);
        this.loadNextDetails();
      })

    
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }



  getItems():void {
    this.loaded = false;

    this.items = this.state.get(STATE_KEY_ITEMS,<any>[]);

    if(!this.state.hasKey(STATE_KEY_ITEMS)){
      this.planspots.getPlanSpotList().subscribe(
        items => {
          const platform = isPlatformBrowser(this.platformId) ?
              'in the browser' : 'on the server';
          console.log(`getItems : Running ${platform} with appId=${this.appId}`);
          this.items = items;
          this.loaded = true;
          this.state.set(STATE_KEY_ITEMS,<any> items);
        }
      )
    } else {
      this.loaded = true;
    }
  }

  resetItems():void {
    
    this.state.remove(STATE_KEY_ITEMS);

    this.items = null;
    this.loaded = true;

    console.log(this.items);
  }

  recoveryQueryParams() {
    /*********************************
      idxDBに検索条件を保持する
      QueryStringにパラメータがあれば検索条件に反映（生成）
    *********************************/
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
  }


  ///
  getConditionMaster(): Observable<ListSelectMaster>{
    return this.planspots.getPlanSpotListSearchCondition();
  }

  ///
  getData(): Observable<PlanSpotList[]>{
    return this.planspots.getPlanSpotList();
  }

  listsort(v:number):void{
    switch (v) {
      case 7:
        this.rows.sort((a, b) => {
          return a.pvQtyAll < b.pvQtyAll ? 1 : -1
        })
        break;
      case 8:
        this.rows.sort((a, b) => {
          return a.pvQtyWeek < b.pvQtyWeek ? 1 : -1;
        });
        break;
      case 9:
        this.rows.sort((a, b) => {
          return a.planSpotQty < b.planSpotQty ? 1 : -1;
        });
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
  }

  async loadNextDetails(){
    let startIndex = 0;

    startIndex = (this.p - 1) * this.limit;
    this.end = startIndex + this.limit;

    if(this.rows.length - startIndex < this.limit)
      this.end = this.rows.length;

    if(this.rows.length > 0){
      for (let i = startIndex; i < this.end; i++){
        (await this.planspots.fetchDetails(this.rows[i]))
          .pipe(takeUntil(this.onDestroy$))
          .subscribe(d => {

            // 非同期で戻された結果セットの順番を維持するための処理
            let $id: number;
            if(d['spotId']){$id = d['spotId'];} else if(d['planId']){$id = d['planId'];}
            const idx = this.rows.findIndex(v => v.id === $id);

            // 掲載終了の場合は削除　isEndOfPublication
            if(d.isEndOfPublication){
              // 削除処理
            }else{
              this.rows[idx] = d;
            }
            
          })
      }
      
      this.details$ = this.rows.slice(0,this.end);


      this.p++;
    } else {
      this.details$ = this.rows.slice(0,0);
    }
  }
}
