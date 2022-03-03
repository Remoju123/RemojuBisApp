import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
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

  @Input() user: User;
  @Input() otherUser: OtherUser;
  @Input() edit: boolean;
  @Input() detail: boolean;
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
      const langpipe = new LangFilterPipe();

      this.user = new User();
      this.user.aboutMe = this.otherUser.aboutMe;
      this.user.age = Number(this.otherUser.age);
      this.user.countryName = langpipe.transform(this.otherUser.countryName, this.lang);
      this.user.coverUrl = this.otherUser.coverUrl;
      this.user.displayName = this.otherUser.displayName;
      this.user.pictureUrl = this.otherUser.pictureUrl;
      this.user.gender = this.otherUser.gender;
    } else {
      // 年代計算
      this.user.age = this.commonService.getAge(this.user.birthday);
    }
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }

  onClickEdit() {
    this.event.emit(false);
  }
}
