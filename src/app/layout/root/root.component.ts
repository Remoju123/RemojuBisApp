import {
  Component,
  HostListener,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
  ViewChild,
  Inject,
  PLATFORM_ID
} from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { DataService } from "../../service/data.service";
import { CommonService } from "../../service/common.service";
import { MyplanService } from "../../service/myplan.service";
import { LoadNotifyService } from "../../service/load-notify.service";
import { Catch } from "../../class/log.class";
import { TranslateService } from "@ngx-translate/core";
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HeaderComponent } from "../header/header.component";
import { isPlatformBrowser } from "@angular/common";
@Component({
  selector: "app-root",
  templateUrl: "./root.component.html",
  styleUrls: ["../../common.scss", "./root.component.scss"]
})
export class RootComponent implements OnInit, OnDestroy {
  private readonly subscription = new Subscription();
  private reloadRequestCount = 0;
  private onDestroy$ = new Subject();
  title = "Remoju";
  showScroll: boolean | undefined;
  showScrollHeight = 300;
  hideScrollHeight = 10;

  mode = "over";
  opened: boolean | undefined;
  events: string[] = [];
  closed: any;

  currentLang: string | undefined;

  showPlanpanel:boolean = true;
  expandHeader:boolean = true;
  jumpFooter:boolean = false;
  
  cartopened:boolean | undefined;
  myPlanSpots:any;
  spots!: number;

  viewbtn_src:string | undefined;
  backbtn_src:string | undefined;

  reloadRequestCount$ = new BehaviorSubject<number>(this.reloadRequestCount);

  @ViewChild(HeaderComponent)
  protected headerCompornent!: HeaderComponent;


  constructor(
    public router: Router,
    public dataService: DataService,
    private commonService: CommonService,
    private myplanService: MyplanService,
    private changeDetectionRef: ChangeDetectorRef,
    private loadNotifyService: LoadNotifyService,
    translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId:Object) {
    translate.setDefaultLang("ja");
    translate.use("ja");
    // translate.use(
    //   (localStorage && localStorage.gml) || environment.defaultLang
    // );

    // NavigationEnd https://swfz.hatenablog.com/entry/2017/05/22/034415
    this.router.events.pipe(takeUntil(this.onDestroy$)).subscribe(e => {
      if (e instanceof NavigationEnd) {
        // this.currentlang = e.url.split("/")[1];
        this.currentLang = "ja";
        this.opened = false;
        this.cartopened = false;
        //ページ遷移後は全てページトップに戻す
        // window.scrollTo(0,0);
      }
    });

  }

  ngOnInit() {
    
    this.loadNotifyService.requestLoad$.pipe(takeUntil(this.onDestroy$)).subscribe((v)=>{
      //this.reloadRequestCount$.next(++this.reloadRequestCount);
      location.reload();
    })

    this.commonService.isshowHeader$.pipe(takeUntil(this.onDestroy$)).subscribe((v)=>{
      this.expandHeader = v;
      this.changeDetectionRef.detectChanges();
    })

    this.commonService.isshowcart$.pipe(takeUntil(this.onDestroy$)).subscribe((v)=>{
      this.cartopened = v;
      this.changeDetectionRef.detectChanges();
    })

    this.commonService.isshowmenu$.pipe(takeUntil(this.onDestroy$)).subscribe((v)=>{
      this.opened = v;
      this.changeDetectionRef.detectChanges();
    })

    this.myplanService.FetchMyplanSpots();
    this.myplanService.MySpots$.subscribe((v:any)=>{
      this.spots = Array.from(v).length;
    })

    if(isPlatformBrowser(this.platformId)){
      let suffix = localStorage.getItem("gml")==="en"?"_en":"";
      this.viewbtn_src = "../../../assets/img/view-my-plan" + suffix + ".svg";
      this.backbtn_src = "../../../assets/img/close-my-plan" + suffix + ".svg"
    }

    console.log(document.documentElement.offsetHeight)
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }

  // ブラウザが閉じるイベントを検出
  @HostListener("window:beforeunload", ["$event"])
  beforeUnload = () => {
    this.dataService.onBeforeUnload();
    // tslint:disable-next-line: semicolon
  };

  // ブラウザスクロール検知：Topへ戻るボタン
  @HostListener("window:scroll", [])
  onWindowScroll() {
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

    if((document.documentElement.offsetHeight + document.documentElement.scrollTop) > (document.documentElement.scrollHeight-122)){
      this.jumpFooter = true;
    }else{
      this.jumpFooter = false;
    }
    //console.log(this.jumpFooter);
    // console.log(
    //   'sh:%i ch"%i',
    //   (document.documentElement.offsetHeight + document.documentElement.scrollTop),
    //   document.documentElement.scrollHeight-122)
  }

  // Topへ戻るボタン
  scrollToTop() {
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
    await this.router.navigate(["/"]);
  }

  // サイトナビ開閉状態の切り替え
  onhandleSiteNav(eventData: boolean) {
    // console.log(!eventData);
    this.opened = !eventData;
  }

  onReceivePPisShowChild(val:boolean){
    //
    this.showPlanpanel = val;
    //console.log(val);
  }

  // カート開閉状態の切り替え
  onhandleCartNav(e:boolean){
    this.cartopened = !e;
  }

  // slide to myplan panel
  togglecart(){
    this.headerCompornent.togglecart();
  }

  onSwipeRight() {
    this.cartopened = false;
  }
  
  onSwipeDown(event: any){
    //console.log(event);
    window.location.reload();
  }
}
