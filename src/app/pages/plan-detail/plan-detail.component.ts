import { Component, HostListener, OnInit, OnDestroy, ViewChild, Inject, PLATFORM_ID } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { PlanApp, Trans, mFeature, UserStaff, UserPlanData } from "../../class/plan.class";
import { Recommended, NestDataSelected, DataSelected, PlanSpotCommon, ComfirmDialogParam } from "../../class/common.class";
import { ListSearchCondition } from "../../class/indexeddb.class";
import { UserPlanList } from "../../class/planspotlist.class";
import { ReviewResult } from "../../class/review.class";
import { Catch } from "../../class/log.class";
import { TranslateService } from "@ngx-translate/core";
import { LangFilterPipe } from "../../utils/lang-filter.pipe";
import { Meta } from "@angular/platform-browser";
import { CommonService } from "../../service/common.service";
import { IndexedDBService } from "../../service/indexeddb.service";
import { MyplanService } from '../../service/myplan.service';
import { PlanService } from "../../service/plan.service";
import { PlanSpotListService } from "../../service/planspotlist.service";
import { MapPanelComponent } from "../../parts/map-panel/map-panel.component";
import { UserPlanListComponent } from "../../parts/user-plan-list/user-plan-list.component";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { isPlatformBrowser } from "@angular/common";
import { NgDialogAnimationService } from 'ng-dialog-animation';
import { ContentObserver } from "@angular/cdk/observers";

@Component({
  selector: "app-plan-detail",
  templateUrl: "./plan-detail.component.html",
  styleUrls: ["./plan-detail.component.scss"]
})
export class PlanDetailComponent implements OnInit,OnDestroy {
  @ViewChild(MapPanelComponent)


  private mapPanelComponent: MapPanelComponent;
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
    public dialog: NgDialogAnimationService,
    //public dialog:MatDialog,
    @Inject(PLATFORM_ID) private platformId:Object
  ) {}

  data: PlanApp = new PlanApp();
  $thanksQty = 0;

  $isRemojuPlan: boolean;
  $versionNo: number;
  $planId: number;

  spots: PlanSpotCommon[];
  transfers: Trans[];

  reviewResult: ReviewResult;

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

  // user_plans: PlanSpotList[] = [];

  userData: UserPlanList = new UserPlanList();

  addplanbtn_src:string;

  blankUserSrc:string = "../../../../../assets/img/icon_who.svg";
  blankuserName:string = "---";

  ct_department: any[] = [
    { id: 1, text: "Remoju コンテンツチーム" },
    { id: 2, text: "-----" },
    { id: 3, text: "-----" }
  ];

  myPlanSpots:any;
  planSpotids: number[] = new Array();

  get lang() {
    return this.translate.currentLang;
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }

  ngOnInit() {
    this.myplanService.FetchMyplanSpots();
    this.myplanService.MySpots$.subscribe(v=>{
      this.myPlanSpots = v;
    })

    this.activatedRoute.paramMap.pipe(takeUntil(this.onDestroy$)).subscribe((params: ParamMap) => {
      const id = params.get("id");
      this.commonService.onNotifySelectedPlanId(id);
      if (id !== null) {
        this.getPlanDetail(id);
      }else{
        this.commonService.selectedPlanId$.subscribe(d => {
          this.getPlanDetail(d.toFixed());
        })
      }
    });

    if(isPlatformBrowser(this.platformId)){
      let suffix = localStorage.getItem("gml")==="en"?"_en":"";
      this.addplanbtn_src = "../../../assets/img/addplan_btn_h" + suffix + ".svg";
    }
  }

  // お気に入り登録(スポット)
  @Catch()
  onClickSpotFavorite(item: PlanSpotCommon) {
    this.planSpotListService
      .registFavorite(
        item.spotId,
        false,
        !item.isFavorite,
        false,
        this.guid,
        item.googleSpot ? true : false
      )
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(() => {
        item.isFavorite = !item.isFavorite;
      });
  }

  // お気に入り登録
  @Catch()
  onClickFavorite() {
    this.planSpotListService
      .registFavorite(
        this.data.planId,
        true,
        !this.data.isFavorite,
        this.data.isRemojuPlan,
        this.guid
      )
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(r => {
        this.data.isFavorite = !this.data.isFavorite;
    });
  }

  // プランに追加する
  async onClickAddToPlan(spot?: PlanSpotCommon) {
    // スポット数チェック
    if(await this.commonService.checkAddPlan(spot ? 1 : this.spots.length) === false) {
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

    // プランに追加
    if (spot) {
      this.planSpotListService.addPlan(spot.spotId, false, undefined, spot.googleSpot ? true : false).then(result => {
        result.pipe(takeUntil(this.onDestroy$)).subscribe(async myPlanApp => {
          if (myPlanApp) {
            this.addToPlanAfter(myPlanApp);
          }
        });
      });
    } else {
      this.planSpotListService.addPlan(this.$planId, true, this.$isRemojuPlan).then(result => {
        result.pipe(takeUntil(this.onDestroy$)).subscribe(async myPlanApp => {
          if (myPlanApp) {
            this.addToPlanAfter(myPlanApp);
          }
        });
      });
    }
  }

  // エリア
  onClickArea(){
    let condition = new ListSearchCondition();
    condition.areaId = [ Number(this.data.areaId) ];
    // 検索条件更新
    this.indexedDBService.registListSearchConditionPlan(condition);
    // スポット一覧へ遷移
    this.router.navigate(["/" + this.lang + "/plans"]);
  }

  // カテゴリ
  onClickCategory(id: number){
    let condition = new ListSearchCondition();
    if (this.data.areaId){
      condition.areaId = [ Number(this.data.areaId) ];
    }
    condition.searchCategories = [ id ];
    // 検索条件更新
    this.indexedDBService.registListSearchConditionPlan(condition);
    // 表示位置をクリア
    sessionStorage.removeItem("cachep");
    // スポット一覧へ遷移
    this.router.navigate(["/" + this.lang + "/plans"]);
  }

  // 違反報告
  // 通報
  onClickReport() {
    // 確認ダイアログの表示
    const param = new ComfirmDialogParam();
    param.title = "ReportPlanUserConfirmTitle";
    param.text = "ReportPlanUserConfirmText";
    const dialog = this.commonService.confirmMessageDialog(param);
    dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
      if (d === "ok") {
          this.planService.reportPlanUser(this.data.planId).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
            this.commonService.reportComplete(r);
          });
      }
    });
  }

  /*------------------------------
   *
   * メソッド
   *
   * -----------------------------*/

  @HostListener("window:scroll", [])
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
  async getPlanDetail(id: string) {
    // GUID取得
    this.guid = await this.commonService.getGuid();

    this.planService.getPlanDetail(id, this.guid).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
      if (!r) {
        this.router.navigate(["/" + this.lang + "/notfound"]);
        return;
      }

      const langpipe = new LangFilterPipe();

      this.$isRemojuPlan = r.isRemojuPlan;
      this.$versionNo = r.versionNo;
      this.$planId = r.planId;

      this.data = r;
      this.data.picCnt = r.pictures===null?0:r.pictures.length;

      if (this.$isRemojuPlan){
        this.meta.addTags([
          {
            name: "description",
            content: langpipe.transform(r.seo.description, this.lang) ? langpipe.transform(r.seo.description, this.lang)
             : langpipe.transform(this.data.planExplanation, this.lang)
          },
          {
            name: "keyword",
            content: langpipe.transform(r.seo.keyword, this.lang)
          },
          {
            name: "subtitle",
            content: langpipe.transform(r.seo.subtitle, this.lang) ? langpipe.transform(r.seo.subtitle, this.lang)
             : langpipe.transform(this.data.planName, this.lang)
          }
        ]);

        this.data.planName = langpipe.transform(this.data.planName, this.lang);
        this.data.planExplanation = langpipe.transform(this.data.planExplanation, this.lang);
      } else {
        this.meta.addTags([
          {
            name: "description",
            content: this.data.planExplanation
          },
          {
            name: "keyword",
            content: this.data.planName
          },
          {
            name: "subtitle",
            content: this.data.planName
          }
        ]);
      }

      // console.log(r);
      let ids = [];
      this.spots = r.spots.map((x, i) => {
        if (x.type === 1){
          this.commonService.setAddPlanLang(x, this.lang);
        }
        // 次のスポットがある場合
        if (i + 1 < r.spots.length) {
          x.destination = this.commonService.isValidJson(r.spots[i + 1].spotName, this.lang);
        }

        // 移動方法
        if (x.transfer) {
          let transfer: any;
          try {
            transfer = this.commonService.isValidJson(x.transfer, this.lang);
          }
          catch{
            transfer = JSON.parse(x.transfer)[0].text;
          }

          x.line = this.planService.transline(transfer);
          x.transtime = this.planService.transtimes(transfer);
          x.transflow = this.planService.transflows(transfer);
        }
        x.ismore =false;
        x.label = "more"

        return x;
      }, []);

      this.reviewResult = r.reviewResult;

      this.recommendedPlan = r.spotToGoList.filter((e: any) => {
        return e.pictureUrl !== null;
      });
      this.features = r.featureList.filter((e:any) => {
        return e.languageCd === this.lang;
      });

      // カテゴリ
      this.categoryNames = r.searchCategories;
      this.mSearchCategory = r.mSearchCategory;

      // map表示
      this.isMapDisp = !this.isMapDisp;

      this.$userStaff = r.userStaff;

      let cids = []
      this.spots.map(x=>{
        this.planSpotids.push(x.spotId)

      });

      // ユーザープランリストデータを事前取得
      if (this.data.user) {
        this.planSpotListService.getUserPlanSpotList(this.data.user.objectId)
          .pipe(takeUntil(this.onDestroy$))
          .subscribe((r)=>{
            //this.user_plans = this.planspots.mergeBulkDataSet(r);
            this.userData.userPlans = this.planSpotListService.mergeBulkDataSet(r, this.guid);

            let ids = [];
            r.map(c => {
              ids = ids.concat(c.searchCategoryIds);
            })

            this.userData.searchCategories = this.planSpotListService.getMasterCategoryNames(new Set(ids),this.mSearchCategory);

            // サーバーステートに保持
            //this.transferState.set<PlanSpotList[]>(USERPLANSPOT_KEY,this.user_plans);
        });
      }
    });

  }

  match(spots:any,plans:any){
    try{
      if(spots){
        const res = Array.from(spots).every(v =>
          Array.from(plans).includes(v)
        );
        return res;
      }
      return false;
    }catch(err){
      //console.error(err);
      return false;
    }
  }

  onViewUserPost(){
    const param = new UserPlanData();
    param.user = this.data.user;
    param.country = this.data.country;
    param.memo = this.data.memo;
    param.rows = this.userData;
    param.myplanspot = this.myPlanSpots;

    const dialogRef = this.dialog.open(UserPlanListComponent, {
      id:"userplanlist",
      maxWidth: "100%",
      width: "100%",
      height:"100%",
      position: { top: "0" },
      data:param,
      autoFocus: false,
      animation: {
        to: "left",
        incomingOptions: {
          keyframeAnimationOptions: { duration: 300, easing: "steps(8, end)" }
        }
      }
    });

    dialogRef.afterClosed().subscribe(()=>{
      setTimeout(() => {
        window.scroll({top: 0, behavior: 'smooth'});
      }, 800);
    })

  }

  linktolist(){
    this.router.navigate(["/" + this.lang + "/planspot"]);
  }

  linktoSpot(planSpot: PlanSpotCommon){
    if (planSpot.type === 1) {
      this.router.navigate(["/" + this.lang + "/spots/detail/", planSpot.spotId]);
    } else {
      this.commonService.locationPlaceIdGoogleMap(this.lang, planSpot.latitude, planSpot.longitude, planSpot.googleSpot.place_id);
    }
  }

  onIsmore(e: { ismore: boolean; label: string; }){
    e.ismore = !e.ismore;
    e.label = e.ismore?"close":"more";
  }

  addToPlanAfter(myPlanApp) {
    // プラン作成に反映
    this.myplanService.onPlanUserChanged(myPlanApp);
    // プランを保存
    this.indexedDBService.registPlan(myPlanApp);
    // subject更新
    this.myplanService.FetchMyplanSpots();
  }

  /*------------------------------
   *
   * owl carousel option specialPage
   *
   * -----------------------------*/
  specialPageOptions:any ={
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: [
      "<i class='material-icons' aria-hidden='true'>keyboard_arrow_left</i>",
      "<i class='material-icons' aria-hidden='true'>keyboard_arrow_right</i>"
    ],
    margin: 10,
    responsive: {
      0: {
        items: 2
      },
      400: {
        items: 3
      },
      740: {
        items: 4
      },
      940: {
        items: 5
      }
    },
    nav: true
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
    margin: 10,
    responsive: {
      0: {
        items: 2
      },
      400: {
        items: 3
      },
      740: {
        items: 4
      },
      940: {
        items: 5
      }
    },
    nav: false,
    autoHeight: false
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
      "<i class='material-icons' aria-hidden='true'>keyboard_arrow_right</i>"
    ],
    items:1,
    nav: true
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
      "<i class='material-icons' aria-hidden='true'>keyboard_arrow_right</i>"
    ],
    stagePadding:25,
    margin: 10,
    //items: 3,
    responsive: {
      0: {
        items: 3
      },
      400: {
        items: 3
      },
      740: {
        items: 4
      },
      940: {
        items: 5
      }
    },
    nav: false,
    autoHeight: false,
    autoPlay:false
  };

  // スワイプで一覧に戻る
  onSwipeRight(event,data){
    this.linktolist();
  }
}
