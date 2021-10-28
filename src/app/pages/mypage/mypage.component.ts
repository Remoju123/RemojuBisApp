import { ActivatedRoute, Params,Router } from "@angular/router";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonService } from "../../service/common.service";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlanSpotList } from "src/app/class/planspotlist.class";
import { MypageFavoriteListService } from "src/app/service/mypagefavoritelist.service";
import { PlanSpotListService } from "src/app/service/planspotlist.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-mypage",
  templateUrl: "./mypage.component.html",
  styleUrls: ["./mypage.component.scss"]
})
export class MypageComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject();
  constructor(
    private activatedRoute: ActivatedRoute,
    public common: CommonService,
    private mypageFavoriteListService: MypageFavoriteListService,
    private planspots: PlanSpotListService,
    private router: Router,
    private translate: TranslateService
  ) { }

  // タブ選択
  tabIndex: number;

  // 初回表示制御
  profile: boolean;
  planlist: boolean;
  favorite: boolean;
  review:boolean;

  details$:PlanSpotList[] = [];

  get lang() {
    return this.translate.currentLang;
  }
  
  ngOnInit() {

    //this.getPlanSpotDataSet();
    this.activatedRoute.fragment.pipe(takeUntil(this.onDestroy$)).subscribe((fragment: any) => {
      if (fragment === "list"){
        // プラン一覧を表示
        this.tabIndex = 0;
        this.tabChange(0);
      } else if (fragment === "favorite") {
        // お気に入り一覧を表示
        this.tabIndex = 1;
        this.tabChange(1);
      } else if (fragment === "review"){
        // レビュー一覧
        this.tabIndex = 2;
        this.tabChange(2);
      } else if (fragment === "profile") {
        // プロフィール
        this.tabIndex = 3;
        this.tabChange(3);
      } else {
        // （初期値）プラン一覧
        this.tabIndex = 0;
        this.tabChange(0);
      }
    });
    
    // ヘッダプランの非表示通知
    this.common.onNotifyIsShowHeader(true);
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }

  // タブ変更(アクティブになっていないタブに画像を含めると幅が0になってしまう)
  tabChange($event: number){
    if ($event === 0){
      this.planlist = true;
      this.router.navigate(["/" + this.lang + "/mypage"],{fragment:'list'})
    }
    if ($event === 1) {
      this.favorite = true;
      this.router.navigate(["/" + this.lang + "/mypage"],{fragment:'favorite'})
    }
    if ($event === 2){
      this.review = true;
      this.router.navigate(["/" + this.lang + "/mypage"],{fragment:'review'})
    }
    if ($event === 3){
      this.profile = true;
      this.router.navigate(["/" + this.lang + "/mypage"],{fragment:'profile'})
    }
  }

  // async getPlanSpotDataSet() {
  //   this.mypageFavoriteListService.getMypageFavoritePlanSpotList().pipe(takeUntil(this.onDestroy$))
  //   .subscribe((r) => {
  //     this.details$ = this.planspots.mergeBulkDataSet(r);
  //   })
  // }
}
