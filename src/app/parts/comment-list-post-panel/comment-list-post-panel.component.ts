import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { ComfirmDialogParam } from "../../class/common.class";
import { Review, SpotReviews, PlanReviews, PlanUserReviews, ReviewResult } from "../../class/review.class";
import { CommonService } from "../../service/common.service";
import { PlanService } from "../../service/plan.service";
import { SpotService } from "../../service/spot.service";
import { UserService } from "../../service/user.service";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-comment-list-post-panel",
  templateUrl: "./comment-list-post-panel.component.html",
  styleUrls: ["./comment-list-post-panel.component.scss"]
})
export class CommentListPostPanelComponent implements OnInit, OnDestroy {

  @Input() reviewResult: ReviewResult;
  @Input() type: number; // 1:スポット 2:Remojuプラン 3:ユーザプラン
  @Input() id: number;

  @Output() onCommentUpd: EventEmitter<number> = new EventEmitter();;

  private onDestroy$ = new Subject();

  constructor(
    private commonService: CommonService,
    private spotService: SpotService,
    private planService: PlanService,
    private userService: UserService,
    private translate: TranslateService) { }

  objectId: string;
  guid: string;
  dispQty: number;

  get lang() {
    return this.translate.currentLang;
  }

  async ngOnInit() {
    this.dispReview(0);
    this.objectId = this.commonService.objectId;
    // GUID取得
    this.guid = await this.commonService.getGuid();

    this.reviewResult.reviews.map(x=>{
      x.ismore = false;
      x.label = this.translate.instant("Continue",this.lang);
    });
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }

  onClickEdit(review: Review){
    review.isEdit = true;
  }

  onClickPosted(contents?: string, review?: Review, parentDisplayOrder?: number){
    // ログインチェック
    if(!this.commonService.loggedIn){
      const param = new ComfirmDialogParam();
      param.title = "LoginConfirmTitle";
      param.text = "LoginConfirmText";
      const dialog = this.commonService.confirmMessageDialog(param);
      dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
        if (d === "ok") {
          // ログイン画面へ
          this.commonService.login();
        }
      });
      return;
    }


    switch (this.type) {
      // スポット
      case 1:
        const spotReviews = new SpotReviews();
        spotReviews.spot_id = this.id;
        if (review) {
          spotReviews.user_id = review.userId;
          spotReviews.display_order = review.displayOrder;
          if (review.parentDisplayOrder) {
            spotReviews.parent_display_order = review.parentDisplayOrder;
          }
          spotReviews.contents = review.editContents;
        } else {
          if (parentDisplayOrder) {
            spotReviews.parent_display_order = parentDisplayOrder;
          }
          spotReviews.contents = contents;
        }
        spotReviews.objectId = this.commonService.objectId;

        this.spotService.registReview(spotReviews).pipe(takeUntil(this.onDestroy$)).subscribe(async r => {
          if (r){
            this.commonService.snackBarDisp("ReviewSaved");
            this.reviewResult = r.reviewResult;
            this.dispReview(0);
          }
        });
        break;
      // Remojuプラン
      case 2:
        const planReviews = new PlanReviews();
        planReviews.plan_id = this.id;
        if (review) {
          planReviews.user_id = review.userId;
          planReviews.display_order = review.displayOrder;
          if (review.parentDisplayOrder) {
            planReviews.parent_display_order = review.parentDisplayOrder;
          }
          planReviews.contents = review.editContents;
        } else {
          if (parentDisplayOrder) {
            planReviews.parent_display_order = parentDisplayOrder;
          }
          planReviews.contents = contents;
        }
        planReviews.objectId = this.commonService.objectId;

        this.planService.registPlanReview(planReviews).pipe(takeUntil(this.onDestroy$)).subscribe(async r => {
          if (r){
            this.commonService.snackBarDisp("ReviewSaved");
            this.reviewResult = r.reviewResult;
            this.dispReview(0);
          }
        });
        break;
      // ユーザプラン
      case 3:
        const planUserReviews = new PlanUserReviews();
        planUserReviews.plan_user_id = this.id;
        if (review) {
          planUserReviews.user_id = review.userId;
          planUserReviews.display_order = review.displayOrder;
          if (review.parentDisplayOrder) {
            planUserReviews.parent_display_order = review.parentDisplayOrder;
          }
          planUserReviews.contents = review.editContents;
        } else {
          if (parentDisplayOrder) {
            planUserReviews.parent_display_order = parentDisplayOrder;
          }
          planUserReviews.contents = contents;
        }
        planUserReviews.objectId = this.commonService.objectId;

        this.planService.registPlanUserReview(planUserReviews).pipe(takeUntil(this.onDestroy$)).subscribe(async r => {
          if (r){
            this.commonService.snackBarDisp("ReviewSaved");
            this.reviewResult = r.reviewResult;
            this.dispReview(0);
          }
        });
        break;
    }
  }

  // 削除する
  onClickDelete(review: Review) {
    // ログインチェック
    if(!this.commonService.loggedIn){
      const param = new ComfirmDialogParam();
      param.title = "LoginConfirmTitle";
      param.text = "LoginConfirmText";
      const dialog = this.commonService.confirmMessageDialog(param);
      dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
        if (d === "ok") {
          // ログイン画面へ
          this.commonService.login();
        }
      });
      return;
    }

    // 確認ダイアログの表示
    const param = new ComfirmDialogParam();
    param.title = "ReviewRemoveConfirm";
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

  onClickThanks(review: Review) {
    review.isThanks = !review.isThanks;
    switch (this.type) {
      // スポット
      case 1:
        this.spotService.registReviewThanks(review, this.guid).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
          review.thanksCnt = r;
        });
        break;
      // プラン
      case 2:
        this.planService.registReviewPlanThanks(review, this.guid).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
          review.thanksCnt = r;
        });
        break;
      // プランユーザ
      case 3:
        this.planService.registReviewPlanUserThanks(review, this.guid).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
          review.thanksCnt = r;
        });
        break;
    }
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
      this.reviewResult.reviews[i].editContents = this.reviewResult.reviews[i].contents;
      this.reviewResult.reviews[i].childReviews.map(x => x.editContents = x.contents);
      if (!this.reviewResult.reviews[i].userName) {
        this.userService.getOtherUser(this.reviewResult.reviews[i].objectId).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
          if (r){
            if (r.pictureUrl) {
              this.reviewResult.reviews[i].pictureUrl = r.pictureUrl;
              this.reviewResult.reviews[i].userName = r.displayName;
            }

            this.reviewResult.reviews.forEach(x => {
              if(x.objectId === this.reviewResult.reviews[i].objectId) {
                x.pictureUrl = r.pictureUrl;
                x.userName = r.displayName;
              }
              if (x.childReviews) {
                x.childReviews.forEach(y => {
                  if(y.objectId === this.reviewResult.reviews[i].objectId) {
                    y.pictureUrl = r.pictureUrl;
                    y.userName = r.displayName;
                  }
                });
              }
            });
          }
        });
      }
    }
    this.onCommentUpd.emit(this.dispQty);
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


}
function Outout() {
  throw new Error("Function not implemented.");
}

