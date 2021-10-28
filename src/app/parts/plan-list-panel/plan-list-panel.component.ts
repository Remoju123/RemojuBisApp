import { Component, OnInit, Input, Output, EventEmitter, Inject, PLATFORM_ID } from "@angular/core";
import { ComfirmDialogParam } from "../../class/common.class";
import { PlanAppList } from "../../class/planlist.class";
import { TranslateService } from "@ngx-translate/core";
import { CommonService } from "../../service/common.service";
import { IndexedDBService } from "../../service/indexeddb.service";
import { MyplanService } from '../../service/myplan.service';
import { MypageFavoriteListService } from "../../service/mypagefavoritelist.service";
import { PlanListService } from "../../service/planlist.service";
import { LangFilterPipe } from "../../utils/lang-filter.pipe";
import { Catch } from "../../class/log.class";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { isPlatformBrowser } from "@angular/common";

@Component({
  selector: "app-plan-list-panel",
  templateUrl: "./plan-list-panel.component.html",
  styleUrls: ["./plan-list-panel.component.scss"]
})
export class PlanListPanelComponent implements OnInit {
  @Input() rows: PlanAppList[];
  @Input() isFavoriteList: boolean;

  @Output() scrolled = new EventEmitter();
  @Output() event = new EventEmitter<Number>();

  private onDestroy$ = new Subject();

  constructor(
    private commonService: CommonService,
    private indexedDBService: IndexedDBService,
    private mypageFavoriteListService: MypageFavoriteListService,
    private myplanService: MyplanService,
    private planListService: PlanListService,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId:Object
  ) { }

  //GUID
  guid: string;

  myPlanSpots:any;

  finished:boolean;

  modelPlan_src:string;
  usersPlan_src:string;

  get lang() {
    return this.translate.currentLang;
  }

  async ngOnInit() {
    // GUID取得
    this.guid = await this.commonService.getGuid();

    this.myplanService.FetchMyplanSpots();
    this.myplanService.MySpots$.subscribe((v)=>{
      this.myPlanSpots = v;
    })

    this.finished = true;

    if(isPlatformBrowser(this.platformId)){
      let suffix = localStorage.getItem("gml")==="en"?"_en":"";
      this.modelPlan_src = "../../../assets/img/model-plan" + suffix + ".svg";
      this.usersPlan_src = "../../../assets/img/users-plan" + suffix + ".svg";
    }



  }

  // お気に入り登録
  @Catch()
  onClickFavorite(row: PlanAppList) {
    if (row.isRemojuPlan) {
      this.planListService
        .registFavorite(
          row.planId,
          this.guid,
          !row.isFavorite
        )
        .pipe(takeUntil(this.onDestroy$))
        .subscribe(() => {
          row.isFavorite = !row.isFavorite;
          this.mypageFavoriteListService.GetFavoriteCount(this.guid);
          this.deleteFavorite(row);
        });
    } else {
      this.planListService
        .registUserFavorite(
          row.planId,
          this.guid,
          !row.isFavorite
        )
        .pipe(takeUntil(this.onDestroy$))
        .subscribe(() => {
          row.isFavorite = !row.isFavorite;
          this.mypageFavoriteListService.GetFavoriteCount(this.guid);
          this.deleteFavorite(row);
        });
    }
  }

  // お気に入り削除
  onClickDeleteFavorite(row: PlanAppList) {
    // 確認ダイアログの表示
    const param = new ComfirmDialogParam();
    param.title = "FavoriteRemoveConfirm";
    const dialog = this.commonService.confirmMessageDialog(param);
    dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
      // お気に入りを削除する
      if (d === "ok") {
        this.onClickFavorite(row);
      }
    });
  }

  // プランに追加する
  async onClickAddToPlan(row: PlanAppList) {
    // スポット数チェック
    if (await this.commonService.checkAddPlan(row.spotQty) === false){
      return;
    }

    // プランに追加
    this.planListService
    .addPlan(row.isRemojuPlan, row.planId).then(result => {
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

  linktoPlan(id:any){
    this.event.emit(id);
  }

  /*------------------------------
   *
   * メソッド
   *
   * -----------------------------*/

  deleteFavorite(row: PlanAppList){
    if (!this.isFavoriteList){
      return;
    }

    this.rows.splice(
      this.rows.findIndex(v => v.planId === row.planId),
      1
    );
    //this.planDetail.emit();
    this.commonService.snackBarDisp("FavoriteRemoved");
  }

  genPlanSpotNames(item:any){
    const arr: any[] = [];
    item.map((x: { isRemojuSpot: any; spotName: string; })=>{
      if(x.isRemojuSpot){
        arr.push(this.commonService.isValidJson(x.spotName,this.lang))
      }else{
        arr.push(x.spotName)
      }
    })
    return arr.join("/");
  }

  onScrollDown() {
    this.scrolled.emit();
  }

  /*------------------------------
   *
   * owl carousel option mainPictures
   *
   * -----------------------------*/
  mainOptions: any = {
    // autoplay:true,
    // autoplayTimeout: 3000,
    // autoplaySpeed: 2400,
    // slideTransition:"linear",
    rewindSpeed:0,
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: [
      "<i class='material-icons' aria-hidden='true'>keyboard_arrow_left</i>",
      "<i class='material-icons' aria-hidden='true'>keyboard_arrow_right</i>"
    ],
    stagePadding:40,
    margin:0,
    items: 1,
    nav: true
  };

  match(spots:any,plans:any){
    try{
      if(spots){
        const res = Array.from(spots).every(v =>
          Array.from(plans).includes(v)
        );
        return res;
      }
    }catch(err){
      //console.error(err);
      return err;;
    }
  }

}
