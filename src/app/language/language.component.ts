import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  template: "<router-outlet></router-outlet>"
})
export class LanguageComponent implements OnInit,OnDestroy {
  private onDestroy$ = new Subject();
  constructor(
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService
  ) { }
  
  ngOnInit(): void {
    this.activatedRoute.params.pipe(takeUntil(this.onDestroy$)).subscribe((params: Params) => {
      this.translate.use(params["lang"]);

      // localStorage.setItem("gml", params["lang"]);
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }
}
