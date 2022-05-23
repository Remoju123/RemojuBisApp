import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { MyPlanApp } from "../../class/common.class";
import { GoogleSpotDialogComponent } from "../google-spot-dialog/google-spot-dialog.component";
import { IndexedDBService } from "../../service/indexeddb.service";

@Component({
  selector: "app-myplan-auto-dialog",
  templateUrl: "./myplan-auto-dialog.component.html",
  styleUrls: ["./myplan-auto-dialog.component.scss"]
})
export class MyplanAutoDialogComponent implements OnInit {
  private onDestroy$ = new Subject();

  constructor(
    private indexedDBService: IndexedDBService,
    private translate: TranslateService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<MyplanAutoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: [boolean, MyPlanApp]
  ) { }

  ngOnInit() {

  }

  // 出発地・到着地を設定
  async onClickStartEndSelect(isStart: boolean) {
    const dialog = this.dialog.open(GoogleSpotDialogComponent, {
      maxWidth: "100%",
      width: this.data[0] ? "92vw" : "52vw",
      maxHeight: "90vh",
      position: { top: "10px" },
      data: isStart ? [this.data[1].startPlanSpot, isStart] : [this.data[1].endPlanSpot, isStart],
      autoFocus: false,
      id: "gspot"
    });

    dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe(result => {
      if (result !== "cancel") {
        if (isStart) {
          this.data[1].startPlanSpot = result;
        } else {
          this.data[1].endPlanSpot = result;
        }
        this.data[1].isSaved = false;
        this.data[1].isTransferSearch = true;
        this.indexedDBService.registPlan(this.data[1]);
      }
    });
  }
}
