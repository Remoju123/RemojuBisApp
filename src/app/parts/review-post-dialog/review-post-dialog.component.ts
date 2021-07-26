import { Component, Inject, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ReviewResult, Review, ReviewPicture, 
  SpotReviews, SpotReviewsPicture, 
  PlanReviews, PlanReviewsPicture, 
  PlanUserReviews, PlanUserReviewsPicture } from "../../class/review.class";
import { CommonService } from "../../service/common.service";
import { PlanService } from "../../service/plan.service";
import { SpotService } from "../../service/spot.service";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { DatePipe } from '@angular/common';

@Component({
  selector: "app-review-post-dialog",
  templateUrl: "./review-post-dialog.component.html",
  styleUrls: ["./review-post-dialog.component.scss"]
})
export class ReviewPostDialogComponent implements OnInit, OnDestroy {

  @ViewChild("fileInput", { static: false }) fileInput:any;
  result: ReviewResult;

  evaluations:number[] = [1,2,3,4,5];
  rating:any;

  private onDestroy$ = new Subject();

  constructor(
    private commonService: CommonService,
    private spotService: SpotService,
    private planService: PlanService,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<ReviewPostDialogComponent>,
    private datePipe:DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  type: number;
  review: Review;

  visitDate:any;

  get lang() {
    return this.translate.currentLang;
  }

  ngOnInit() {
    this.review = this.data.review;
    this.type = this.data.type;
    if (!this.review.pictures){
      this.review.pictures = new Array<ReviewPicture>();
    }
    this.rating = this.review.evaluation?this.review.evaluation.toFixed(1):"0.0";
    
    if(this.review.visitDate){
      this.visitDate = this.datePipe.transform(this.review.visitDate,"yyyy-MM-dd");
    }
  }

  ngOnDestroy(){
    this.onDestroy$.next();
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
      // 画像表示
      for(let i = 0; i < files.length; i++)
      {
        let reviewPicture = await this.imageSize(files[i]);
        reviewPicture.picturedisplayOrder = this.review.pictures.length + 1;
        // 追加
        this.review.pictures.push(reviewPicture)
      }
    }
  }

  // 画像削除
  onClickSpotDelete(picture: ReviewPicture){
    this.review.pictures.splice(
      this.review.pictures.findIndex(
        v => v.picturedisplayOrder === picture.picturedisplayOrder
      ),
      1
    );
    let i = 1;
    this.review.pictures.forEach(picture => {
      picture.picturedisplayOrder = i++;
    });
  }
  
  // 保存
  onClickSave(){
    // コンテナ名設定
    let container: string;
    if (this.type ===1) {
      container = "";
    } else {
      container = "pr";
    }

    for (let i = 0; i < this.review.pictures.length; i++) {
      if (this.review.pictures[i].pictureFile) {
        // 画像URLを設定(ファイル名は表示順(display_order)_画像表示順(picture_display_order)＋拡張子)
        this.review.pictures[i].pictureUrl = environment.blobUrl + "/" + container + this.review.id + "/" +
          "r{0}_" + this.review.pictures[i].picturedisplayOrder
          + this.review.pictures[i].pictureFile.name.substring(
            this.review.pictures[i].pictureFile.name.lastIndexOf(".")
          ,this.review.pictures[i].pictureFile.name.length);
      }
    }

    this.review.evaluation = this.rating;
    this.review.visitDate = this.visitDate;

    let result: ReviewResult;
    switch (this.type) {
      // スポット
      case 1:
        let spotReviewsPictures = Array<SpotReviewsPicture>();
        for (let i =0; i<this.review.pictures.length; i++){
          spotReviewsPictures.push(
            {
              spot_id: this.review.id,
              display_order: this.review.displayOrder,
              picture_display_order: i + 1,
              picture_url: this.review.pictures[i].pictureUrl
            }
          );
        }
        let spotReviews :SpotReviews = {
          spot_id: this.review.id,
          user_id: this.review.userId,
          display_order: this.review.displayOrder,
          title: this.review.title,
          contents: this.review.contents,
          evaluation: Number(this.review.evaluation),
          visit_datetime: this.review.visitDate,
          pictures: spotReviewsPictures,
          objectId: this.commonService.objectId
        }
        this.spotService.registReview(spotReviews).pipe(takeUntil(this.onDestroy$)).subscribe(async r => {
          if (r){
            result = r.reviewResult;
            for (let i = 0; i < this.review.pictures.length; i++) {
              if (this.review.pictures[i].pictureFile) {
                // 画像保存処理
                await this.saveImageSpot(this.review.pictures[i].pictureFile
                  , this.review.pictures[i].pictureUrl.replace("{0}", r.displayOrder.toString()),
                  this.review.id);
              }
            }
            //this.commonService.onSetReviewAve(result.avgEvaluation);
            this.dialogRef.close(result);
          }
        });
        break;
      // Remojuプラン
      case 2:
        let planReviewsPictures = Array<PlanReviewsPicture>();
        for (let i =0; i<this.review.pictures.length; i++){
          planReviewsPictures.push(
            {
              plan_id: this.review.id,
              display_order: this.review.displayOrder,
              picture_display_order: i + 1,
              picture_url: this.review.pictures[i].pictureUrl
            }
          );
        }
        let planReviews :PlanReviews = {
          plan_id: this.review.id,
          user_id: this.review.userId,
          display_order: this.review.displayOrder,
          title: this.review.title,
          contents: this.review.contents,
          evaluation: Number(this.review.evaluation),
          visit_datetime: this.review.visitDate,
          pictures: planReviewsPictures,
          objectId: this.commonService.objectId
        }
        this.planService.registPlanReview(planReviews).pipe(takeUntil(this.onDestroy$)).subscribe(async r => {
          if (r){
            result = r.reviewResult;
            for (let i = 0; i < this.review.pictures.length; i++) {
              if (this.review.pictures[i].pictureFile) {
                // 画像保存処理
                await this.saveImagePlan(this.review.pictures[i].pictureFile
                  , this.review.pictures[i].pictureUrl.replace("{0}", r.displayOrder.toString()),
                  this.review.id);
              }
            }
            this.dialogRef.close(result);
          }
        });
        break;
      // ユーザプラン
      case 3:
        let planUserReviewsPictures = Array<PlanUserReviewsPicture>();
        for (let i =0; i<this.review.pictures.length; i++){
          planUserReviewsPictures.push(
            {
              plan_user_id: this.review.id,
              display_order: this.review.displayOrder,
              picture_display_order: i + 1,
              picture_url: this.review.pictures[i].pictureUrl
            }
          );
        }
        let planUserReviews :PlanUserReviews = {
          plan_user_id: this.review.id,
          user_id: this.review.userId,
          display_order: this.review.displayOrder,
          title: this.review.title,
          contents: this.review.contents,
          evaluation: Number(this.review.evaluation),
          visit_datetime: this.review.visitDate,
          pictures: planUserReviewsPictures,
          objectId: this.commonService.objectId
        }
        this.planService.registPlanUserReview(planUserReviews).pipe(takeUntil(this.onDestroy$)).subscribe(async r => {
          if (r){
            result = r.reviewResult;
            for (let i = 0; i < this.review.pictures.length; i++) {
              if (this.review.pictures[i].pictureFile) {
                // 画像保存処理
                await this.saveImagePlan(this.review.pictures[i].pictureFile
                  , this.review.pictures[i].pictureUrl.replace("{0}", r.displayOrder.toString()),
                  this.review.id);
              }
            }
            this.dialogRef.close(result);
          }
        });
        break;
    }
  }

  /*------------------------------
   *
   * メソッド
   *
   * -----------------------------*/

  // 画像サイズ変更
  async imageSize(file: File): Promise<ReviewPicture>{
    return new Promise((resolve, reject) => {
      let reviewPicture = new ReviewPicture();

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
        reviewPicture.picturePreviewUrl = resized;
        // blobに再変換
        var blob = this.commonService.base64toBlob(resized);
        // blob object array( fileに再変換 )
        reviewPicture.pictureFile = this.commonService.blobToFile(blob, Date.now() + file.name);
        resolve(reviewPicture);
      };
    });
  }

  saveImageSpot(file: File, pictureUrl: string, spotId: number){
    return new Promise((resolve, reject) => {
    // 画像アップロード
    this.spotService.fileUpload(file
      , pictureUrl.substring(
        pictureUrl.lastIndexOf("/") + 1
        , pictureUrl.length)
      , spotId).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
        resolve(true);
      });
    });
  }

  saveImagePlan(file: File, pictureUrl: string, planId: number){
    return new Promise((resolve, reject) => {
    // 画像アップロード
    this.planService.fileUpload(file
      , pictureUrl.substring(
        pictureUrl.lastIndexOf("/") + 1
        , pictureUrl.length)
      , planId).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
        resolve(true);
      });
    });
  }

  handleChange(e:any){
    const val = e.target.value;
    this.rating = parseInt(e.target.value).toFixed(1);
  }

  reviewOptions: any = {
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
    margin: 5,
    items:3,
    nav: false,
    autoHeight: false
  };
}
