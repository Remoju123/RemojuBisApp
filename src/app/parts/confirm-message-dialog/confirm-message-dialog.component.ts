import { Component, ElementRef, Inject, OnInit, ViewChild } from "@angular/core";
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

  text: string;
  subText: string;

  ngOnInit() {
    if (!this.data.leftButton){
      this.data.leftButton = "OK";
    }
    if (!this.data.rightButton){
      this.data.rightButton = "Cancel";
    }
    if (this.data.text) {
      let rep: string = this.translate.instant(this.data.text);
      if (this.data.textRep) {
        for (let i = 0; i < this.data.textRep.length; i++) {
          rep = rep.replace(`{${i}}`, this.data.textRep[i]);
        }
      }
      this.text = rep;
    }
    if (this.data.subText) {
      let rep = this.translate.instant(this.data.subText);
      if (this.data.subTextRep) {
        for (let i = 0; i < this.data.subTextRep.length; i++) {
          rep = rep.replace(`{${i}}`, this.data.subTextRep[i]);
        }
      }
      this.subText = rep;
    }
  }

}
