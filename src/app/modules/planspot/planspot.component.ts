import { Component, OnDestroy, OnInit, PLATFORM_ID, APP_ID, Inject} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { forkJoin, Subject, Subscription } from 'rxjs';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ListSearchCondition } from 'src/app/class/indexeddb.class';
import { PlanAppList } from 'src/app/class/planlist.class';
import {
  DataSelected,
  ListSelectedPlan,
  CachePlans,
  ListSelected
} from "../../class/common.class";
import { IndexedDBService } from "../../service/indexeddb.service";

import { PlanSpotListService } from 'src/app/service/planspotlist.service';
import { PlanSpotListSearchResult } from 'src/app/class/planspotlist.class';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

const STATE_KEY_ITEMS = makeStateKey('items');

@Component({
  selector: 'app-planspot',
  templateUrl: './planspot.component.html',
  styleUrls: ['./planspot.component.scss']
})
export class PlanspotComponent implements OnInit,OnDestroy {
  private onDestroy$ = new Subject();

  

  details$: Observable<PlanAppList[]>;
  subsc:Subscription;
  condition: ListSearchCondition;
  isRemojuRecommended: boolean;
  isUserPost: boolean;

  items: any = [];
  loaded: boolean;

  constructor(
    private planspot: PlanSpotListService,
    private activatedRoute: ActivatedRoute,
    private indexedDBService: IndexedDBService,
    private state: TransferState,
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(APP_ID) private appId: string
    ) {
      this.loaded = false;
    }

  async ngOnInit() {

    this.recoveryQueryParams();

    forkJoin([
      this.getCondition(),
      this.getList()
    ])
    .pipe(takeUntil(this.onDestroy$))
    .subscribe(data => {
      console.log('condition ',data[0]);
      console.log('planspot ',data[1]);
    })
    
    
    //this.getItems();

    //console.log(this.items);
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }

  getItems():void {
    this.loaded = false;

    this.items = this.state.get(STATE_KEY_ITEMS,<any>[]);

    if(!this.state.hasKey(STATE_KEY_ITEMS)){
      this.planspot.getPlanSpotList().subscribe(
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
    this.activatedRoute.queryParams.pipe(takeUntil(this.onDestroy$)).subscribe((params:Params) => {
      if ((params.aid && params.aid.length > 0)
       || (params.era && params.era.length > 0)
       || (params.cat && params.cat.length > 0)
       || (params.rep && params.rep.length > 0)
       || (params.usp && params.usp.length > 0))
      {
        // if (!this.condition){
        //   this.condition = new ListSearchCondition();
        // }    
        this.condition.areaId =
          params.aid && params.aid.length > 0 ? params.aid.split(",").map(Number) : [];
        this.condition.areaId2 =
          params.era && params.era.length > 0 ? params.era.split(",").map(Number) : [];
        this.condition.searchCategories =
          params.cat && params.cat.length > 0 ? params.cat.split(",").map(Number) : [];
        this.condition.searchOptions =
          params.opt.length > 0 ? params.opt.split(",").map(Number) : [];
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
    })
  }


  getQueryParams(): Observable<Params>{
    return this.activatedRoute.queryParams;
  }
  ///
  getCondition(): Observable<ListSelectedPlan>{
    return this.planspot.getPlanSpotListSearchCondition();
    // this.planspot.getPlanSpotListSearchCondition().pipe(takeUntil(this.onDestroy$)).subscribe
    // (async result => {
    //   // this.listSelectedPlan = result;
    //   // this.listSelectedPlan.isList = true;
    //   // this.$mSort = result.mSort;

    //   // 検索条件を取得
    //   let condition: any = await this.indexedDBService.getListSearchConditionPlan();
    //   if (condition){
    //     this.condition = condition;
    //   } else {
    //     this.condition = new ListSearchCondition();
    //   }
    // })

  }

  ///
  getList(): Observable<PlanSpotListSearchResult>{
    return this.planspot.getPlanSpotList();
  }

}
