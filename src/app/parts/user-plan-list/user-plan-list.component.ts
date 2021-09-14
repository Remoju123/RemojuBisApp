import { Component, OnInit, ChangeDetectionStrategy, Inject,OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subject } from 'rxjs';
import { CacheStore, PlanSpotList } from 'src/app/class/planspotlist.class';
import { UserPlanData } from 'src/app/class/plan.class';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { ListSearchCondition } from 'src/app/class/indexeddb.class';
import { PlanSpotListService } from 'src/app/service/planspotlist.service';
import { takeUntil } from 'rxjs/operators';

export const USERPLANSPOT_KEY = makeStateKey<CacheStore>('USERPLANSPOT_KEY');

@Component({
  selector: 'app-user-plan-list',
  templateUrl: './user-plan-list.component.html',
  styleUrls: ['./user-plan-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserPlanListComponent implements OnInit,OnDestroy {
  private onDestroy$ = new Subject();

  condition:ListSearchCondition;

  rows: PlanSpotList[] = [];
  rows$: Observable<PlanSpotList[]>;

  temp: PlanSpotList[] = [];
  details$:PlanSpotList[];

  details$$: Observable<any[]>;

  p: number;
  limit: number = 6;
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
    public dialogRef:MatDialogRef<UserPlanListComponent>,
    private planspots: PlanSpotListService,
    private transferState: TransferState,
    @Inject(MAT_DIALOG_DATA) public data: UserPlanData
  ) {
  }
  
  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  async ngOnInit() {   
    //this.rows = this.data.rows.slice(0,5);
    this.rows = this.transferState.get<PlanSpotList[]>(USERPLANSPOT_KEY,null);

    //this.rows = this.data.rows;
    //this.planspots.mergeBulkDataSet(this.rows);
  }

  onClose(){
    this.dialogRef.close()
  }

  onScrollDown(){
    //this.rows = this.data.rows.slice(0,this.data.rows.length);
    //console.log('scroll');
    //this.planspots.mergeBulkDataSet(this.data.rows);
  }

  /*--- TBD ---*/
  // async mergeNextDataSet(){
  //   const merge = require('deepmerge');

  //   if(this.rows.length > 0){
  //     this.isList = true;
  //     let startIndex = (this.p - 1) * this.limit;
  //     this.end = startIndex + this.limit;
  //     if(this.rows.length - startIndex < this.limit){
  //       this.end = this.rows.length;
  //     }

  //     for (let i = startIndex; i < this.end; i++){
  //       (await this.planspots.fetchDetails(this.rows[i]))
  //         .pipe(takeUntil(this.onDestroy$))
  //         .subscribe(d => {
  //           const idx = this.rows.findIndex(v => v.id === d.id);
  //           console.log(merge(this.rows[idx],d));
  //           merge(this.rows[idx],d);
  //           //this.details$$ = of(this.rows.slice(0,this.end));
  //         }
  //       )
  //     }
      
  //     this.p++;
  //   }
  // }

}
