import { Component, OnInit,OnDestroy, ChangeDetectorRef, Inject, PLATFORM_ID } from "@angular/core";
import { ActivatedRoute, Params, ParamMap, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { CommonService } from "../../service/common.service";
import { IndexedDBService } from "../../service/indexeddb.service";
import { MyplanService } from '../../service/myplan.service';
import { SpotService } from "../../service/spot.service";
import { SpotListService } from "../../service/spotlist.service";
import {
  ListSelected,
  DataSelected,
  ComfirmDialogParam,
  MyPlanApp,
  CacheSpots
} from "../../class/common.class";
import { ListSearchCondition } from "../../class/indexeddb.class";
import { SpotAppList, searchResult } from "../../class/spotlist.class";
import { MatDialog } from "@angular/material/dialog";
import { SearchDialogFormComponent } from "../../parts/search-dialog-form/search-dialog-form.component";
import { LangFilterPipe } from "../../utils/lang-filter.pipe";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoadingIndicatorService } from '../../service/loading-indicator.service';
import { isPlatformBrowser } from "@angular/common";

@Component({
  selector: "app-spot-list",
  templateUrl: "./spot-list.component.html",
  styleUrls: ["./spot-list.component.scss"]
})
export class SpotListComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject();

  constructor(
    public router: Router,
    private commonService: CommonService,
    private indexedDBService: IndexedDBService,
    private myplanService: MyplanService,
    private spotService: SpotService,
    private spotListService: SpotListService,
    private translate: TranslateService,
    public dialog: MatDialog,
    private loading:LoadingIndicatorService,
    private activatedRoute: ActivatedRoute,
    private cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId:Object  ) { }

  // 絞り込み、ソート等、一覧保持用
  rows: SpotAppList[] = [];
  // スポット一覧全件(編集不可)
  temp: SpotAppList[] = [];
  // 一覧バインド用
  details: SpotAppList[] = [];

  // ソートデフォルト値
  sortval = 5;

  keyword: string;
  optionKeywords: string[];

  $mSort: DataSelected[];

  // 検索条件
  condition: ListSearchCondition;
  // 検索条件選択値
  listSelected: ListSelected;

  // ページング
  p: number;
  // スクロールした時に表示更新する件数
  pageSize: number = 6;
  // 最終表示位置
  end:number;
  // window.pageYOffset(詳細から戻ったときの位置復元時に使用)
  offset = 0;

  //GUID
  guid: string;

  get lang() {
    return this.translate.currentLang;
  }

  // loadingObject refer
  ref:any;

  // myプランに入っているスポット
  myPlanSpots:any;

  /*------------------------------
   *
   * イベント
   *
   * -----------------------------*/

  ngOnInit() {
  // URLパラメータ判定(外部リンク対応)
    this.activatedRoute.queryParams.pipe(takeUntil(this.onDestroy$)).subscribe((params: Params) => {
      if ((params.aid && params.aid.length > 0)
      || (params.era && params.era.length > 0)
      || (params.cat && params.cat.length > 0)
      || (params.opt && params.opt.length > 0)) {
        this.recoveryQueryParams(params);
      }
      this.getSpotList();
    });

    // 共有プランの場合
    this.activatedRoute.paramMap.pipe(takeUntil(this.onDestroy$)).subscribe((params: ParamMap) => {
      const id = params.get("id");
      if (id){
        // 編集中のプランを確認して共有プランを開く
        this.checkPlan(id);
      }
    });

    
    this.spotListService.searchFilter.pipe(takeUntil(this.onDestroy$)).subscribe((result:searchResult)=>{
      this.rows = result.list;
      this.temp = [...this.rows];
      this.optionKeywords = result.searchTarm!="" ? result.searchTarm.split(","):[];
      // location.pathname　/言語/spots～　または　/言語/sharedplan～ ⇒/を抜くためのsubstring(1)
      let url = location.pathname.substring(1);
      
      /* --only browser task: browser object history,location -- */
      if(isPlatformBrowser(this.platformId)){
        // 共有プランの場合、spotsにする
        if(location.pathname.includes("sharedplan")){
          // 共有プランのURL：/言語/sharedplan/XXXXXXXXXXXXXXXXXXX　言語/を抜き出し、＋spotsを付ける
          // +2　⇒ substringで/を抜いているので+1、indexOfなので+1
          url = location.pathname.substring(1, location.pathname.substring(1).indexOf("/") + 2) + "spots";
        }
        if(result.searchParams.length>19){
          history.replaceState(
            "search_key",
            "",
            url + "?" + result.searchParams
          );
        } else {
          history.replaceState("search_key", "", url);
        }
      }
      /* --only browser task: browser object history,location -- */

      // 条件更新
      this.recoveryQueryParams(result.searchParamsObj);
      
      // 詳細データを初期化
      this.p = 1;
      // キーワードをクリア
      this.keyword = "";
      // ソート
      this.listsort(this.rows, this.sortval);
    });

    ////---- TDB: NG0100 Cause 202106051835MM ------
    this.myplanService.FetchMyplanSpots();
    this.myplanService.MySpots$.subscribe((v)=>{
      this.myPlanSpots = v;
    });
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

  // スポット詳細へ遷移
  linktoSpot(id:any){
    const c = new CacheSpots();
    c.count = this.end;
    c.offset = window.pageYOffset;
    c.data = this.rows;
    c.keyword = this.keyword;
    sessionStorage.setItem("caches",JSON.stringify(c));

    this.router.navigate(["/" + this.lang + "/spots/detail/", id]);
  }
  
  selectedChange(index: number){
    if(index === 1){
      this.router.navigate([location.pathname.replace("spots", "plans")]);
    }
  }

  recoveryQueryParams(params:any){
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
      params.opt && params.opt.length > 0 ? params.opt.split(",").map(Number) : [];
    // 検索条件更新
    this.indexedDBService.registListSearchConditionSpot(this.condition);
  }
  
  /*------------------------------
   *
   * メソッド
   *
   * -----------------------------*/

  // スポット一覧取得
  async getSpotList() {
    let isTollSpot = false;

    // 有料スポットの場合、画像を表示
    const tollSpotUrl = this.commonService.getTollSpotUrl();
    if (tollSpotUrl){
      isTollSpot = true;
      this.sortval = 0;
    }

    // ロゴ変更通知
    this.commonService.onlogoChange();

    this.spotListService.getSpotListSearchCondition(isTollSpot).pipe(takeUntil(this.onDestroy$)).subscribe(async r => {
      this.listSelected = r;
      this.$mSort = r.mSort;

      // 検索条件選択値取得
      let condition: any = await this.indexedDBService.getListSearchConditionSpot();
      if (condition){
        this.condition = condition;
      } else {
        this.condition = new ListSearchCondition();
      }

      // GUID取得
      this.guid = await this.commonService.getGuid();
      // ローディング開始
      // this.ref = this.loading.show();

      this.spotListService.getSpotList(tollSpotUrl).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
        // 有料スポットの場合、エリアIDを設定
        if (r.tollSpotAreaId){
          this.recoveryQueryParams({ aid: String(r.tollSpotAreaId) , era: "", cat: "", opt: ""});
        }

        this.p = 1;
        // 予算枠
        this.spotService.budgetFrame = r.budgetFrame;
        // 営業曜日
        this.spotService.businessday = r.businessDay;

        // 検索処理用にlistSelected_classにスポットリストデータを追加
        this.listSelected.spotList = r.spotAppList;

        // 検索結果フィルタリング処理
        this.spotListService.getSearchFilter(this.listSelected,this.condition);
      });
    });
  }

  // スポット一覧詳細取得
  getSpotListDetail() {    
    let startidx = 0;
    /* --only browser task: browser object sessionStorage -- */
    if(isPlatformBrowser(this.platformId)){
      // 前回の表示位置を取得
      const cache = sessionStorage.getItem("caches");
      // 表示位置を復元する場合
      if (cache){
        let d :CacheSpots = JSON.parse(cache);
        // 一覧の内容を復元
        this.rows = d.data;// Object.assign(this.rows, d.data);
        // 表示グループ
        this.p = Math.floor(d.count/this.pageSize);
        // 最終表示位置
        this.end = d.count;
        // 表示する一覧を復元
        this.details = this.rows.slice(0,this.end);
        // スクロール位置
        this.offset = d.offset;
        // キーワード
        this.keyword = d.keyword;
        // 復元したら削除
        sessionStorage.removeItem("caches");
        // ローディングを閉じる
        if(this.ref){
          this.ref.close();
        }        
      } else {
        // 表示開始位置 = 表示グループ * 6(初回0、次の更新時 1 * 6 = 6)
        startidx = (this.p - 1) * this.pageSize;
        // 最終表示位置(初回、6、次の更新時　6 + 6 = 12)
        this.end = startidx + this.pageSize;
        // 最終グループ表示の場合、最終表示位置を一覧の最大件数にする
        // 全件が1000件の場合、最終グループ表示時、p=167 startidx=996 end=996+6=1002⇒1000
        if(this.rows.length - startidx < this.pageSize){
          this.end = this.rows.length;
        }
      }
    }
    /* --only browser task: browser object sessionStorage -- */

    // 詳細取得判定用（初期化）
    if (this.rows.length > 0){
      let arr = [];
      for (let i = startidx; i < this.end; i++) {
        if (!this.rows[i].googleSpot && !this.rows[i].isDetail) {
          this.rows[i].guid = this.guid;
          this.spotListService
            .getSpotListDetail(
              this.rows[i])
            .pipe(takeUntil(this.onDestroy$))
            .subscribe(d => {
              const idx = this.rows.findIndex(v => v.spotId === d.spotId);
              // 掲載終了の場合、削除する
              if (d.isEndOfPublication) {
                // tempから削除
                this.temp.splice(this.temp.findIndex(x => x.spotId = this.rows[idx].spotId), 1);
                // rowsからも削除
                this.rows.splice(idx, 1);
                // endを調整
                if(this.rows.length - startidx < this.pageSize){
                  this.end = this.rows.length;
                }
              } else {
                this.spotListService.dataFormat(d);
                this.rows[idx] = d;
              }
              this.details = this.rows.slice(0,this.end);
              // arr.push("x");
              // this.commonService.onNotifyIsLoadingFinish(this.pageSize >= arr.length ? true : false);
          });
        } else {
          this.details = this.rows.slice(0,this.end);
        }
      }
      this.p++;
    } else {
      this.details = this.rows.slice(0,0);
    }

    //　ローディング終了処理
    this.commonService.isloadfin$.subscribe(r=>{
      if(r){
        if(this.ref){
          this.ref.close();
        }        
      }
    });
  }
    
  

  // スクロール
  onScrollDownSpot() {
    this.getSpotListDetail();
  }

  openDialog(e: any) {
    this.listSelected.tabIndex = e;

    const dialogRef = this.dialog.open(SearchDialogFormComponent, {
      maxWidth: "100%",
      width: "92vw",
      position: { top: "10px" },
      data: this.listSelected,
      autoFocus: false
    });

    dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe(result => {
      this.p = 1;
      this.rows = result;
      this.listsort(this.rows, this.sortval);  
    });
  }
  
  getGoogleSpot(val: string) {
    return new Promise<SpotAppList[]>(resolve => {
      this.spotListService.getGoogleSpotList(val, this.lang, this.guid)
        .pipe(takeUntil(this.onDestroy$))
        .subscribe(
        result => {
          resolve(result);
        },
        () => {
          // reject(error);
        }
      );
    });
  }

  // キーワード検索
  updateFilter(e:any) {
    const val = e.target.value.toLowerCase();

    //　該当するキーワードが検索対象項目に部分一致するスポットを絞り込む
    let _temp = this.temp.filter(d => {
      let keys = JSON.parse(d.seoKeyword).concat(JSON.parse(d.areaName),JSON.parse(d.spotName),JSON.parse(d.subheading),JSON.parse(d.address),JSON.parse(d.address));
      return JSON.stringify(keys).toLowerCase().indexOf(val) !== -1 || !val;
    });

    // 詳細データを初期化
    this.p = 1;

    // 検索結果が10件に満たない場合、Googleスポットを補完する
    if (_temp.length < 10) {
      const langpipe = new LangFilterPipe();
      this.getGoogleSpot(val)
        .then(result => {
          // Remojuスポットと同じスポットは削除
          let googleSpots = result.filter(result => {
            const tmp = _temp.filter(row => {
              if (langpipe.transform(JSON.parse(row.spotName), this.lang) === result.googleSpot.spot_name) {
                return result;
              }
              return "";
            });
            if (tmp.length === 0){
              return result;
            }
            return "";
          })
          // Remojuスポットをスポット名でソート
          _temp = this.spotNameSort(_temp, val, true);
          // Googleスポット名でソート
          googleSpots = this.spotNameSort(googleSpots, val, false);
          _temp = _temp.concat(googleSpots);
        })
        .then(() => {
          this.rows = _temp;
          this.getSpotListDetail();
        });
    } else if (val) {
      this.spotNameSort(_temp, val, true);
      this.rows = _temp;
      // 詳細補完
      this.getSpotListDetail();
    } else {
      this.rows = _temp;
      // ソート、詳細補完
      this.listsort(this.rows, this.sortval);
    }
  }

  // スポット名にキーワードが早く登場する順に並び替える
  spotNameSort(rows: SpotAppList[], keyword: string, isRemoju: boolean){
    return rows.sort((a, b) => {
      let aIndex: number, bIndex : number;
      if (isRemoju) {
        aIndex = a.spotName.indexOf(keyword);
        bIndex = b.spotName.indexOf(keyword);
      } else {
        aIndex = a.googleSpot.spot_name.indexOf(keyword);
        bIndex = b.googleSpot.spot_name.indexOf(keyword);
      }
      if (aIndex === -1 || aIndex === null){
        aIndex = 999999;
      }
      if (bIndex === -1 || bIndex === null) {
        bIndex = 999999;
      }
      return aIndex > bIndex ? 1 : -1;
    });
  }

  sortChange(e: { value: number }) {
    this.p = 1;
    this.sortval = e.value;
    this.listsort(this.rows, e.value);
  }

  async listsort(rows: SpotAppList[], v: number) {
    let _temp: SpotAppList[];
    
    switch (v) {
      // 有料スポットの近い順
      case 0:
        // 昇順
        _temp = rows.sort((a, b) => {
          return a.nearestOrder > b.nearestOrder ? 1 : -1;
        });
        break;
      // ページビュー順
      case 1:
        _temp = rows.sort((a, b) => {
          return a.pvQtyAll < b.pvQtyAll ? 1 : -1;
        });
        break;
      case 2:
        _temp = rows.sort((a, b) => {
          return a.pvQtyWeek < b.pvQtyWeek ? 1 : -1;
        });
        break;
      case 3:
        _temp = rows.sort((a, b) => {
          return a.planSpotQty < b.planSpotQty ? 1 : -1;
        });
        break;
      case 4:
        _temp = rows.sort((a, b) => {
          return a.reviewAvg < b.reviewAvg ? 1 : -1;
        });
        break;
      // 新着順
      case 5:
        _temp = rows.sort((a, b) => {
          return a.releaseCreateDatetime < b.releaseCreateDatetime ? 1 : -1;
        });
        break;
      // ユーザの居場所から近い順
      case 6:
        // ユーザの居場所取得
        const location = await this.spotListService.getGeoLocation();
        if (
          location.errorCd === null &&
          location.latitude !== null &&
          location.longitude !== null
        ) {
        // 昇順
          _temp = rows.sort((a, b) => {
            return Math.abs(a.latitude - location.latitude) + Math.abs(a.longitude - location.longitude)
            > Math.abs(b.latitude - location.latitude) + Math.abs(b.longitude - location.longitude) ? 1 : -1;
          });
        } else {
          this.commonService.messageDialog("FailLocationInfo");
        }
        break;
      case 19:
        const highlightAreas = this.listSelected.mArea.filter(x => x.isHighlight === true);
        _temp = rows.sort((a, b) => {
          // 都道府県で並び替え
          if(a.areaId !== b.areaId){
            const highlightAreaA = highlightAreas.find(x => x.parentId === a.areaId);
            const highlightAreaB = highlightAreas.find(x => x.parentId === b.areaId);
            if (highlightAreaA && highlightAreaB || !highlightAreaB && !highlightAreaB) {
              return a.areaId > b.areaId ? 1 : -1
            } else if (highlightAreaA){
              return -1;
            } else {
              return 1;
            }
          }
          // 地区で並び替え
          if(a.areaId2 !== b.areaId2){
            return a.areaId2 > b.areaId2 ? 1 : -1
          }
          return 0          
        });
        break;
      }
    // return temp;
    // 検索結果補完
    //this.ref = this.loading.show();
    this.getSpotListDetail();
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
      param.leftButton = "Cancel";
      param.rightButton = "OK";
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
