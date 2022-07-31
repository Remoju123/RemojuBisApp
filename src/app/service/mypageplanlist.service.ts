import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { MypagePlanAppList } from "../class/mypageplanlist.class";
import { CommonService } from "./common.service";
import { DataSelected } from "../class/common.class";
import { Review } from "../class/review.class";

const httpOptions = {
  headers: new HttpHeaders({
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json;charset=utf-8"
  })
};

@Injectable({
  providedIn: "root"
})
export class MypagePlanListService {

  public conditionSessionKey = "MyplanSearchCondition";
  public listSessionKey = "MyplanList";

  constructor(
    private http: HttpClient,
    private commonService: CommonService,
    @Inject("BASE_API_URL") private host: string
  ) { }

  // 選択値を取得
  getDataSelected() {
    const url = this.host + "/api/MypagePlanList/ListSelected";
    return this.http.get<DataSelected[]>(url);
  }

  // マイページ・プラン一覧を取得
  getMypagePlanList() {
    const url = this.host + "/api/MypagePlanList/Search";
    return this.http.get<MypagePlanAppList[]>(url, {
      params: { objectId: this.commonService.objectId}
    });
  }

  // プラン一覧(詳細)を取得
  getMypagePlanListDetail(
    options: MypagePlanAppList
  ) {
    options.objectId = this.commonService.objectId;
    const url = this.host + "/api/MypagePlanList/SearchDetail";
    return this.http.get<MypagePlanAppList>(url, {
      params: {
        planUserId: options.planUserId,
        objectId: this.commonService.objectId
      }
    });
  }

  // 公開・非公開登録
  registIsRelease(
    planUserId: number,
    isRelease: boolean,
    isStartEnd: boolean) {
    const url = this.host + "/api/MypagePlanList/RegistIsRelease";
    return this.http.get<boolean>(url, {
      params: {
        planUserId: String(planUserId),
        isRelease: String(isRelease),
        isStartEnd: String(isStartEnd),
        objectId: this.commonService.objectId
      }
    });
  }

  // プラン削除
  delPlan(
    planUserId: number) {
    const url = this.host + "/api/MypagePlanList/Delete";
    return this.http.get<boolean>(url, {
      params: {
        planUserId: String(planUserId),
        objectId: this.commonService.objectId
      }
    });
  }

  //
  getMyPageReviewList(){
    const url = this.host + "/api/MypageReviewList/Search";
    return this.http.get<Review[]>(url, {
      params: { objectId: this.commonService.objectId}
    });
  }
}
