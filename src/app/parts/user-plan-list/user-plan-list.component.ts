import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserPlanData } from 'src/app/class/plan.class';
import { PlanSpotList } from 'src/app/class/planspotlist.class';
import { CommonService } from 'src/app/service/common.service';
import { IndexedDBService } from 'src/app/service/indexeddb.service';
import { MyplanService } from 'src/app/service/myplan.service';
import { PlanSpotListService } from 'src/app/service/planspotlist.service';
@Component({
  selector: 'app-user-plan-list',
  templateUrl: './user-plan-list.component.html',
  styleUrls: ['./user-plan-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserPlanListComponent implements OnInit {
  private onDestroy$ = new Subject();
  constructor(
    private translate: TranslateService,
    private commonService: CommonService,
    private planspots: PlanSpotListService,
    private myplanService: MyplanService,
    private indexedDBService: IndexedDBService,
    public dialogRef:MatDialogRef<UserPlanListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserPlanData
  ) {}  

  get lang() {
    return this.translate.currentLang;
  }

  async ngOnInit() {
  }

  // プランに追加
  async addMyPlan(item:PlanSpotList){
    console.log(item);
    const tempqty:number = item.isPlan===1 ? 1:item.spotQty;
    if(await this.commonService.checkAddPlan(tempqty) === false){
      return
    };

    this.planspots.addPlan(
      item.isRemojuPlan,
      item.id,
      item.isPlan,
      item.googleSpot
    ).then(result => {
      result.pipe(takeUntil(this.onDestroy$)).subscribe(
        async myPlanApp => {
          if (myPlanApp) {
            this.myplanService.onPlanUserChanged(myPlanApp);
            this.indexedDBService.registPlan(myPlanApp);
            this.myplanService.FetchMyplanSpots();
          }
        }
      )
    })
  }

  onClose(){
    this.dialogRef.close()
  }
  
}
