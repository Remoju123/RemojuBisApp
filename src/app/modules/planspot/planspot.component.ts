import { Component, OnDestroy, OnInit } from '@angular/core';
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

  listSelectedPlan: ListSelectedPlan;
  
  constructor(
    private planspot: PlanSpotListService,
    private activatedRoute: ActivatedRoute,
    private indexedDBService: IndexedDBService,
  ) { }

  ngOnInit(): void {

    this.subsc = this.activatedRoute.queryParams.subscribe((params: Params) => {
      if ((params.aid && params.aid.length > 0)
       || (params.era && params.era.length > 0)
       || (params.cat && params.cat.length > 0)
       || (params.rep && params.rep.length > 0)
       || (params.usp && params.usp.length > 0)) {
        this.recoveryQueryParams(params);
      }
    });

    forkJoin([
      this.getCondition(),
      this.getList()
    ])
    .pipe(takeUntil(this.onDestroy$))
    .subscribe(data => {
      console.log('condition ',data[0]);
      console.log('planspot ',data[1]);
    })
  }

  ngOnDestroy(){
    this.onDestroy$.next();
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
