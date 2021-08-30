import { Component, Inject, OnInit, OnDestroy, Injectable, ViewChild, PLATFORM_ID } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { CommonService } from "../../service/common.service";
import { IndexedDBService } from "../../service/indexeddb.service";
import { PlanListService } from "../../service/planlist.service";
import { SpotService } from "../../service/spot.service";
import { MyplanService } from "../../service/myplan.service";
import { PlanService } from "../../service/plan.service";
import {
  DataSelected,
  ComfirmDialogParam,
  MyPlanApp,
  PlanSpotCommon,
  PlanUserPicture,
  MapFullScreenParam,
  ListSelectedPlan,
  ImageCropperParam} from "../../class/common.class";
import { ListSearchCondition } from "../../class/indexeddb.class";
import { searchResult, PlanAppList } from "../../class/planlist.class";
import { LangFilterPipe } from "../../utils/lang-filter.pipe";
import { MatDialog } from "@angular/material/dialog";
import { MatAccordion } from "@angular/material/expansion";
import { GoogleSpotDialogComponent } from "../../parts/google-spot-dialog/google-spot-dialog.component";
import { MapDialogComponent } from "../../parts/map-dialog/map-dialog.component";
import { SearchDialogFormPlanComponent } from "../../parts/search-dialog-form-plan/search-dialog-form-plan.component";
import { UrlcopyDialogComponent } from "../../parts/urlcopy-dialog/urlcopy-dialog.component";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { LoadingIndicatorService } from "../../service/loading-indicator.service";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { environment } from "../../../environments/environment";
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import * as moment from 'moment';
import { isPlatformBrowser } from "@angular/common";
import { ImageCropperDialogComponent } from "../../parts/image-cropper-dialog/image-cropper-dialog.component";
import { Catch } from "src/app/class/log.class";

// DatePickerの日本語日付表示修正用
@Injectable()
export class MyDateAdapter extends NativeDateAdapter{
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
  providers:[
    {provide:DateAdapter,useClass:MyDateAdapter}
  ]
})
export class MyplanComponent implements OnInit ,OnDestroy{
  private onDestroy$ = new Subject();
  private baseUrl:string;
  private currentlang:string;

  constructor(
    private commonService: CommonService,
    private myplanService: MyplanService,
    private indexedDBService: IndexedDBService,
    private planListService: PlanListService,
    private planService: PlanService,
    private spotService: SpotService,
    private translate: TranslateService,
    public dialog: MatDialog,
    private router: Router,
    private loading:LoadingIndicatorService,
    private dateAdapter:DateAdapter<NativeDateAdapter>,
    //@Inject("BASE_URL") private baseUrl: string
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if(isPlatformBrowser(this.platformId)){
      this.baseUrl = document.getElementsByTagName("base")[0].href;
      this.currentlang = localStorage.getItem("gml");
    }
  }

  @ViewChild("mepPlan") accordionPlan: MatAccordion;
  @ViewChild("mepSpot") accordionSpot: MatAccordion;

  // 編集/プレビュー
  isEdit:boolean = true;
  // スポット0件時のダミー表示
  spotZero: PlanSpotCommon[];
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

  get lang() {
    return this.translate.currentLang;
  }

  /*------------------------------
   *
   * イベント
   *
   * -----------------------------*/

  ngOnInit() {
    // 表示するプランを設定(初回表示)
    this.setEditPlan();
    // 閲覧履歴を取得
    // this.getHistory();

    // カレンダーの言語切り替え
    if(this.currentlang!=="ja"){
      this.dateAdapter.setLocale('en-EN'); //暫定、日本語以外は英語表記に
    }

    //出発時間リストを生成
    this.genStartTimes();

    // エリア・カテゴリの選択内容を表示
    this.planListService.searchFilterNoList.pipe(takeUntil(this.onDestroy$)).subscribe((result: searchResult)=>{
      this.optionKeywords = result.searchTarm!="" ? result.searchTarm.split(","):[];
    });

    // 追加通知
    this.myplanService.PlanUser$.pipe(takeUntil(this.onDestroy$)).subscribe(async x => {
      // 編集モードにする
      this.isEdit = true;
      this.setUserPicture(x);
      this.myplanService.FetchMyplanSpots();
    });

    // スポット削除通知
    this.myplanService.RemoveDisplayOrder$.pipe(takeUntil(this.onDestroy$)).subscribe(x => {
      // 編集モードにする
      this.isEdit = true;
      // 削除したスポットを取得
      const planSpot = this.row.planSpots.find(spots => spots.displayOrder === x);
      // スポットを削除
      this.onClickSpotDelete(planSpot);
    });

    // プラン削除通知
    this.myplanService.RemovePlanUser$.pipe(takeUntil(this.onDestroy$)).subscribe(x => {
      this.planRemove();
    });
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }

  myTrackBy(index: number): any {
    return index;
  }

  // 編集・プレビュー切り替え
  onClickEdit(){
    this.isEdit = !this.isEdit;
    // プレビューの場合
    if (!this.isEdit) {
      // 移動方法取得処理
      if (this.row.isTransferSearch){
        const ref = this.loading.show();
        this.myplanService.setTransfer().then(result => {
          result.pipe(takeUntil(this.onDestroy$)).subscribe(r => {
            if (r) {
              this.setUserPicture(r);
              this.setPreviewPicture();
              ref.close();
            }
          });
        });
      } else {
        this.setPreviewPicture();
      }
    }
  }

  // プランメイン写真
  async onClickSelectPhotoPlan(e:any) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0] as File;
      const img = await this.commonService.imageSize(file);
      this.row.picturePreviewUrl = img.previewUrl;
      this.row.pictureFile = img.file;
      this.row.aspectRatio = "1";
      this.onChange(false);
    }
  }

  // プランメイン写真削除
  onClickPhotoDeletePlan(): void {
    this.row.pictureFile = null;
    this.row.picturePreviewUrl = null;
    this.row.pictureUrl = null;
    this.row.imageCropped = null;
    this.row.cropperPosition = null;
    this.onChange(false);
  }

  onClickCropPlan() {
    let param = new ImageCropperParam();
    
    param.isAspectRatio = true;
    param.aspectRatio = this.row.aspectRatio;
    param.cropperPosition = this.row.cropperPosition;
    param.imageCropped = this.row.imageCropped;
    param.pictureFile = this.row.pictureFile;
    param.picturePreviewUrl = this.row.picturePreviewUrl;
    console.log(param);
    const dialogRef = this.dialog.open(ImageCropperDialogComponent, {
      id:"imgcrop",
      maxWidth: "100%",
      width: "100vw",
      position: { top: "0px" },
      data: param,
      autoFocus: false
    });

    dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((r: any) => {
      if (r && r !== "cancel"){
        console.log(r);
        this.row.imageCropped = r.imageCropped;
        this.row.aspectRatio = r.aspectRatio;
        this.row.cropperPosition = r.cropperPosition;
        this.onChange(false);
      }
    });
  }

  // エリア・カテゴリ選択
  onClickAreaCategory() {
    const dialogRef = this.dialog.open(SearchDialogFormPlanComponent, {
      maxWidth: "100%",
      width: "92vw",
      position: { top: "10px" },
      data: this.listSelectedPlan,
      autoFocus: false
      // maxHeight: "80vh"
    });

    dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe(() => {
      // const condition: ListSearchCondition = result;
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
      // 選択値を保持
      // this.listSelectedPlan.condition = result;
      // 保存
      this.onChange(false);
    });
  }

  // スポット写真
  async onClickSelectPhotoSpot(e:any, planSpot: PlanSpotCommon) {
    if (e.target.files) {
      for(let i = 0; i < e.target.files.length; i++) {
        if (e.target.files[i]) {
          const file = e.target.files[i] as File;
          const img = await this.commonService.imageSize(file);
          let picture = new PlanUserPicture();
          picture.display_order = planSpot.displayOrder;
          if (planSpot.planUserpictures) {
            picture.picture_display_order = planSpot.planUserpictures.length + 1;
          } else {
            picture.picture_display_order = 1;
          }
          picture.pictureFile = img.file;
          picture.picturePreviewUrl = img.previewUrl;
          if (planSpot.planUserpictures){
            planSpot.planUserpictures.push(picture);
          } else {
            planSpot.planUserpictures = [ picture ];
          }
        }
      }
      this.onChange(false);
    }
  }

  // スポット写真削除
  onClickPhotoDeleteSpot(planSpot: PlanSpotCommon, picture: PlanUserPicture){
    planSpot.planUserpictures.splice(
      planSpot.planUserpictures.findIndex(
        v => v.picture_display_order === picture.picture_display_order
      ),
      1
    );
    let i = 1;
    planSpot.planUserpictures.forEach(picture => {
      picture.picture_display_order = i++;
    });
    this.onChange(false);
  }

  onClickCropSpot(planSpot: PlanSpotCommon, picture: PlanUserPicture) {
    let param = new ImageCropperParam();
    if (picture.picture_display_order === 1) {
      param.isAspectRatio = true;
    } else {
      param.isAspectRatio = false;
    }
    param.aspectRatio = planSpot.aspectRatio;
    param.cropperPosition = picture.cropperPosition;
    param.imageCropped = picture.imageCropped;
    param.pictureFile = picture.pictureFile;
    param.picturePreviewUrl = picture.picturePreviewUrl;
    const dialogRef = this.dialog.open(ImageCropperDialogComponent, {
      id:"imgcrop",
      maxWidth: "100%",
      width: "92vw",
      position: { top: "10px" },
      data: param,
      autoFocus: false
    });

    dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((r: any) => {
      if (r && r !== "cancel"){
        const idx = this.row.planSpots.findIndex(x => x.displayOrder === planSpot.displayOrder);
        const idxPic = this.row.planSpots[idx].planUserpictures.findIndex(x => x.picture_display_order === picture.picture_display_order);

        this.row.planSpots[idx].planUserpictures[idxPic].imageCropped = r.imageCropped;
        this.row.planSpots[idx].aspectRatio = r.aspectRatio;
        this.row.planSpots[idx].planUserpictures[idxPic].cropperPosition = r.cropperPosition;
        this.onChange(false);
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
      this.row.isAuto = true;
      // 保存
      this.onChange(true);
    
  }

  // 出発地・到着地を設定
  async onClickStartEndSelect(isStart: boolean){
    const dialog = this.dialog.open(GoogleSpotDialogComponent, {
      maxWidth: "100%",
      width: "92vw",
      maxHeight: "90vh",
      position: { top: "10px" },
      data: isStart ? [ this.row.startPlanSpot, isStart ] : [ this.row.endPlanSpot, isStart ],
      autoFocus: false,
      id:"gspot"
    });

    dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe(result => {
      if (result !== "cancel") {
        if (isStart){
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
  onClickStartEndDelete(isStart: boolean){
    if(isStart){
      this.row.startPlanSpot = null;
    } else {
      this.row.endPlanSpot = null;
    }
    // 保存
    this.onChange(true);
  }

  // 変更時保存
  onChange(value: boolean){
    // 移動方法(一旦trueになったらfalseがきてもtrueのままにする)
    if (!this.row.isTransferSearch){
      this.row.isTransferSearch = value;
    }
    // 保存
    this.registPlan(false);
  }

  // スポットを追加する
  async onClickAddSpot(){
    // スポット数チェック
    if (await this.commonService.checkAddPlan(1) === false){
      return;
    }

    this.router.navigate(["/" + this.lang + "/spots"]);

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
    const dialog = this.dialog.open(MapDialogComponent, {
      maxWidth: "100%",
      width: "100vw",
      height:"100vh",
      position: { top: "0" },
      data: param,
      autoFocus: false,
      id:"fullmap"
    });
  }

  // スポット入れ替え
  cdkDropListDroppedSpot(event:any) {
    // console.log("dragged!!");
    // event.stopPropagation();
    moveItemInArray(this.row.planSpots, event.previousIndex, event.currentIndex);
    // 表示順設定
    let i = 1;
    this.row.planSpots.forEach(x => {
       x.displayOrder = i;
       if (x.planUserpictures){
        x.planUserpictures.forEach(x => x.display_order = i);
       }
       i++;
    });
    // 保存
    this.onChange(true);
  }

  // スポット削除
  onClickSpotDelete(planSpot: PlanSpotCommon) {
    // 1スポット削除して0スポットになる場合は一括クリアと同じ処理
    if(this.row.planSpots.length === 1){
      this.planRemove();
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

      // 保存
      this.onChange(true);
    }
    // subject更新
    this.myplanService.FetchMyplanSpots();
  }

  // プランを共有する
  onClickSharePlan() {
    // プラン保存済み
    if (this.row.planUserId > 0 && this.row.isSaved && !this.row.isShare){
      this.myplanService.registShare(this.row.planUserId).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
        if (r !== null) {
          this.row.isShare = true;
          this.row.shareUrl = r;
          this.shareDialog();
        }
      });
    } else {
      this.shareDialog();
    }
  }

  // プランを保存する
  onClickSavePlan() {
    if (!this.commonService.loggedIn) {
      // ログイン画面へ
      this.commonService.login();
      return;
    }

    // プランメイン写真の画像URL(ファイル名はプランユーザID＋拡張子)
    if (this.row.pictureFile) {
      this.row.pictureUrl = environment.blobUrl + "/pr{0}/{0}_{1}.webp";
    }

    // スポット写真
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

    // IndexdbDBに一旦保存
    this.registPlan(false);

    // 保存
    this.myplanService.registPlan().then(result => {
      result.pipe(takeUntil(this.onDestroy$)).subscribe(async r => {
        //if(r){
          // プランメイン写真
          if (this.row.pictureFile) {
            if (this.row.imageCropped) {
              // blobに再変換
              var blob = this.commonService.base64toBlob(this.row.imageCropped);
              // blob object array( fileに再変換 )
              var file = this.commonService.blobToFile(blob, Date.now() + this.row.pictureFile.name);
              // 画像保存処理
              await this.saveImagePlan(file
                , r.pictureUrl,
                r.planUserId);
            } else {
              // 画像保存処理
              await this.saveImagePlan(this.row.pictureFile
                , r.pictureUrl,
                r.planUserId);
            }
          }

          // スポット写真
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
                    await this.saveImagePlan(file
                      , r.planSpots[i].planUserpictures[j].picture_url,
                      r.planUserId);
                  } else {
                    // 画像保存処理
                    await this.saveImagePlan(this.row.planSpots[i].planUserpictures[j].pictureFile
                      , r.planSpots[i].planUserpictures[j].picture_url,
                      r.planUserId);
                  }
                }
              }
            }
          }

          // マイページに保存通知
          this.myplanService.onPlanUserSaved(r);

          this.row = r;
          this.dataFormat();
          // 変更を保存
          this.registPlan(true);

          // 保存完了
          this.commonService.snackBarDisp("PlanSaved");
        // } else {
        //   //this.router.navigate(["/" + this.lang + "/systemerror"]);
        //   //return;
        // }
      });
    });
  }

  // 破棄(新規)・新規プラン作成ボタンクリック時
  onClickBatchClear(isNew: boolean) {
    if (this.row && !this.row.isSaved){
      // 確認ダイアログの表示
      const param = new ComfirmDialogParam();
      if (isNew) {
        param.title = "NewPlanConfirm";
      } else {
        param.title = "PlanClearConfirm";
      }
      param.leftButton = "Cancel";
      param.rightButton = "OK";
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

  // 破棄(変更)
  onClickReset(){
    // 確認ダイアログの表示
    const param = new ComfirmDialogParam();
    param.title = "ResetPlanConfirm";
    param.leftButton = "Cancel";
    param.rightButton = "OK";
    const dialog = this.commonService.confirmMessageDialog(param);
    dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
      // 編集をリセット
      if (d === "ok") {
        // DBから取得
        this.myplanService.getPlanUser(this.row.planUserId.toString()).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
          if (r) {
            // 画面に反映
            this.row = r;
            // プラン保存
            this.indexedDBService.registPlan(r);
            // subject更新
            this.myplanService.FetchMyplanSpots();
          }
        });
      }
    });
  }

  /*------------------------------
   *
   * メソッド
   *
   * -----------------------------*/

  // 選択リスト取得
  getListSelected(): Promise<boolean>{
    return new Promise(async (resolve) => {
      this.myplanService.getDataSelected().pipe(takeUntil(this.onDestroy$)).subscribe(r => {
        this.$stayTime = r.stayTime;
        this.spotService.businessday = r.businessDay;
        this.listSelectedPlan = r.listSelectedPlan;
        this.listSelectedPlan.mArea.sort((a, b) => a.parentId > b.parentId  ? 1 : -1);
        this.listSelectedPlan.mArea.map(x => x.isHighlight = false);
        this.listSelectedPlan.planList = new Array<PlanAppList>();
        this.listSelectedPlan.isList = false;
        this.spotZero = r.planSpots;
        for (let i = 0; i < this.spotZero.length; i++) {
          // 多言語項目の使用言語で設定
          this.commonService.setAddPlanLang(this.spotZero[i], this.lang);
        }
        resolve(true);
      });
    });
  }

  // 表示するプランを設定
  async setEditPlan(){
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
        });
      });
    } else if (!this.$stayTime) {
      // 選択リストを取得
      await this.getListSelected();
    }
  }

  /* 閲覧履歴を取得
  async getHistory(){
    // 閲覧履歴を取得
    const hisSpot: any = await this.indexedDBService.getHistorySpot();
    this.historySpot = hisSpot.reverse();
    const hisPlan: any = await this.indexedDBService.getHistoryPlan();
    this.historyPlan = hisPlan.reverse();
  }*/

  // 一括クリア
  planRemove(){
    // 編集エリアを閉じる
    this.accordionPlan.closeAll();
    this.accordionSpot.closeAll();
    // プラン初期化
    this.row = null;
    // 終了時間を削除
    this.endTime = null;
    // エリア・カテゴリの選択状態を解除
    this.listSelectedPlan.condition = null;
    // ストレージから削除
    this.indexedDBService.clearMyPlan();

    this.myplanService.FetchMyplanSpots();
  }

  // 共有ダイアログの表示
  shareDialog() {
    this.dialog.open(UrlcopyDialogComponent, {
      maxWidth: "100%",
      width: "92vw",
      position: { top: "10px" },
      data: this.row.isShare && this.row.isSaved ? this.baseUrl + this.lang + "/sharedplan/" + this.row.shareUrl : "",
      autoFocus: false
    });
  }

  dataFormat() {
    const langpipe = new LangFilterPipe();

    if (!this.listSelectedPlan.condition){
      this.listSelectedPlan.condition = new ListSearchCondition();
    }
    if (this.row.areaId) {
      this.listSelectedPlan.condition.areaId = [ this.row.areaId ];
    }
    if (this.row.areaId2) {
      this.listSelectedPlan.condition.areaId2 = [ this.row.areaId2 ];
    }
    if (this.row.categories) {
      this.listSelectedPlan.condition.searchCategories = this.row.categories;
    }
    this.planListService.getSearchFilter(this.listSelectedPlan, this.listSelectedPlan.condition);

    // 出発地が設定されている場合
    if (this.row.startPlanSpot){
      // 多言語項目の使用言語で設定
      this.commonService.setAddPlanLang(this.row.startPlanSpot, this.lang);
      // 移動方法
      if (this.row.startPlanSpot.transfer) {
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
        catch{
          transfer = JSON.parse(this.row.startPlanSpot.transfer)[0].text;
        }

        this.row.startPlanSpot.line = this.planService.transline(transfer);
        this.row.startPlanSpot.transtime = this.planService.transtimes(transfer);
        this.row.startPlanSpot.transflow = this.planService.transflows(transfer);
      }
    }

    // 終了時間(出発時間＋所要時間)
    if (this.row.startTime && this.row.timeRequired){
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
    if (this.row.endPlanSpot){
      // 多言語項目の使用言語で設定
      this.commonService.setAddPlanLang(this.row.endPlanSpot, this.lang);
      // 最終スポットの到着地を到着地に設定
      this.row.planSpots[this.row.planSpots.length - 1].destination = this.row.endPlanSpot.spotName;
    }

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
      if (this.row.planSpots[i].transfer) {
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
        catch{
          transfer = JSON.parse(this.row.planSpots[i].transfer)[0].text;
        }

        this.row.planSpots[i].line = this.planService.transline(transfer);
        this.row.planSpots[i].transtime = this.planService.transtimes(transfer);
        this.row.planSpots[i].transflow = this.planService.transflows(transfer);
      }
    }
  }

  // プランをIndexedDBに保存
  registPlan(isSaved: boolean){
    // 未保存プランの場合、常にステータスは未保存
    if(this.row.planUserId === 0){
      this.row.isSaved = false;
    } else {
      this.row.isSaved = isSaved;
    }
    this.indexedDBService.registPlan(this.row);
  }

  linktoSpot(sid:any){
    this.router.navigate(["/" + this.lang + "/spots/detail/",sid]);
  }

  genStartTimes(){
    for (let hour = 7; hour < 24; hour++){
      this.$startTime.push(moment({hour}).format('HH:mm'));
      this.$startTime.push(moment({hour,minute:30}).format('HH:mm'));
    }
  }
/*
  getImageExt(fileName: string) {
    return fileName.substring(fileName.lastIndexOf(".") ,fileName.length);
  }
*/
  saveImagePlan(file: File, pictureUrl: string, planId: number){
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

  async setUserPicture(myPlanApp: MyPlanApp){
    if (this.row && this.row.planUserId === myPlanApp.planUserId) {
      // 画像ファイル、プレビューURLを設定
      myPlanApp.picturePreviewUrl = this.row.picturePreviewUrl;
      myPlanApp.pictureFile = this.row.pictureFile;
      for(let i = 0; i < myPlanApp.planSpots.length; i++) {
        let planSpot = this.row.planSpots.find(x => x.displayOrder === myPlanApp.planSpots[i].displayOrder);
        if (planSpot?.planUserpictures) {
          myPlanApp.planSpots[i].planUserpictures = planSpot.planUserpictures;
        }
      }
    }

    this.row = myPlanApp;
    if (this.$stayTime){
      this.dataFormat();
    } else {
      await this.getListSelected();
      this.dataFormat();
    }
    // 変更を保存
    this.registPlan(false);
  }

  // プレビュー用の画像設定
  setPreviewPicture() {
    // 表示する画像を設定
    for (let i = 0; i < this.row.planSpots.length; i++) {
      if (this.row.planSpots[i].planUserpictures?.length > 0) {
        this.row.planSpots[i].previewPictures = this.row.planSpots[i].planUserpictures.map(x => x.imageCropped ?? x.picturePreviewUrl ?? x.picture_url);
      } else {
        this.row.planSpots[i].previewPictures = this.row.planSpots[i].pictures;
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

  setStep(i:number){
    this.step = i;
  }
}
