import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { ComfirmDialogParam } from "../../class/common.class";

@Component({
  selector: "app-confirm-message-dialog",
  templateUrl: "./confirm-message-dialog.component.html",
  styleUrls: ["./confirm-message-dialog.component.scss"]
})
export class ConfirmMessageDialogComponent implements OnInit {

  constructor(
    private translate: TranslateService,
    public dialogRef: MatDialogRef<ConfirmMessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ComfirmDialogParam
  ) { }

  ngOnInit() {
    if (!this.data.leftButton){
      this.data.leftButton = "OK";
    }
    if (!this.data.rightButton){
      this.data.rightButton = "Cancel";
    }
  }

}
