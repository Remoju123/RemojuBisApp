import { Component, Input } from "@angular/core";
import { MenuItems } from "../../shared/menu-items/menu-items";
import { CommonService } from "../../service/common.service";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-nav-menu",
  templateUrl: "./nav-menu.component.html",
  styleUrls: ["./nav-menu.component.scss"]
})
export class NavMenuComponent {
  isAuthenticated = false;
  isExpanded = false;

  loggedIn: boolean = false;
  userName!: string;

  get lang() {
    return this.translate.currentLang;
  }

  @Input()
  currentlang!: string;

  isEn:boolean = true;

  constructor(
    private router: Router,
    public common: CommonService, 
    public menuItems: MenuItems,
    private translate: TranslateService
    ) {
  }

  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }

  isShow(flg: any) {
    return flg === null || flg === this.isAuthenticated;
  }

  onNavgate(page:string,frag?:string){
    if(frag===""){
      this.router.navigate(["/" + this.lang + "/" + page + "/"]);
    }else{
      this.router.navigate(["/" + this.lang + "/" + page + "/"],{fragment:frag});
    }
  }

  onClickSwitchLang(e){
    /*----------------------
    *checked:true ==> 'en'
    *checked:false ==> 'ja'
    -----------------------*/
    if(e.target.checked){
      this.translate.use('en')
      this.translate.currentLang = 'en'
    }else{
      this.translate.use('ja')
      this.translate.currentLang = 'ja';
    }

    
  }
}
