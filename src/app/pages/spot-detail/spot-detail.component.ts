import {
  Component,
  HostListener,
  Input,
  OnInit,
  OnDestroy,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { CommonService } from '../../service/common.service';
import { IndexedDBService } from '../../service/indexeddb.service';
import { MyplanService } from '../../service/myplan.service';
import { SpotService } from '../../service/spot.service';
import { PlanSpotListService } from '../../service/planspotlist.service';
import { Recommended, ComfirmDialogParam } from '../../class/common.class';
import { SpotApp, Pictures } from '../../class/spot.class';
import { ListSearchCondition } from '../../class/indexeddb.class';
import { UpdFavorite } from '../../class/mypageplanlist.class';
import { UserStaff } from '../../class/plan.class';
import { GoogleSpot } from '../../class/planspotlist.class';
import { SpotSearchCategory } from '../../class/spot.class';
import { ReviewResult } from '../../class/review.class';
import { Catch } from '../../class/log.class';
import { Meta } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { LangFilterPipe } from '../../utils/lang-filter.pipe';
// import { DeviceDetectorService } from "ngx-device-detector";
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { CacheStore } from '../../class/planspotlist.class';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { MyplanListCacheStore } from '../../class/mypageplanlist.class';

export const PLANSPOT_KEY = makeStateKey<CacheStore>('PLANSPOT_KEY');
export const FAVORITE_KEY = makeStateKey<CacheStore>('FAVORITE_KEY');
export const MYPLANLIST_KEY =
  makeStateKey<MyplanListCacheStore>('MYPLANLIST_KEY');

@Component({
  selector: 'app-spot-detail',
  templateUrl: './spot-detail.component.html',
  styleUrls: ['./spot-detail.component.scss'],
})
export class SpotDetailComponent implements OnInit, OnDestroy {
  @ViewChild('cont') cont: ElementRef;

  private onDestroy$ = new Subject();
  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private indexedDBService: IndexedDBService,
    private myplanService: MyplanService,
    private spotService: SpotService,
    private planspotListService: PlanSpotListService,
    private meta: Meta,
    private translate: TranslateService,
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  data: SpotApp = new SpotApp();
  $latitude: number;
  $longitude: number;
  $zoom = 16;
  $spotName: string;
  $regularHoliday: string;
  $businessDay: string;
  $budgetFrame: string;
  $budgetFrameHead: string;

  $businessHourMain: string;
  $businessHourHead: string;

  $areaName1: string;
  $areaName2: string;
  $searchCategories: SpotSearchCategory[];

  $spotId: number;
  $versionNo: number;
  $googleSpot: GoogleSpot;

  $userStaff: UserStaff;

  $nearest: string;
  $access: string;

  $averageStayTime: string;
  $hpUrl: string;

  $mapUrl: string;

  mainPictures: Pictures[];
  mainPicturesSingle: Pictures;
  isMulti = true;
  spotPictures: Pictures[];

  reviewResult: ReviewResult;
  reviewQty: number;

  nearbySpots: Recommended[];
  nearbySpotshow: boolean;
  popularSpots: Recommended[];
  popularSpotshow: boolean;
  modelPlans: Recommended[];
  modePlanshow: boolean;
  showScroll: boolean;
  showDetailScroll: boolean;
  showScrollHeight = 300;
  hideScrollHeight = 10;

  isMobile: boolean;
  guid: string;

  addplanbtn_src: string;

  myPlanSpots: any;

  loading: boolean = false;

  ngAfterViewInit() {
    const script = document.createElement('script');
    script.async = true;
    script.src =
      '//rot8.a8.net/jsa/38b464a3857e947cc8a7d78d48239462/c6f057b86584942e415435ffb1fa93d4.js';
    const div = document.getElementById('script');
    div.insertAdjacentElement('afterend', script);
  }

  async ngOnInit() {
    // GUID取得
    this.guid = await this.commonService.getGuid();

    this.activatedRoute.paramMap
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((params: ParamMap) => {
        let id = params.get('id');
        if (id) {
          this.setSpotDetail(id);
        } else {
          this.router.navigate(['/' + this.lang + '/404']);
        }
      });

    if (isPlatformBrowser(this.platformId)) {
      this.myplanService.FetchMyplanSpots();
      let suffix = localStorage.getItem('gml') === 'en' ? '_en' : '';
      this.addplanbtn_src =
        '../../../assets/img/addplan_btn_h' + suffix + '.svg';
    }

    this.isMobile = this.detectIsMobile(window.innerWidth);

    this.myplanService.MySpots$.subscribe((v) => {
      this.myPlanSpots = v;
    });
  }

  // SignalRの設定
  @Catch()
  private connectionSettings() {
    // Startup.csに設定したルートを指定する
    this.connection = new HubConnectionBuilder()
      .withUrl('/spotthankshub')
      .build();
    // 通知を受け取る SpotThanksHubのSendAsyncに指定したターゲットに第一引数を合わせる
    this.connection.on('ReceiveMessage', (count: number) => {
      this.data.thanksQty = count;
    });
    // コネクション開始
    this.connection
      .start()
      .then(() => console.log('接続成功'))
      .catch(() => console.log('接続失敗'));
  }

  @Catch()
  onClickThanks() {
    this.data.isThanks = !this.data.isThanks;
    this.spotService
      .registThanks(this.$spotId, this.data.isThanks, this.guid)
      .subscribe((r) => {
        this.data.thanksQty = r;
      });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const element = document.getElementById('spot-detail');
    const rect = element?.getBoundingClientRect();

    if (
      (window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop) > this.showScrollHeight
    ) {
      this.showScroll = true;
      this.showDetailScroll = true;
    } else if (
      this.showScroll &&
      (window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop) < this.hideScrollHeight
    ) {
      this.showScroll = false;
      this.showDetailScroll = false;
    }

    if (rect) {
      if (rect.top - rect.height - 250 < 0) {
        this.showDetailScroll = false;
      }
    }
  }

  // スポット詳細へ進むボタン
  scrollToDetail() {
    // console.log(el);
    const el = document.getElementById('spot-detail');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  scrollToWriter() {
    const el = document.getElementById('writer');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  onClickFavorite() {
    this.data.isFavorite = !this.data.isFavorite;
    const param = new UpdFavorite();
    param.spotId = this.$spotId;
    param.type = 1;
    param.isFavorite = this.data.isFavorite;
    this.myplanService.updateFavorite(param);
    this.planspotListService.setTransferStateFavorite(
      false,
      this.$spotId,
      this.data.isFavorite,
      false
    );
    if (this.transferState.hasKey(FAVORITE_KEY)) {
      this.transferState.remove(FAVORITE_KEY);
    }
    this.planspotListService
      .registFavorite(
        this.$spotId,
        false,
        this.data.isFavorite,
        false,
        this.guid
      )
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(() => {
        // if (!r) {
        //   this.router.navigate(["/SystemError"]);
        //   return;
        // }
      });
  }

  // プランに追加する TBD:googleSpot
  onClickAddToPlan() {
    this.addToPlan();
  }

  // エリア
  onClickArea(isArea1: boolean) {
    let condition = new ListSearchCondition();
    if (isArea1 && this.data.area1) {
      condition.areaId = [Number(this.data.area1)];
    } else if (!isArea1 && this.data.area2) {
      condition.areaId2 = [Number(this.data.area2)];
    }
    // 検索条件更新
    sessionStorage.setItem(
      this.planspotListService.conditionSessionKey,
      JSON.stringify(condition)
    );
    if (this.transferState.hasKey(PLANSPOT_KEY)) {
      this.transferState.remove(PLANSPOT_KEY);
    }
    if (this.transferState.hasKey(FAVORITE_KEY)) {
      this.transferState.remove(FAVORITE_KEY);
    }
    // スポット一覧へ遷移
    this.router.navigate(['/' + this.lang + '/planspot']);
  }

  // カテゴリ
  onClickCategory(category: SpotSearchCategory) {
    let condition = new ListSearchCondition();
    if (this.data.area1) {
      condition.areaId = [Number(this.data.area1)];
    }
    condition.searchCategories = [category.search_category_id];
    // 検索条件更新
    sessionStorage.setItem(
      this.planspotListService.conditionSessionKey,
      JSON.stringify(condition)
    );
    if (this.transferState.hasKey(PLANSPOT_KEY)) {
      this.transferState.remove(PLANSPOT_KEY);
    }
    if (this.transferState.hasKey(FAVORITE_KEY)) {
      this.transferState.remove(FAVORITE_KEY);
    }
    // スポット一覧へ遷移
    this.router.navigate(['/' + this.lang + '/planspot']);
  }

  onCommentUpd(qty: number) {
    this.reviewQty = qty;
  }

  /*------------------------------
   *
   * スポット登録情報の取得
   *
   * -----------------------------*/
  @Catch()
  async setSpotDetail(id: string) {
    this.loading = true;
    this.spotService
      .getSpotDetail(id, this.guid)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((r) => {
        if (!r) {
          this.router.navigate(['/' + this.lang + '/notfound']);
          return;
        }

        this.data = r;

        this.$spotId = this.data.spotId;
        this.$versionNo = this.data.versionNo;
        this.$googleSpot = new GoogleSpot();

        const langpipe = new LangFilterPipe();

        this.meta.addTags([
          {
            name: 'description',
            content: langpipe.transform(this.data.seo.description, this.lang)
              ? langpipe.transform(this.data.seo.description, this.lang)
              : langpipe.transform(this.data.spotOverview, this.lang),
          },
          {
            name: 'keyword',
            content: langpipe.transform(this.data.seo.keyword, this.lang),
          },
          {
            name: 'subtitle',
            content: langpipe.transform(this.data.seo.subtitle, this.lang)
              ? langpipe.transform(this.data.seo.subtitle, this.lang)
              : langpipe.transform(this.data.spotName, this.lang) +
                ',' +
                langpipe.transform(this.data.subheading, this.lang),
          },
        ]);

        this.reviewResult = this.data.reviewResult;
        this.reviewQty = this.data.reviewResult?.reviews?.length;

        this.nearbySpots = this.data.nearbySpotList.filter((e: any) => {
          return e.pictureUrl !== null;
        });

        this.popularSpots = this.data.popularSpotList.filter((e: any) => {
          return e.pictureUrl !== null;
        });

        this.modelPlans = this.data.modelPlanList.map((x) => {
          x.name = this.commonService.isValidJson(x.name, this.lang);
          return x;
        });
        this.modePlanshow = this.data.modelPlanList.length > 0;

        this.$latitude = Number(this.data.latitude);
        this.$longitude = Number(this.data.longitude);

        // this.spotService.getThanks(this.data.spotId).pipe(takeUntil(this.onDestroy$)).subscribe(t => {
        //   this.$thanksQty = t;
        // });
        // this.spotService.registThanks().subscribe(t => {
        //   this.$thanksQty = t;
        // });

        this.mainPictures = this.data.pictures;
        this.isMulti = this.data.pictures.length > 1;
        //if(r.pictures.length <= 1){
        this.mainPicturesSingle = this.data.pictures[0];
        //}

        this.spotPictures = this.data.pictures.filter(
          (p: { is_main: any }) => !p.is_main
        );
        // メイン営業時間
        this.spotService.businessday = this.data.businessDay;
        this.$businessHourMain = this.spotService.getBusinessHourMain(
          this.data.businessHours
        );
        // 定休日
        this.$regularHoliday = this.spotService.getRegularholidays(
          this.data.regularHoliday
        );
        // URL
        const _url = langpipe.transform(this.data.hp, this.lang);
        if (_url !== '') {
          this.$hpUrl =
            "<a href='" + _url + "' target='_brank'>" + _url + '</a>';
        } else {
          this.$hpUrl = '<span>------</span>';
        }
        // 営業時間
        this.$businessDay = this.spotService.getBusinessHours(
          this.data.businessHours,
          langpipe.transform(this.data.businessHoursRemarks, this.lang)
        );
        // 予算枠
        this.spotService.budgetFrame = this.data.budgetFrame;
        this.$budgetFrame = this.spotService.getBudgetFrame(
          this.data.budgets,
          langpipe.transform(this.data.budgetRemarks, this.lang)
        );
        // 推奨時間
        this.$averageStayTime =
          this.data.averageStayTime > 0
            ? this.data.averageStayTime + ' ' + this.translate.instant('Minute')
            : '-';
        // エリア
        this.$areaName1 = this.data.areaName1;
        this.$areaName2 = this.data.areaName2;
        // こだわり
        this.$searchCategories = this.data.searchCategories.filter((x) => {
          if (x.name !== null) {
            return x;
          }
          return '';
        });
        // Googlemap url
        this.$mapUrl =
          'https://www.google.com/maps/search/?api=1&query=' +
          langpipe.transform(this.data.spotName, this.lang) +
          ',' +
          langpipe.transform(this.data.address, this.lang);

        this.$budgetFrameHead = this.spotService.getBudgetFrameLine(
          this.data.budgets
        );
        this.$businessHourHead = this.spotService.getBusinessHourHead(
          this.data.businessHours
        );

        this.$userStaff = this.data.userStaff;

        this.$nearest = this.data.accesses[0].nearest;
        this.$access = this.spotService.getAccessIcon(
          this.data.accesses[0].access
        );

        // 閲覧履歴を更新
        /*const mainPicture = this.data.pictures.find(x => x.is_main === true);
      if (mainPicture && mainPicture.picture_url.length > 0){
        let history: Recommended = {
          isSpot : true,
          name: this.data.spotName,
          versionNo: this.data.versionNo,
          spotPlanID: this.data.spotId,
          pictureUrl: mainPicture.picture_url};
        this.indexedDBService.registHistorySpot(history)
      }*/

        this.loading = false;
      });
  }

  // プランに追加
  async addToPlan() {
    // スポット数チェック
    if ((await this.commonService.checkAddPlan(1)) === false) {
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

    // プランに追加
    this.planspotListService
      .addPlan(this.$spotId, false, this.guid)
      .then((result) => {
        result.pipe(takeUntil(this.onDestroy$)).subscribe(async (myPlanApp) => {
          if (myPlanApp) {
            // プラン作成に反映
            this.myplanService.onPlanUserChanged(myPlanApp);
            // プランを保存
            this.indexedDBService.registPlan(myPlanApp);
            // subject更新
            this.myplanService.FetchMyplanSpots();
          }
        });
      });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
  }

  linktolist() {
    if (this.transferState.hasKey(FAVORITE_KEY)) {
      this.router.navigate(['/' + this.lang + '/mypage'], {
        fragment: 'favorite',
      });
    } else if (this.transferState.hasKey(MYPLANLIST_KEY)) {
      this.router.navigate(['/' + this.lang + '/mypage'], { fragment: 'list' });
    } else {
      this.router.navigate(['/' + this.lang + '/planspot']);
    }
  }

  /*------------------------------
   *
   * owl carousel option nearbySpot/popularSpot/recommendPlan
   *
   * -----------------------------*/
  customOptions: any = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    stagePadding: 20,
    //margin: 10,
    responsive: {
      0: {
        items: 2,
      },
      400: {
        items: 3,
      },
      740: {
        items: 4,
      },
      940: {
        items: 5,
      },
    },
    nav: false,
    autoHeight: false,
  };

  /*------------------------------
   *
   * owl carousel option mainPictures
   *
   * -----------------------------*/
  mainOptions: any = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: true,
    navSpeed: 700,
    navText: [
      "<i class='material-icons' aria-hidden='true'>keyboard_arrow_left</i>",
      "<i class='material-icons' aria-hidden='true'>keyboard_arrow_right</i>",
    ],
    items: 1,
    nav: true,
  };

  // HubConnectionオブジェクト
  private connection: HubConnection;

  get lang() {
    return this.translate.currentLang;
  }

  // スワイプで一覧に戻る
  onSwipeRight(event, data) {
    this.linktolist();
  }

  scrollToTop() {
    this.cont.nativeElement.scrollTo(0, 0);
  }

  detectIsMobile(w: any) {
    if (w < 1024) {
      return true;
    } else {
      return false;
    }
  }
}
