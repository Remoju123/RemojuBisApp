import { Inject, Injectable,OnDestroy } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ListSelected, FavoriteCount } from '../class/common.class';
import { PlanAppListSearchResult } from "../class/planlist.class";
import { SpotAppListSearchResult } from "../class/spotlist.class";
import { CommonService } from "./common.service";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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

  private myfavCount = new Subject<any>();
  public myfavCount$ = this.myfavCount.asObservable();
  private onDestroy$ = new Subject();

  constructor(
    private http: HttpClient,
    private commonService: CommonService,
    @Inject("BASE_API_URL") private host: string
  ) { }

  // マイページ・お気に入りのソートを取得
  getMypageFavoriteSort() {
    const url = this.host + "/api/MypageFavoriteList/ListSelected";
    return this.http.get<ListSelected>(url);
  }
  
  // マイページ・お気に入りプラン一覧を取得
  getMypageFavoritePlanList() {
    const url = this.host + "/api/MypageFavoriteList/SearchPlan";
    return this.http.get<PlanAppListSearchResult>(url,  {
      params: { objectId: this.commonService.objectId}
    });
  }

  // マイページ・お気に入りスポット一覧を取得
  getMypageFavoriteSpotList() {
    const url = this.host + "/api/MypageFavoriteList/SearchSpot";
    return this.http.get<SpotAppListSearchResult>(url,  {
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
