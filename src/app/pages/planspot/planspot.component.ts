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
import { isPlatformBrowser,isPlatformServer } from '@angular/common';



export const STATE_KEY_ITEMS = makeStateKey('items');
export const STATE_KEY_DETAIL = makeStateKey('details');
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

  details$:PlanSpotList[] = [];

  result:Observable<PlanSpotList>[] = [];

  p: number;
  limit: number;
  end: number;

  sortval:number;
  
  items: any = [];
  loaded: boolean;

  title:string;
  body:string;

  constructor(
    private planspots: PlanSpotListService,
    private activatedRoute: ActivatedRoute,
    private indexedDBService: IndexedDBService,
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: object
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
      //　1.検索条件でフィルタリングした結果セットをsearchFilter(subject)に格納する
      this.planspots.filteringData(result[0],this.condition,result[1])
    })

    // 2.searchFilterから結果セットを取り出す
    this.planspots.searchFilter
    .pipe(takeUntil(this.onDestroy$))
    .subscribe(result => {
      this.rows = result.list;
      this.listsort(this.sortval);
      this.loadNextDetails();
    })

    /* --only browser task: browser object history,location -- */
    if(isPlatformBrowser(this.platformId)){
      
    }
    /* --only browser task: browser object history,location -- */
/*
    if (this.state.hasKey(STATE_KEY_DETAIL)) {
      this.details$ = this.state.get<PlanSpotList[]>(STATE_KEY_DETAIL, null);
    } else {
      const details:PlanSpotList[] = [ {
        address: null,
areaId: 13,
areaId2: 0,
areaName: "[{\"lang\":\"ja\",\"text\":\"東京都\"},{\"lang\":\"en\",\"text\":\"Tokyo\"}]",
areaName2: null,
averageStayTime: null,
budgets: null,
businessHours: null,
createDate: "2021-06-07T12:51:55.77",
favoriteQty: 0,
googleSpot: null,
guid: "21a29e46-5f3c-0752-b851-1c3071d8067e",
id: 1492,
isCreation: true,
isEndOfPublication: false,
isFavorite: false,
isPlan: 1,
isRegularHoliday: false,
isRemojuPlan: false,
keyword: "【テスト】都内の最狂スポットテスト[{\"lang\":\"ja\",\"text\":\"東京都\"},{\"lang\":\"en\",\"text\":\"Tokyo\"}]",
objectId: "c4d558b5-f7f1-4aa4-a6a9-7be021b992b8",
overview: null,
pictures: [],
planName: "【テスト】都内の最狂スポット",
planSpotNames: [],
pvQtyAll: 0,
regularHoliday: null,
releaseCreateDatetime: "2021-07-07T11:36:22.07",
reviewAvg: 0,
searchCategories: [],
searchCategoryIds: [],
seo: null,
spotAccess: null,
spotName: null,
spotQty: 5,
subheading: null,
timeRequiredHour: 5,
timeRequiredMin: 40,
travelDate: null,
userName: "Yuri",
userPictureUrl: "https://remoju.blob.core.windows.net/e4a0da98-215c-4c98-86ee-623203b6b9d0/161889047129398e3f6fb438c3711a360cc777f093e44.jpg",
versionNo: 1
      }];
      
      this.state.set<PlanSpotList[]>(STATE_KEY_DETAIL, details);
      this.details$ = details;
    }
*/
    console.log(this.transferState);
    

      
      
  }

  ngOnDestroy(){
    this.onDestroy$.next();
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

  onScrollDown() {
    console.log("scrolled!")
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
      // case 8:
      //   this.rows.sort((a, b) => {
      //     return a.pvQtyWeek < b.pvQtyWeek ? 1 : -1;
      //   });
      //   break;
      // case 9:
      //   this.rows.sort((a, b) => {
      //     return a.planSpotQty < b.planSpotQty ? 1 : -1;
      //   });
      //   break;
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
      case 12:
        this.rows.sort((a, b) => {
          return a.id < b.id ? 1 : -1;
        });
        break;
      
    }
  }

  getDetails():PlanSpotList[]{
    let startIndex = 0;

    startIndex = (this.p - 1) * this.limit;
    this.end = startIndex + this.limit;

    if(this.rows.length - startIndex < this.limit)
      this.end = this.rows.length;

    let _details:PlanSpotList[];

    if(this.rows.length > 0){
      for (let i = startIndex; i < this.end; i++){
        this.planspots.fetchDetails2(this.rows[i])
          .pipe(takeUntil(this.onDestroy$))
          .subscribe(d => {
            console.log(d);
            const idx = this.rows.findIndex(v => v.id === d.id);
            _details = this.rows.slice(startIndex,this.end);
          });
      }
      this.p ++;
    }else{
      _details = this.rows.slice(0,0);
    }
    return _details;
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
            // // 非同期で戻された結果セットの順番を維持するための処理
            const idx = this.rows.findIndex(v => v.id === d.id);

            // // 掲載終了の場合は削除　isEndOfPublication
            // if(d.isEndOfPublication){
            //   // 削除処理
            // }else{
            //   this.rows[idx] = d;
            // }

            //console.log(this.rows[idx])
            //d.sort = i;
            this.rows[idx] = d;
            const _details = this.rows.slice(startIndex,this.end);
            this.transferState.set<PlanSpotList[]>(STATE_KEY_DETAIL, _details);   
            this.details$ = _details;
          })
      }
      this.p++;
    }

    // if (this.transferState.hasKey(STATE_KEY_DETAIL)) {
    //   this.details$ = this.transferState.get<PlanSpotList[]>(STATE_KEY_DETAIL, null);
    // } else {
    //   const _details = this.rows.slice(startIndex,this.end);
    //   this.transferState.set<PlanSpotList[]>(STATE_KEY_DETAIL, _details);
    //   this.details$ = _details;
    // }
  }
  /*
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

    //console.log(this.items);
  }
  */
  
}
