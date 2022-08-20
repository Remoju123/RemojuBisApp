import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonService } from "../../service/common.service";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlanSpotList } from "../../class/planspotlist.class";
import { UserService } from "../../service/user.service";
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
    public commonService: CommonService,
    private userService: UserService,
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

  userName: string;

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
      } else if (fragment === "profile") {
        // プロフィール
        this.tabIndex = 2;
        this.tabChange(2);
      } else if (fragment === "review"){
        // レビュー一覧
        this.tabIndex = 3;
        this.tabChange(3);
      } else {
        // （初期値）プラン一覧
        this.tabIndex = 0;
        this.tabChange(0);
      }
    });

    // ヘッダプランの非表示通知
    this.commonService.onNotifyIsShowHeader(true);

    this.userName = this.commonService.name;

    this.userService.isupdUserName$.pipe(takeUntil(this.onDestroy$)).subscribe((v)=>{
      // ユーザー情報
      this.userService.getUser().pipe(takeUntil(this.onDestroy$)).subscribe(r=>{
        if (r) {
          this.userName = r.displayName;
        }
      });
    });
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }

  // タブ変更(アクティブになっていないタブに画像を含めると幅が0になってしまう)
  tabChange($event: number){
    if ($event === 0){
      this.planlist = true;
      this.router.navigate(["/" + this.lang + "/mypage"],{fragment:'list'});
      window.scrollTo(0,0);
    }
    if ($event === 1) {
      this.favorite = true;
      this.router.navigate(["/" + this.lang + "/mypage"],{fragment:'favorite'});
      window.scrollTo(0,0);
    }
    if ($event === 2){
      this.profile = true;
      this.router.navigate(["/" + this.lang + "/mypage"],{fragment:'profile'});
      window.scrollTo(0,0);
    }
    if ($event === 3){
      this.review = true;
      this.router.navigate(["/" + this.lang + "/mypage"],{fragment:'review'});
      window.scrollTo(0,0);
    }
  }

  linktolist() {
    this.router.navigate(["/" + this.lang + "/planspot"]);
  }

  // async getPlanSpotDataSet() {
  //   this.mypageFavoriteListService.getMypageFavoritePlanSpotList().pipe(takeUntil(this.onDestroy$))
  //   .subscribe((r) => {
  //     this.details$ = this.planspots.mergeBulkDataSet(r);
  //   })
  // }
}
