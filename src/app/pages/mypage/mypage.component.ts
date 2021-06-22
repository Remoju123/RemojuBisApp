import { ActivatedRoute, Params,Router } from "@angular/router";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonService } from "../../service/common.service";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: "app-mypage",
  templateUrl: "./mypage.component.html",
  styleUrls: ["./mypage.component.scss"]
})
export class MypageComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject();
  constructor(
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService
  ) { }

  // タブ選択
  tabIndex: number;

  // 初回表示制御
  profile: boolean;
  planlist: boolean;
  favorite: boolean;
  
  ngOnInit() {
    this.activatedRoute.fragment.pipe(takeUntil(this.onDestroy$)).subscribe((fragment: any) => {
      if (fragment === "list"){
        // プラン一覧を表示
        this.tabIndex = 2;
        this.tabChange(2);
      } else if (fragment === "favorite") {
        // お気に入り一覧を表示
        this.tabIndex = 1;
        this.tabChange(1);
      } else if (fragment === "profile") {
        this.tabIndex = 0;
        this.tabChange(0);
      } else {
        this.tabIndex = 0;
        this.tabChange(0);
      }
    });
    
    // ヘッダプランの非表示通知
    this.commonService.onNotifyIsShowHeader(true);
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }

  // タブ変更(アクティブになっていないタブに画像を含めると幅が0になってしまう)
  tabChange($event: number){
    if (!this.profile && $event === 0){
      this.profile = true;
    }
    if (!this.favorite && $event === 1) {
      this.favorite = true;
    }
    if (!this.planlist && $event === 2){
      this.planlist = true;
    }
  }
}
