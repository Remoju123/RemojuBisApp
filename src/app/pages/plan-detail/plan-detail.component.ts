import {
  Component,
  HostListener,
  OnInit,
  OnDestroy,
  ViewChild,
  Inject,
  PLATFORM_ID,
  ElementRef,
  Input,
  HostBinding,
  Renderer2,
} from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { PlanApp, Trans, mFeature, UserStaff } from '../../class/plan.class';
import {
  Recommended,
  NestDataSelected,
  DataSelected,
  PlanSpotCommon,
  ComfirmDialogParam,
  MyPlanApp,
} from '../../class/common.class';
import { ListSearchCondition } from '../../class/indexeddb.class';
import {
  MyplanListCacheStore,
  UpdFavorite,
} from '../../class/mypageplanlist.class';
import { CacheStore, PlanSpotList } from '../../class/planspotlist.class';
import { ReviewResult } from '../../class/review.class';
import { Catch } from '../../class/log.class';
import { TranslateService } from '@ngx-translate/core';
import { LangFilterPipe } from '../../utils/lang-filter.pipe';
import {
  DomSanitizer,
  makeStateKey,
  Meta,
  SafeResourceUrl,
  TransferState,
} from '@angular/platform-browser';
import { CommonService } from '../../service/common.service';
import { IndexedDBService } from '../../service/indexeddb.service';
import { MyplanService } from '../../service/myplan.service';
import { PlanService } from '../../service/plan.service';
import { PlanSpotListService } from '../../service/planspotlist.service';
import { MapPanelComponent } from '../../parts/map-panel/map-panel.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { NgDialogAnimationService } from 'ng-dialog-animation';
import { BannerService } from 'src/app/service/banner.service';

export const PLANSPOT_KEY = makeStateKey<CacheStore>('PLANSPOT_KEY');
export const FAVORITE_KEY = makeStateKey<CacheStore>('FAVORITE_KEY');
export const MYPLANLIST_KEY =
  makeStateKey<MyplanListCacheStore>('MYPLANLIST_KEY');

@Component({
  selector: 'app-plan-detail',
  templateUrl: './plan-detail.component.html',
  styleUrls: ['./plan-detail.component.scss'],
})
export class PlanDetailComponent implements OnInit, OnDestroy {
  @ViewChild(MapPanelComponent)
  private mapPanelComponent: MapPanelComponent;

  @ViewChild('cont') cont: ElementRef;

  @ViewChild('divA8', { static: false }) divA8: ElementRef;

  @ViewChild('writer') writer: ElementRef;

  private onDestroy$ = new Subject();
  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private indexedDBService: IndexedDBService,
    private myplanService: MyplanService,
    private planService: PlanService,
    private planSpotListService: PlanSpotListService,
    // private deviceService: DeviceDetectorService,
    private meta: Meta,
    private translate: TranslateService,
    private transferState: TransferState,
    public dialog: NgDialogAnimationService,
    @Inject(PLATFORM_ID) private platformId: Object,
    public sanitizer: DomSanitizer,
    private renderer: Renderer2,
    private bannerService: BannerService
  ) {}

  data: PlanApp = new PlanApp();

  $isRemojuPlan: boolean;
  $versionNo: number;
  $planId: number;

  id;

  spots: PlanSpotCommon[];
  transfers: Trans[];

  reviewResult: ReviewResult;
  reviewQty: number;

  recommendedPlan: Recommended[];
  features: mFeature[];

  showScroll: boolean;
  showDetailScroll: boolean;
  showScrollHeight = 300;
  hideScrollHeight = 10;

  isMapDisp = false;

  mSearchCategory: NestDataSelected[];
  categoryNames: DataSelected[];

  $userStaff: UserStaff;

  isMobile: boolean;
  guid: string;

  isSpot: boolean;

  userPlanList: PlanSpotList[] = [];

  addplanbtn_src: string;

  blankUserSrc: string = '../../../../../assets/img/icon_who.svg';
  blankuserName: string = '---';

  noPic: string = '../../../assets/img/nopict.png';

  ct_department: any[] = [
    { id: 1, text: 'Remoju コンテンツチーム' },
    { id: 2, text: '-----' },
    { id: 3, text: '-----' },
  ];

  myPlanSpots: any;
  planSpotids: number[] = new Array();

  isMypage: boolean = false;

  loading: boolean = false;

  get lang() {
    return this.translate.currentLang;
  }

  banners: any[] = [];

  ngOnDestroy() {
    this.onDestroy$.next();
  }

  async ngOnInit() {
    // GUID取得
    this.guid = await this.commonService.getGuid();

    const arr = [];
    this.bannerService.getBannerList().subscribe((d) => {
      d.map((item) => {
        if (item.size === '320x50') {
          arr.push(item);
        }
      });
      const _banner = arr.map((f) => f.link);
      this.renderer.setProperty(
        this.divA8.nativeElement,
        'innerHTML',
        _banner[Math.floor(Math.random() * _banner.length)]
      );
    });

    if (
      this.transferState.hasKey(MYPLANLIST_KEY) ||
      this.transferState.hasKey(FAVORITE_KEY)
    ) {
      this.isMypage = true;
    }

    this.activatedRoute.paramMap
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((params: ParamMap) => {
        this.id = params.get('id');
        if (this.id) {
          this.setPlanDetail(this.id);
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

    this.myplanService.PlanUserSaved$.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((x) => {
      if (x.planUserId === this.$planId) {
        this.setPlanDetail(this.$planId.toString());
      }
    });

    // お気に入り更新通知
    this.myplanService.updFavirute$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((x) => {
        let spot = this.data.spots.find(
          (planSpot) => planSpot.spotId === x.spotId && planSpot.type === x.type
        );
        if (spot) {
          spot.isFavorite = x.isFavorite;
        }
      });
  }

  @Catch()
  onClickThanks() {
    this.data.isThanks = !this.data.isThanks;
    if (this.$isRemojuPlan) {
      this.planService
        .registPlanThanks(this.$planId, this.data.isThanks, this.guid)
        .subscribe((r) => {
          this.data.thanksQty = r;
        });
    } else {
      this.planService
        .registPlanUserThanks(this.$planId, this.data.isThanks, this.guid)
        .subscribe((r) => {
          this.data.thanksQty = r;
        });
    }
  }

  // お気に入り登録(スポット)
  @Catch()
  onClickSpotFavorite(item: PlanSpotCommon) {
    item.isFavorite = !item.isFavorite;
    const param = new UpdFavorite();
    param.spotId = item.spotId;
    param.type = item.type;
    param.isFavorite = item.isFavorite;
    this.myplanService.updateFavorite(param);
    this.planSpotListService.setTransferStateFavorite(
      false,
      item.spotId,
      item.isFavorite,
      item.googleSpot ? true : false
    );
    if (this.transferState.hasKey(FAVORITE_KEY)) {
      this.transferState.remove(FAVORITE_KEY);
    }
    this.planSpotListService
      .registFavorite(
        item.spotId,
        false,
        item.isFavorite,
        false,
        this.guid,
        item.googleSpot ? true : false
      )
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(() => {});
  }

  // お気に入り登録
  @Catch()
  onClickFavorite() {
    this.data.isFavorite = !this.data.isFavorite;
    this.planSpotListService.setTransferStateFavorite(
      true,
      this.data.planId,
      this.data.isFavorite
    );
    if (this.transferState.hasKey(FAVORITE_KEY)) {
      this.transferState.remove(FAVORITE_KEY);
    }
    this.planSpotListService
      .registFavorite(
        this.data.planId,
        true,
        this.data.isFavorite,
        this.data.isRemojuPlan,
        this.guid
      )
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((r) => {});
  }

  // プランに追加する
  async onClickAddToPlan(spot?: PlanSpotCommon) {
    // プラン共有ではないまたはスポット追加
    if (!isNaN(this.id) || spot) {
      // スポット数チェック
      if (
        (await this.commonService.checkAddPlan(
          spot ? 1 : this.spots.length
        )) === false
      ) {
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
      if (spot) {
        this.planSpotListService
          .addPlan(
            spot.spotId,
            false,
            this.guid,
            undefined,
            spot.googleSpot ? true : false,
            null,
            this.$planId
          )
          .then((result) => {
            result
              .pipe(takeUntil(this.onDestroy$))
              .subscribe(async (myPlanApp) => {
                if (myPlanApp) {
                  this.addToPlanAfter(myPlanApp);
                }
              });
          });
      } else {
        this.planSpotListService
          .addPlan(this.$planId, true, this.guid, this.$isRemojuPlan)
          .then((result) => {
            result
              .pipe(takeUntil(this.onDestroy$))
              .subscribe(async (myPlanApp) => {
                if (myPlanApp) {
                  this.addToPlanAfter(myPlanApp);
                }
              });
          });
      }
      // プラン共有のプラン追加
    } else {
      // 編集中のプランを取得
      let myPlan: any = await this.indexedDBService.getEditPlan();
      const myPlanApp: MyPlanApp = myPlan;

      // 未保存の場合
      if (myPlanApp && !myPlanApp.isSaved) {
        // 確認ダイアログの表示
        const param = new ComfirmDialogParam();
        param.title = 'EditPlanConfirmTitle';
        param.text = 'EditPlanConfirmText';
        const dialog = this.commonService.confirmMessageDialog(param);
        dialog
          .afterClosed()
          .pipe(takeUntil(this.onDestroy$))
          .subscribe((r: any) => {
            if (r === 'ok') {
              // プランを取得してプラン作成に反映
              this.getPlan();
            } else {
              // 編集中のプランを表示
              this.commonService.onNotifyIsShowCart(true);
            }
          });
      } else {
        this.getPlan();
      }
    }
  }

  chkInMyPlanspot(item: any) {
    return this.myPlanSpots.includes(item.spotId);
  }

  // エリア
  onClickArea() {
    let condition = new ListSearchCondition();
    condition.areaId = [Number(this.data.areaId)];
    // 検索条件更新
    sessionStorage.setItem(
      this.planSpotListService.conditionSessionKey,
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
  onClickCategory(id: number) {
    let condition = new ListSearchCondition();
    if (this.data.areaId) {
      condition.areaId = [Number(this.data.areaId)];
    }
    condition.searchCategories = [id];
    // 検索条件更新
    sessionStorage.setItem(
      this.planSpotListService.conditionSessionKey,
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

  // 違反報告
  // 通報
  onClickReport() {
    // 確認ダイアログの表示
    const param = new ComfirmDialogParam();
    param.title = 'ReportPlanUserConfirmTitle';
    param.text = 'ReportPlanUserConfirmText';
    const dialog = this.commonService.confirmMessageDialog(param);
    dialog
      .afterClosed()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((d: any) => {
        if (d === 'ok') {
          this.planService
            .reportPlanUser(this.data.planId)
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((r) => {
              this.commonService.reportComplete(r);
            });
        }
      });
  }

  onCommentUpd(qty: number) {
    this.reviewQty = qty;
  }

  /*------------------------------
   *
   * メソッド
   *
   * -----------------------------*/

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (
      (window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop) > this.showScrollHeight
    ) {
      this.showScroll = true;
    } else if (
      this.showScroll &&
      (window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop) < this.hideScrollHeight
    ) {
      this.showScroll = false;
    }
  }

  @Input() default: string;
  @HostBinding('attr.src') @Input() src;
  @HostListener('error') updateSrc() {
    this.src = this.default;
    console.log(this.default);
  }

  // Map表示
  setMapCenter(latitude: any, longitude: any) {
    this.mapPanelComponent.setMapCenter(latitude, longitude);
  }

  /*----------------------------
   *
   * プラン情報の取得
   *
   * ---------------------------*/
  @Catch()
  async setPlanDetail(id: string) {
    this.loading = true;
    this.planService
      .getPlanDetail(id, this.guid)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((r) => {
        if (!r) {
          this.router.navigate(['/' + this.lang + '/404']);
          return;
        }

        const langpipe = new LangFilterPipe();

        this.data = r;
        this.data.picCnt =
          this.data.pictures === null ? 0 : this.data.pictures.length;

        this.isSpot = this.data.spots.length === 1;

        this.$isRemojuPlan = this.data.isRemojuPlan;
        this.$versionNo = this.data.versionNo;
        this.$planId = this.data.planId;

        if (this.$isRemojuPlan) {
          this.meta.addTags([
            {
              name: 'description',
              content: langpipe.transform(this.data.seo.description, this.lang)
                ? langpipe.transform(this.data.seo.description, this.lang)
                : langpipe.transform(this.data.planExplanation, this.lang),
            },
            {
              name: 'keyword',
              content: langpipe.transform(this.data.seo.keyword, this.lang),
            },
            {
              name: 'subtitle',
              content: langpipe.transform(this.data.seo.subtitle, this.lang)
                ? langpipe.transform(this.data.seo.subtitle, this.lang)
                : langpipe.transform(this.data.planName, this.lang),
            },
          ]);

          this.data.planName = langpipe.transform(
            this.data.planName,
            this.lang
          );
          this.data.planExplanation = langpipe.transform(
            this.data.planExplanation,
            this.lang
          );
        } else {
          this.meta.addTags([
            {
              name: 'description',
              content: this.data.planExplanation,
            },
            {
              name: 'keyword',
              content: this.data.planName,
            },
            {
              name: 'subtitle',
              content: this.data.planName,
            },
          ]);
        }

        // console.log(r);
        let ids = [];
        this.spots = this.data.spots.map((x, i) => {
          if (x.type === 1) {
            this.commonService.setAddPlanLang(x, this.lang);
          }
          // 次のスポットがある場合
          if (i + 1 < this.data.spots.length) {
            x.destination = this.commonService.isValidJson(
              this.data.spots[i + 1].spotName,
              this.lang
            );
          }

          // 移動方法
          if (!this.data.isCar && x.transfer) {
            let transfer: any;
            try {
              transfer = this.commonService.isValidJson(x.transfer, this.lang);
            } catch {
              transfer = JSON.parse(x.transfer)[0].text;
            }

            x.line = this.planService.transline(transfer);
            x.transtime = this.planService.transtimes(transfer);
            x.transflow = this.planService.transflows(transfer);
          }
          x.ismore = false;
          x.label = 'more';

          return x;
        }, []);

        this.reviewResult = this.data.reviewResult;
        this.reviewQty = this.data.reviewResult?.reviews?.length;

        this.recommendedPlan = this.data.spotToGoList.filter((e: any) => {
          return e.pictureUrl !== null;
        });
        this.features = this.data.featureList.filter((e: any) => {
          return e.languageCd === this.lang;
        });

        // カテゴリ
        this.categoryNames = this.data.searchCategories;
        this.mSearchCategory = this.data.mSearchCategory;

        // map表示
        this.isMapDisp = !this.isMapDisp;

        this.$userStaff = this.data.userStaff;

        let cids = [];
        this.spots.map((x) => {
          this.planSpotids.push(x.spotId);
        });

        // ユーザープランリストデータを事前取得
        /*if (this.data.user) {
        this.planSpotListService.getUserPlanSpotList(id)
        .pipe(takeUntil(this.onDestroy$))
        .subscribe(rows => {
          this.userPlanList = rows;
          for(let i = 0; i < this.userPlanList.length; i++) {
            if (this.userPlanList[i].isDetail) {
              continue;
            }
            this.planSpotListService.fetchDetails(this.userPlanList[i], this.guid)
            .pipe(takeUntil(this.onDestroy$))
            .subscribe(_row => {
              this.userPlanList[i] = _row;
            });
          }
        });
      }*/
        this.loading = false;
      });
  }

  match(spots: any, plans: any) {
    try {
      if (spots) {
        const res = Array.from(spots).every((v) =>
          Array.from(plans).includes(v)
        );
        return res;
      }
      return false;
    } catch (err) {
      //console.error(err);
      return false;
    }
  }

  onViewUserPost() {
    /*const param = new UserPlanData();
    param.user = this.data.user;
    param.userPlanList = this.userPlanList;
    param.mSearchCategory = this.mSearchCategory;
    param.myplanspot = this.myPlanSpots;

    const dialogRef = this.dialog.open(UserPlanListComponent, {
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

    dialogRef.afterClosed().subscribe(() => {
      setTimeout(() => {
        window.scroll({ top: 0, behavior: 'smooth' });
      }, 800);
    })*/
    this.router.navigate([
      '/' + this.lang + '/userplans',
      this.data.user.objectId,
    ]);
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

  linktoSpot(planSpot: PlanSpotCommon) {
    if (planSpot.type === 1) {
      this.router.navigate([
        '/' + this.lang + '/spots/detail/',
        planSpot.spotId,
      ]);
    } else {
      this.commonService.locationPlaceIdGoogleMap(
        this.lang,
        planSpot.latitude,
        planSpot.longitude,
        planSpot.googleSpot.place_id
      );
    }
  }

  onIsmore(e: { ismore: boolean; label: string }) {
    e.ismore = !e.ismore;
    e.label = e.ismore ? 'close' : 'more';
  }

  addToPlanAfter(myPlanApp) {
    // プラン作成に反映
    this.myplanService.onPlanUserChanged(myPlanApp);
    // プランを保存
    this.indexedDBService.registPlan(myPlanApp);
    // subject更新
    this.myplanService.FetchMyplanSpots();
  }

  // プラン取得
  getPlan() {
    // DBから取得
    this.myplanService
      .getPlanUser(this.id)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((r) => {
        r.isShare = false;
        r.shareUrl = null;

        // プラン作成に反映
        this.myplanService.onPlanUserEdit(r);
        // プラン保存
        this.indexedDBService.registPlan(r);
        // subject更新
        this.myplanService.FetchMyplanSpots();
        // マイプランパネルを開く
        this.commonService.onNotifyIsShowCart(true);
      });
  }

  /*------------------------------
   *
   * owl carousel option specialPage
   *
   * -----------------------------*/
  specialPageOptions: any = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: [
      "<i class='material-icons' aria-hidden='true'>keyboard_arrow_left</i>",
      "<i class='material-icons' aria-hidden='true'>keyboard_arrow_right</i>",
    ],
    margin: 10,
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
    nav: true,
  };

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

  thumbOptions: any = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: [
      "<i class='material-icons' aria-hidden='true'>keyboard_arrow_left</i>",
      "<i class='material-icons' aria-hidden='true'>keyboard_arrow_right</i>",
    ],
    stagePadding: 25,
    margin: 10,
    //items: 3,
    responsive: {
      0: {
        items: 3,
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
    autoPlay: false,
  };

  // スワイプで一覧に戻る
  onSwipeRight(event) {
    //console.log(event.target);
    if (!event.target.classList.contains('noswip')) {
      this.linktolist();
    }
  }

  onSwipeStop(e) {
    return;
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

  // 比較関数（同じ配列同士で重複する値があるか否か）
  getIsDuplicate(arr1, arr2) {
    if (arr2) {
      return (
        [...arr1, ...arr2].filter(
          (item) => arr1.includes(item) && arr2.includes(item)
        ).length > 0
      );
    } else {
      return false;
    }
  }
}
