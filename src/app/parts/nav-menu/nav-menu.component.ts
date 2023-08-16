import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Location } from '@angular/common';
import { MenuItems } from '../../shared/menu-items/menu-items';
import { CommonService } from '../../service/common.service';
import { MypageFavoriteListService } from '../../service/mypagefavoritelist.service';
import { MypagePlanListService } from '../../service/mypageplanlist.service';
import { PlanSpotListService } from '../../service/planspotlist.service';
import { UserService } from '../../service/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CacheStore } from '../../class/planspotlist.class';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { MyplanListCacheStore } from '../../class/mypageplanlist.class';

export const PLANSPOT_KEY = makeStateKey<CacheStore>('PLANSPOT_KEY');
export const FAVORITE_KEY = makeStateKey<CacheStore>('FAVORITE_KEY');
export const MYPLANLIST_KEY =
  makeStateKey<MyplanListCacheStore>('MYPLANLIST_KEY');

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss'],
})
export class NavMenuComponent implements OnInit, OnDestroy {
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
    private location: Location,
    public commonService: CommonService,
    private planSpotListService: PlanSpotListService,
    private mypageFavoriteListService: MypageFavoriteListService,
    private mypagePlanListService: MypagePlanListService,
    private transferState: TransferState,
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

    this.userService.isupdUserName$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((v) => {
        // ユーザー情報
        this.userService
          .getUser()
          .pipe(takeUntil(this.onDestroy$))
          .subscribe((r) => {
            if (r) {
              this.userName = r.displayName;
            }
          });
      });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
  }

  onNavgate(page: string, frag?: string, isSessionClear?: boolean) {
    //console.log(page);
    if (isSessionClear) {
      sessionStorage.removeItem(this.planSpotListService.conditionSessionKey);
      this.transferState.remove(PLANSPOT_KEY);
      sessionStorage.removeItem(this.mypagePlanListService.conditionSessionKey);
      this.transferState.remove(MYPLANLIST_KEY);
      sessionStorage.removeItem(
        this.mypageFavoriteListService.conditionSessionKey
      );
      this.transferState.remove(FAVORITE_KEY);
    }
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
    //window.open(`${location.origin}/contents/ja-jp/${page}`, '_blank');
  }

  onClickSwitchLang(e) {
    /*----------------------
    *checked:true ==> 'en'
    *checked:false ==> 'ja'
    -----------------------*/
    let currentLang = 'ja';
    if (e.target.checked) {
      this.translate.use('en');
      currentLang = 'en';
    } else {
      this.translate.use('ja');
      currentLang = 'ja';
    }
    this.translate.currentLang = currentLang;
    this.commonService.onNotifyChangeLang(this.translate.currentLang);

    let $url = this.router.url.replace(/.../, currentLang);
    this.location.replaceState($url);
  }

  onClose() {
    this.sideClose.emit();
  }
}
