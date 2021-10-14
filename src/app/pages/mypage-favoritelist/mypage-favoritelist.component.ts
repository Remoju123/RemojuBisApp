import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { ComfirmDialogParam, DataSelected, ListSelectMaster } from "../../class/common.class";
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
  listSelectMaster: ListSelectMaster;
  count: number = 0;
  rows: PlanSpotList[] = [];
  details$: PlanSpotList[] = [];
  $mSort: DataSelected[];
  optionKeywords: tarms;
  select:string;

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

    this.mypageFavoriteListService.getMypageFavoriteSort().pipe(takeUntil(this.onDestroy$)).subscribe(async r => {
      this.listSelectMaster = r;
      this.listSelectMaster.isList = true;
      this.$mSort = r.mSort;
    });
    let condition: any = await this.indexedDBService.getListSearchConditionMyfav();
      if (condition){
        this.condition = condition;
      }

    this.getPlanSpotDataSet();

    this.planspots.searchFilter.pipe(takeUntil(this.onDestroy$))
    .subscribe(result => {
      this.rows = result.list;
      this.optionKeywords = result.searchTarm;
      this.count = result.list.length;
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
    this.mypageFavoriteListService.getMypageFavoritePlanSpotList().pipe(takeUntil(this.onDestroy$))
    .subscribe(async (r) => {
      console.log(r);
      this.planspots.filteringData(r,this.condition,this.listSelectMaster);
      this.mergeNextDataSet();
    })
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
          (await this.planspots.fetchDetails(this.rows[i]))
          .pipe(takeUntil(this.onDestroy$))
          .subscribe(d => {
            const idx = this.rows.findIndex(v => v.id === d.id);
            this.rows[idx] = d;
            this.rows.forEach(x => x.userName = this.commonService.isValidJson(x.userName, this.lang));

            this.details$ = this.rows.slice(0,this.end);
            this.count = this.details$.length;
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

  linktoDetail(id:number){
    if(id > 10000){
      this.router.navigate(["/" + this.lang + "/spots/detail",id]);
    }else{
      this.router.navigate(["/" + this.lang + "/plans/detail",id]);
    }
  }

  // プランに追加
  async addMyPlan(item:PlanSpotList){
    const tempqty:number = item.isPlan===1 ? item.spotQty : 1;
    if(await this.commonService.checkAddPlan(tempqty) === false){
      return
    };

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

  // お気に入り削除
  deleteFavorite(item:PlanSpotList) {
    // 確認ダイアログの表示
    const param = new ComfirmDialogParam();
    param.title = "FavoriteRemoveConfirm";
    param.leftButton = "Cancel";
    param.rightButton = "OK";
    const dialog = this.commonService.confirmMessageDialog(param);
    dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
      // お気に入りを削除する
      if (d === "ok") {
        this.setFavorite(item);
      }
    });
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

    this.details$.splice(
      this.details$.findIndex(v=> v.id === item.id),1
    )
    this.count = this.details$.length;
    this.commonService.snackBarDisp("FavoriteRemoved");
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
