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
import { async } from '@angular/core/testing';


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

    this.getMyReview();
  }

  getMyReview():void {
    this.mypagePlanListService.getMyPageReviewList().subscribe((result)=>{
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
      data: { review: review, type: review.type, spotplanName: this.commonService.isValidJson(review.planSpotName, this.lang)},
      autoFocus: false,
      id:"review-post"
    });

    dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe(r => {
      if (r && r !== "cancel"){
        this.commonService.snackBarDisp("ReviewSaved");

        //this.reviewResult = r;
        //this.dispReview(0);

        //console.log(r.avgEvaluation);
        //this.avgEvaluation = r.avgEvaluation.toFixed(2);
        this.getMyReview();
      }
    });
  }

  onClickDelete(review:Review){
    // 確認ダイアログの表示
    const param = new ComfirmDialogParam();
    param.title = "ReviewRemoveConfirm";
    const dialog = this.commonService.confirmMessageDialog(param);
    dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
      if(d === "ok"){
        switch (review.type) {
          // スポット
          case 1:
            this.spotService.deleteReview(review.id, review.displayOrder).toPromise().then(async r =>{
              if(r){
                this.commonService.snackBarDisp("ReviewRemoved");
              }
            }).then(()=>{
              this.getMyReview();
            })
            break;
          // プラン
          case 2:
            this.planService.deletePlanReview(review.id, review.displayOrder).toPromise().then(async r =>{
              if(r){
                this.commonService.snackBarDisp("ReviewRemoved");
              }
            }).then(()=>{
              this.getMyReview();
            })
            break;
          // プランユーザ
          case 3:
            this.planService.deletePlanUserReview(review.id, review.displayOrder).toPromise().then(async r =>{
              if(r){
                this.commonService.snackBarDisp("ReviewRemoved");
              }
            }).then(()=>{
              this.getMyReview();
            })
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

  isJSON(arg:any){
    arg = (typeof arg === "function") ? arg() : arg;
    if (typeof arg  !== "string") {
      return false;
    }
    try {
      arg = (!JSON) ? eval("(" + arg + ")") : JSON.parse(arg);
      return true;
    } catch (e) {
      return false;
    }
  }

}
