import { Component, Inject, OnInit, OnDestroy, Injectable, ViewChild, ViewChildren, PLATFORM_ID, QueryList, Input } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { CommonService } from "../../service/common.service";
import { IndexedDBService } from "../../service/indexeddb.service";
import { SpotService } from "../../service/spot.service";
import { MyplanService } from "../../service/myplan.service";
import { PlanService } from "../../service/plan.service";
import { PlanSpotListService } from "../../service/planspotlist.service";
import {
  DataSelected,
  ComfirmDialogParam,
  MyPlanApp,
  PlanSpotCommon,
  PlanUserPicture,
  MapFullScreenParam,
  ListSelectedPlan,
  ImageCropperParam, editparams
} from "../../class/common.class";
import { ListSearchCondition } from "../../class/indexeddb.class";
import { LangFilterPipe } from "../../utils/lang-filter.pipe";
import { MatDialog } from "@angular/material/dialog";
import { MatAccordion, MatExpansionPanel } from "@angular/material/expansion";
import { GoogleSpotDialogComponent } from "../../parts/google-spot-dialog/google-spot-dialog.component";
import { MapDialogComponent } from "../../parts/map-dialog/map-dialog.component";
import { SearchDialogFormPlanComponent } from "../../parts/search-dialog-form-plan/search-dialog-form-plan.component";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { LoadingIndicatorService } from "../../service/loading-indicator.service";
import { moveItemInArray } from "@angular/cdk/drag-drop";
import { environment } from "../../../environments/environment";
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { isPlatformBrowser, isPlatformServer } from "@angular/common";
import { ImageCropperDialogComponent } from "../../parts/image-cropper-dialog/image-cropper-dialog.component";
import { HttpUrlEncodingCodec } from "@angular/common/http";
import { MyplanSpotEditDialogComponent } from "src/app/parts/myplan-spot-edit-dialog/myplan-spot-edit-dialog.component";
import { MyplanPlanEditDialogComponent } from "src/app/parts/myplan-plan-edit-dialog/myplan-plan-edit-dialog.component";
import { PlanspotComponent } from "../planspot/planspot.component";

// DatePickerの日本語日付表示修正用
@Injectable()
export class MyDateAdapter extends NativeDateAdapter {
  getDateNames(): string[] {
    const dateNames: string[] = [];
    for (let i = 0; i < 31; i++) {
      dateNames[i] = String(i + 1);
    }
    return dateNames;
  }
}
@Component({
  selector: "app-myplan",
  templateUrl: "./myplan.component.html",
  styleUrls: ["./myplan.component.scss"],
  providers: [
    { provide: DateAdapter, useClass: MyDateAdapter }
  ]
})

export class MyplanComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject();
  private baseUrl: string;
  private currentlang: string;
  codec = new HttpUrlEncodingCodec;

  constructor(
    private commonService: CommonService,
    private myplanService: MyplanService,
    private indexedDBService: IndexedDBService,
    private planService: PlanService,
    private spotService: SpotService,
    private planSpotListService: PlanSpotListService,
    private translate: TranslateService,
    public dialog: MatDialog,
    private router: Router,
    private loading: LoadingIndicatorService,
    private dateAdapter: DateAdapter<NativeDateAdapter>,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.baseUrl = document.getElementsByTagName("base")[0].href;
      this.currentlang = localStorage.getItem("gml");
    }
  }

  @ViewChild("keywordInput") keywordInput: { nativeElement: any };

  // 編集/プレビュー
  isEdit: boolean = true;
  // スポット0件時のダミー表示
  spotZero: PlanSpotCommon[];
  // 初期プラン
  initRow: MyPlanApp;
  // 作成中のプラン
  row: MyPlanApp;
  // プランの終了時間
  endTime: string;
  // エリア・カテゴリ(マスタ)
  listSelectedPlan: ListSelectedPlan;
  // エリア・カテゴリ選択値(表示用)
  optionKeywords: string[] = [];

  $stayTime: DataSelected[];

  $startTime: string[] = [];

  isMapDisp = false;

  isOpen = true;

  step = 999;

  isSaving = false;

  collapse: boolean = false;

  get lang() {
    return this.translate.currentLang;
  }

  pictureUrl: string = "../../../assets/img/icon_who.svg";

  @Input() isMobile: boolean;
  @Input() userPic: string;
  @Input() useName: string;

  /*------------------------------
   *
   * イベント
   *
   * -----------------------------*/

  async ngOnInit() {
    await this.getListSelected();

    //出発時間リストを生成
    for (let hour = 0; hour < 24; hour++) {
      this.$startTime.push(('0' + hour).slice(-2) + ':' + '00');
      this.$startTime.push(('0' + hour).slice(-2) + ':' + '30');
    }

    if (isPlatformServer(this.platformId)) {
      this.row = JSON.parse(JSON.stringify(this.initRow));
      return;
    }

    // 編集中のプランを取得
    let myPlan: any = await this.indexedDBService.getEditPlan();
    const myPlanApp: MyPlanApp = myPlan;

    if (myPlanApp) {
      // スポット・写真補完
      this.myplanService.getPlanComplement().then(result => {
        result.pipe(takeUntil(this.onDestroy$)).subscribe(r => {
          if (!r) {
            this.router.navigate(["/" + this.lang + "/systemerror"]);
            return;
          }
          // 写真を戻すために先にバインドしておく
          this.row = myPlanApp;
          this.setUserPicture(r);
          // if (this.row.planSpots && this.row.planSpots.length > 0) {
          //   this.isEdit = this.isMobile?false:true;
          // }
          this.indexedDBService.registPlan(this.row);
        });
      });
    } else {
      this.row = JSON.parse(JSON.stringify(this.initRow));
      this.indexedDBService.registPlan(this.row);
    }

    // カレンダーの言語切り替え
    if (this.currentlang !== "ja") {
      this.dateAdapter.setLocale('en-EN'); //暫定、日本語以外は英語表記に
    }

    // エリア・カテゴリの選択内容を表示
    this.myplanService.searchFilter.pipe(takeUntil(this.onDestroy$)).subscribe((result: string[]) => {
      this.optionKeywords = result;
    });

    // プラン編集変更通知
    this.myplanService.PlanUserEdit$.pipe(takeUntil(this.onDestroy$)).subscribe(async x => {
      // 編集モードにする
      this.isEdit = true;
      this.row = x;
      this.dataFormat();
    });

    // 追加通知
    this.myplanService.PlanUser$.pipe(takeUntil(this.onDestroy$)).subscribe(async x => {
      this.setUserPicture(x);
      // プレビュー表示
      // this.isEdit = false;
      // 編集モードにする
      this.isEdit = true;
      // 変更を保存
      this.registPlan(false);
      this.myplanService.FetchMyplanSpots();
    });

    // スポット削除通知
    this.myplanService.RemoveDisplayOrder$.pipe(takeUntil(this.onDestroy$)).subscribe(x => {
      // 削除したスポットを取得
      const planSpot = this.row.planSpots.find(spots => spots.displayOrder === x);
      // スポットを削除
      this.onClickSpotDelete(null, planSpot);
    });

    // プラン削除通知
    this.myplanService.RemovePlanUser$.pipe(takeUntil(this.onDestroy$)).subscribe(x => {
      this.planRemove();
    });

    // お気に入り更新通知
    this.myplanService.updFavirute$.pipe(takeUntil(this.onDestroy$)).subscribe(x => {
      if (this.row.planSpots && this.row.planSpots.length > 0) {
        let spot = this.row.planSpots.find(planSpot => planSpot.spotId === x.spotId && planSpot.type === x.type)
        if (spot) {
          spot.isFavorite = x.isFavorite;
        }
      }
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
  }

  myTrackBy(index: number): any {
    return index;
  }

  // 編集・プレビュー切り替え
  onClickEdit(isAuto: boolean = false) {
    this.isEdit = !this.isEdit;
    // プレビューの場合
    if (!this.isEdit) {
      // 移動方法取得処理
      if (this.row.isTransferSearch) {
        const ref = this.loading.show();
        this.myplanService.setTransfer(isAuto).then(result => {
          result.pipe(takeUntil(this.onDestroy$)).subscribe(r => {
            if (r) {
              this.setUserPicture(r);
              // 変更を保存
              this.registPlan(false);
              // 最適化OFF
              this.row.isAuto = false;
              ref.close();
            }
          });
        });
      } else {
        this.setPreviewPicture();
      }
    }
  }

  // エリア・カテゴリ選択
  onClickAreaCategory() {
    const dialogRef = this.dialog.open(SearchDialogFormPlanComponent, {
      maxWidth: "100%",
      width: "92vw",
      position: { top: "10px" },
      data: this.listSelectedPlan,
      autoFocus: false,
      // maxHeight: "80vh"
      id: "searchDialogPlan"
    });

    dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe(() => {
      if (this.listSelectedPlan.condition.areaId.length > 0) {
        this.row.areaId = this.listSelectedPlan.condition.areaId[0];
      } else {
        this.row.areaId = null;
      }
      if (this.listSelectedPlan.condition.areaId2.length > 0) {
        this.row.areaId2 = this.listSelectedPlan.condition.areaId2[0];
      } else {
        this.row.areaId2 = null;
      }
      this.row.categories = this.listSelectedPlan.condition.searchCategories
      this.myplanService.getSearchFilter(this.listSelectedPlan.mArea, this.listSelectedPlan.mSearchCategory, this.listSelectedPlan.condition);
      // 保存
      this.onChange(false);
    });
  }


  // プラン編集ダイアログ
  onClickPlanEdit(row: MyPlanApp) {
    console.log(row);
    const dialogRef = this.dialog.open(MyplanPlanEditDialogComponent, {
      maxWidth: "100%",
      width: this.isMobile ? "92vw" : "52vw",
      maxHeight: "90vh",
      position: { top: "10px" },
      data: row,
      autoFocus: false,
      id: "editplan"
    })
  }

  // スポット編集ダイアログ
  onClickSpotEdit(item: PlanSpotCommon) {
    let params = new editparams();
    params.item = item;
    params.stayTimes = this.$stayTime;
    params.myPlan = this.row;

    const dialogRef = this.dialog.open(MyplanSpotEditDialogComponent, {
      maxWidth: "100%",
      width: this.isMobile ? "92vw" : "52vw",
      maxHeight: "90vh",
      position: { top: "10px" },
      data: params,
      autoFocus: false,
      id: "editspot"
    });

    // dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe(result => {
    //   console.log(item);
    // })
  }

  // スポット全削除
  onClickClearAllSpot() {
    // 確認ダイアログの表示
    const param = new ComfirmDialogParam();
    param.title = "SpotAllClearConfirm";
    const dialog = this.commonService.confirmMessageDialog(param);
    dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
      if (d === "ok") {
        this.spotAllRemove();
      }
    });
  }

  // バスON・OFF
  onClickBus() {
    this.row.isBus = !this.row.isBus;
    // 保存
    this.onChange(true);
  }

  // 経路最適化
  onClickAuto() {
    // 最適化していないこと
    if (this.row.optimized) {
      this.commonService.messageDialog("Optimized");
      return;
    }

    // 出発地、到着地を含めてスポットが4つ以上あること
    let cnt = 0;
    if (this.row.startPlanSpot) {
      cnt += 1;
    }
    if (this.row.planSpots) {
      cnt += this.row.planSpots.length;
    }
    if (this.row.endPlanSpot) {
      cnt += 1;
    }
    if (cnt < 4) {
      this.commonService.messageDialog("ErrorMsgAuto");
      return;
    }

    // 最適化ON
    this.row.isAuto = true;
    this.row.isTransferSearch = true;

    const param = new ComfirmDialogParam();
    param.title = "AutoSearchConfirmTitle";
    param.text = "AutoSearchConfirmText";
    if (this.row.startPlanSpot) {
      param.textRep = [this.row.startPlanSpot.spotName];
    } else {
      param.textRep = [this.row.planSpots[0].spotName];
    }
    if (this.row.endPlanSpot) {
      param.textRep.push(this.row.endPlanSpot.spotName);
    } else {
      param.textRep.push(this.row.planSpots[this.row.planSpots.length - 1].spotName);
    }
    const dialog = this.commonService.confirmMessageDialog(param);
    dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
      if (d === "ok") {
        //  最適化
        this.onClickEdit(true);
      } else {
        // 最適化OFF
        this.row.isAuto = false;
      }
    });
  }

  // 出発地・到着地を設定
  async onClickStartEndSelect(isStart: boolean) {
    const dialog = this.dialog.open(GoogleSpotDialogComponent, {
      maxWidth: "100%",
      width: this.isMobile ? "92vw" : "52vw",
      maxHeight: "90vh",
      position: { top: "10px" },
      data: isStart ? [this.row.startPlanSpot, isStart] : [this.row.endPlanSpot, isStart],
      autoFocus: false,
      id: "gspot"
    });

    dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe(result => {
      if (result !== "cancel") {
        if (isStart) {
          this.row.startPlanSpot = result;
        } else {
          this.row.endPlanSpot = result;
        }
        // 保存
        this.onChange(true);
      }
    });
  }

  // 出発地・到着地を削除
  onClickStartEndDelete(isStart: boolean) {
    if (isStart) {
      this.row.startPlanSpot = null;
    } else {
      this.row.endPlanSpot = null;
    }
    // 保存
    this.onChange(true);
  }

  // 交通機関・車ON・OFF
  onClickTran(isCar: boolean) {
    this.row.isCar = isCar;
    // 保存
    this.onChange(true);
  }

  // 変更時保存
  onChange(value: boolean) {
    // 移動方法(一旦trueになったらfalseがきてもtrueのままにする)
    if (!this.row.isTransferSearch) {
      this.row.isTransferSearch = value;
    }
    if (value) {
      this.row.optimized = false;
    }
    // 保存
    this.registPlan(false);
  }

  // スポットを追加する
  async onClickAddSpot() {
    // スポット数チェック
    if (await this.commonService.checkAddPlan(1) === false) {
      this.commonService.messageDialog("ErrorMsgAddSpot");
      return;
    }

    this.router.navigate(["/" + this.lang + "/planspot"]);

    // スライドを閉じる
    this.commonService.onNotifyIsShowCart(false);
  }

  // Map
  onClickMap() {
    const param = new MapFullScreenParam();
    param.isDetail = false;
    param.planId = this.row.planUserId;
    param.planSpots = this.row.planSpots;
    param.startPlanSpot = this.row.startPlanSpot;
    param.endPlanSpot = this.row.endPlanSpot;
    param.isCar = this.row.isCar;
    const dialog = this.dialog.open(MapDialogComponent, {
      maxWidth: "100%",
      width: "100vw",
      height: "100vh",
      position: { top: "0" },
      data: param,
      autoFocus: false,
      id: "fullmap"
    });
  }

  // スポット入れ替え
  cdkDropListDroppedSpot(event: any) {
    moveItemInArray(this.row.planSpots, event.previousIndex, event.currentIndex);
    // 表示順設定
    let i = 1;
    this.row.planSpots.forEach(x => {
      x.displayOrder = i;
      if (x.planUserpictures) {
        x.planUserpictures.forEach(x => x.display_order = i);
      }
      i++;
    });
    // 保存
    this.onChange(true);
  }

  // スポット削除
  onClickSpotDelete(event: any, planSpot: PlanSpotCommon) {
    event.stopPropagation();

    // 1スポット削除して0スポットになる場合は編集エリアをすべて閉じる
    if (this.row.planSpots.length === 1) {
      this.spotAllRemove();
    } else {
      // スポットを削除
      this.row.planSpots.splice(
        this.row.planSpots.findIndex(
          v => v.displayOrder === planSpot.displayOrder
        ),
        1
      );
      // 表示順設定
      let i = 1;
      this.row.planSpots.forEach(x => x.displayOrder = i++);
    }
    // 保存
    this.onChange(true);
    // subject更新
    this.myplanService.FetchMyplanSpots();
  }

  // プランを保存する
  async onClickSavePlan() {
    if (!this.commonService.loggedIn) {
      const param = new ComfirmDialogParam();
      param.id = "cmd";
      param.title = "LoginConfirmTitle";
      const dialog = this.commonService.confirmMessageDialog(param);
      dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
        if (d === "ok") {
          // ログイン画面へ
          this.commonService.login();
        }
      });
      return;
    }

    // プラン名必須チェック
    if (!this.row.planName) {
      this.commonService.messageDialog("ErrorMsgRequiredPlanName");
      if (!this.isEdit) {
        this.isEdit = true;
        await this.sleep(500);
      }
      return;
    }

    if (this.row.planSpots) {
      for (let i = 0; i < this.row.planSpots.length; i++) {
        if (!this.row.planSpots[i].spotName) {
          this.commonService.messageDialog("NoSpotName");
          if (!this.isEdit) {
            this.isEdit = true;
            await this.sleep(500);
          }
          return;
        }
      }
    }

    // 保存ボタンロック
    this.isSaving = true;

    let isNew = false;
    if (this.row.planUserId === 0) {
      isNew = true;
    }

    // プランメイン写真の画像URL(ファイル名はプランユーザID＋拡張子)
    if (this.row.pictureFile) {
      this.row.pictureUrl = environment.blobUrl + "/pr{0}/{0}_{1}.webp";
    }

    // スポット写真
    if (this.row.planSpots) {
      for (let i = 0; i < this.row.planSpots.length; i++) {
        if (this.row.planSpots[i].planUserpictures) {
          for (let j = 0; j < this.row.planSpots[i].planUserpictures.length; j++) {
            if (this.row.planSpots[i].planUserpictures[j].pictureFile) {
              // 画像URLを設定(ファイル名は表示順(display_order)_画像表示順(picture_display_order)＋拡張子)
              this.row.planSpots[i].planUserpictures[j].picture_url = environment.blobUrl + "/pr{0}/" +
                this.row.planSpots[i].displayOrder + "_" + this.row.planSpots[i].planUserpictures[j].picture_display_order
                + "_{1}.webp";
            }
          }
        }
      }
    }

    // IndexdbDBに一旦保存
    this.registPlan(false);

    // 保存
    this.myplanService.registPlan().then(result => {
      result.pipe(takeUntil(this.onDestroy$)).subscribe(async r => {
        //if(r){
        const result = [];
        // プランメイン写真
        if (this.row.pictureFile) {
          if (this.row.imageCropped) {
            // blobに再変換
            var blob = this.commonService.base64toBlob(this.row.imageCropped);
            // blob object array( fileに再変換 )
            var file = this.commonService.blobToFile(blob, Date.now() + this.row.pictureFile.name);
            // 画像保存処理
            result.push(this.saveImagePlan(file
              , r.pictureUrl,
              r.planUserId));
          } else {
            // 画像保存処理
            result.push(this.saveImagePlan(this.row.pictureFile
              , r.pictureUrl,
              r.planUserId));
          }
        }

        // スポット写真
        if (this.row.planSpots) {
          for (let i = 0; i < this.row.planSpots.length; i++) {
            if (this.row.planSpots[i].planUserpictures) {
              for (let j = 0; j < this.row.planSpots[i].planUserpictures.length; j++) {
                if (this.row.planSpots[i].planUserpictures[j].pictureFile) {
                  if (this.row.planSpots[i].planUserpictures[j].imageCropped) {
                    // blobに再変換
                    var blob = this.commonService.base64toBlob(this.row.planSpots[i].planUserpictures[j].imageCropped);
                    // blob object array( fileに再変換 )
                    var file = this.commonService.blobToFile(blob, Date.now() + this.row.planSpots[i].planUserpictures[j].pictureFile.name);
                    // 画像保存処理
                    result.push(this.saveImagePlan(file
                      , r.planSpots[i].planUserpictures[j].picture_url,
                      r.planUserId));
                  } else {
                    // 画像保存処理
                    result.push(this.saveImagePlan(this.row.planSpots[i].planUserpictures[j].pictureFile
                      , r.planSpots[i].planUserpictures[j].picture_url,
                      r.planUserId));
                  }
                }
              }
            }
          }
        }

        await Promise.all(result);

        // マイページに保存通知
        this.myplanService.onPlanUserSaved(r);

        this.row = r;
        this.dataFormat();
        // 変更を保存
        this.registPlan(true);
        // 保存完了
        if (location.pathname.indexOf("mypage") > 0 || !isNew) {
          this.commonService.snackBarDisp("PlanSave");
        } else {
          const param = new ComfirmDialogParam();
          param.title = "PlanSavedConfirmTitle";
          param.leftButton = "PlanSavedConfirmButton";
          const dialog = this.commonService.confirmMessageDialog(param);
          dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
            // マイプラン一覧へ
            if (d === "ok") {
              this.commonService.onNotifyIsShowCart(false);
              this.router.navigate(["/" + this.lang + "/mypage"], { fragment: "list" });
            }
          });
        }
        // 保存ボタンロック解除
        this.isSaving = false;
      });
    });
  }

  // 新規プラン作成ボタンクリック時
  onClickNewPlan() {
    if (this.row && !this.row.isSaved) {
      // 確認ダイアログの表示
      const param = new ComfirmDialogParam();
      param.title = "NewPlanConfirmTitle";
      param.text = "NewPlanConfirmText";
      param.leftButton = "CreateNew";
      const dialog = this.commonService.confirmMessageDialog(param);
      dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
        // 新しいプランを作成する
        if (d === "ok") {
          this.planRemove();
        }
      });
    } else {
      this.planRemove();
    }
  }

  /*------------------------------
   *
   * メソッド
   *
   * -----------------------------*/
  // 選択リスト取得
  getListSelected(): Promise<boolean> {
    return new Promise(async (resolve) => {
      this.myplanService.getDataSelected().pipe(takeUntil(this.onDestroy$)).subscribe(r => {
        this.$stayTime = r.stayTime;
        this.spotService.businessday = r.businessDay;
        this.listSelectedPlan = r.listSelectedPlan;
        this.listSelectedPlan.mArea.sort((a, b) => a.parentId > b.parentId ? 1 : -1);
        this.listSelectedPlan.mArea.map(x => x.isHighlight = false);
        this.spotZero = r.myPlan.planSpots;
        this.initRow = JSON.parse(JSON.stringify(r.myPlan));
        this.initRow.planSpots = null;
        for (let i = 0; i < this.spotZero.length; i++) {
          // 多言語項目の使用言語で設定
          this.commonService.setAddPlanLang(this.spotZero[i], this.lang);
        }
        resolve(true);
      });
    });
  }
  // スポット一括クリア
  spotAllRemove() {
    if (this.row.startPlanSpot || this.row.endPlanSpot) {
      this.row.isTransferSearch = true;
    } else {
      this.row.isTransferSearch = false;
    }
    this.row.timeRequired = null;
    this.row.timeRequiredDisp = null;
    this.row.isAuto = false;
    this.row.optimized = false;
    this.row.isBus = false;
    this.endTime = null;
    this.row.planSpots = null;
    this.isEdit = true;
    this.registPlan(false);
    this.step = 999;
    //this.accordionSpot.closeAll();
    this.myplanService.FetchMyplanSpots();
  }

  // 一括クリア
  planRemove() {
    // 編集エリアを閉じる
    this.step = 999;
    // if (this.accordionPlan) {
    //   this.accordionPlan.closeAll();
    // }
    // if (this.accordionSpot) {
    //   this.accordionSpot.closeAll();
    // }
    // プラン初期化
    this.row = JSON.parse(JSON.stringify(this.initRow));
    // 終了時間を削除
    this.endTime = null;
    // エリア・カテゴリの選択状態を解除
    this.listSelectedPlan.condition = null;
    // 変更を保存
    this.indexedDBService.registPlan(this.row);
    this.isEdit = true;
    // subject更新
    this.myplanService.FetchMyplanSpots();
  }

  async dataFormat() {
    const langpipe = new LangFilterPipe();

    if (!this.listSelectedPlan.condition) {
      this.listSelectedPlan.condition = new ListSearchCondition();
    }
    if (this.row.areaId) {
      this.listSelectedPlan.condition.areaId = [this.row.areaId];
    }
    if (this.row.areaId2) {
      this.listSelectedPlan.condition.areaId2 = [this.row.areaId2];
    }
    if (this.row.categories) {
      this.listSelectedPlan.condition.searchCategories = this.row.categories;
    }
    this.myplanService.getSearchFilter(this.listSelectedPlan.mArea, this.listSelectedPlan.mSearchCategory, this.listSelectedPlan.condition);

    // プレビュー用の画像を設定
    this.setPreviewPicture();

    // 出発地が設定されている場合
    if (this.row.startPlanSpot) {
      // 多言語項目の使用言語で設定
      this.commonService.setAddPlanLang(this.row.startPlanSpot, this.lang);
      // 移動方法
      if (!this.row.isCar && this.row.startPlanSpot.transfer) {
        // 次のスポットがある場合
        if (this.row.planSpots.length > 0) {
          if (this.row.planSpots[0].type === 1) {
            this.row.startPlanSpot.destination = this.commonService.isValidJson(this.row.planSpots[0].spotName, this.lang);
          } else {
            this.row.startPlanSpot.destination = this.row.planSpots[0].spotName;
          }
        }

        let transfer: any;
        try {
          transfer = this.commonService.isValidJson(this.row.startPlanSpot.transfer, this.lang);
        }
        catch {
          transfer = JSON.parse(this.row.startPlanSpot.transfer)[0].text;
        }

        this.row.startPlanSpot.line = this.planService.transline(transfer);
        this.row.startPlanSpot.transtime = this.planService.transtimes(transfer);
        this.row.startPlanSpot.transflow = this.planService.transflows(transfer);
      }
    }

    // 終了時間(出発時間＋所要時間)
    if (this.row.startTime && this.row.timeRequired) {
      // 所要時間を設定
      const hour = Number(this.row.timeRequired.substring(0, 2));
      const minute = Number(this.row.timeRequired.substring(3, 5));
      this.row.timeRequiredDisp =
        (hour > 0 ? hour + " " + this.translate.instant("Hour") + " " : "") +
        minute + " " + this.translate.instant("Minute");

      // 出発時間＋所要時間
      let startTime = new Date("1970/1/1 " + this.row.startTime);
      startTime.setMinutes(startTime.getMinutes() + hour * 60 + minute);
      this.endTime = startTime.getHours().toString() + ":"
        + (startTime.getMinutes() < 10 ? "0" + startTime.getMinutes() : startTime.getMinutes()).toString();
    }

    // 到着地が設定されている場合
    if (this.row.endPlanSpot) {
      // 多言語項目の使用言語で設定
      this.commonService.setAddPlanLang(this.row.endPlanSpot, this.lang);
      // 最終スポットの到着地を到着地に設定
      this.row.planSpots[this.row.planSpots.length - 1].destination = this.row.endPlanSpot.spotName;
    }

    if (this.row.planSpots) {
      for (let i = 0; i < this.row.planSpots.length; i++) {
        // 多言語項目の使用言語で設定
        this.commonService.setAddPlanLang(this.row.planSpots[i], this.lang);

        if (this.row.planSpots[i].type === 1) {
          // 営業時間
          this.row.planSpots[i].businessHourHead = this.spotService.getBusinessHourHead(
            this.row.planSpots[i].businessHours
          );
          // 定休日
          this.row.planSpots[i].holiday = this.spotService.getRegularholidays(
            this.row.planSpots[i].regularHoliday
          );
        }

        // 移動方法
        if (!this.row.isCar && this.row.planSpots[i].transfer) {
          // 次のスポットがある場合
          if (i + 1 < this.row.planSpots.length) {
            if (this.row.planSpots[i + 1].type === 1) {
              this.row.planSpots[i].destination = this.commonService.isValidJson(this.row.planSpots[i + 1].spotName, this.lang);
            } else {
              this.row.planSpots[i].destination = this.row.planSpots[i + 1].spotName;
            }
          }
          // 移動方法
          let transfer: any;
          try {
            transfer = this.commonService.isValidJson(this.row.planSpots[i].transfer, this.lang);
          }
          catch {
            transfer = JSON.parse(this.row.planSpots[i].transfer)[0].text;
          }

          this.row.planSpots[i].line = this.planService.transline(transfer);
          this.row.planSpots[i].transtime = this.planService.transtimes(transfer);
          this.row.planSpots[i].transflow = this.planService.transflows(transfer);
        }
      }
    }
  }

  // プランをIndexedDBに保存
  registPlan(isSaved: boolean) {
    // 未保存プランの場合、常にステータスは未保存
    if (this.row.planUserId === 0) {
      this.row.isSaved = false;
    } else {
      this.row.isSaved = isSaved;
    }
    this.indexedDBService.registPlan(this.row);
  }

  linktoSpot(planSpot: PlanSpotCommon) {
    if (planSpot.type === 1) {
      this.router.navigate(["/" + this.lang + "/spots/detail/", planSpot.spotId]);
    } else {
      this.commonService.locationPlaceIdGoogleMap(this.lang, planSpot.latitude, planSpot.longitude, planSpot.googleSpot.place_id);
    }
  }

  saveImagePlan(file: File, pictureUrl: string, planId: number) {
    return new Promise((resolve) => {
      // 画像アップロード
      this.planService.fileUpload(file
        , pictureUrl.substring(
          pictureUrl.lastIndexOf("/") + 1
          , pictureUrl.length)
        , planId).pipe(takeUntil(this.onDestroy$)).subscribe(() => {
          resolve(true);
        });
    });
  }

  async setUserPicture(myPlanApp: MyPlanApp) {
    if (this.row && this.row.planUserId === myPlanApp.planUserId) {
      // 画像ファイル、プレビューURLを設定
      myPlanApp.picturePreviewUrl = this.row.picturePreviewUrl;
      myPlanApp.pictureFile = this.row.pictureFile;
      if (myPlanApp.planSpots && this.row.planSpots) {
        for (let i = 0; i < myPlanApp.planSpots.length; i++) {
          let planSpot = this.row.planSpots.find(x => x.displayOrder === myPlanApp.planSpots[i].displayOrder);
          if (planSpot?.planUserpictures) {
            myPlanApp.planSpots[i].planUserpictures = planSpot.planUserpictures;
          }
        }
      }
    }

    this.row = myPlanApp;
    this.dataFormat();
  }

  // プレビュー用の画像設定
  setPreviewPicture() {
    // 表示する画像を設定
    if (this.row.planSpots) {
      for (let i = 0; i < this.row.planSpots.length; i++) {
        if (this.row.planSpots[i].planUserpictures?.length > 0) {
          this.row.planSpots[i].previewPictures = this.row.planSpots[i].planUserpictures.map(x => x.imageCropped ?? x.picturePreviewUrl ?? x.picture_url);
          this.row.planSpots[i].previewMemos = this.row.planSpots[i].planUserpictures.map(x => x.memo);
        } else {
          this.row.planSpots[i].previewPictures = this.row.planSpots[i].pictures;
          this.row.planSpots[i].previewMemos = this.row.planSpots[i].pictureMemos;
        }
      }
    }
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
    nav: true
  };

  setStep(i: number) {
    this.step = i;
  }

  onKeywordSearch(e) {
    const val = e.target.value.toLowerCase();
    if (val !== "") {
      let condition = new ListSearchCondition();
      condition.sortval = "11";
      condition.select = "all";
      condition.keyword = val;

      this.router.navigate(["/" + this.lang + "/planspot"], { queryParams: { aid: '', era: '', cat: '', srt: condition.sortval, lst: condition.select, kwd: condition.keyword } });

      if (~this.router.url.indexOf('planspot')) {
        this.planSpotListService.updSearchCondition(condition);
      }
      this.commonService.onNotifyIsShowCart(false);
    }
  }

  inputClear() {
    this.keywordInput.nativeElement.value = "";
    return;
  }

  isCollapse() {
    return this.collapse = !this.collapse;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
