import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ListSelected, ListSelectedPlan } from "../class/common.class";
import { PlanSpotListSearchResult, PlanSpotList } from "../class/planspotlist.class";
import { PlanAppList } from "../class/planlist.class";
import { SpotAppList } from "../class/spotlist.class";
import { CommonService } from "./common.service";
  
  @Injectable({
    providedIn: "root"
  })
  export class PlanSpotListService {
    constructor(
      private http: HttpClient,
      private commonService: CommonService,
      @Inject("BASE_API_URL") private host: string
    ) { }
  
    // 検索条件を取得
    getPlanSpotListSearchCondition() {
      const url = this.host + "/api/PlanSpotList/ListSelected";
      return this.http.get<ListSelectedPlan>(url);
    }
  
    // プランスポット一覧を取得
    getPlanSpotList() {
      const url = this.host + "/api/PlanSpotList/Search";
      return this.http.get<PlanSpotListSearchResult>(url);
    }

    // 一覧のスポット詳細取得
    async getSpotDetail(planSpotList: PlanSpotList) {
      const guid = await this.commonService.getGuid();
      const url = this.host + "/api/PlanSpotList/SearchDetailSpot";
      return this.http.get<SpotAppList>(url, {
        params: {
          versionNo: String(planSpotList.versionNo),
          spotId: String(planSpotList.id),
          objectId: this.commonService.objectId,
          guid: guid
          }
      });
    }

    // 一覧のプラン詳細取得
    async getPlanDetail(planSpotList: PlanSpotList) {
      const guid = await this.commonService.getGuid();
      const url = this.host + "/api/PlanSpotList/SearchDetailPlan";
      return this.http.get<PlanAppList>(url, {
        params: {
          isRemojuPlan: String(planSpotList.isRemojuPlan),
          versionNo: String(planSpotList.versionNo),
          planId: String(planSpotList.id),
          objectId: this.commonService.objectId,
          guid: guid
        }
      });
    }
  }