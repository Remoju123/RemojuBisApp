import { Component, Inject, OnInit ,OnDestroy} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { MapSpot, ComfirmDialogParam } from "../../class/common.class";
import { CommonService } from "../../service/common.service";
import { MyplanService } from "../../service/myplan.service";
import { IndexedDBService } from "../../service/indexeddb.service";
import { SpotListService } from "../../service/spotlist.service";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-map-infowindow-dialog",
  templateUrl: "./map-infowindow-dialog.component.html",
  styleUrls: ["./map-infowindow-dialog.component.scss"]
})
export class MapInfowindowDialogComponent implements OnInit ,OnDestroy{
  private onDestroy$ = new Subject();
  constructor(
    private translate: TranslateService,
    private router: Router,
    private commonService: CommonService,
    private myplanService: MyplanService,
    private indexedDBService: IndexedDBService,
    private spotListService: SpotListService,
    public dialogRef: MatDialogRef<MapInfowindowDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MapSpot
  ) { }

  guid: string;

  get lang() {
    return this.translate.currentLang;
  }

  async ngOnInit() {
    this.guid = await this.commonService.getGuid();
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }

  // スポット詳細を表示
  onClickSpotDetail() {
    if (this.data.type === 1) {
      this.dialogRef.close(this.data.spotId);
    }
  }

  // 現在地からの行き方
  onClickMapApp() {
    this.commonService.locationGoogleMap(this.lang, this.data.latitude, this.data.longitude);
    this.dialogRef.close();
  }

  // お気に入りに登録
  onClickFavorite() {
    this.spotListService
      .registFavorite(
        this.data.spotId,
        !this.data.isFavorite,
        this.guid
        // this.data.googleSpot
      )
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(r => {
        if (!r) {
          this.router.navigate(["/" + this.lang + "/systemerror"]);
          return;
        }
        this.data.isFavorite = !this.data.isFavorite;
      });
  }

  // プランに追加
  async onClickAddToPlan() {
    // スポット数チェック
    if(await this.commonService.checkAddPlan(1) === false) {
      const param = new ComfirmDialogParam();
      param.text = "ErrorMsgAddSpot";
      param.leftButton = "CreateNew";
      const dialog = this.commonService.confirmMessageDialog(param);
      dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
        if(d === "ok"){
          // プラン新規作成
          this.myplanService.onPlanUserRemoved();
        }
      });
      return;
    }

    // プランに追加
    this.spotListService
    .addSpot(this.data.spotId, this.data.type).then(result => {
      result.pipe(takeUntil(this.onDestroy$)).subscribe(async myPlanApp => {
        if (myPlanApp) {
          // プラン作成に反映
          this.myplanService.onPlanUserChanged(myPlanApp);
          // 保存
          this.indexedDBService.registPlan(myPlanApp);
          // 地図に反映
          this.dialogRef.close(myPlanApp.planSpots);
        }
      });
    });
  }

  // プランから削除
  onClickDelSpot() {
    this.dialogRef.close("delete");
  }
}
