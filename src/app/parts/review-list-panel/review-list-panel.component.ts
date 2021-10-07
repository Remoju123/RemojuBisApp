import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { CommonService } from "../../service/common.service";
import { SpotService } from "../../service/spot.service";
import { PlanService } from "../../service/plan.service";
import { UserService } from "../../service/user.service";
import { MatDialog } from "@angular/material/dialog";
import { ComfirmDialogParam } from "../../class/common.class";
import { Review, ReviewResult } from "../../class/review.class";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { ReviewPostDialogComponent } from '../review-post-dialog/review-post-dialog.component';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: "app-review-list-panel",
  templateUrl: "./review-list-panel.component.html",
  styleUrls: ["./review-list-panel.component.scss"]
})
export class ReviewListPanelComponent implements OnInit, OnDestroy {
  
  @Input() reviewResult: ReviewResult;
  @Input() type: number; // 1:スポット 2:Remojuプラン 3:ユーザプラン
  @Input() id: number;
  @Input() spotplanName: string;
  
  private onDestroy$ = new Subject();
  
  constructor(
    private commonService: CommonService,
    private spotService: SpotService,
    private planService: PlanService,
    private userService: UserService,
    private translate: TranslateService,
    public dialog: MatDialog
  ) { }

  // レビューを表示する件数
  dispQty = 0;
  // オブジェクトID
  objectId: string;
  // レビューボタン文字
  reviewBtnText:string;

  // レビュー評価平均
  avgEvaluation: any;


  get lang() {
    return this.translate.currentLang;
  }

  ngOnInit() {
    this.dispReview(0);
    this.objectId = this.commonService.objectId;

    this.reviewResult.reviews.map(x=>{
      x.ismore = false;
      x.label = this.translate.instant("Continue",this.lang);
    })

    this.avgEvaluation = this.reviewResult.avgEvaluation.toFixed(2);
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }

  onClickPosted(review?: Review){
    if (!review){
      review = new Review();
      review.id = this.id;
    }

    console.log(review);

    const dialog = this.dialog.open(ReviewPostDialogComponent, {
      maxWidth: "100%",
      width: "92vw",
      position: { top: "10px" },
      data: { review: review, type: this.type, spotplanName: this.commonService.isValidJson(this.spotplanName, this.lang)},
      autoFocus: false,
      id:"review-post"
    });

    dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe(r => {
      if (r && r !== "cancel"){
        this.commonService.snackBarDisp("ReviewSaved");
        this.reviewResult = r;
        this.dispReview(0);
        
        console.log(r.avgEvaluation);
        this.avgEvaluation = r.avgEvaluation.toFixed(2);
      }
    });
  }  

  onClickMore(){
    if (this.dispQty + this.reviewResult.qty > this.reviewResult.reviews.length){
      this.dispQty = this.reviewResult.reviews.length;
    } else {
      this.dispQty += this.reviewResult.qty;
    }
   this.dispReview(this.dispQty); 
  }

  dispReview(startidx: number){
    // moreでない場合、表示件数を初期化する
    if (startidx === 0) {
      if (this.reviewResult.qty > this.reviewResult.reviews.length){
        this.dispQty = this.reviewResult.reviews.length;
      } else {
        this.dispQty = this.reviewResult.qty;
      }
    }
    for (let i = startidx; i < this.dispQty; i++){
      this.userService.getOtherUser(this.reviewResult.reviews[i].objectId).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
        if (r){
          this.reviewResult.reviews[i].age = r.age;
          this.reviewResult.reviews[i].gender = r.gender;
        }
      });
    }
  }

  reviewbtnName(){
    let t = "";
    if(this.reviewResult.reviews.length>=20){
      t= this.translate.instant("RevireAlsoMore")
    }else{
      t= this.translate.instant("ReviewMore").replace("##",this.reviewResult.reviews.length);
    }
    return t;
  }

  onIsmore(e: { ismore: boolean; label: any; }){
    e.ismore = !e.ismore;
    e.label = e.ismore?this.translate.instant("Close",this.lang):this.translate.instant("Continue",this.lang);
  }

  // 削除する
  onClickDelete(review: Review) {
    // ログインチェック
    if(!this.commonService.loggedIn){
      // ログイン画面へ
      this.commonService.login();
      return;
    }

    // 確認ダイアログの表示
    const param = new ComfirmDialogParam();
    param.title = "ReviewRemoveConfirm";
    param.leftButton = "Cancel";
    param.rightButton = "OK";
    const dialog = this.commonService.confirmMessageDialog(param);
    dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
      // レビューを削除する
      if (d === "ok") {
        switch (this.type) {
          // スポット
          case 1:
            this.spotService.deleteReview(review.id, review.displayOrder).pipe(takeUntil(this.onDestroy$)).subscribe(async r => {
              if (r){
                this.commonService.snackBarDisp("ReviewRemoved");
                this.reviewResult = r;
                this.dispReview(0);
              }
            });
            break;
          // プラン
          case 2:
            this.planService.deletePlanReview(review.id, review.displayOrder).pipe(takeUntil(this.onDestroy$)).subscribe(async r => {
              if (r){
                this.commonService.snackBarDisp("ReviewRemoved");
                this.reviewResult = r;
                this.dispReview(0);
              }
            });
            break;
          // プランユーザ
          case 3:
            this.planService.deletePlanUserReview(review.id, review.displayOrder).pipe(takeUntil(this.onDestroy$)).subscribe(async r => {
              if (r){
                this.commonService.snackBarDisp("ReviewRemoved");
                this.reviewResult = r;
                this.dispReview(0);
              }
            });
            break;
        }
      }
    });
  }

  // 違反報告
  onClickReport(review: Review) {
    // 確認ダイアログの表示
    const param = new ComfirmDialogParam();
    param.title = "ReportReviewConfirmTitle";
    param.text = "ReportReviewConfirmText";
    param.leftButton = "Cancel";
    param.rightButton = "OK";
    const dialog = this.commonService.confirmMessageDialog(param);
    dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
      if (d === "ok") {
        switch (this.type) {
          // スポット
          case 1:
            this.spotService.reportReview(review.id, review.displayOrder).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
              this.commonService.reportComplete(r);
            });
            break;
          // プラン
          case 2:
            this.planService.reportPlanReview(review.id, review.displayOrder).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
              this.commonService.reportComplete(r);
            });
            break;
          // プランユーザ
          case 3:
            this.planService.reportPlanUserReview(review.id, review.displayOrder).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
              this.commonService.reportComplete(r);
            });
            break;
        }
      }
    });
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
    items:4,
    nav: false,
    autoHeight: false
  };

  reviewAvg(data:Review[]){
    let sum = data.reduce((p,c)=>p+c.evaluation,0);
    //console.log(sum/data.length);
    return sum/data.length;
  }

}
