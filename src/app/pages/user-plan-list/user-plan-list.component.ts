import { Component, OnInit, ChangeDetectionStrategy, Inject, Input,ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ComfirmDialogParam } from '../../class/common.class';
import { ListSearchCondition } from 'src/app/class/indexeddb.class';
import { UpdFavorite } from '../../class/mypageplanlist.class';
import { OtherUser } from '../../class/plan.class';
import { PlanSpotList } from '../../class/planspotlist.class';
import { CommonService } from '../../service/common.service';
import { IndexedDBService } from '../../service/indexeddb.service';
import { UserService } from '../../service/user.service';
import { MyplanService } from '../../service/myplan.service';
import { PlanSpotListService } from '../../service/planspotlist.service';
import { threadId } from 'worker_threads';
import { PlanspotListComponent } from '../planspot/components/planspot-list/planspot-list.component';
@Component({
  selector: 'app-user-plan-list',
  templateUrl: './user-plan-list.component.html',
  styleUrls: ['./user-plan-list.component.scss']
})
export class UserPlanListComponent implements OnInit {
  private onDestroy$ = new Subject();
  @ViewChild(PlanspotListComponent) private list: PlanspotListComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private commonService: CommonService,
    private planspots: PlanSpotListService,
    private myplanService: MyplanService,
    private indexedDBService: IndexedDBService,
    private planSpotListService: PlanSpotListService,
    private userService: UserService,
    private location: Location,
    private router: Router
  ) {
    this.limit = 6;
    this.p = 1;
    this.condition = new ListSearchCondition();
  }

  condition: ListSearchCondition;

  user: OtherUser;
  userPlanSpots: PlanSpotList[] = [];

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

    this.activatedRoute.paramMap.pipe(takeUntil(this.onDestroy$)).subscribe((params: ParamMap) => {
      const id = params.get("id");
      if (id) {
        this.userService.getOtherUser(id).pipe(takeUntil(this.onDestroy$)).subscribe(r =>{
          this.user = r;
        });
        this.userService.getUserPlanList(id).pipe(takeUntil(this.onDestroy$)).subscribe(r =>{
          this.userPlanSpots = r.userPlanSpotList;
          let ids = [];
          this.userPlanSpots.map(c => {
            ids = ids.concat(c.searchCategoryIds);
          });
          this.searchCategories = this.planSpotListService.getMasterCategoryNames(new Set(ids), r.mSearchCategoryPlan);
          this.mergeNextDataSet();
        });
      } else {
        this.router.navigate(["/" + this.lang + "/404"]);
      }
    });

    this.myplanService.MySpots$.subscribe(v => {
      this.myPlanSpots = v;
    });
  }

  onScrollDown() {
    this.mergeNextDataSet();
  }

  mergeNextDataSet() {
    if (this.userPlanSpots.length > 0) {
      let startIndex = (this.p - 1) * this.limit;
      this.end = startIndex + this.limit;
      if (this.userPlanSpots.length - startIndex < this.limit) {
        this.end = this.userPlanSpots.length;
      }

      for (let i = startIndex; i < this.end; i++) {
        if (this.userPlanSpots[i].isDetail) {
          this.details$ = this.userPlanSpots.slice(0, this.end);
          continue;
        }
        this.planspots.fetchDetails(this.userPlanSpots[i], this.guid)
          .pipe(takeUntil(this.onDestroy$))
          .subscribe(d => {
            const idx = this.userPlanSpots.findIndex(v => v.id === d.id);

            this.userPlanSpots[idx] = d;
            this.userPlanSpots.forEach(x => x.userName = this.commonService.isValidJson(x.userName, this.lang));

            this.details$ = this.userPlanSpots.slice(0, this.end);
          })
      }
      this.p++;
    }
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
          //this.dialogRef.close();
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
    });
  }

  // お気に入り登録・除外
  setFavorite(item:PlanSpotList){
    item.isFavorite = !item.isFavorite;
    if (!item.isPlan) {
      const param = new UpdFavorite();
      param.spotId =  item.id;
      param.type = item.googleSpot ? 2 : 1;
      param.isFavorite = item.isFavorite;
      this.myplanService.updateFavorite(param);
    }
    this.planSpotListService.setTransferState(item.isPlan, item.id, item.isFavorite, item.googleSpot ? true : false);
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
      });
    }else{
      this.router.navigate(["/" + this.lang + "/spots/detail",item.id]);
    }
  }

  onSwipeRight(){
    this.location.back();
  }
}
