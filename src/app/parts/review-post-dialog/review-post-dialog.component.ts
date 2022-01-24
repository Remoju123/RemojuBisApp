import { Component, Inject, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ImageCropperParam } from "../../class/common.class";
import { ReviewResult, Review, ReviewPicture,
  SpotReviews, SpotReviewsPicture,
  PlanReviews, PlanReviewsPicture,
  PlanUserReviews, PlanUserReviewsPicture } from "../../class/review.class";
import { ImageCropperDialogComponent } from "../image-cropper-dialog/image-cropper-dialog.component";
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
    public dialog: MatDialog,
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
        const img = await this.commonService.imageSize(files[i]);
        let reviewPicture = new ReviewPicture();
        reviewPicture.picturedisplayOrder = this.review.pictures.length + 1;
        reviewPicture.pictureFile = img.file;
        reviewPicture.picturePreviewUrl = img.previewUrl;
        // 追加
        this.review.pictures.push(reviewPicture)
      }
    }
  }

  onClickCrop(picture: ReviewPicture) {
    let param = new ImageCropperParam();

    param.isAspectRatio = false;
    param.aspectRatio = "1";
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
        const idx = this.review.pictures.findIndex(x => x.picturedisplayOrder === picture.picturedisplayOrder);
        this.review.pictures[idx].imageCropped = r.imageCropped;
        this.review.pictures[idx].cropperPosition = r.cropperPosition;
      }
    });
  }

  // 画像削除
  onClickImageDelete(picture: ReviewPicture){
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
          "r{0}_" + this.review.pictures[i].picturedisplayOrder + "_{1}.webp";
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
            const resultImg = [];
            for (let i = 0; i < this.review.pictures.length; i++) {
              if (this.review.pictures[i].pictureFile) {
                const registReview = r.reviewResult.reviews.find(x => x.displayOrder === r.displayOrder);
                // 画像保存処理
                resultImg.push(this.saveImageSpot(this.review.pictures[i].pictureFile
                  , this.review.pictures[i].imageCropped
                  , registReview.pictures[i].pictureUrl
                  , this.review.id));
              }
            }
            //this.commonService.onSetReviewAve(result.avgEvaluation)
            await Promise.all(resultImg);
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
            const resultImg = [];
            for (let i = 0; i < this.review.pictures.length; i++) {
              if (this.review.pictures[i].pictureFile) {
                const registReview = r.reviewResult.reviews.find(x => x.displayOrder === r.displayOrder);
                // 画像保存処理
                resultImg.push(this.saveImagePlan(this.review.pictures[i].pictureFile
                  , this.review.pictures[i].imageCropped
                  , registReview.pictures[i].pictureUrl
                  , this.review.id));
              }
            }
            await Promise.all(resultImg);
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
            const resultImg = [];
            for (let i = 0; i < this.review.pictures.length; i++) {
              if (this.review.pictures[i].pictureFile) {
                const registReview = r.reviewResult.reviews.find(x => x.displayOrder === r.displayOrder);
                // 画像保存処理
                resultImg.push(this.saveImagePlan(this.review.pictures[i].pictureFile
                  , this.review.pictures[i].imageCropped
                  , registReview.pictures[i].pictureUrl,
                  this.review.id));
              }
            }
            await Promise.all(resultImg);
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

  saveImageSpot(pictureFile: File, imageCropped: any, pictureUrl: string, spotId: number){
    return new Promise((resolve, reject) => {
      // 画像アップロード
      if (imageCropped){
        // blobに再変換
        var blob = this.commonService.base64toBlob(imageCropped);
        // blob object array( fileに再変換 )
        var file = this.commonService.blobToFile(blob, pictureFile.name);
        this.spotService.fileUpload(file
          , pictureUrl.substring(
            pictureUrl.lastIndexOf("/") + 1
            , pictureUrl.length)
          , spotId).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
            resolve(true);
          });
      } else {
        this.spotService.fileUpload(pictureFile
          , pictureUrl.substring(
            pictureUrl.lastIndexOf("/") + 1
            , pictureUrl.length)
          , spotId).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
            resolve(true);
          });
      }
    });
  }

  saveImagePlan(pictureFile: File, imageCropped: any, pictureUrl: string, planId: number){
    return new Promise((resolve, reject) => {
      // 画像アップロード
      if (imageCropped){
        // blobに再変換
        var blob = this.commonService.base64toBlob(imageCropped);
        // blob object array( fileに再変換 )
        var file = this.commonService.blobToFile(blob, pictureFile.name);
        this.planService.fileUpload(file
          , pictureUrl.substring(
            pictureUrl.lastIndexOf("/") + 1
            , pictureUrl.length)
          , planId).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
            resolve(true);
          });
      } else {
        this.planService.fileUpload(pictureFile
          , pictureUrl.substring(
            pictureUrl.lastIndexOf("/") + 1
            , pictureUrl.length)
          , planId).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
            resolve(true);
          });
      }
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
