import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Directions, PlanSpotCommon } from "../../class/common.class";
import { CommonService } from "../../service/common.service";
import { Subject } from "rxjs";

@Component({
  selector: "app-transfer-panel",
  templateUrl: "./transfer-panel.component.html",
  styleUrls: ["./transfer-panel.component.scss"]
})
export class TransferPanelComponent implements OnInit {

  @Input() isCar: boolean;
  @Input() item: PlanSpotCommon;
  @Input() nextItem: PlanSpotCommon;

  directions: Directions;
  duration: string;

  get lang() {
    return this.translate.currentLang;
  }

  private onDestroy$ = new Subject();

  constructor(
    private commonService: CommonService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    if (this.isCar && this.item.transfer) {
      this.directions = JSON.parse(this.item.transfer);
      this.duration = (this.directions.DurationHour > 0 ? this.directions.DurationHour + " " + this.translate.instant("Hour") + " " : "")
      + this.directions.DurationMin + " " + this.translate.instant("Minute");
    }
  }

  linktoDirection () {
    this.commonService.directionGoogleMap(this.item, this.nextItem);
  }
}
