import {
  Component,
  HostListener,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../service/data.service';
import { CommonService } from '../../service/common.service';
//import { IndexedDBService } from "../../service/indexeddb.service";
import { MyplanService } from '../../service/myplan.service';
import { LoadNotifyService } from '../../service/load-notify.service';
import { Catch } from '../../class/log.class';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HeaderComponent } from '../header/header.component';
import { MatSidenav } from '@angular/material/sidenav';
@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['../../common.scss', './root.component.scss'],
})
export class RootComponent implements OnInit, OnDestroy {
  private reloadRequestCount = 0;
  private onDestroy$ = new Subject();
  title = 'おでかけ検索はリモージュ - Remoju';
  showScroll: boolean | undefined;
  showScrollHeight = 300;
  hideScrollHeight = 10;

  mode = 'over';
  opened: boolean = false;
  events: string[] = [];
  closed: any;

  currentLang: string | undefined;

  currentUrl: string | undefined;

  showPlanpanel: boolean = true;
  expandHeader: boolean = true;
  jumpFooter: boolean = false;

  cartopened: boolean = false;
  myPlanSpots: any;
  spots!: number;

  viewbtn_src = '../../../assets/img/view-my-plan.svg';
  backbtn_src = '../../../assets/img/close-my-plan.svg';
  toTop_src = '../../../assets/img/toTop.svg';

  isMobile: boolean;
  userPic: string;
  userName: string;

  reloadRequestCount$ = new BehaviorSubject<number>(this.reloadRequestCount);

  deviceInfo = null;

  isOfficial: boolean;

  @ViewChild(HeaderComponent) protected header: HeaderComponent;

  @ViewChild(MatSidenav) sidenav: MatSidenav;

  constructor(
    public router: Router,
    public dataService: DataService,
    private commonService: CommonService,
    //private indexedDBService: IndexedDBService,
    private myplanService: MyplanService,
    private changeDetectionRef: ChangeDetectorRef,
    private loadNotifyService: LoadNotifyService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.commonService.isOffcial$.subscribe((v) => {
      this.isOfficial = v;
      this.cd.detectChanges();
    });

    this.loadNotifyService.requestLoad$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(() => {
        location.reload();
      });

    this.commonService.isshowHeader$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((v) => {
        this.expandHeader = v;
        this.changeDetectionRef.detectChanges();
      });

    this.commonService.isshowcart$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(async (v) => {
        this.cartopened = v;
        this.changeDetectionRef.detectChanges();
      });

    this.commonService.isshowmenu$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((v) => {
        this.opened = v;
        this.changeDetectionRef.detectChanges();
      });

    this.myplanService.FetchMyplanSpots();
    this.myplanService.MySpots$.subscribe((v: any) => {
      this.spots = Array.from(v).length;
    });

    this.isMobile = this.detectIsMobile(window.innerWidth);

    this.commonService.curlang$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((lang) => {
        sessionStorage.setItem('gml', lang);
        this.currentLang = lang;
        let suffix = lang === 'en' ? '_en' : '';
        this.viewbtn_src = '../../../assets/img/view-my-plan' + suffix + '.svg';
        this.backbtn_src =
          '../../../assets/img/close-my-plan' + suffix + '.svg';
        this.toTop_src = '../../../assets/img/toTop.svg';
      });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = this.detectIsMobile(window.innerWidth);
  }

  // ブラウザが閉じるイベントを検出
  @HostListener('window:beforeunload', ['$event'])
  beforeUnload = () => {
    this.dataService.onBeforeUnload();
    // tslint:disable-next-line: semicolon
  };

  // ブラウザスクロール検知：Topへ戻るボタン
  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event) {
    event.stopPropagation();
    if (
      (window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop) > this.showScrollHeight
    ) {
      this.showScroll = true;
      this.showPlanpanel = false;
    } else if (
      this.showScroll &&
      (window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop) < this.hideScrollHeight
    ) {
      this.showScroll = false;
      this.showPlanpanel = true;
    }

    if (
      document.documentElement.offsetHeight +
        document.documentElement.scrollTop >
      document.documentElement.scrollHeight - 122
    ) {
      this.jumpFooter = true;
    } else {
      this.jumpFooter = false;
    }
  }

  // Topへ戻るボタン
  scrollToTop() {
    event.stopPropagation();
    this.commonService.scrollToTop();
  }

  // ====================
  // メニューの選択
  // ====================

  // Push通知ON/OFF
  @Catch()
  async toggleEnablePush() {
    if (this.dataService.isEnablePush) {
      this.dataService.isEnablePush = false;
    } else {
      const ret = await this.dataService.getPermission();
      this.dataService.isEnablePush = ret;
    }
  }

  // テーマ切り替え
  @Catch()
  async changeTheme(name: string) {
    this.dataService.theme = name;
    await this.initApp();
  }

  // リセット
  @Catch()
  async initApp() {
    await this.dataService.initApp();
  }

  // トップページへ戻る
  @Catch()
  async goHome() {
    await this.router.navigate(['/']);
  }

  // サイトナビ開閉状態の切り替え
  onhandleSiteNav(eventData: boolean) {
    // console.log(!eventData);
    this.opened = !eventData;
  }

  onReceivePPisShowChild(val: boolean) {
    //
    this.showPlanpanel = val;
    //console.log(val);
  }

  // カート開閉状態の切り替え
  async onhandleCartNav() {
    event.stopPropagation();
    this.cartopened = !this.cartopened;

    const target = document.getElementById('bodyContent');
    target.style.visibility = this.cartopened ? 'hidden' : 'hidden';
    if (!this.cartopened) {
      setTimeout(() => {
        target.style.visibility = 'visible';
      }, 350);
    }

    /*if (this.cartopened) {
      // 編集中のプランを取得
      let myPlan: any = await this.indexedDBService.getEditPlan();
      const myPlanApp: MyPlanApp = myPlan;

      if (myPlanApp.planSpots){
        if (myPlanApp.isCar && myPlanApp.planSpots.length > 10) {
          this.commonService.snackBarDisp("ErrorMsgSetTransferCar", 5000);
        } else if (!myPlanApp.isCar && myPlanApp.planSpots.length > 8) {
          this.commonService.snackBarDisp("ErrorMsgSetTransferEkitan", 5000);
        }
      }
    }*/
  }

  // slide to myplan panel
  togglecart() {
    //this.header.togglecart();
  }

  onSwipeRight() {
    this.cartopened = false;
  }

  onSwipeDown() {
    //console.log(event);
    window.location.reload();
  }

  onSideNavClose() {
    this.sidenav?.close();
  }

  detectIsMobile(w: any) {
    if (w < 1024) {
      return true;
    } else {
      return false;
    }
  }
}
