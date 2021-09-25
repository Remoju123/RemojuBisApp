import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserPlanData } from 'src/app/class/plan.class';
import { PlanSpotList } from 'src/app/class/planspotlist.class';
import { CommonService } from 'src/app/service/common.service';
import { IndexedDBService } from 'src/app/service/indexeddb.service';
import { MypageFavoriteListService } from 'src/app/service/mypagefavoritelist.service';
import { MyplanService } from 'src/app/service/myplan.service';
import { PlanSpotListService } from 'src/app/service/planspotlist.service';
import { threadId } from 'worker_threads';
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
    private mypageFavoriteListService: MypageFavoriteListService,
    private router: Router,
    public dialogRef:MatDialogRef<UserPlanListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserPlanData
  ) {
  }  

  get lang() {
    return this.translate.currentLang;
  }

  guid:string;

  async ngOnInit() {
    this.guid= await this.commonService.getGuid();

    //console.log(this.data.rows.searchCategories);
  }

  // プランに追加
  async addMyPlan(item:PlanSpotList){
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
    }).then(()=>{
      this.dialogRef.close();
    })
  }

  // お気に入り登録・除外
  setFavorite(item:PlanSpotList){
    this.planspots.registFavorite(
      item.id,
      item.isPlan,
      !item.isFavorite,
      item.isRemojuPlan,
      this.guid,
      item.googleSpot
    )
    .pipe(takeUntil(this.onDestroy$))
    .subscribe(()=>{
      this.mypageFavoriteListService.GetFavoriteCount(this.guid);
    });
    item.isFavorite = !item.isFavorite;
  }

  linktoDetail(id:number){
    if(id > 10000){
      this.router.navigate(["/" + this.lang + "/spots/detail",id]);
    }else{
      this.router.navigate(["/" + this.lang + "/plans/detail",id]).then(()=>{
        this.dialogRef.close();
      });
    }
  }

  onClose(){
    this.dialogRef.close()
  }
  
}
