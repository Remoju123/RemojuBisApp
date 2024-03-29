import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Overlay } from '@angular/cdk/overlay';
import { CommonService } from '../../service/common.service';
import { MypageFavoriteListService } from '../../service/mypagefavoritelist.service';
import { MypagePlanListService } from '../../service/mypageplanlist.service';
import { PlanSpotListService } from '../../service/planspotlist.service';
import { UserService } from '../../service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ComponentPortal } from '@angular/cdk/portal';
import { MatSpinner } from '@angular/material/progress-spinner';
import { isPlatformBrowser } from '@angular/common';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { MyplanListCacheStore } from '../../class/mypageplanlist.class';
import { CacheStore } from '../../class/planspotlist.class';

export const PLANSPOT_KEY = makeStateKey<CacheStore>('PLANSPOT_KEY');
export const FAVORITE_KEY = makeStateKey<CacheStore>('FAVORITE_KEY');
export const MYPLANLIST_KEY =
  makeStateKey<MyplanListCacheStore>('MYPLANLIST_KEY');

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject();
  mode = new UntypedFormControl('over');
  shouldRun: boolean = false;
  // shouldRun = [/(^|\.)plnkr\.co$/, /(^|\.)stackblitz\.io$/].some(h =>
  //   h.test(window.location.host)
  // );

  languages = environment.languages;

  currentLang: string = environment.defaultLang;
  // currentLang: string = isPlatformBrowser(this.platformId)
  //   ? sessionStorage.getItem('gml')
  //   : 'ja';

  // サイドナビバインドプロパティ
  @Output() event = new EventEmitter<boolean>();
  @Input()
  sidenav_closed: boolean = false;
  status: boolean = false;

  // カートナビバインドプロパティ
  @Output() cartevent = new EventEmitter<boolean>();
  @Input()
  cartnav_closed: boolean = false;
  cartStatus: boolean = false;

  logopc = 'remoju-logo-pc-ja';
  logosp = 'remoju-logo-sp-ja';
  logo_body = 'remoju-logo';
  isDesktopDevice: boolean = false;

  favcount: any;

  loggedIn: boolean = false;
  public userInfo: any = null;

  spinner = this.overlay.create({
    hasBackdrop: true,
    positionStrategy: this.overlay
      .position()
      .global()
      .centerHorizontally()
      .centerVertically(),
  });

  ppisshow: boolean = true;
  public pictureUrl: string = '../../../assets/img/icon_who.svg';
  public userName: string = '';

  constructor(
    private commonService: CommonService,
    private planSpotListService: PlanSpotListService,
    private mypageFavoriteListService: MypageFavoriteListService,
    private mypagePlanListService: MypagePlanListService,
    private translate: TranslateService,
    private userService: UserService,
    public router: Router,
    public dialog: MatDialog,
    private overlay: Overlay,
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.shouldRun = [/(^|\.)plnkr\.co$/, /(^|\.)stackblitz\.io$/].some((h) =>
        h.test(window.location.host)
      );
    }
  }

  changeLang(lang: any) {
    if (lang !== this.currentLang) {
      this.translate.use(lang);
      this.currentLang = lang;
    }
    this.logopc = this.logo_body + '-pc-' + lang;
    this.logosp = this.logo_body + '-sp-' + lang;

    localStorage.setItem('gml', lang);
    location.reload();
  }

  isCurrentLang(lang: any) {
    return lang === this.currentLang;
  }

  toggleactive() {
    this.status = this.sidenav_closed;
    this.event.emit(!this.status);
  }

  togglecart() {
    this.cartStatus = this.cartnav_closed;
    this.cartevent.emit(!this.cartStatus);
  }

  async ngOnInit() {
    this.commonService.isshowHeader$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((v) => {
        this.ppisshow = v;
      });

    this.commonService.isupdHeader$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((v) => {
        //ユーザー情報
        this.userService
          .getUser()
          .pipe(takeUntil(this.onDestroy$))
          .subscribe((r) => {
            if (r && r.pictureUrl) {
              this.pictureUrl = r.pictureUrl;
              this.userName = r.displayName;
            }
          });
      });

    // お気に入り数取得
    /*const guid = await this.commonService.getGuid();
    this.mypageFavoriteListService.GetFavoriteCount(guid);

    this.mypageFavoriteListService.myfavCount$.pipe(takeUntil(this.onDestroy$)).subscribe((v)=>{
      if(v){
        this.favcount = v["spotCount"]+v["planCount"];
      }
    });*/
  }

  onNavgateRemoju() {
    sessionStorage.removeItem(this.planSpotListService.conditionSessionKey);
    this.transferState.remove(PLANSPOT_KEY);
    sessionStorage.removeItem(this.mypagePlanListService.conditionSessionKey);
    this.transferState.remove(MYPLANLIST_KEY);
    sessionStorage.removeItem(
      this.mypageFavoriteListService.conditionSessionKey
    );
    this.transferState.remove(FAVORITE_KEY);
    if(!this.router.url.includes('planspot')){
      this.router.navigate(['/' + this.currentLang + '/planspot/']);
      this.planSpotListService.onSetClearSearch(false)
    }else{
      this.planSpotListService.onSetClearSearch(true)
    }

  }

  linktoProfile() {
    let navigationExtras: NavigationExtras = {
      fragment: 'profile',
    };
    this.router.navigate(
      ['/' + this.currentLang + '/mypage'],
      navigationExtras
    );
  }

  linktoFavorite() {
    let navigationExtras: NavigationExtras = {
      fragment: 'favorite',
    };
    this.router.navigate(
      ['/' + this.currentLang + '/mypage'],
      navigationExtras
    );
  }

  linktoMyplan() {
    let navigationExtras: NavigationExtras = {
      fragment: 'list',
    };
    this.router.navigate(
      ['/' + this.currentLang + '/mypage'],
      navigationExtras
    );
  }

  linktoGuide() {
    this.router.navigate(['/' + this.currentLang + '/offcial/guide']);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
  }

  onLoading() {
    // ローディング開始
    this.spinner.attach(new ComponentPortal(MatSpinner));
    setTimeout(() => {
      // ローディング終了
      this.spinner.detach();
    }, 3000);
  }
}
