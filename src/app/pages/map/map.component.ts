import { Component, OnInit} from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { MyPlanApp, PlanSpotCommon } from "../../class/common.class";
import { TranslateService } from "@ngx-translate/core";
import { CommonService } from "../../service/common.service";
import { MyplanService } from "../../service/myplan.service";
import { IndexedDBService } from "../../service/indexeddb.service";
import { PlanService } from "../../service/plan.service";
import { LangFilterPipe } from "../../utils/lang-filter.pipe";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"]
})
export class MapComponent implements OnInit {
  private onDestroy$ = new Subject();
  constructor(
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private myplanService: MyplanService,
    private indexedDBService: IndexedDBService,
    private planService: PlanService,
    private translate: TranslateService,
    private location: Location,
    private router: Router
  ) { }

  planSpots: PlanSpotCommon[];
  startPlanSpot: PlanSpotCommon;
  endPlanSpot: PlanSpotCommon;

  userplanid: any;
  planid: any;

  get lang() {
    return this.translate.currentLang;
  }

  /*------------------------------
   *
   * イベント
   *
   * -----------------------------*/
  ngOnInit() {
    this.activatedRoute.paramMap.pipe(takeUntil(this.onDestroy$)).subscribe((params: ParamMap) => {
      // プラン詳細の場合
      this.planid = params.get("planid");
      if (this.planid) {
        this.getPlanDetail(this.planid);
        return;
      }

      // プランユーザIDを取得
      this.userplanid = params.get("userplanid");

      // 保存済みのユーザ作成プランの場合、ログイン済みであること
      // if (this.userplanid && !this.commonService.isLogin) {
      //   // ログイン画面へ
      //   this.commonService.redirectLogin();
      //   return;
      // }
      
      // ユーザ作成プランを取得
      this.getEditPlan();
    });
  }

  // 戻るボタンクリック時
  onClickBack() {
    if (this.planid) {
      this.router.navigate(["/" + this.lang + "/plans/detail/" + this.planid]);
    } else {
      this.router.navigate(["/" + this.lang + "/spots/"]);
    }
  }

  /*------------------------------
   *
   * メソッド
   *
   * -----------------------------*/
  // CT作成プラン取得
  async getPlanDetail(id: string) {
    const guid = await this.commonService.getGuid();
    this.planService.getPlanDetail(id, guid).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
      const langpipe = new LangFilterPipe();
      this.planSpots = r.spots.map(x => {
        this.commonService.setAddPlanLang(x, this.lang);
        return x;
      });
    });
  }

  // ユーザ作成プランを取得
  async getEditPlan(){
    const langpipe = new LangFilterPipe();
    
    // 編集中のユーザ作成プランの場合、編集中のプランを取得
    let myPlan: any = await this.indexedDBService.getEditPlan();
    const myPlanApp: MyPlanApp = myPlan;

    // IDが一致するか確認
    if(myPlanApp
      && (myPlanApp.planUserId === 0
      || myPlanApp.planUserId.toString() === this.userplanid)){
      // Googleスポット、プラン名補完
      this.myplanService.getPlanComplement().then(result => {
        result.pipe(takeUntil(this.onDestroy$)).subscribe(r => {
          this.planSpots = r.planSpots.map(x => {
            this.commonService.setAddPlanLang(x, this.lang);
            return x;
          });
          this.startPlanSpot = r.startPlanSpot;
          this.endPlanSpot = r.endPlanSpot;
        });
        return;
      });
    }

    // 保存済みのユーザ作成プランかつ編集中のプランがない場合はDBから取得
    if(this.userplanid){
      this.myplanService.getPlanUser(this.userplanid).pipe(takeUntil(this.onDestroy$)).subscribe(r => {
        this.planSpots = r.planSpots.map(x => {
          this.commonService.setAddPlanLang(x, this.lang);
          return x;
        });
        this.startPlanSpot = r.startPlanSpot;
        this.endPlanSpot = r.endPlanSpot;
        // 保存
        this.indexedDBService.registPlan(r);
      });
      return;
    }

    // error
    this.router.navigate(["/" + this.lang + "/systemerror"]);
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }
}
