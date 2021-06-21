import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter,
  OnDestroy,
  Inject,
  PLATFORM_ID
} from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { Overlay } from "@angular/cdk/overlay";
import { CommonService } from "../../service/common.service";
import { UserService } from "../../service/user.service";
import { MypageFavoriteListService } from "../../service/mypagefavoritelist.service";
import { TranslateService } from "@ngx-translate/core";
import { environment } from "../../../environments/environment";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ComponentPortal } from '@angular/cdk/portal';
import { MatSpinner } from '@angular/material/progress-spinner';
import { isPlatformBrowser } from "@angular/common";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent implements OnInit ,OnDestroy{
  private onDestroy$ = new Subject();
  mode = new FormControl("over");
  shouldRun:boolean;
  // shouldRun = [/(^|\.)plnkr\.co$/, /(^|\.)stackblitz\.io$/].some(h =>
  //   h.test(window.location.host)
  // );

  languages = environment.languages;
  
  currentLang: string = "ja";

  // サイドナビバインドプロパティ
  @Output() event = new EventEmitter<boolean>();
  @Input() sidenav_closed: boolean;
  status: boolean;

  // カートナビバインドプロパティ
  @Output() cartevent = new EventEmitter<boolean>();
  @Input() cartnav_closed:boolean;
  cartStatus:boolean;
  
  logopc = "remoju-logo-pc-ja";
  logosp = "remoju-logo-sp-ja";
  logo_body = "remoju-logo";
  isDesktopDevice: boolean;
  
  favcount:any;
  
  loggedIn: boolean;
  public userInfo: any = null;

  tollSpotLogo: string = "";
  tollSpotLogo2: string = "";
  tollSpotUrl: string = "";

  spinner = this.overlay.create({
    hasBackdrop: true,
    positionStrategy: this.overlay
      .position()
      .global()
      .centerHorizontally()
      .centerVertically()
  });

  ppisshow:boolean = true;
  pictureUrl:string = "../../../assets/img/icon_who.svg";
  userName:string="";

  constructor(
    private commonService: CommonService,
    private mypageFavoriteListService: MypageFavoriteListService,
    private translate: TranslateService,
    private userService: UserService,
    public router: Router,
    public dialog: MatDialog,
    private overlay: Overlay,
    @Inject(PLATFORM_ID) private platformId:Object) 
  {
    if(isPlatformBrowser(this.platformId)){
      this.shouldRun = [/(^|\.)plnkr\.co$/, /(^|\.)stackblitz\.io$/].some(h =>
          h.test(window.location.host)
      );
    }
  }

  changeLang(lang: any) {
    if (lang !== this.currentLang) {
      this.translate.use(lang);
      this.currentLang = lang;
    }
    this.logopc = this.logo_body + "-pc-" + lang;
    this.logosp = this.logo_body + "-sp-" + lang;

    localStorage.setItem("gml", lang);
    location.reload();
  }

  isCurrentLang(lang: any) {
    return lang === this.currentLang;
  }

  toggleactive() {
    this.status = this.sidenav_closed;
    this.event.emit(!this.status);
  }

  togglecart(){
   this.cartStatus = this.cartnav_closed;
   this.cartevent.emit(!this.cartStatus); 
  }

  async ngOnInit() {
    this.commonService.logoChange$.pipe(takeUntil(this.onDestroy$)).subscribe((v)=>{
      // 有料スポットの場合、ロゴを表示
      this.tollSpotUrl = this.commonService.getTollSpotUrl();
      if (this.tollSpotUrl) {
        this.tollSpotLogo = "../../../assets/img/" + this.tollSpotUrl + "_logo.svg";
      } else {
        this.tollSpotLogo = "";
      }
    });

    this.commonService.isshowHeader$.pipe(takeUntil(this.onDestroy$)).subscribe((v)=>{
      this.ppisshow = v;
    });

    // お気に入り数取得
    const guid = await this.commonService.getGuid();
    this.mypageFavoriteListService.GetFavoriteCount(guid);

    this.mypageFavoriteListService.myfavCount$.pipe(takeUntil(this.onDestroy$)).subscribe((v)=>{
      if(v){
        this.favcount = v["spotCount"]+v["planCount"];
      }
    });

    // ユーザー情報
    if(this.commonService.loggedIn){
      this.userService.getUser().pipe(takeUntil(this.onDestroy$)).subscribe((r: { pictureUrl: string; displayName: string; }) =>{
        if(r){
          if(r.pictureUrl){this.pictureUrl = r.pictureUrl};
          this.userName = r.displayName;
        }
      });
    }
  }

  linktoProfile(){
    let navigationExtras:NavigationExtras = {
      fragment:'profile'
    }
    this.router.navigate(["/" + this.currentLang + "/mypage"],navigationExtras);
  }

  linktoFavorite(){
    let navigationExtras:NavigationExtras = {
      fragment:'favorite'
    }
    this.router.navigate(["/" + this.currentLang + "/mypage"],navigationExtras);
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }

  onLoading(){
    // ローディング開始
    this.spinner.attach(new ComponentPortal(MatSpinner));
    setTimeout(() => {
      // ローディング終了
      this.spinner.detach();
    }, 3000);
  }

}
