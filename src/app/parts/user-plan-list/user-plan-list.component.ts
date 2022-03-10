import { Component, OnInit, ChangeDetectionStrategy, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ComfirmDialogParam } from '../../class/common.class';
import { ListSearchCondition } from 'src/app/class/indexeddb.class';
import { UpdFavorite } from '../../class/mypageplanlist.class';
import { UserPlanData } from '../../class/plan.class';
import { PlanSpotList } from '../../class/planspotlist.class';
import { CommonService } from '../../service/common.service';
import { IndexedDBService } from '../../service/indexeddb.service';
import { MypageFavoriteListService } from '../../service/mypagefavoritelist.service';
import { MyplanService } from '../../service/myplan.service';
import { PlanSpotListService } from '../../service/planspotlist.service';
import { threadId } from 'worker_threads';
@Component({
  selector: 'app-user-plan-list',
  templateUrl: './user-plan-list.component.html',
  styleUrls: ['./user-plan-list.component.scss']
})
export class UserPlanListComponent implements OnInit {
  private onDestroy$ = new Subject();

  constructor(
    private translate: TranslateService,
    private commonService: CommonService,
    private planspots: PlanSpotListService,
    private myplanService: MyplanService,
    private indexedDBService: IndexedDBService,
    private planSpotListService: PlanSpotListService,
    private mypageFavoriteListService: MypageFavoriteListService,
    private router: Router,
    public dialogRef:MatDialogRef<UserPlanListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserPlanData
  ) {
    this.myPlanSpots = this.data.myplanspot;
    this.limit = 6;
    this.p = 1;
    this.condition = new ListSearchCondition();
  }

  condition: ListSearchCondition;

  myPlanSpots:any;

  p: number;
  limit: number;
  end: number;
  offset: number;

  get lang() {
    return this.translate.currentLang;
  }

  guid:string;
  details$: PlanSpotList[] = [];
  searchCategories: string[] = [];

  async ngOnInit() {
    this.guid= await this.commonService.getGuid();

    this.mergeNextDataSet();

    let ids = [];
    this.data.userPlanList.map(c => {
      ids = ids.concat(c.searchCategoryIds);
    })

    this.searchCategories = this.planSpotListService.getMasterCategoryNames(new Set(ids), this.data.mSearchCategory);
  }

  onScrollDown() {
    this.mergeNextDataSet();
  }

  mergeNextDataSet() {
    let startIndex = (this.p - 1) * this.limit;
    this.end = startIndex + this.limit;
    if (this.data.userPlanList.length - startIndex < this.limit) {
      this.end = this.data.userPlanList.length;
    }

    for (let i = startIndex; i < this.end; i++) {
      if (this.data.userPlanList[i].isDetail) {
        this.details$ = this.data.userPlanList.slice(0, this.end);
        continue;
      }
      this.planspots.fetchDetails(this.data.userPlanList[i], this.guid)
        .pipe(takeUntil(this.onDestroy$))
        .subscribe(d => {
          const idx = this.data.userPlanList.findIndex(v => v.id === d.id);

          this.data.userPlanList[idx] = d;
          this.data.userPlanList.forEach(x => x.userName = this.commonService.isValidJson(x.userName, this.lang));

          this.details$ = this.data.userPlanList.slice(0, this.end);
        })
    }
    this.p++;
  }

  // プランに追加
  async addMyPlan(item:PlanSpotList){
    const tempqty:number = item.isPlan ? item.spotQty : 1;
    if(await this.commonService.checkAddPlan(tempqty) === false) {
      const param = new ComfirmDialogParam();
      param.text = "ErrorMsgAddSpot";
      param.leftButton = "EditPlanProgress";
      const dialog = this.commonService.confirmMessageDialog(param);
      dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((d: any) => {
        if(d === "ok"){
          this.dialogRef.close();
          // 編集中のプランを表示
          this.commonService.onNotifyIsShowCart(true);
        }
      });
      return;
    }

    this.planspots.addPlan(
      item.id,
      item.isPlan,
      this.guid,
      item.isRemojuPlan,
      item.googleSpot ? true : false,
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
    item.isFavorite = !item.isFavorite;
    const param = new UpdFavorite();
    param.spotId =  item.id;
    param.type = item.googleSpot ? 2 : 1;
    param.isFavorite = item.isFavorite;
    this.myplanService.updateFavorite(param);
    this.planspots.registFavorite(
      item.id,
      item.isPlan,
      item.isFavorite,
      item.isRemojuPlan,
      this.guid,
      item.googleSpot ? true : false
    )
    .pipe(takeUntil(this.onDestroy$))
    .subscribe(()=>{
      //this.mypageFavoriteListService.GetFavoriteCount(this.guid);
    });
  }

  linktoDetail(item:PlanSpotList){
    if(item.isPlan){
      this.router.navigate(["/" + this.lang + "/plans/detail",item.id]).then(()=>{
        this.dialogRef.close();
      });
    }else{
      this.router.navigate(["/" + this.lang + "/spots/detail",item.id]);
    }
  }

  onClose(){
    this.dialogRef.close();
  }
}
