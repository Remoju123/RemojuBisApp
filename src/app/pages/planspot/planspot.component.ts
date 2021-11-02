import { Component, OnDestroy, OnInit, PLATFORM_ID, Inject,AfterViewChecked} from '@angular/core';
import { ActivatedRoute, Params, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ListSearchCondition } from 'src/app/class/indexeddb.class';
import { IndexedDBService } from "../../service/indexeddb.service";
import { MyPlanApp, ComfirmDialogParam, DataSelected, ListSelectMaster } from 'src/app/class/common.class';
import { PlanSpotListService } from 'src/app/service/planspotlist.service';
import { CacheStore, PlanSpotList, tarms } from 'src/app/class/planspotlist.class';
import { isPlatformBrowser } from '@angular/common';
import { CommonService } from 'src/app/service/common.service';
import { TranslateService } from '@ngx-translate/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { SearchDialogComponent } from './components/search-dialog/search-dialog.component';
import { MypageFavoriteListService } from 'src/app/service/mypagefavoritelist.service';
import { MyplanService } from 'src/app/service/myplan.service';
import { HttpUrlEncodingCodec } from '@angular/common/http';
import { LangFilterPipe } from "../../utils/lang-filter.pipe";


export const PLANSPOT_KEY = makeStateKey<CacheStore>('PLANSPOT_KEY');
export const PLANSPOTLIST_KEY = makeStateKey<PlanSpotList[]>('PLANSPOTLIST_KEY');
@Component({
  selector: 'app-planspot',
  templateUrl: './planspot.component.html',
  styleUrls: ['./planspot.component.scss']
})
export class PlanspotComponent implements OnInit,OnDestroy, AfterViewChecked {
  private onDestroy$ = new Subject();

  condition: ListSearchCondition;
  listSelectMaster: ListSelectMaster;

  rows: PlanSpotList[] = [];
  temp: PlanSpotList[] = [];
  details$:PlanSpotList[] = [];
  count: number = 0;

  result:Observable<PlanSpotList>[] = [];

  myPlanSpots:any;

  p: number;
  limit: number;
  end: number;
  offset:number;

  $mSort: DataSelected[];
  sortval:number;
  optionKeywords: tarms;
  googleSearchArea: string = '----';

  isList:boolean = true;
  select:string;

  guid:string;

  prevkeyword: string;
  token: string;

  get lang() {
    return this.translate.currentLang;
  }

  codec = new HttpUrlEncodingCodec;

  constructor(
    private translate: TranslateService,
    private commonService: CommonService,
    private planspots: PlanSpotListService,
    private activatedRoute: ActivatedRoute,
    private indexedDBService: IndexedDBService,
    private mypageFavoriteListService: MypageFavoriteListService,
    private myplanService: MyplanService,
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
    this.guid= await this.commonService.getGuid();
    this.recoveryQueryParams();

    // 共有プランの場合
    this.activatedRoute.paramMap.pipe(takeUntil(this.onDestroy$)).subscribe(async (params: ParamMap) => {
      const id = params.get("id");
      if (id){
        await this.checkPlan(id);
      }
    });

    this.planspots.getPlanSpotListSearchCondition().pipe(takeUntil(this.onDestroy$)).subscribe(async r => {
      this.listSelectMaster = r;
      this.listSelectMaster.isList = true;
      this.$mSort = r.mSort;
    });

    if(this.transferState.hasKey(PLANSPOT_KEY)){
      this.cacheRecoveryDataSet();
    }else{
      let condition: any = await this.indexedDBService.getListSearchCondition();
      if (condition){
        this.condition = condition;
      }
      this.getPlanSpotDataSet();
    }

    this.planspots.searchFilter
    .pipe(takeUntil(this.onDestroy$))
    .subscribe(result => {
      this.rows = result.list;
      this.temp = [...this.rows];
      this.optionKeywords = result.searchTarm;
      this.historyReplace(result.searchParams);
      this.count = result.list.length;
    })

    this.myplanService.FetchMyplanSpots();
    this.myplanService.MySpots$.subscribe(r=>{
      this.myPlanSpots = r;
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
       || (params.kwd && params.kwd.length > 0)
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
        this.condition.keyword = params.kwd;

        this.indexedDBService.registListSearchCondition(this.condition);
      }
    })
  }

  async getPlanSpotDataSet() {
    if (this.condition.select === 'google') {
      this.rows = [];
      this.temp = [];
      this.details$ = [];
      this.prevkeyword = null;
      this.token = null;
      this.count = 0;

      this.mergeNextDataSet();
    } else {
      this.planspots.getPlanSpotList().pipe(takeUntil(this.onDestroy$)).subscribe(r => {
        // trasferState save list
        this.transferState.set<PlanSpotList[]>(PLANSPOTLIST_KEY,r);

        this.planspots.filteringData(r,this.condition,this.listSelectMaster);
        this.mergeNextDataSet();
      });
    }
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
      //if(this.condition.select !== 'plan'){
      if(this.condition.select === 'google'){
        const keyword = this.condition.keyword;
        if(keyword !== null && ((this.prevkeyword === keyword && this.token) || (this.prevkeyword !== keyword))){
          (await this.planspots.getGoogleSpotList(keyword, this.condition.googleAreaId, this.token)).subscribe(g => {
            this.prevkeyword = keyword;
            this.details$ = this.details$.concat(g.planSpotList);
            this.count += g.planSpotList.length;
            this.token = g.tokenGoogle;
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
    this.listSelectMaster = cache.ListSelectMaster;
    this.optionKeywords = cache.optionKeywords;
    this.googleSearchArea = cache.googleSearchArea;

    this.transferState.remove(PLANSPOT_KEY);
  }

  historyReplace(searchParams:string):void{
    if(isPlatformBrowser(this.platformId)){
      if(searchParams.length>19){
        history.replaceState(
          "search_key",
          "",
          location.pathname.substring(1, location.pathname.lastIndexOf("/")) + "?" + searchParams
        );
      } else {
        history.replaceState("search_key", "", location.pathname.substring(1, location.pathname.lastIndexOf("/")));
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
    setTimeout(() => {
      this.condition.keyword = v;
      this.indexedDBService.registListSearchCondition(this.condition);
      this.getPlanSpotDataSet();
      this.p = 1;
    }, 100);
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
    c.ListSelectMaster = this.listSelectMaster;
    c.optionKeywords = this.optionKeywords;
    c.googleSearchArea = this.googleSearchArea;

    this.transferState.set<CacheStore>(PLANSPOT_KEY,c);
    // 5digits or more is Plan
    if(id > 10000){
      this.router.navigate(["/" + this.lang + "/spots/detail",id]);
    }else{
      this.router.navigate(["/" + this.lang + "/plans/detail",id]);
    }
  }

  // 検索パネル(エリア・カテゴリー選択)
  openDialog(e: number){
    this.listSelectMaster.tabIndex = e;
    this.listSelectMaster.isGoogle = this.condition.select === 'google';

    const dialogRef = this.dialog.open(SearchDialogComponent, {
      maxWidth: "100%",
      width: "92vw",
      position: { top: "10px" },
      data: this.listSelectMaster,
      autoFocus: false,
      id:"searchDialog"
    });

    dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe(condition => {
      if (condition !== 'cancel'){
        // ローカル変数配列の重複除外
        condition.areaId = Array.from(new Set(condition.areaId));
        condition.areaId2 = Array.from(new Set(condition.areaId2));
        this.indexedDBService.registListSearchCondition(condition);
        this.condition = condition;
        if (this.condition.select === 'google') {
          const langpipe = new LangFilterPipe();
          const googleAreas:any[] = [];
          this.condition.googleAreaId?.forEach(v => {
            googleAreas.push(langpipe.transform(this.listSelectMaster.mArea.find(x=>x.parentId === v).parentName, this.translate.currentLang));
          });
          this.googleSearchArea = googleAreas.length > 0 ? googleAreas.join(' 、'):'----';
        }
        this.getPlanSpotDataSet();
        this.p = 1;
        this.transferState.remove(PLANSPOTLIST_KEY);
      }
    });
  }

  // 検索条件リセット
  conditionReset(){
    this.commonService.scrollToTop();

    if (this.condition.select === 'google') {
      this.condition.googleAreaId = [];
    } else {
      this.condition.areaId = [];
      this.condition.areaId2 = [];
      this.condition.searchCategories = [];
    }
    this.condition.keyword = "";
    this.indexedDBService.registListSearchCondition(this.condition);
    this.getPlanSpotDataSet();
    this.p = 1;
  }

  // プランに追加
  async addMyPlan(item:PlanSpotList){
    const tempqty:number = item.isPlan===1 ? item.spotQty : 1;
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
      item.isRemojuPlan,
      item.id,
      item.isPlan,
      item.googleSpot
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

  // お気に入り登録・除外
  setFavorite(item:PlanSpotList){
    this.planspots.registFavorite(
      item.id,
      item.isPlan,
      !item.isFavorite,
      item.isRemojuPlan,
      this.guid,
      item.googleSpot
    )
    .pipe(takeUntil(this.onDestroy$))
    .subscribe(()=>{
      this.mypageFavoriteListService.GetFavoriteCount(this.guid);
    });
    item.isFavorite = !item.isFavorite;
  }

  async checkPlan(id: string){
    // 編集中のプランを取得
    let myPlan: any = await this.indexedDBService.getEditPlan();
    const myPlanApp: MyPlanApp = myPlan;

    if (myPlanApp && !myPlanApp.isSaved){
      // 確認ダイアログの表示
      const param = new ComfirmDialogParam();
      param.title = "EditPlanConfirmTitle";
      param.text = "EditPlanConfirmText";
      const dialog = this.commonService.confirmMessageDialog(param);
      dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
        if (d === "ok") {
          // 編集中のプランを表示
          this.commonService.onNotifyIsShowCart(true);
        } else {
          // 共有プランを開く
          this.openSharedPlan(id);
        }
      });
    } else {
      // 共有プランを開く
      this.openSharedPlan(id);
    }
  }

  openSharedPlan(id: string){
    // DBから取得
    this.myplanService.getPlanUser(id).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
      if (!r) {
        // this.router.navigate(["/" + this.currentlang + "/systemerror"]);
        // return;
      }
      // プラン作成に反映
      this.myplanService.onPlanUserChanged(r);
      // プランを保存
      this.indexedDBService.registPlan(r);
      // マイプランパネルを開く
      this.commonService.onNotifyIsShowCart(true);
    });
  }
}
