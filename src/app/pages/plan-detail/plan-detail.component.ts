import { Component, HostListener, OnInit, OnDestroy, ViewChild, Input, Inject, PLATFORM_ID } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { PlanApp, Trans, mFeature, UserStaff } from "../../class/plan.class";
import { Recommended, NestDataSelected, DataSelected, PlanSpotCommon, ComfirmDialogParam } from "../../class/common.class";
import { ListSearchCondition } from "../../class/indexeddb.class";
import { ReviewResult } from "../../class/review.class";
import { Catch } from "../../class/log.class";
import { TranslateService } from "@ngx-translate/core";
import { LangFilterPipe } from "../../utils/lang-filter.pipe";
import { Meta } from "@angular/platform-browser";
import { CommonService } from "../../service/common.service";
import { IndexedDBService } from "../../service/indexeddb.service";
import { MyplanService } from '../../service/myplan.service';
import { PlanListService } from "../../service/planlist.service";
import { PlanService } from "../../service/plan.service";
import { SpotListService } from "../../service/spotlist.service";
import { MapPanelComponent } from "../../parts/map-panel/map-panel.component";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { isPlatformBrowser } from "@angular/common";

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
    private planListService: PlanListService,
    private spotListService: SpotListService,
    // private deviceService: DeviceDetectorService,
    private meta: Meta,
    private translate: TranslateService,
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

  addplanbtn_src:string;

  ct_department: any[] = [
    { id: 1, text: "Remoju コンテンツチーム" },
    { id: 2, text: "-----" },
    { id: 3, text: "-----" }
  ];

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
    stagePadding:40,
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

  myPlanSpots:any;
  planSpotids: number[] = new Array();
  
  get lang() {
    return this.translate.currentLang;
  }

  ngOnInit() {
    this.myplanService.FetchMyplanSpots();
    this.myplanService.MySpots$.subscribe((v)=>{
      this.myPlanSpots = v;
    })

    this.getMaster();

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
    this.spotListService
      .registFavorite(
        item.spotId,
        !item.isFavorite,
        this.guid
      )
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(() => {
        item.isFavorite = !item.isFavorite;
      });
  }

  // お気に入り登録
  @Catch()
  onClickFavorite() {
    if (this.data.isRemojuPlan) {
      this.planListService
        .registFavorite(
          this.data.planId,
          this.guid,
          !this.data.isFavorite
        )
        .pipe(takeUntil(this.onDestroy$))
        .subscribe(r => {
          this.data.isFavorite = !this.data.isFavorite;
        });
    } else {
      this.planListService
        .registUserFavorite(
          this.data.planId,
          this.guid,
          !this.data.isFavorite
        )
        .pipe(takeUntil(this.onDestroy$))
        .subscribe(r => {
          this.data.isFavorite = !this.data.isFavorite;
        });
    }
  }

  // プランに追加する
  onClickAddToPlan() {
    this.addToPlan();
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
    param.leftButton = "Cancel";
    param.rightButton = "OK";
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

  @Catch()
  registThanks() {
    // this.spotService
    //   .registThanks(this.$spotId, 0, this.guid, false)
    //   .subscribe(r => {
    //     this.$thanksQty = r;
    //   });
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    // var element = document.getElementById("spot-detail");
    // var rect = element.getBoundingClientRect();

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

  @Catch()
  async getMaster() {
    this.planListService.getPlanListSearchCondition(false).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
      this.mSearchCategory = r.mSearchCategory;
      // const Caterogries = [
      //   r.mSearchCategory[0].dataSelecteds,
      //   r.mSearchCategory[1].dataSelecteds,
      //   r.mSearchCategory[2].dataSelecteds
      // ];
    });
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
      const langpipe = new LangFilterPipe();

      this.$isRemojuPlan = r.isRemojuPlan;
      this.$versionNo = r.versionNo;
      this.$planId = r.planId;

      this.data = r;
      this.data.picCnt = r.pictures===null?0:r.pictures.length;
      //this.data.spotToGoCnt = r.spotToGoList?0:r.spotToGoList.length;

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
      this.data.startTime = this.reshapetime(this.data.startTime);
      this.data.endTime = this.reshapetime(this.data.endTime);
      let ids = [];
      this.spots = r.spots.map((x, i) => {
        if (x.type === 1){
          this.commonService.setAddPlanLang(x, this.lang);
        }
        x.startTime = this.reshapetime(x.startTime);
        // 次のスポットがある場合
        if (i + 1 < r.spots.length) {
          x.destination = this.commonService.isValidJson(r.spots[i + 1].spotName, this.lang);
        }
        x.line = this.planService.transline(
          langpipe.transform(JSON.parse(x.transfer), this.lang)
        );
        x.transtime = this.planService.transtimes(
          langpipe.transform(JSON.parse(x.transfer), this.lang)
        );
        x.transflow = this.planService.transflows(
          langpipe.transform(JSON.parse(x.transfer), this.lang)
        );
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
      
      // map表示
      this.isMapDisp = !this.isMapDisp;

      this.$userStaff = r.userStaff;

      // 閲覧履歴を更新
      if (this.data.pictures && this.data.pictures.length > 0 && this.data.pictures[0].length > 0){
        let history: Recommended = {
          isSpot: false,
          name: this.data.planName,
          versionNo: this.data.versionNo,
          spotPlanID: this.data.planId,
          pictureUrl: this.data.pictures[0]};
        this.indexedDBService.registHistoryPlan(history)
      }

      this.spots.map(x=>{
        this.planSpotids.push(x.spotId)
      });
    });
  }

  reshapetime(v: string) {
    if (v) {
      const str = v.split(":");
      return parseInt(str[0]).toString() + ":" + str[1];
    }
    return "";
  }

  getEndTime(st: string,addtime: number){
    const d = new Date("1970/1/1 " + st);
    d.setMinutes(d.getMinutes() + addtime);
    return d.toLocaleTimeString();
    //console.log(d.setMinutes(d.getMinutes + addtime));
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

  // プランに追加
  async addToPlan(){
    // スポット数チェック
    if (await this.commonService.checkAddPlan(this.spots.length)){
      // プランに追加
      await this.addToPlanApi();
    }
  }

  async addToPlanApi(){
    // プランに追加
    this.planListService
    .addPlan(this.$isRemojuPlan, this.$planId).then(result => {
      result.pipe(takeUntil(this.onDestroy$)).subscribe(async myPlanApp => {
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

  linktoSpot(id:any){
    
  }
  
  onIsmore(e: { ismore: boolean; label: string; }){
    e.ismore = !e.ismore;
    e.label = e.ismore?"close":"more";
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
    // navText: [
    //   "<i class='material-icons' aria-hidden='true'>keyboard_arrow_left</i>",
    //   "<i class='material-icons' aria-hidden='true'>keyboard_arrow_right</i>"
    // ],
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
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 2
      },
      940: {
        items: 3
      }
    },
    nav: true
  };

  ngOnDestroy(){
    this.onDestroy$.next();
  }
}
