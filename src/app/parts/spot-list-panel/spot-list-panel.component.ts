import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ComfirmDialogParam } from "../../class/common.class";
import { SpotAppList } from "../../class/spotlist.class";
import { TranslateService } from "@ngx-translate/core";
import { CommonService } from "../../service/common.service";
import { IndexedDBService } from "../../service/indexeddb.service";
import { MyplanService } from '../../service/myplan.service';
import { MypageFavoriteListService } from "../../service/mypagefavoritelist.service";
import { SpotListService } from "../../service/spotlist.service";
import { Catch } from "../../class/log.class";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-spot-list-panel",
  templateUrl: "./spot-list-panel.component.html",
  styleUrls: ["./spot-list-panel.component.scss"]
})
export class SpotListPanelComponent implements OnInit {
  @Input() rows: SpotAppList[];
  @Input() myPlanSpots: any;
  @Input() isFavoriteList: boolean;

  @Output() scrolled = new EventEmitter();
  @Output() event = new EventEmitter<Number>();

  private onDestroy$ = new Subject();

  constructor(
    private commonService: CommonService,
    private indexedDBService: IndexedDBService,
    private mypageFavoriteListService: MypageFavoriteListService,
    private myplanService: MyplanService,
    private spotListService: SpotListService,
    private translate: TranslateService
  ) { }

  //GUID
  guid: string;
  
  get lang() {
    return this.translate.currentLang;
  }

  async ngOnInit() {
    // GUID取得
    this.guid = await this.commonService.getGuid();
  }

  // お気に入り登録
  @Catch()
  onClickFavorite(row: SpotAppList) {
    // console.log(row);
    this.spotListService
      .registFavorite(
        row.spotId,
        !row.isFavorite,
        this.guid,
        row.googleSpot
      )
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(() => {
        row.isFavorite = !row.isFavorite;
        this.mypageFavoriteListService.GetFavoriteCount(this.guid);

        if (this.isFavoriteList){
             this.rows.splice(
            this.rows.findIndex(v => v.spotId === row.spotId),
            1
          );
          //this.spotDetail.emit();
          this.commonService.snackBarDisp("FavoriteRemoved");
        }
      });
  }

  // お気に入り削除
  onClickDeleteFavorite(row: SpotAppList) {
    // 確認ダイアログの表示
    const param = new ComfirmDialogParam();
    param.title = "FavoriteRemoveConfirm";
    param.leftButton = "Cancel";
    param.rightButton = "OK";
    const dialog = this.commonService.confirmMessageDialog(param);
    dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
      // お気に入りを削除する
      if (d === "ok") {
        this.onClickFavorite(row);
      }
    });
  }

  // プランに追加する
  async onClickAddToPlan(row: SpotAppList) {
    // スポット数チェック
    if (await this.commonService.checkAddPlan(1) === false){
      return;
    }
    
    // プランに追加
    this.spotListService
    .addSpot(row.spotId, row.googleSpot ? 2 : 1, row.googleSpot).then(result => {
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

  // スポット詳細へ遷移
  linktoSpot(id:any){
    this.event.emit(id);
  }

  onScrollDownSpot() {
    this.scrolled.emit();
  }

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
    items: 1,
    nav: true,
    // autoplay:true
  };
}