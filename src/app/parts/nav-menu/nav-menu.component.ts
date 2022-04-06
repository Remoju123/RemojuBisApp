import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from "@angular/core";
import { MenuItems } from "../../shared/menu-items/menu-items";
import { CommonService } from "../../service/common.service";
import { UserService } from "../../service/user.service";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-nav-menu",
  templateUrl: "./nav-menu.component.html",
  styleUrls: ["./nav-menu.component.scss"],
})
export class NavMenuComponent implements OnInit, OnDestroy{
  private onDestroy$ = new Subject();

  isAuthenticated = false;
  isExpanded = false;

  loggedIn: boolean = false;
  userName!: string;

  get lang() {
    return this.translate.currentLang;
  }

  @Input()
  currentlang!: string;

  @Output() sideClose = new EventEmitter();

  isEn: boolean = true;

  constructor(
    private router: Router,
    public commonService: CommonService,
    public userService: UserService,
    public menuItems: MenuItems,
    private translate: TranslateService
  ) {}

  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }

  isShow(flg: any) {
    return flg === null || flg === this.isAuthenticated;
  }

  ngOnInit() {
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

  onNavgate(page: string, frag?: string) {
    if (frag === '') {
      this.router.navigate(['/' + this.lang + '/' + page + '/']);
    } else {
      this.router.navigate(['/' + this.lang + '/' + page + '/'], {
        fragment: frag,
      });
    }
    this.onClose();
  }

  onNavgateFeature(page: string) {
    location.href = `${location.origin}/contents/ja-jp/${page}`;
  }

  onClickSwitchLang(e) {
    /*----------------------
    *checked:true ==> 'en'
    *checked:false ==> 'ja'
    -----------------------*/
    if (e.target.checked) {
      this.translate.use('en');
      this.translate.currentLang = 'en';
    } else {
      this.translate.use('ja');
      this.translate.currentLang = 'ja';
    }
    this.commonService.onNotifyChangeLang(this.translate.currentLang);
  }

  onClose(){
    this.sideClose.emit();
  }
}
