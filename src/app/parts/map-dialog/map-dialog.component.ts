import { Component, Inject, OnInit, OnDestroy } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MapFullScreenParam } from "../../class/common.class";
import { MapService } from "../../service/map.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-map-dialog",
  templateUrl: "./map-dialog.component.html",
  styleUrls: ["./map-dialog.component.scss"]
})
export class MapDialogComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject();
  constructor(
    private mapService: MapService,
    public dialogRef: MatDialogRef<MapDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MapFullScreenParam
  ) { }

  ngOnInit() {
    // 画面遷移通知
    this.mapService.CloseDialog$.pipe(takeUntil(this.onDestroy$)).subscribe(x => {
      this.dialogRef.close();
    });
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }
}
