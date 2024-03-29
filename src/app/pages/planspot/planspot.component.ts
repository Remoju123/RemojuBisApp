import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Inject,
  AfterViewChecked,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from '../../service/common.service';
import { GaService } from '../../service/ga.service';
import { IndexedDBService } from '../../service/indexeddb.service';
import { PlanSpotListService } from '../../service/planspotlist.service';
import { MyplanService } from '../../service/myplan.service';
import {
  ComfirmDialogParam,
  DataSelected,
  ListSelectMaster,
} from '../../class/common.class';
import { ListSearchCondition } from '../../class/indexeddb.class';
import { UpdFavorite } from '../../class/mypageplanlist.class';
import {
  CacheStore,
  PlanSpotList,
  tarms,
} from '../../class/planspotlist.class';
import { UserPlanData } from '../../class/user.class';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { SearchDialogComponent } from './components/search-dialog/search-dialog.component';
import { PlanspotListComponent } from './components/planspot-list/planspot-list.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpUrlEncodingCodec } from '@angular/common/http';
import { NgDialogAnimationService } from 'ng-dialog-animation';
import { UserDialogComponent } from 'src/app/parts/user-dialog/user-dialog.component';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { BannerType } from 'src/app/class/banner.class';
import { BannerService } from 'src/app/service/banner.service';

import { MyplanMemoClearPipe } from 'src/app/utils/myplan-memo-clear.pipe';
import { timeStamp } from 'console';

export const PLANSPOT_KEY = makeStateKey<CacheStore>('PLANSPOT_KEY');

@Component({
  selector: 'app-planspot',
  templateUrl: './planspot.component.html',
  styleUrls: ['./planspot.component.scss'],
})
export class PlanspotComponent implements OnInit, OnDestroy, AfterViewChecked {
  private onDestroy$ = new Subject();
  @ViewChild(PlanspotListComponent) private list: PlanspotListComponent;

  condition: ListSearchCondition;
  listSelectMaster: ListSelectMaster;

  source: PlanSpotList[] = [];

  rows: PlanSpotList[] = [];
  spots: PlanSpotList[] = [];
  plans: PlanSpotList[] = [];
  details$: PlanSpotList[] = [];
  count: number = 0;

  // google search another holder
  googles$: PlanSpotList[] = [];

  $close: boolean = false;

  result: Observable<PlanSpotList>[] = [];

  myPlanSpots: any;

  p: number = 1;
  limit: number;
  end: number;
  offset: number;
  num: number;

  $mSort: DataSelected[];
  sortval: number;
  optionKeywords: tarms;
  searchParams: string;

  isList: boolean = true;

  guid: string;

  prevkeyword: string;
  token: string;
  loading: boolean;

  //switch: boolean = false;

  isClearSearch: boolean = false;

  get lang() {
    return this.translate.currentLang;
  }

  codec = new HttpUrlEncodingCodec();

  isBrowser: boolean = false;

  isMobile: boolean;

  //banner$: Observable<BannerType[]> | undefined;

  banners: any[];

  noPic: string = '../../../../assets/img/nopict.png';

  isSelectorShow: boolean = true;

  constructor(
    private translate: TranslateService,
    private commonService: CommonService,
    private planspots: PlanSpotListService,
    private activatedRoute: ActivatedRoute,
    private indexedDBService: IndexedDBService,
    private gaService: GaService,
    private myplanService: MyplanService,
    private transferState: TransferState,
    private router: Router,
    public dialog: MatDialog,
    public animationDialog: NgDialogAnimationService,
    private bannerService: BannerService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.limit = 9;
    //this.p = 1;
    this.condition = new ListSearchCondition();
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit() {
    this.guid = await this.commonService.getGuid();
    this.commonService.onNotifyIsOffcial(false);

    const arr = [];
    this.bannerService.getBannerList().subscribe((d) => {
      d.map((item) => {
        if (item.size === '320x50') {
          arr.push(item);
        }
      });
      this.banners = arr.map((f) => f);
    });

    this.isMobile = this.detectIsMobile(window.innerWidth);

    if (this.transferState.hasKey(PLANSPOT_KEY)) {
      this.cacheRecoveryDataSet();
    } else {
      let condition = this.recoveryQueryParams();

      const result = [];
      result.push(
        new Promise((resolve) => {
          this.planspots
            .getPlanSpotListSearchCondition()
            .pipe(takeUntil(this.onDestroy$))
            .subscribe(async (r) => {
              this.listSelectMaster = r;
              this.$mSort = r.mSort;
              resolve(true);
            });
        })
      );
      result.push(
        new Promise((resolve) => {
          this.planspots
            .getPlanList()
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((r) => {
              this.plans = r;
              resolve(true);
            });
        })
      );
      result.push(
        new Promise((resolve) => {
          this.planspots
            .getSpotList()
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((r) => {
              this.spots = r;
              resolve(true);
            });
        })
      );

      await Promise.all(result);

      const filterResult = await this.planspots.getFilterbyCondition(
        this.spots.concat(this.plans),
        condition
      );
      if (filterResult.length === 0 && condition.keyword) {
        condition.select = 'google';
        if (this.isBrowser) {
          sessionStorage.setItem(
            this.planspots.conditionSessionKey,
            JSON.stringify(condition)
          );
        }
      }
      this.condition = condition;
      this.filteringData();
    }

    this.myplanService.FetchMyplanSpots();
    this.myplanService.MySpots$.subscribe((r) => {
      this.myPlanSpots = r;
    });

    this.myplanService.PlanUserSaved$.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((x) => {
      const idx = this.details$.findIndex(
        (v) => v.isPlan === true && v.id === x.planUserId
      );
      if (idx > -1) {
        this.planspots
          .fetchDetails(this.details$[idx], this.guid)
          .pipe(takeUntil(this.onDestroy$))
          .subscribe(async (d) => {
            this.rows[idx] = await this.planspots.mergeDetail(
              this.rows[idx],
              d
            );
            this.details$ = this.rows.slice(0, this.end);
          });
      }
    });

    this.planspots.searchSubject.subscribe((r) => {
      this.condition = r;
      sessionStorage.setItem(
        this.planspots.conditionSessionKey,
        JSON.stringify(this.condition)
      );
      this.filteringData();
    });

    this.myplanService.updFavirute$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((x) => {
        let spot: PlanSpotList, spotDetail: PlanSpotList;
        if (x.type === 1) {
          spot = this.rows.find(
            (planSpot) =>
              planSpot.isPlan === false &&
              planSpot.id === x.spotId &&
              !planSpot.googleSpot
          );
          spotDetail = this.details$.find(
            (planSpot) =>
              planSpot.isPlan === false &&
              planSpot.id === x.spotId &&
              !planSpot.googleSpot
          );
        } else {
          spotDetail = this.details$.find(
            (planSpot) =>
              planSpot.isPlan === false &&
              planSpot.googleSpot.google_spot_id === x.spotId
          );
        }
        if (spot) {
          spot.isFavorite = x.isFavorite;
        }
        if (spotDetail) {
          spotDetail.isFavorite = x.isFavorite;
        }
      });

    this.planspots.clearSearch
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((v) => {
        if (v) {
          this.keywordSearch('');
        }
      });
  }

  ngAfterViewChecked(): void {
    if (typeof this.offset !== 'undefined') {
      if (this.list?.isMobile) {
        if (this.offset > 0) {
          window.scrollTo(0, this.offset);
        }
        if (this.offset === window.pageYOffset) {
          this.offset = 0;
        }
      } else {
        if (this.offset > 0) {
          this.list.box.nativeElement.scrollTo(0, this.offset);
          this.offset = 0;
        }
      }
    }
  }

  ngOnDestroy() {
    this.onDestroy$.next();
  }

  onScrollDown() {
    this.mergeNextDataSet();
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event) {
    event.stopPropagation();
    if((window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop) > 79){
      this.isSelectorShow = false;
    }else{
      this.isSelectorShow = true;
    }
  }

  async filteringData() {
    const result = await this.planspots.filteringData(
      this.spots.concat(this.plans),
      this.condition,
      this.listSelectMaster
    );

    if (this.isBrowser) {
      this.offset = 0;
      this.commonService.scrollToTop();
    }

    this.p = 1;
    this.prevkeyword = null;
    this.token = null;
    this.rows = result.list;
    this.optionKeywords = result.searchTarm;
    this.searchParams = result.searchParams;
    this.historyReplace(result.searchParams);
    if (this.condition.select !== 'google') {
      this.count = result.list.length;
    }
    this.mergeNextDataSet();
  }

  async mergeNextDataSet(isDetail: boolean = false) {
    if (this.rows.length > 0) {
      this.isList = true;
      let startIndex = (this.p - 1) * this.limit;
      this.end = startIndex + this.limit;
      if (isDetail) startIndex = 0;

      //if(this.condition.select === 'all')
      this.loading = startIndex === 0 ? true : false;

      if (this.rows.length - startIndex < this.limit)
        this.end = this.rows.length;
      for (let i = startIndex; i < this.end; i++) {
        this.planspots
          .fetchDetails(this.rows[i], this.guid)
          .pipe(takeUntil(this.onDestroy$))
          .subscribe(async (d) => {
            if (d) {
              if (d.isEndOfPublication) {
                this.rows.splice(i, 1);
                if (this.rows.length - startIndex < this.limit) {
                  this.end = this.rows.length;
                }
              } else {
                this.rows[i] = await this.planspots.mergeDetail(
                  this.rows[i],
                  d,
                  i
                );
              }
              this.details$ = this.rows.slice(0, this.end);
            }
            this.loading = false;
          });
      }
      this.p++;
    } else if (this.condition.select === 'google') {
      this.isList = false;
      const keyword = this.condition.keyword;
      if (this.prevkeyword !== keyword) {
        this.details$ = [];
        this.googles$ = [];
      }

      //this.loading = true;
      if (
        keyword &&
        ((this.prevkeyword === keyword && this.token) ||
          this.prevkeyword !== keyword)
      ) {
        //this.loading = true;
        this.planspots
          .getGoogleSpotList(this.guid, keyword, this.token)
          .pipe(takeUntil(this.onDestroy$))
          .subscribe((g) => {
            this.prevkeyword = keyword;
            //this.isList=true;
            this.googles$ = this.googles$.concat(g.planSpotList);
            this.token = g.tokenGoogle;
            this.loading = false;
          });
      }
    }
  }

  historyReplace(searchParams: string): void {
    if (isPlatformBrowser(this.platformId)) {
      if (searchParams.length > 19) {
        history.replaceState(
          'search_key',
          '',
          location.pathname.substring(0) + '?' + searchParams
        );
      } else {
        history.replaceState('search_key', '', location.pathname.substring(0));
      }
    }
  }

  // キーワード検索
  async keywordSearch(v: any) {
    // this.gaService.sendEvent(
    //   'planspotlist',
    //   this.condition.select,
    //   'search',
    //   v
    // );
    this.condition.keyword = v;
    this.prevkeyword = null;
    this.token = null;
    // キーワードがクリアされた場合はAllにする
    if (!v) {
      this.condition.select = 'all';
      // キーワードが変更された場合はALLで表示できるものがあるか確認して変更する
    } else {
      let condition = { ...this.condition };
      condition.select = 'all';
      const result = await this.planspots.getFilterbyCondition(
        this.spots.concat(this.plans),
        condition
      );
      if (result.length > 0) {
        this.condition.select = 'all';
      } else {
        this.condition.select = 'google';
      }
    }
    sessionStorage.setItem(
      this.planspots.conditionSessionKey,
      JSON.stringify(this.condition)
    );
    this.filteringData();
  }

  // 表示順
  sortChange(v: any) {
    //this.gaService.sendEvent('planspotlist', this.condition.select, 'sort', v);
    this.condition.sortval = v;
    sessionStorage.setItem(
      this.planspots.conditionSessionKey,
      JSON.stringify(this.condition)
    );
    this.filteringData();
  }

  // プランスポット切り替え
  onPlanSpotChange(val: any) {
    //google analysticはcutする
    //this.gaService.sendEvent('planspotlist', val, 'tab', null);
    this.condition.select = val;
    sessionStorage.setItem(
      this.planspots.conditionSessionKey,
      JSON.stringify(this.condition)
    );
    //this.switch = true;
    if (!this.isMobile) {
      this.list?.scrollToTop();
    }
    this.filteringData();
  }

  onSelectorClose(e: boolean) {
    this.$close = e;
  }

  // プラン/スポット詳細リンク
  linktoDetail(item: PlanSpotList) {
    // this.gaService.sendEvent(
    //   'planspotlist',
    //   this.condition.select,
    //   'detail',
    //   item.id
    // );

    this.setTransferState();

    if (item.isPlan) {
      this.router.navigate(['/' + this.lang + '/plans/detail', item.id]);
    } else if (item.googleSpot) {
      this.commonService.locationPlaceIdGoogleMap(
        this.lang,
        item.googleSpot.latitude,
        item.googleSpot.longitude,
        item.googleSpot.place_id
      );
    } else {
      this.router.navigate(['/' + this.lang + '/spots/detail', item.id]);
    }
  }

  setTransferState(planSpotList: PlanSpotList = null) {
    try {
      let _offset: number;
      if (this.list.isMobile) {
        _offset = window.pageYOffset;
      } else {
        _offset = this.list.scrollPos;
      }

      const c = new CacheStore();
      c.data = this.rows;
      c.spots = this.spots;
      c.plans = this.plans;
      c.details$ = this.details$;
      c.p = this.p;
      c.end = this.end;
      c.offset = _offset;
      c.mSort = this.$mSort;
      c.isList = this.isList;
      c.ListSelectMaster = this.listSelectMaster;
      c.optionKeywords = this.optionKeywords;
      c.searchParams = this.searchParams;
      c.planSpotList = planSpotList;

      this.transferState.set<CacheStore>(PLANSPOT_KEY, c);
    } catch (error) {
      //
    }
  }

  // 検索パネル(エリア・カテゴリー選択)
  openDialog(e: number) {
    // this.gaService.sendEvent(
    //   'planspotlist',
    //   this.condition.select,
    //   'search_dialog',
    //   e
    // );

    this.listSelectMaster.tabIndex = e;
    this.listSelectMaster.isGoogle = this.condition.select === 'google';
    this.listSelectMaster.planSpotList = this.spots.concat(this.plans);

    const dialogRef = this.dialog.open(SearchDialogComponent, {
      maxWidth: '100%',
      width: '92vw',
      position: { top: '10px' },
      data: this.listSelectMaster,
      autoFocus: false,
      id: 'searchDialog',
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(async (condition) => {
        if (condition !== 'cancel') {
          // ローカル変数配列の重複除外
          condition.areaId = Array.from(new Set(condition.areaId));
          condition.areaId2 = Array.from(new Set(condition.areaId2));
          this.condition = condition;
          sessionStorage.setItem(
            this.planspots.conditionSessionKey,
            JSON.stringify(this.condition)
          );
          this.filteringData();
        }
      });
  }

  // 検索条件リセット
  async conditionReset() {
    this.commonService.scrollToTop();

    if (this.condition.select === 'google') {
      this.condition.select = 'all';
    }
    this.condition.areaId = [];
    this.condition.areaId2 = [];
    this.condition.searchCategories = [];
    this.condition.keyword = '';
    sessionStorage.setItem(
      this.planspots.conditionSessionKey,
      JSON.stringify(this.condition)
    );
    this.filteringData();
  }

  // プランに追加
  async addMyPlan(item: PlanSpotList) {
    // this.gaService.sendEvent(
    //   'planspotlist',
    //   this.condition.select,
    //   'add_to_cart',
    //   item.id
    // );

    const memoPipe = new MyplanMemoClearPipe();
    const tempqty: number = item.isPlan ? item.spotQty : 1;
    if ((await this.commonService.checkAddPlan(tempqty)) === false) {
      const param = new ComfirmDialogParam();
      param.text = 'ErrorMsgAddSpot';
      param.leftButton = 'EditPlanProgress';
      const dialog = this.commonService.confirmMessageDialog(param);
      dialog
        .afterClosed()
        .pipe(takeUntil(this.onDestroy$))
        .subscribe((d: any) => {
          if (d === 'ok') {
            // 編集中のプランを表示
            this.commonService.onNotifyIsShowCart(true);
          }
        });
      return;
    }
    this.loading = true;
    this.planspots
      .addPlan(
        item.id,
        item.isPlan,
        this.guid,
        item.isRemojuPlan,
        item.googleSpot ? true : false,
        item.googleSpot
      )
      .then((result) => {
        result.pipe(takeUntil(this.onDestroy$)).subscribe(async (myPlanApp) => {
          if (myPlanApp) {
            //myPlanのplanSpotsのmemoを初期化する処理
            memoPipe.transform(myPlanApp);
            this.myplanService.onPlanUserChanged(myPlanApp);
            this.indexedDBService.registPlan(myPlanApp);
            this.myplanService.FetchMyplanSpots().then(() => {
              this.loading = false;
            });
          }
        });
      });
  }

  cacheRecoveryDataSet() {
    const cache = this.transferState.get<CacheStore>(PLANSPOT_KEY, null);
    this.rows = cache.data;
    this.spots = cache.spots;
    this.plans = cache.plans;
    this.details$ = cache.data.filter((d) => d.pictures.length > 0);
    this.end = cache.end;
    this.offset = cache.offset;
    this.p = cache.p - 1;
    this.$mSort = cache.mSort;
    this.count = cache.data.length;
    this.isList = cache.isList; //change
    this.listSelectMaster = cache.ListSelectMaster;
    this.optionKeywords = cache.optionKeywords;
    this.searchParams = cache.searchParams;
    if (cache.planSpotList) {
      this.onViewUserPost(cache.planSpotList);
    }
    this.transferState.remove(PLANSPOT_KEY);

    this.condition = JSON.parse(
      sessionStorage.getItem(this.planspots.conditionSessionKey)
    );
    this.historyReplace(this.searchParams);
  }

  recoveryQueryParams() {
    let condition = new ListSearchCondition();

    this.activatedRoute.queryParams
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(async (params: Params) => {
        if (
          (params.aid && params.aid.length > 0) ||
          (params.era && params.era.length > 0) ||
          (params.cat && params.cat.length > 0) ||
          (params.srt && params.srt.length > 0) ||
          (params.lst && params.lst.length > 0) ||
          (params.kwd && params.kwd.length > 0)
        ) {
          condition.areaId =
            params.aid && params.aid.length > 0
              ? params.aid.split(',').map(Number)
              : [];
          condition.areaId2 =
            params.era && params.era.length > 0
              ? params.era.split(',').map(Number)
              : [];
          condition.searchCategories =
            params.cat && params.cat.length > 0
              ? params.cat.split(',').map(Number)
              : [];
          condition.searchOptions =
            params.opt && params.opt.length > 0
              ? params.opt.split(',').map(Number)
              : [];
          condition.sortval = params.srt;
          condition.select = params.lst;
          condition.keyword = params.kwd;

          if (this.isBrowser) {
            sessionStorage.setItem(
              this.planspots.conditionSessionKey,
              JSON.stringify(condition)
            );
          }
        } else if (
          this.isBrowser &&
          sessionStorage.getItem(this.planspots.conditionSessionKey)
        ) {
          condition = JSON.parse(
            sessionStorage.getItem(this.planspots.conditionSessionKey)
          );
        }
      });
    return condition;
  }

  // お気に入り登録・除外
  setFavorite(item: PlanSpotList) {
    // this.gaService.sendEvent(
    //   'planspotlist',
    //   this.condition.select,
    //   item.isFavorite ? 'favorite_off' : 'favorite_on',
    //   item.id
    // );

    item.isFavorite = !item.isFavorite;
    if (!item.isPlan) {
      const param = new UpdFavorite();
      param.spotId = item.id;
      param.type = item.googleSpot ? 2 : 1;
      param.isFavorite = item.isFavorite;
      this.myplanService.updateFavorite(param);
    }
    this.planspots
      .registFavorite(
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
    // this.gaService.sendEvent(
    //   'planspotlist',
    //   this.condition.select,
    //   'view_user',
    //   item.user.objectId
    // );

    this.setTransferState(item);

    const param = new UserPlanData();
    param.user = item.user;
    param.userPlanSpotList = item.userPlanList;

    this.dialog.open(UserDialogComponent, {
      id: 'userpost',
      maxWidth: '100%',
      width: this.list.isMobile ? '92vw' : '50vw',
      position: { top: '12px' },
      data: param,
      autoFocus: false,
    });
  }

  detectIsMobile(w: any) {
    if (w < 1024) {
      return true;
    } else {
      return false;
    }
  }
}
