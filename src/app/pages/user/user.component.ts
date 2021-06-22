import { ActivatedRoute, ParamMap } from "@angular/router";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { UserService } from "../../service/user.service";
import { DataSelected } from "../../class/common.class";
import { User } from "../../class/user.class";
import { LangFilterPipe } from "../../utils/lang-filter.pipe";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: "app-user",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.scss"]
})
export class UserComponent implements OnInit, OnDestroy {

  private onDestroy$ = new Subject();

  constructor(
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private userService: UserService,
  ) { }

  data: User;

  // 国リスト
  $country: DataSelected[];

  currentlang = this.lang;

  get lang() {
    return this.translate.currentLang;
  }

  /*------------------------------
   *
   * イベント
   *
   * -----------------------------*/
  ngOnInit() {
    // 国選択データ取得
    this.userService.getDataSelected().pipe(takeUntil(this.onDestroy$)).subscribe(r => {
      this.$country = r;
    });

    // URLパラメータ判定
    this.activatedRoute.paramMap.pipe(takeUntil(this.onDestroy$)).subscribe((params: ParamMap) => {
      let id = params.get("id");
      if (id !== null) {
        // ユーザ情報取得
        this.userService.getOtherUser(id).pipe(takeUntil(this.onDestroy$)).subscribe(r =>{
          this.data = r;
        });
      }
    });
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }
}
