import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from '@ngx-translate/core';
import { UserPlanData } from 'src/app/class/plan.class';
@Component({
  selector: 'app-user-plan-list',
  templateUrl: './user-plan-list.component.html',
  styleUrls: ['./user-plan-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserPlanListComponent implements OnInit {
  
  constructor(
    private translate: TranslateService,
    public dialogRef:MatDialogRef<UserPlanListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserPlanData
  ) {}  

  get lang() {
    return this.translate.currentLang;
  }

  async ngOnInit() {
  }

  onClose(){
    this.dialogRef.close()
  }

  onScrollDown(){
    //
  }
  
}
