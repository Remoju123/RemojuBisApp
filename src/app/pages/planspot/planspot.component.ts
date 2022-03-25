import { Component, OnDestroy, OnInit, PLATFORM_ID, Inject, AfterViewChecked, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from '../../service/common.service';
import { IndexedDBService } from "../../service/indexeddb.service";
import { PlanSpotListService } from '../../service/planspotlist.service';
import { MyplanService } from '../../service/myplan.service';
import { ComfirmDialogParam, DataSelected, ListSelectMaster } from '../../class/common.class';
import { ListSearchCondition } from '../../class/indexeddb.class';
import { UpdFavorite } from '../../class/mypageplanlist.class';
import { CacheStore, PlanSpotList, tarms } from '../../class/planspotlist.class';
import { UserPlanData } from '../../class/user.class';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { SearchDialogComponent } from './components/search-dialog/search-dialog.component';
import { PlanspotListComponent } from './components/planspot-list/planspot-list.component';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { HttpUrlEncodingCodec } from '@angular/common/http';
import { LangFilterPipe } from "../../utils/lang-filter.pipe";
import { NgDialogAnimationService } from 'ng-dialog-animation';
import { UserDialogComponent } from 'src/app/parts/user-dialog/user-dialog.component';

export const PLANSPOT_KEY = makeStateKey<CacheStore>('PLANSPOT_KEY');
@Component({
  selector: 'app-planspot',
  templateUrl: './planspot.component.html',
  styleUrls: ['./planspot.component.scss']
})
export class PlanspotComponent implements OnInit, OnDestroy, AfterViewChecked {
  private onDestroy$ = new Subject();
  @ViewChild(PlanspotListComponent) private list: PlanspotListComponent;

  condition: ListSearchCondition;
  listSelectMaster: ListSelectMaster;

  rows: PlanSpotList[] = [];
  spots: PlanSpotList[] = [];
  plans: PlanSpotList[] = [];
  details$: PlanSpotList[] = [];
  count: number = 0;

  result: Observable<PlanSpotList>[] = [];

  myPlanSpots: any;

  p: number;
  limit: number;
  end: number;
  offset: number;

  $mSort: DataSelected[];
  sortval: number;
  optionKeywords: tarms;
  googleSearchArea: string = '----';

  isList: boolean = true;
  select: string;

  guid: string;

  prevkeyword: string;
  token: string;

  get lang() {
    return this.translate.currentLang;
  }

  codec = new HttpUrlEncodingCodec;

  isBrowser: boolean = false;

  constructor(
    private translate: TranslateService,
    private commonService: CommonService,
    private planspots: PlanSpotListService,
    private activatedRoute: ActivatedRoute,
    private indexedDBService: IndexedDBService,
    private myplanService: MyplanService,
    private transferState: TransferState,
    private router: Router,
    public dialog: MatDialog,
    public animationDialog: NgDialogAnimationService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.limit = 6;
    this.p = 1;
    this.condition = new ListSearchCondition();
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewChecked(): void {
    if (typeof this.offset !== "undefined") {
      if (this.list.isMobile) {
        if (this.offset > 0) {
          window.scrollTo(0, this.offset);
        }
        if (this.offset === window.pageYOffset) {
          this.offset = 0;
        }
      } else {
        if (this.offset > 0) {
          this.list.box.nativeElement.scrollTo(0, this.offset)
          this.offset = 0;
        }
      }
    }
  }

  async ngOnInit() {
    this.guid = await this.commonService.getGuid();
    this.recoveryQueryParams();

    if (this.transferState.hasKey(PLANSPOT_KEY)) {
      const cache = this.transferState.get<CacheStore>(PLANSPOT_KEY, null);
      this.rows = cache.data;
      this.end = cache.end;
      this.offset = cache.offset;
      this.details$ = this.rows.slice(0, this.end);
      this.p = cache.p - 1;
      this.condition.select = cache.select;
      this.condition.sortval = cache.sortval;
      this.condition.keyword = cache.keyword;
      this.$mSort = cache.mSort;
      this.count = cache.data.length;
      this.isList = cache.isList; //change
      this.listSelectMaster = cache.ListSelectMaster;
      this.optionKeywords = cache.optionKeywords;
      this.googleSearchArea = cache.googleSearchArea;
      if (cache.planSpotList) {
        this.onViewUserPost(cache.planSpotList);
      }

      this.transferState.remove(PLANSPOT_KEY);
      this.mergeNextDataSet(true);
      if (!cache.isDetail && this.rows.length > 0) {
        const details = this.rows.slice(0, this.end).filter(x => x.isDetail === true);
        if (details && details.length > 0) {
          this.details$[0].objectId = this.commonService.objectId;
          this.planspots.getFavorite(details).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
            r.forEach(x => {
              if (x.isDetail) {
                this.rows.find(y => y.isPlan === x.isPlan && y.id === x.id).isFavorite = x.isFavorite;
                this.details$.find(y => y.isPlan === x.isPlan && y.id === x.id).isFavorite = x.isFavorite;
              }
            });
          });
        }
      }
    } else {
      this.planspots.getPlanSpotListSearchCondition().pipe(takeUntil(this.onDestroy$)).subscribe(async r => {
        this.listSelectMaster = r;
        this.$mSort = r.mSort;
        this.isDetail();
      });

      let condition: any = await this.indexedDBService.getListSearchCondition();
      if (condition) {
        this.condition = condition;
      }
      this.getPlanSpotDataSet();
    }

    this.myplanService.FetchMyplanSpots();
    this.myplanService.MySpots$.subscribe(r => {
      this.myPlanSpots = r;
    });

    this.planspots.searchSubject.subscribe(r => {
      this.condition = r;
      this.indexedDBService.registListSearchCondition(this.condition);

      this.getPlanSpotDataSet();
    });

    this.myplanService.updFavirute$.pipe(takeUntil(this.onDestroy$)).subscribe(x => {
      let spot: PlanSpotList, spotDetail: PlanSpotList;
      if (x.type === 1) {
        spot = this.rows.find(planSpot => planSpot.isPlan === false && planSpot.id === x.spotId && !planSpot.googleSpot);
        spotDetail = this.details$.find(planSpot => planSpot.isPlan === false && planSpot.id === x.spotId && !planSpot.googleSpot);
      }
      else {
        spot = this.rows.find(planSpot => planSpot.isPlan === false && planSpot.id === x.spotId && planSpot.googleSpot);
        spotDetail = this.details$.find(planSpot => planSpot.isPlan === false && planSpot.id === x.spotId && planSpot.googleSpot);
      }
      if (spot) {
        spot.isFavorite = x.isFavorite;
      }
      if (spotDetail) {
        spotDetail.isFavorite = x.isFavorite;
      }
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
  }

  onScrollDown() {
    this.mergeNextDataSet();
  }

  recoveryQueryParams() {
    this.activatedRoute.queryParams.pipe(takeUntil(this.onDestroy$)).subscribe((params: Params) => {
      if ((params.aid && params.aid.length > 0)
        || (params.era && params.era.length > 0)
        || (params.cat && params.cat.length > 0)
        || (params.srt && params.srt.length > 0)
        || (params.lst && params.lst.length > 0)
        || (params.kwd && params.kwd.length > 0)
      ) {
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
      this.details$ = [];
      this.prevkeyword = null;
      this.token = null;
      this.count = 0;
      this.mergeNextDataSet();
    } else {
      this.p = 1;
      this.spots = [];
      this.plans = [];
      this.rows = [];
      if (this.condition.select === 'all' || this.condition.select === 'plan') {
        this.planspots.getPlanList().pipe(takeUntil(this.onDestroy$)).subscribe(r => {
          this.plans = r;
          this.isDetail();
        });
      }
      if (this.condition.select === 'all' || this.condition.select === 'spot') {
        this.planspots.getSpotList().pipe(takeUntil(this.onDestroy$)).subscribe(r => {
          this.spots = r;
          this.isDetail();
        });
      }
    }
  }

  async isDetail() {
    if (this.listSelectMaster
      && (this.condition.select === 'plan' || this.spots.length > 0)
      && (this.condition.select === 'spot' || this.plans.length > 0)) {
      const result = await this.planspots.filteringData(this.spots.concat(this.plans), this.condition, this.listSelectMaster);

      this.rows = result.list;
      this.optionKeywords = result.searchTarm;
      this.historyReplace(result.searchParams);
      this.count = result.list.length;
      this.mergeNextDataSet();
    }
  }

  async mergeNextDataSet(isComplement: boolean = false) {
    if (this.rows.length > 0) {
      this.isList = true;
      let startIndex = (this.p - 1) * this.limit;
      this.end = startIndex + this.limit;
      if (this.rows.length - startIndex < this.limit) {
        this.end = this.rows.length;
      }
      if (isComplement) {
        startIndex = 0;
      }

      for (let i = startIndex; i < this.end; i++) {
        if (this.rows[i].isDetail) {
          this.details$ = this.rows.slice(0, this.end);
          continue;
        }
        this.planspots.fetchDetails(this.rows[i], this.guid)
          .pipe(takeUntil(this.onDestroy$))
          .subscribe(d => {
            const idx = this.rows.findIndex(v => v.id === d.id);

            if (d.isEndOfPublication) {
              this.rows.splice(idx, 1);
              if (this.rows.length - startIndex < this.limit) {
                this.end = this.rows.length;
              }
            } else {
              this.rows[idx] = d;
              this.rows.forEach(x => x.userName = this.commonService.isValidJson(x.userName, this.lang));
            }
            this.details$ = this.rows.slice(0, this.end);
            if (i === this.end - 1 && isPlatformServer(this.platformId)) {
              this.setTransferState(false);
            }
          })
      }
      this.p++;
    } else {
      this.details$ = [];
      this.isList = false;
      this.condition.select = 'google';
      const keyword = this.condition.keyword;
      if (keyword !== null && ((this.prevkeyword === keyword && this.token) || (this.prevkeyword !== keyword))) {
        (await this.planspots.getGoogleSpotList(keyword, this.condition.googleAreaId, this.token)).pipe(takeUntil(this.onDestroy$)).subscribe(g => {
          this.prevkeyword = keyword;
          this.details$ = this.details$.concat(g.planSpotList);
          this.count += g.planSpotList.length;
          this.token = g.tokenGoogle;
        })
      }
    }
  }


  historyReplace(searchParams: string): void {
    if (isPlatformBrowser(this.platformId)) {
      if (searchParams.length > 19) {
        history.replaceState(
          "search_key",
          "",
          location.pathname.substring(0) + "?" + searchParams
        );
      } else {
        history.replaceState(
          "search_key",
          "",
          location.pathname.substring(0)
        );
      }
      // history back desabled
      // history.pushState(null, null, null);
      // window.onpopstate = () => {
      //   history.pushState(null, null, null);
      // }
    }
  }

  // キーワード検索
  keywordSearch(v: any) {
    setTimeout(() => {
      this.condition.keyword = v;
      this.indexedDBService.registListSearchCondition(this.condition);
      this.getPlanSpotDataSet();
    }, 100);
  }

  // 表示順
  sortChange(v: any) {
    this.condition.sortval = v;
    this.indexedDBService.registListSearchCondition(this.condition);
    this.getPlanSpotDataSet();
  }

  // プランスポット切り替え
  onPlanSpotChange(val: any) {
    this.select = val;
    this.condition.select = val;
    this.indexedDBService.registListSearchCondition(this.condition);
    this.getPlanSpotDataSet();
  }

  // プラン/スポット詳細リンク
  linktoDetail(item: PlanSpotList) {
    this.setTransferState(true);

    if (item.isPlan) {
      this.router.navigate(["/" + this.lang + "/plans/detail", item.id]);
    } else if (item.googleSpot) {
      this.commonService.locationPlaceIdGoogleMap(this.lang, item.googleSpot.latitude, item.googleSpot.longitude, item.googleSpot.place_id);
    } else {
      this.router.navigate(["/" + this.lang + "/spots/detail", item.id]);
    }
  }

  setTransferState(isDetail: boolean, planSpotList: PlanSpotList = null) {
    let _offset: number;
    if (this.list.isMobile) {
      _offset = window.pageYOffset;
    } else {
      _offset = this.list.scrollPos
    }
    const c = new CacheStore();
    c.data = this.rows;
    c.p = this.p;
    c.end = this.end;
    c.offset = _offset;
    c.select = this.condition.select;
    c.sortval = this.condition.sortval;
    c.mSort = this.$mSort;
    c.keyword = this.condition.keyword;
    c.isList = this.isList;
    c.ListSelectMaster = this.listSelectMaster;
    c.optionKeywords = this.optionKeywords;
    c.googleSearchArea = this.googleSearchArea;
    c.isDetail = isDetail;
    c.planSpotList = planSpotList;

    this.transferState.set<CacheStore>(PLANSPOT_KEY, c);
  }

  // 検索パネル(エリア・カテゴリー選択)
  openDialog(e: number) {
    this.listSelectMaster.tabIndex = e;
    this.listSelectMaster.isGoogle = this.condition.select === 'google';
    this.listSelectMaster.planSpotList = this.rows;

    const dialogRef = this.dialog.open(SearchDialogComponent, {
      maxWidth: "100%",
      width: "92vw",
      position: { top: "10px" },
      data: this.listSelectMaster,
      autoFocus: false,
      id: "searchDialog"
    });

    dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe(condition => {
      if (condition !== 'cancel') {
        // ローカル変数配列の重複除外
        condition.areaId = Array.from(new Set(condition.areaId));
        condition.areaId2 = Array.from(new Set(condition.areaId2));
        this.indexedDBService.registListSearchCondition(condition);
        this.condition = condition;
        if (this.condition.select === 'google') {
          const langpipe = new LangFilterPipe();
          const googleAreas: any[] = [];
          this.condition.googleAreaId?.forEach(v => {
            googleAreas.push(langpipe.transform(this.listSelectMaster.mArea.find(x => x.parentId === v).parentName, this.translate.currentLang));
          });
          this.googleSearchArea = googleAreas.length > 0 ? googleAreas.join(' 、') : '----';
        }
        this.getPlanSpotDataSet();
      }
    });
  }

  // 検索条件リセット
  conditionReset() {
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
  }

  // プランに追加
  async addMyPlan(item: PlanSpotList) {
    const tempqty: number = item.isPlan ? item.spotQty : 1;
    if (await this.commonService.checkAddPlan(tempqty) === false) {
      const param = new ComfirmDialogParam();
      param.text = "ErrorMsgAddSpot";
      param.leftButton = "EditPlanProgress";
      const dialog = this.commonService.confirmMessageDialog(param);
      dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
        if (d === "ok") {
          // 編集中のプランを表示
          this.commonService.onNotifyIsShowCart(true);
        }
      });
      return;
    }

    this.planspots.addPlan(
      item.id,
      item.isPlan,
      this.guid,
      item.isRemojuPlan,
      item.googleSpot ? true : false,
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
  setFavorite(item: PlanSpotList) {
    item.isFavorite = !item.isFavorite;
    if (!item.isPlan) {
      const param = new UpdFavorite();
      param.spotId =  item.id;
      param.type = item.googleSpot ? 2: 1
      param.isFavorite = item.isFavorite;
      this.myplanService.updateFavorite(param);
    }
    this.planspots.registFavorite(
      item.id,
      item.isPlan,
      item.isFavorite,
      item.isRemojuPlan,
      this.guid,
      item.googleSpot ? true : false,
      item.googleSpot
    )
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(() => {
        //this.mypageFavoriteListService.GetFavoriteCount(this.guid);
      });

  }

  onViewUserPost(item: PlanSpotList) {
    this.setTransferState(true, item);

    const param = new UserPlanData();
    param.user = item.user;
    param.userPlanSpotList = item.userPlanList;

    this.animationDialog.open(UserDialogComponent, {
      id: "userplanlist",
      maxWidth: "100%",
      width: "100%",
      height: "100%",
      position: { top: "0" },
      data: param,
      autoFocus: false,
      animation: {
        to: "left",
        incomingOptions: {
          keyframeAnimationOptions: { duration: 300, easing: "steps(8, end)" }
        }
      }
    });
  }
}
