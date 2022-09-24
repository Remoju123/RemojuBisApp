import { Inject, Injectable,OnDestroy } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FavoriteCount } from '../class/common.class';
import { CommonService } from "./common.service";
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlanSpotList } from "../class/planspotlist.class";

const httpOptions = {
  headers: new HttpHeaders({
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json;charset=utf-8"
  })
};

@Injectable({
  providedIn: "root"
})
export class MypageFavoriteListService implements OnDestroy {

  public conditionSessionKey = "MyfavoriteSearchCondition";

  private myfavCount = new Subject<any>();
  public myfavCount$ = this.myfavCount.asObservable();
  private onDestroy$ = new Subject();

  constructor(
    private http: HttpClient,
    private commonService: CommonService,
    @Inject("BASE_API_URL") private host: string
  ) { }

  getMypageFavoritePlanList():Observable<PlanSpotList[]> {
    const url = this.host + "/api/MypageFavoriteList/SearchPlan";
    return this.http.get<PlanSpotList[]>(url,  {
      params: { objectId: this.commonService.objectId}
    });
  }

  getMypageFavoriteSpotList():Observable<PlanSpotList[]> {
    const url = this.host + "/api/MypageFavoriteList/SearchSpot";
    return this.http.get<PlanSpotList[]>(url,  {
      params: { objectId: this.commonService.objectId}
    });
  }

  // お気に入り数取得
  GetFavoriteCount(guid: string) {
    if(guid!==""){
      const url = this.host + "/api/MypageFavoriteList/GetFavoriteCount";
      this.http.get<FavoriteCount>(url,  {
      params: { objectId: this.commonService.objectId,
                guid: guid}
      })
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((v)=>{
        this.myfavCount.next(v);
      });
    }
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }
}
