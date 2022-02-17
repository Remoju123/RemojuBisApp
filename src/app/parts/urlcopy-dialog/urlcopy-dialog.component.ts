import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { Clipboard } from "@angular/cdk/clipboard";

@Component({
  selector: "app-urlcopy-dialog",
  templateUrl: "./urlcopy-dialog.component.html",
  styleUrls: ["./urlcopy-dialog.component.scss"]
})
export class UrlcopyDialogComponent implements OnInit {
  constructor(
    private translate: TranslateService,
    private clipboard: Clipboard,
    public dialogRef: MatDialogRef<UrlcopyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {}

  shareUrl: string;

  get lang() {
    return this.translate.currentLang;
  }

  /*------------------------------
   *
   * イベント
   *
   * -----------------------------*/

  ngOnInit() {
  }

  onClickCopy(): void {
    this.clipboard.copy(this.data);
    this.dialogRef.close();
  }
}
