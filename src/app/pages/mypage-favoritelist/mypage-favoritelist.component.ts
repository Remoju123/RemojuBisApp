import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { ComfirmDialogParam, DataSelected } from "../../class/common.class";
import { TranslateService } from "@ngx-translate/core";
import { CommonService } from "../../service/common.service";
import { MypageFavoriteListService } from "../../service/mypagefavoritelist.service";
import { Router } from "@angular/router";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlanSpotList, tarms } from "src/app/class/planspotlist.class";
import { PlanSpotListService } from "src/app/service/planspotlist.service";
import { MyplanService } from "src/app/service/myplan.service";
import { IndexedDBService } from "src/app/service/indexeddb.service";
import { ListSearchCondition } from "src/app/class/indexeddb.class";
@Component({
  selector: "app-mypage-favoritelist",
  templateUrl: "./mypage-favoritelist.component.html",
  styleUrls: ["./mypage-favoritelist.component.scss"]
})
export class MypageFavoriteListComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject();

  constructor(
    private commonService: CommonService,
    private mypageFavoriteListService: MypageFavoriteListService,
    private translate: TranslateService,
    private router: Router,
    private planspots: PlanSpotListService,
    private myplanService: MyplanService,
    private indexedDBService: IndexedDBService,
  ) {
    this.limit = 6;
    this.p = 1;
    this.condition = new ListSearchCondition();
  }

  @Input() myFavorite:Boolean;

  // 初回表示制御
  guid: string;

  condition: ListSearchCondition;
  //listSelectMaster: ListSelectMaster;
  count: number = 0;
  rows: PlanSpotList[] = [];
  spots: PlanSpotList[] = [];
  plans: PlanSpotList[] = [];
  details$: PlanSpotList[] = [];
  $mSort: DataSelected[];
  optionKeywords: tarms;
  select:string;

  myPlanSpots:any;

  p: number;
  limit: number;
  end: number;

  get lang() {
    return this.translate.currentLang;
  }
  /*------------------------------
   *
   * イベント
   *
   * -----------------------------*/
  async ngOnInit() {
    // GUID取得
    this.guid = await this.commonService.getGuid();

    let condition: any = await this.indexedDBService.getListSearchConditionMyfav();
    if (condition){
      this.condition = condition;
    }

    this.getPlanSpotDataSet();

    this.myplanService.FetchMyplanSpots();
    this.myplanService.MySpots$.subscribe(r=>{
      this.myPlanSpots = r;
    })
  }

  ngOnDestroy() {
    this.onDestroy$.next();
  }

  /*------------------------------
   *
   * メソッド
   *
   * -----------------------------*/
  getPlanSpotDataSet() {
    this.mypageFavoriteListService.getMypageFavoritePlanList().pipe(takeUntil(this.onDestroy$))
    .subscribe(async (r) => {
      this.plans = r;
      this.isDetail();
    });
    this.mypageFavoriteListService.getMypageFavoriteSpotList().pipe(takeUntil(this.onDestroy$))
    .subscribe(async (r) => {
      this.spots = r;
      this.isDetail();
    });
  }

  isDetail() {
    if ((this.condition.select === 'plan' || this.spots.length > 0)
      && (this.condition.select === 'spot' || this.plans.length > 0)) {
        this.rows = this.planspots.getFilterbyCondition(this.spots.concat(this.plans),this.condition);
        this.count = this.rows.length;
        this.mergeNextDataSet();
      }
  }

  async mergeNextDataSet(){
    if(this.rows.length > 0){
      let startIndex = (this.p - 1) * this.limit;
      this.end = startIndex + this.limit;
      if(this.rows.length - startIndex < this.limit){
        this.end = this.rows.length;
      }
      for (let i = startIndex; i < this.end; i++){
        if(!this.rows[i].googleSpot){
          (await this.planspots.fetchDetails(this.rows[i], this.guid))
          .pipe(takeUntil(this.onDestroy$))
          .subscribe(d => {
            const idx = this.rows.findIndex(v => v.id === d.id);
            this.rows[idx] = d;
            this.rows[idx].userName = this.commonService.isValidJson(this.rows[idx].userName, this.lang);

            this.details$ = this.rows.slice(0,this.end);
          })
        }
      }
      this.p++;
    }else{
      this.details$ = [];
    }
  }
  onScrollDown() {
    this.mergeNextDataSet();
  }

  linktoDetail(item:PlanSpotList){
    if (item.isPlan){
      this.router.navigate(["/" + this.lang + "/plans/detail",item.id]);
    } else if (item.googleSpot) {
      this.commonService.locationPlaceIdGoogleMap(this.lang, item.googleSpot.latitude, item.googleSpot.longitude, item.googleSpot.place_id);
    } else {
      this.router.navigate(["/" + this.lang + "/spots/detail",item.id]);
    }
  }

  // プランに追加
  async addMyPlan(item:PlanSpotList){
    const tempqty:number = item.isPlan ? item.spotQty : 1;
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
      item.id,
      item.isPlan,
      item.isRemojuPlan
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

  // お気に入り削除
  deleteFavorite(item:PlanSpotList) {
    // 確認ダイアログの表示
    const param = new ComfirmDialogParam();
    param.title = "FavoriteRemoveConfirm";
    const dialog = this.commonService.confirmMessageDialog(param);
    dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
      // お気に入りを削除する
      if (d === "ok") {
        this.planspots.registFavorite(
          item.id,
          item.isPlan,
          !item.isFavorite,
          item.isRemojuPlan,
          this.guid,
          item.googleSpot ? true: false
        )
        .pipe(takeUntil(this.onDestroy$))
        .subscribe(async ()=>{
          this.rows.splice(
            this.rows.findIndex(v => v.id === item.id),1
          )
          this.count = this.rows.length;
          this.commonService.snackBarDisp("FavoriteRemoved");

          if(!this.rows[this.end - 1].googleSpot){
            (await this.planspots.fetchDetails(this.rows[this.end - 1], this.guid))
            .pipe(takeUntil(this.onDestroy$))
            .subscribe(d => {
              this.rows[this.end - 1] = d;
              this.rows[this.end - 1].userName = this.commonService.isValidJson(this.rows[this.end - 1].userName, this.lang);
            })
          }
          this.details$ = this.rows.slice(0,this.end);
        });
      }
    });
  }

  // 表示順
  sortChange(v:any){
    this.condition.sortval = v;
    this.indexedDBService.registListSearchConditionMyfav(this.condition);
    this.getPlanSpotDataSet();
    this.p = 1;
  }

  // プランスポット切り替え
  onPlanSpotChange(val:any){
    this.select = val;
    this.condition.select = val;
    this.indexedDBService.registListSearchConditionMyfav(this.condition);
    this.getPlanSpotDataSet();
    this.p = 1;
  }

  // 検索条件リセット
  conditionReset(){
  }
}
