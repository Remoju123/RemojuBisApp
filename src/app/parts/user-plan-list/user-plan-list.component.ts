import { Component, OnInit, ChangeDetectionStrategy, Inject,OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CacheStore, PlanSpotList } from 'src/app/class/planspotlist.class';
import { CommonService } from 'src/app/service/common.service';
import { PlanSpotListService } from 'src/app/service/planspotlist.service';
import { FilterPipe } from "ngx-filter-pipe";
import { UserPlanData } from 'src/app/class/plan.class';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { searchResult } from 'src/app/class/spotlist.class';

export const USERPLANSPOT_KEY = makeStateKey<CacheStore>('USERPLANSPOT_KEY');

@Component({
  selector: 'app-user-plan-list',
  templateUrl: './user-plan-list.component.html',
  styleUrls: ['./user-plan-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserPlanListComponent implements OnInit,OnDestroy {
  private onDestroy$ = new Subject();

  rows: PlanSpotList[] = [];
  rows$: Observable<PlanSpotList[]>;

  temp: PlanSpotList[] = [];
  details$:PlanSpotList[];

  details$$: Observable<any[]>;

  p: number;
  limit: number;
  end: number;
  offset:number;

  isList:boolean = true;

  guid:string;

  test:any[];
  
  get lang() {
    return this.translate.currentLang;
  }

  constructor(
    private translate: TranslateService,
    private commonService: CommonService,
    private planspots: PlanSpotListService,
    public dialogRef:MatDialogRef<UserPlanListComponent>,
    private filterPipe: FilterPipe,
    private transferState: TransferState,
    @Inject(MAT_DIALOG_DATA) public data: UserPlanData
  ) { 
    this.limit = 6;
    this.p = 1;
  }
  
  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  async ngOnInit() {
    //console.log(this.data.rows);
    //this.mergeNextDataSet();
  }

  onClose(){
    this.dialogRef.close()
  }

  onScrollDown(){
    
  }

  /*--- TBD ---*/

  async mergeNextDataSet(){
    if(this.data.rows.length > 0){
      this.isList = true;
      let startIndex = (this.p - 1) * this.limit;
      this.end = startIndex + this.limit;
      if(this.data.rows.length - startIndex < this.limit){
        this.end = this.data.rows.length;
      }

      for (let i = startIndex; i < this.end; i++){
        (await this.planspots.fetchDetails(this.data.rows[i]))
          .pipe(takeUntil(this.onDestroy$))
          .subscribe(d => {
            // 非同期で戻された結果セットの順番を維持するための処理
            const idx = this.data.rows.findIndex(v => v.id === d.id);
            this.data.rows[idx] = d;
            this.data.rows.forEach(x => x.userName = this.commonService.isValidJson(x.userName, this.lang));
            this.details$ = this.data.rows.slice(0,this.end);
            console.log(this.details$);
          })
      }
      this.p++;
    }else{
      this.details$ = [];
    }
  }
}
