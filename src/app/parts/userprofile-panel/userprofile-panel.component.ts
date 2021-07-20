import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { DataSelected } from "../../class/common.class";
import { User } from "../../class/user.class";
import { OtherUser } from "../../class/plan.class";
import { CommonService } from "../../service/common.service";
import { LangFilterPipe } from "../../utils/lang-filter.pipe";
import { Subject } from "rxjs";

@Component({
  selector: "app-userprofile-panel",
  templateUrl: "./userprofile-panel.component.html",
  styleUrls: ["./userprofile-panel.component.scss"]
})
export class UserprofilePanelComponent implements OnInit, OnDestroy {

  // 国リスト
  @Input() country: DataSelected[];
  @Input() user: User;
  @Input() otherUser: OtherUser;
  @Input() edit: boolean;
  @Input() detail: boolean;
  @Input() memo:string;
  @Output() event = new EventEmitter<boolean>();

  private onDestroy$ = new Subject();

  constructor(
    private commonService: CommonService,
    private translate: TranslateService
  ) { }

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
    if (this.otherUser) {
      this.user = new User();
      this.user.aboutMe = this.otherUser.aboutMe;
      this.user.age = Number(this.otherUser.age);
      this.user.country = this.otherUser.country;
      this.user.coverUrl = this.otherUser.coverUrl;
      this.user.displayName = this.otherUser.displayName;
      this.user.pictureUrl = this.otherUser.pictureUrl;
      this.user.gender = this.otherUser.gender;
    } else {
      // 年代計算
      this.user.age = this.commonService.getAge(this.user.birthday);
    }

    // 国名を取得
    if (this.user.country && this.user.country > 0){
      const langpipe = new LangFilterPipe();
      this.user.countryName = langpipe.transform(this.country.find(x => x.id === this.user.country).name, this.lang);
    }
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }

  onClickEdit() {
    this.event.emit(false);
  }
}
