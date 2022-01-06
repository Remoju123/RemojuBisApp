import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { ComfirmDialogParam, DataSelected, ListSelectedPlan, MyPlanApp, PlanSpotCommon, PlanUserPicture, GoogleNearBySearch } from "../../class/common.class";
import { ListSearchCondition } from "../../class/indexeddb.class";
import { PlanAppList, searchResult } from "../../class/planlist.class";
import { GoogleSpotDialogComponent } from "../../parts/google-spot-dialog/google-spot-dialog.component";
import { SearchDialogFormPlanComponent } from "../../parts/search-dialog-form-plan/search-dialog-form-plan.component";
import { CommonService } from "../../service/common.service";
import { MyplanService } from '../../service/myplan.service';
import { PlanListService } from "../../service/planlist.service";
import { UserplanpostService } from "../../service/userplanpost.service"
import { TranslateService } from "@ngx-translate/core";
import { FormControl, FormGroupDirective, NgForm } from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { LangFilterPipe } from "../../utils/lang-filter.pipe";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { environment } from "../../../environments/environment";

declare const google: any;
declare let EXIF: any;

export class MypageErrorStateMatcher implements ErrorStateMatcher{
  isErrorState(control:FormControl | null,form:FormGroupDirective | NgForm | null):boolean{
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: "app-userplan-post",
  templateUrl: "./userplan-post.component.html",
  styleUrls: ["./userplan-post.component.scss"]
})
export class UserplanPostComponent implements OnInit, OnDestroy {
  @ViewChild("fileInput") fileInput: { nativeElement: { value: string; click: () => void; files: any[]; }; };
  @ViewChild("videoInput") videoInput: { nativeElement: { value: string; click: () => void; files: any[]; }; };

  private onDestroy$ = new Subject();

  constructor(
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private myplanService: MyplanService,
    private planListService: PlanListService,
    private router: Router,
    private translate: TranslateService,
    private userplanpostService: UserplanpostService,
    public dialog: MatDialog
  ) { }

  // 作成中のプラン
  row: MyPlanApp;
  // tempSpots: PlanUserSpot[];

  // エリア・カテゴリ(マスタ)
  listSelectedPlan: ListSelectedPlan;
  // エリア・カテゴリ選択値(表示用)
  optionKeywords: string[];

  // 滞在時間リスト
  $stayTime: DataSelected[];

  get lang() {
    return this.translate.currentLang;
  }

  ngOnInit() {
    this.row = new MyPlanApp();
    this.row.isRelease = false;
    this.row.isCreation = false;

    this.myplanService.getDataSelected().pipe(takeUntil(this.onDestroy$)).subscribe(r => {
      if (!r) {
        this.router.navigate(["/" + this.lang + "/systemerror"]);
        return;
      }
      this.$stayTime = r.stayTime;
    });

    // エリア・カテゴリの選択内容を表示
    this.planListService.searchFilter.pipe(takeUntil(this.onDestroy$)).subscribe((result:searchResult)=>{
      this.optionKeywords = result.searchTarm!="" ? result.searchTarm.split(","):[];
    });

    // 編集の場合
    this.activatedRoute.paramMap.pipe(takeUntil(this.onDestroy$)).subscribe((params: ParamMap) => {
      const id = params.get("id");
      if (id !== null) {
        this.myplanService.getPlanUser(id).pipe(takeUntil(this.onDestroy$)).subscribe(async r => {
          if (r) {
            this.row = this.dataFormat(r);
            await this.getAreaCategoryList();
            if (!this.listSelectedPlan.condition){
              this.listSelectedPlan.condition = new ListSearchCondition();
            }
            if (r.areaId) {
              this.listSelectedPlan.condition.areaId = [ r.areaId ];
            }
            if (r.areaId2) {
              this.listSelectedPlan.condition.areaId2 = [ r.areaId2 ];
            }
            if (r.categories) {
              this.listSelectedPlan.condition.searchCategories = r.categories;
            }
            this.planListService.getSearchFilter(this.listSelectedPlan, this.listSelectedPlan.condition);
          } else {
            this.router.navigate(["/" + this.lang + "/systemerror"]);
            return;
          }
        });
      } else {
        this.getAreaCategoryList();
      }
    });
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }

  myTrackBy(index: number, obj: any): any {
    return index;
  }

  // ファイルを選択ボタンクリック時(見えているボタン)
  onClickSelectPhotoInputButton(): void {
    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.click();
  }

  // ファイルを選択ボタンクリック時(見えていないボタン)
  async onClickSelectPhoto() {
    if (this.fileInput.nativeElement.files && this.fileInput.nativeElement.files[0]) {
      const files: File[] = this.fileInput.nativeElement.files;
      // 画像読み込み&スポット候補リスト取得
      for(let i = 0; i < files.length; i++)
      {
        const planSpot = await this.imageRead(files[i]);
        // 選択状態のGoogleスポットの情報を設定
        this.setGoogleSpot(planSpot);
        if (!this.row.planSpots){
          this.row.planSpots = new Array<PlanSpotCommon>();
        }
        // 追加
        this.row.planSpots.push(planSpot)
      }

      // 撮影日時順に並び替え
      this.onChangeStartTime();
    }
  }

  // 到着時間変更時
  onChangeStartTime() {
    // 到着時間順に並び替え
    this.row.planSpots = this.row.planSpots.sort((a, b) => {
      return a.startTime > b.startTime ? 1 : -1;
    });
    // 表示順設定
    this.setDisplayOrder();
  }

  // Googleスポット選択クリック時
  onClickSpotSelect(planSpot: PlanSpotCommon) {
    const dialog = this.dialog.open(GoogleSpotDialogComponent, {
      maxWidth: "100%",
      width: "92vw",
      maxHeight: "90vh",
      position: { top: "10px" },
      data: planSpot,
      autoFocus: false
    });

    dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe(result => {
      if (result && result !== "cancel") {
        this.setGoogleSpot(result);
      }
    });

  }

  // スポット削除ボタンクリック時
  onClickSpotDelete(planSpot: PlanSpotCommon) {
    this.row.planSpots.splice(
      this.row.planSpots.findIndex(
        v => v.displayOrder === planSpot.displayOrder
      ),
      1
    );
    // 表示順設定
    this.setDisplayOrder();
  }

  // 動画を選択ボタンクリック時(見えているボタン)
  onClickSelectVideoInputButton(): void {
    this.videoInput.nativeElement.value = '';
    this.videoInput.nativeElement.click();
  }

  // 動画を選択ボタンクリック時(見えていないボタン)
  onClickSelectVideo(planSpot: PlanSpotCommon) {
    if (this.videoInput.nativeElement.files && this.videoInput.nativeElement.files[0]) {
      const files: File[] = this.videoInput.nativeElement.files;
      // 画像読み込み&スポット候補リスト取得
      let isError = false;
      for(let i = 0; i < files.length; i++)
      {
        if (files[i].size < 104857600) {
          planSpot.planUserpictures.push({
            plan_user_id: this.row.planUserId,
            display_order: planSpot.displayOrder,
            picture_display_order: planSpot.planUserpictures.length + 1,
            picture_url: "",
            is_video: true,
            is_main: false,
            pictureFile: files[i],
            picturePreviewUrl: URL.createObjectURL(files[i]),
            cropperPosition: null,
            imageCropped: null
          });
        } else {
          isError = true;
        }
      }
      if (isError){
        this.commonService.messageDialog("VideoSizeError")
      }
    }
  }

  // 動画削除ボタンクリック時
  onClickVideoDelete(item: PlanSpotCommon,video: PlanUserPicture) {
    item.planUserpictures.splice(
      item.planUserpictures.findIndex(
        v => v.picture_display_order === video.picture_display_order
      ),
      1
    );
    for (let i = 0; i < item.planUserpictures.length; i++){
      item.planUserpictures[i].picture_display_order = i + 1;
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
      id:"searchDialogPlan"
    });

    dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe(result => {
      const condition: ListSearchCondition = result;
      if (condition.areaId.length > 0) {
        this.row.areaId = condition.areaId[0];
      } else {
        this.row.areaId = 0;
      }
      if (condition.areaId2.length > 0) {
        this.row.areaId2 = condition.areaId2[0];
      } else {
        this.row.areaId2 = 0;
      }
      this.row.categories = condition.searchCategories
      // 選択値を保持
      this.listSelectedPlan.condition = result;
    });
  }

  // 保存ボタンクリック時
  async onClickSave(){
    if (this.spotNameCheck()){
      for (let i = 0; i < this.row.planSpots.length; i++) {
        for (let j = 0; j < this.row.planSpots[i].planUserpictures.length; j++) {
          if (this.row.planSpots[i].planUserpictures[j].pictureFile) {
            // 画像URLを設定(ファイル名は表示順(display_order)_画像表示順(picture_display_order)＋拡張子)
            this.row.planSpots[i].planUserpictures[j].picture_url = environment.blobUrl + "/{0}/" +
              this.row.planSpots[i].displayOrder + "_" + this.row.planSpots[i].planUserpictures[j].picture_display_order
              + this.row.planSpots[i].planUserpictures[j].pictureFile.name.substring(
                this.row.planSpots[i].planUserpictures[j].pictureFile.name.lastIndexOf(".")
              ,this.row.planSpots[i].planUserpictures[j].pictureFile.name.length);
          }
        }
      }
      // 保存処理
      this.userplanpostService.registPlanPost(this.row).pipe(takeUntil(this.onDestroy$)).subscribe(async (result: MyPlanApp) =>{
        for (let i = 0; i < this.row.planSpots.length; i++) {
          for (let j = 0; j < this.row.planSpots[i].planUserpictures.length; j++) {
            if (this.row.planSpots[i].planUserpictures[j].pictureFile) {
              // 画像保存処理
              await this.saveImage(this.row.planSpots[i].planUserpictures[j].pictureFile
                , result.planSpots[i].planUserpictures[j].picture_url,
                result.planUserId);
            }
          }
        }
        // 確認ダイアログの表示
        const param = new ComfirmDialogParam();
        param.title = "CreatedPlanSaveTitle";
        param.text = "CreatedPlanSaveText";
        const dialog = this.commonService.confirmMessageDialog(param);
        dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
          // このページにとどまる
          if (d === "cancel") {
            // 画面に反映
            this.row = this.dataFormat(result);
          // 他のユーザが投稿したプランを見る
          } else {
            this.router.navigate(["/" + this.lang + "/plans?usp=1"]);
          }
        });

      });
    }
  }

  /*------------------------------
   *
   * メソッド
   *
   * -----------------------------*/

  // エリア・カテゴリリスト取得
  getAreaCategoryList(): Promise<boolean>{
    return new Promise(async (resolve, reject) => {
      this.planListService.getPlanListSearchCondition(false).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
        this.listSelectedPlan = r;
        this.listSelectedPlan.mArea.sort((a, b) => a.parentId > b.parentId  ? 1 : -1);
        this.listSelectedPlan.mArea.map(x => x.isHighlight = false);
        this.listSelectedPlan.planList = new Array<PlanAppList>();
        this.listSelectedPlan.isList = false;
        resolve(true);
      });
    });
  }

  // 画像読み込み&スポット候補リスト取得
  async imageRead(file: File): Promise<PlanSpotCommon>{
    return new Promise(async (resolve, reject) => {
      let planSpot = new PlanSpotCommon();
      planSpot.memo = "";

      // サイズ変更
      planSpot.planUserpictures = [ await this.imageSize(file) ];
      planSpot.planUserpictures[0].picture_display_order = 1;
      planSpot.planUserpictures[0].is_video = false;
      planSpot.planUserpictures[0].is_main = true;

      // 写真の属性取得
      let exifData = await this.getExifData(file);
      // 撮影時間
      planSpot.dateTimeOriginal = EXIF.getTag(exifData, "DateTimeOriginal");
      if (planSpot.dateTimeOriginal) {
        // 10分に丸める
        const hour = Number(planSpot.dateTimeOriginal.substring(11, 13));
        let minute = Number(planSpot.dateTimeOriginal.substring(14, 16));
        if (minute % 10 !== 0){
          minute += 10 - minute % 10;
        }
        planSpot.startTime = hour.toString()
          + ":" + (minute < 10 ? "0" + minute.toString() : minute.toString());
      } else {
        planSpot.startTime = "00:00"
      }
      // 緯度経度
      const latitude = EXIF.getTag(exifData, "GPSLatitude");
      const longitude = EXIF.getTag(exifData, "GPSLongitude")
      // 緯度経度が取得できる場合
      if (latitude && latitude.length > 2 && longitude && longitude.length > 2){
        // Googleスポットの候補リストを取得
        const location = new google.maps.LatLng((latitude[0].numerator / latitude[0].denominator)
        + (latitude[1].numerator / latitude[1].denominator / 60)
        + (latitude[2].numerator / latitude[2].denominator / 3600),
        (longitude[0].numerator / longitude[0].denominator)
        + (longitude[1].numerator / longitude[1].denominator / 60)
        + (longitude[2].numerator / longitude[2].denominator / 3600));

        planSpot.latitude = location.lat;
        planSpot.longitude = location.lng;

        const request = {
          location: location,
          // referenceとscopeを取得するとエラーが出力されてしまうので取得項目を指定することで回避
          fields: [ "business_status", "geometry", "name", "photos", "place_id", "plus_code", "rating", "types", "user_ratings_total", "vicinity" ],
          rankBy: google.maps.places.RankBy.DISTANCE,
          types: [ "establishment" ]
        };

        const service = new google.maps.places.PlacesService(document.createElement("map"));
        service.nearbySearch(request, function(results: GoogleNearBySearch[], status: any){
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            // 地域情報を除く
            planSpot.googleSpotNearBySerach = results
              .filter(x => x.business_status === "OPERATIONAL");
            if (planSpot.googleSpotNearBySerach && planSpot.googleSpotNearBySerach.length > 0){
              // 先頭のスポットを選択状態にする
              planSpot.place_id = planSpot.googleSpotNearBySerach[0].place_id;
            }
            resolve(planSpot);
          } else {
            alert("nearbySearch:" + status);
          }
        });
      } else {
        resolve(planSpot);
      }
    });
  }

  // 画像サイズ変更
  async imageSize(file: File): Promise<PlanUserPicture>{
    return new Promise((resolve, reject) => {
      let planUserPicture = new PlanUserPicture();

      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        // 縮小後のサイズを計算。ここでは横幅 (width) を指定
        const dstWidth = 1024;
        const scale = dstWidth / width;
        const dstHeight = height * scale;
        // Canvas オブジェクトを使い、縮小後の画像を描画
        const canvas = document.createElement("canvas");
        canvas.width = dstWidth;
        canvas.height = dstHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, dstWidth, dstHeight);
        // Canvas オブジェクトから Data URL を取得
        const resized = canvas.toDataURL("image/webp",0.75);
        planUserPicture.picturePreviewUrl = resized;
        // blobに再変換
        var blob = this.commonService.base64toBlob(resized);
        // blob object array( fileに再変換 )
        planUserPicture.pictureFile = this.commonService.blobToFile(blob, Date.now() + file.name);
        resolve(planUserPicture);
      };
    });
  }

  // 画像属性取得
  async getExifData(file: File): Promise<any>{
    return new Promise((resolve, reject) => {
      EXIF.getData(file, () => {
        resolve(this);
      });
    });
  }

  // 表示順設定
  setDisplayOrder(){
    for (let i = 0; i < this.row.planSpots.length; i++){
      this.row.planSpots[i].displayOrder = i + 1;
      for (let j = 0; j < this.row.planSpots[i].planUserpictures.length; j++){
        this.row.planSpots[i].planUserpictures[j].display_order = i + 1;
      }
    }
    // 駅探検索ON
    this.row.isTransferSearch = true;
  }

  // 選択したGoogleスポットを設定
  setGoogleSpot(planSpot: PlanSpotCommon){
    if (planSpot.googleSpotNearBySerach && planSpot.place_id && planSpot.place_id.length > 0){
      const googleSpot = planSpot.googleSpotNearBySerach.find(x => x.place_id === planSpot.place_id);
      if (googleSpot){
        planSpot.googleSpot.latitude = googleSpot.geometry.location.lat();
        planSpot.googleSpot.longitude = googleSpot.geometry.location.lng();
        planSpot.googleSpot.spot_name = googleSpot.name;
        planSpot.googleSpot.compoundCode = googleSpot.plus_code.compound_code;
        planSpot.googleSpot.place_id = googleSpot.place_id;
      }
    }
  }

  // 保存データ取得後の整形
  dataFormat(myPlanApp: MyPlanApp){
    const langpipe = new LangFilterPipe();

    myPlanApp.planSpots.forEach(x => {
      if (x.startTime){
        x.startTime = x.startTime.substring(0, 5);
      }
    });
    return myPlanApp;
  }

  // スポット名未登録エラーメッセージ
  spotNameCheck(): boolean{
    // 非公開の場合はチェックしない
    if (!this.row.isRelease){
      return true;
    }

    // スポットが設定されているかを確認
    for (let i = 0; i < this.row.planSpots.length; i++){
      if (!this.row.planSpots[i].latitude && !this.row.planSpots[i].longitude){
        this.commonService.messageDialog("NoSpotName");
        return false;
      }
    }
    return true;
  }

  saveImage(file: File, pictureUrl: string, planUserId: number){
    return new Promise((resolve, reject) => {
    // 画像アップロード
    this.userplanpostService.fileUpload(file
      , pictureUrl.substring(
        pictureUrl.lastIndexOf("/") + 1
        , pictureUrl.length)
      , planUserId).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
        resolve(true);
      });
    });
  }
}
