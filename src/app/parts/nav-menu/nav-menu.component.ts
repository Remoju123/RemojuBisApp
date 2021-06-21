import { Component, Input } from "@angular/core";
// import { MenuItems } from "../../shared/menu-items/menu-items";
import { CommonService } from "../../service/common.service";
import { Router } from "@angular/router";

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

  @Input()
  currentlang!: string;

  constructor(
    private router: Router,
    public common: CommonService, 
    // public menuItems: MenuItems
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
}
