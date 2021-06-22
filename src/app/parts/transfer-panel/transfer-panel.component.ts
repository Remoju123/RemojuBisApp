import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { PlanSpotCommon } from "../../class/common.class";
import { Subject } from "rxjs";

@Component({
  selector: "app-transfer-panel",
  templateUrl: "./transfer-panel.component.html",
  styleUrls: ["./transfer-panel.component.scss"]
})
export class TransferPanelComponent implements OnInit {

  @Input() item: PlanSpotCommon;

  get lang() {
    return this.translate.currentLang;
  }

  private onDestroy$ = new Subject();

  constructor(
    private translate: TranslateService
  ) { }

  ngOnInit() {
  }

}
