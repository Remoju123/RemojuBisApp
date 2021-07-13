import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ListSelectMaster } from "../class/common.class";
import { PlanSpotList,searchResult,
  SearchParamsObj } from "../class/planspotlist.class";
import { CommonService } from "./common.service";
import { Observable, Subject } from "rxjs";
import { ListSearchCondition } from "../class/indexeddb.class";
import { FilterPipe } from "ngx-filter-pipe";
import { LangFilterPipe } from "../utils/lang-filter.pipe";
import { TranslateService } from "@ngx-translate/core";

const httpOptions = {
  headers: new HttpHeaders({
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json;charset=utf-8"
  })
};
  
  @Injectable({
    providedIn: "root"
  })
  export class PlanSpotListService {
    
    public result: searchResult;

    public searchSubject = new Subject<searchResult>();
    public searchFilter = this.searchSubject.asObservable();

    public searchSubjectNoList = new Subject<searchResult>();
    public searchFilterNoList = this.searchSubjectNoList.asObservable();

    constructor(
      private http: HttpClient,
      private commonService: CommonService,
      private filterPipe: FilterPipe,
      private translate: TranslateService,
      @Inject("BASE_API_URL") private host: string
    ) { 
      this.result = new searchResult();
    }
  
    // 検索条件を取得
    getPlanSpotListSearchCondition() {
      const url = this.host + "/api/PlanSpotList/ListSelected";
      return this.http.get<ListSelectMaster>(url);
    }
  
    // プランスポット一覧を取得
    getPlanSpotList() {
      const url = this.host + "/api/PlanSpotList/Search";
      return this.http.get<PlanSpotList[]>(url);
    }

    // 一覧のスポット詳細取得
    async fetchSpotDetail(planSpotList: PlanSpotList) {
      const guid = await this.commonService.getGuid();
      const url = this.host + "/api/PlanSpotList/SearchDetailSpot";
      return this.http.get<PlanSpotList>(url, {
        params: {
          versionNo: String(planSpotList.versionNo),
          spotId: String(planSpotList.id),
          objectId: this.commonService.objectId,
          guid: guid
          }
      });
    }

    // 一覧のプラン詳細取得
    async fetchPlanDetail(planSpotList: PlanSpotList) {
      const guid = await this.commonService.getGuid();
      const url = this.host + "/api/PlanSpotList/SearchDetailPlan";
      return this.http.get<PlanSpotList>(url, {
        params: {
          isRemojuPlan: String(planSpotList.isRemojuPlan),
          versionNo: String(planSpotList.versionNo),
          planId: String(planSpotList.id),
          objectId: this.commonService.objectId,
          guid: guid
        }
      });
    }

    async fetchDetails(options: PlanSpotList){
      const spot_url = this.host + "/api/PlanSpotList/SearchDetailSpot";
      const plan_url = this.host + "/api/PlanSpotList/SearchDetailPlan";
      options.objectId = this.commonService.objectId;
      options.guid = await this.commonService.getGuid();
      
      if(options.isPlan){
        return this.http.post<PlanSpotList>(plan_url,options,httpOptions);
      }else{
        return this.http.post<PlanSpotList>(spot_url, options, httpOptions);
      }
    }



    async filteringData(data:any,cond:ListSearchCondition,master:ListSelectMaster){
      /*-----------------------------------------
      * 1.絞り込み処理
      -----------------------------------------*/
      const areas:any = [];
      cond.areaId.forEach(x => {
        areas.push({ areaId: x });
      });
  
      cond.areaId2.forEach(x => {
        areas.push({ areaId2: x });
      });

      let _result = [];
      // エリア検索 (ngx-filter-pipe)
      const filterd1 = areas.length
        ? this.filterPipe.transform(data, {
          $or: areas
        }) : data;

      // カテゴリ検索(OR)
      _result = filterd1.filter((item: { searchCategories: any[]; }) => {
        if (!cond.searchCategories.length) {
          return true;
        }
        return item.searchCategories.find((c: { search_category_id: any; }) => {
          return cond.searchCategories.find(f => f === c.search_category_id);
        });
      });

      // モデルプラン みんなのプラン検索
      _result = _result.filter((item: { isRemojuPlan: boolean; }) => {
        // isRemojuPlan true:Remojuプラン false:ユーザ投稿プラン
        return item.isRemojuPlan ? item.isRemojuPlan === cond.isRemojuRecommended
        : !item.isRemojuPlan === cond.isUserPost;
      });

      /*-----------------------------------------
      * 2.検索条件文字列結合
      -----------------------------------------*/

      const _areaNums: string[] = [];
      const _areaId2Nums: string[] = [];
      const _category: string[] = [];
      const kws: any[] = [];

      const Categories = [
        ...master.mSearchCategory[0].dataSelecteds,
        ...master.mSearchCategory[1].dataSelecteds,
        ...master.mSearchCategory[2].dataSelecteds
      ];

      const langpipe = new LangFilterPipe();

      if(cond.areaId.length){
        cond.areaId.forEach(v=>{
          _areaNums.push(master.mArea.find(x=>x.parentId === v).parentName)
        });
      }

      if(cond.areaId2.length){
        cond.areaId2.forEach(e=>{
          const _areas = master.mArea.find(
            v => v.parentId === Number(e.toString().slice(0, -2))
          );
          _areaId2Nums.push(_areas.dataSelecteds.find(x => x.id === e).name);
        })
      }

      if(cond.searchCategories.length){
        cond.searchCategories.forEach(v=>{
          _category.push(Categories.find(x => x.id === v).name);
        })
      }

      let kw = [..._areaNums, ..._areaId2Nums, ..._category];
      kw.map(k => {
        kws.push(langpipe.transform(k, this.translate.currentLang));
      });
        /*-----------------------------------------
      * 3.検索パラメータ結合
      -----------------------------------------*/

      const _params = [];
      _params.push("aid=" + cond.areaId.join(","));
      _params.push("era=" + cond.areaId2.join(","));
      _params.push("cat=" + cond.searchCategories.join(","));
      if (cond.isRemojuRecommended){
        _params.push("rep=1");
      }
      if (cond.isUserPost){
        _params.push("usp=1");
      }

      this.result.list = _result;
      this.result.searchTarm = kws.length > 0 ? kws.join(","):"";
      this.result.searchParams = _params.join("&");
      this.result.searchParamsObj = new SearchParamsObj;
      this.result.searchParamsObj.aid = cond.areaId.join(",");
      this.result.searchParamsObj.era = cond.areaId2.join(",");
      this.result.searchParamsObj.cat = cond.searchCategories.join(",");
      this.result.searchParamsObj.rep = cond.isRemojuRecommended;
      this.result.searchParamsObj.usp = cond.isUserPost;



      if (master.isList) {
        this.searchSubject.next(this.result);
      } else {
        this.searchSubjectNoList.next(this.result);
      }
    }


    // スポット詳細を整形
    

    // プラン詳細を整形




  }