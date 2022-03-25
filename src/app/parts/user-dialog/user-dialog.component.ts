import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { UserPlanData } from "../../class/user.class";
import { Subject } from 'rxjs';

@Component({
  selector: "app-user-dialog",
  templateUrl: "./user-dialog.component.html",
  styleUrls: ["./user-dialog.component.scss"]
})
export class UserDialogComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject();
  constructor(
    private translate: TranslateService,
    private router: Router,
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserPlanData
  ) { }

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

  ngOnDestroy(){
    this.onDestroy$.next();
  }

  onViewUserPost() {
    this.router.navigate(["/" + this.lang + "/userplans", this.data.user.objectId]);
    this.dialogRef.close();
  }
}
