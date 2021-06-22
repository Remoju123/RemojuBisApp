import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-memo-dialog",
  templateUrl: "./memo-dialog.component.html",
  styleUrls: ["./memo-dialog.component.scss"]
})
export class MemoDialogComponent implements OnInit {
  constructor(
    private translate: TranslateService,
    public dialogRef: MatDialogRef<MemoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {}

  ngOnInit() {}

  onClickOK(): void {
    this.dialogRef.close(this.data);
  }
}
