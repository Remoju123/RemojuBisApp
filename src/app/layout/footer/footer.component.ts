import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { MenuItems } from "../../shared/menu-items/menu-items";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"]
})
export class FooterComponent implements OnInit {
  get lang() {
    return this.translate.currentLang;
  }

  year:Date = new Date();
  
  constructor(
    private router:Router,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    
  }

  linkto(page:any){
    this.router.navigate(['/'+ this.lang + '/' + page])
  }
}
