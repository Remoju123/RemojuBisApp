import { Component, OnInit,Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { MypagePlanListService } from 'src/app/service/mypageplanlist.service';
import { ReviewPostDialogComponent } from '../../../parts/review-post-dialog/review-post-dialog.component';
import { Review, ReviewResult } from "../../../class/review.class";
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from 'src/app/service/common.service';
import { ComfirmDialogParam } from 'src/app/class/common.class';
import { SpotService } from 'src/app/service/spot.service';
import { PlanService } from 'src/app/service/plan.service';


@Component({
  selector: 'app-mypage-reviewlist',
  templateUrl: './mypage-reviewlist.component.html',
  styleUrls: ['./mypage-reviewlist.component.scss']
})
export class MypageReviewlistComponent implements OnInit {

  constructor(
    private mypagePlanListService: MypagePlanListService,
    private translate: TranslateService,
    public dialog: MatDialog,
    private commonService: CommonService,
    private spotService: SpotService,
    private planService: PlanService,
  ) { }

  @Input() name:any;

  private onDestroy$ = new Subject();

  myReviews:Review[];
  type:number;

  get lang() {
    return this.translate.currentLang;
  }

  ngOnInit(): void {

    this.mypagePlanListService.getMyPageReviewList().subscribe((result)=>{
      console.log(result);
      this.myReviews = result;
    })
  }

  genMarkPath(item){
    return item.isPlan?
      '../../../../assets//img/mark_plan.svg':
      '../../../../assets/img/mark_spot.svg';
  }

  onClickPosted(review?: Review){
    
    const dialog = this.dialog.open(ReviewPostDialogComponent, {
      maxWidth: "100%",
      width: "92vw",
      position: { top: "10px" },
      data: { review: review, type: 1, spotplanName: ""},
      autoFocus: false,
      id:"review-post"
    });

    dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe(r => {
      if (r && r !== "cancel"){
        this.commonService.snackBarDisp("ReviewSaved");
        //this.reviewResult = r;
        //this.dispReview(0);
        
        console.log(r.avgEvaluation);
        //this.avgEvaluation = r.avgEvaluation.toFixed(2);
      }
    });
  }

  onClickDelete(review:Review){
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
                // this.reviewResult = r;
                // this.dispReview(0);
              }
            });
            break;
          // プラン
          case 2:
            this.planService.deletePlanReview(review.id, review.displayOrder).pipe(takeUntil(this.onDestroy$)).subscribe(async r => {
              if (r){
                this.commonService.snackBarDisp("ReviewRemoved");
                // this.reviewResult = r;
                // this.dispReview(0);
              }
            });
            break;
          // プランユーザ
          case 3:
            this.planService.deletePlanUserReview(review.id, review.displayOrder).pipe(takeUntil(this.onDestroy$)).subscribe(async r => {
              if (r){
                this.commonService.snackBarDisp("ReviewRemoved");
                // this.reviewResult = r;
                // this.dispReview(0);
              }
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

}
