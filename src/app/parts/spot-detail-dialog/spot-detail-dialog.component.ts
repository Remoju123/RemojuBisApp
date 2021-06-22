import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-spot-detail-dialog",
  templateUrl: "./spot-detail-dialog.component.html",
  styleUrls: ["./spot-detail-dialog.component.scss"]
})
export class SpotDetailDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: string
) { }

  ngOnInit() {
  }

}
