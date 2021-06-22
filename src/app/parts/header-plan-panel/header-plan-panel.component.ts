import { Component, OnInit, Input } from '@angular/core';
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-header-plan-panel',
  templateUrl: './header-plan-panel.component.html',
  styleUrls: ['./header-plan-panel.component.scss']
})
export class HeaderPlanPanelComponent implements OnInit {

  get lang() {
    return this.translate.currentLang;
  }

  @Input() show_scr:boolean;
 
  constructor(
    private router: Router,
    private translate: TranslateService,
  ) { }

  currentlang = this.lang;

  ngOnInit() {

  }

  thumbOptions: any = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: [
      "<i class='material-icons' aria-hidden='true'>keyboard_arrow_left</i>",
      "<i class='material-icons' aria-hidden='true'>keyboard_arrow_right</i>"
    ],
    margin: 28,
    items: 5,
    nav: false,
    autoHeight: false
  };

  onCreatePlan(){
    this.router.navigate(["/" + this.currentlang + "/spots/"]);
  }
}
