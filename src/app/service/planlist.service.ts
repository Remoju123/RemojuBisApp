import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
  MyPlanApp,
  AddPlan,
  ListSelectedPlan
} from "../class/common.class";
import {
  ListSearchCondition, MyPlan
} from "../class/indexeddb.class"
import {
  PlanAppList,
  PlanFavorite,
  PlanUserFavorite,
  PlanAppListSearchResult,
  searchResult,
  SearchParamsObj
} from "../class/planlist.class";
import { CommonService } from "./common.service";
import { IndexedDBService } from "./indexeddb.service";
import { TranslateService } from "@ngx-translate/core";
import { FilterPipe } from "ngx-filter-pipe";
import { LangFilterPipe } from "../utils/lang-filter.pipe";
import { Subject } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json;charset=utf-8"
  })
};

@Injectable({
  providedIn: "root"
})
export class PlanListService {
  constructor(
    private http: HttpClient,
    private commonService: CommonService,
    private indexedDBService: IndexedDBService,
    private translate: TranslateService,
    @Inject("BASE_API_URL") private host: string,
    private filterPipe: FilterPipe
  ) { }

  // 検索条件を取得
  getPlanListSearchCondition(isTollSpot: boolean) {
    const url = this.host + "/api/PlanList/ListSelected";
    return this.http.get<ListSelectedPlan>(url, {
      params: {
        isTollSpot: String(isTollSpot)
      }
    });
  }

  // プラン一覧を取得
  getPlanList(tollSpotUrl: string) {
    const url = this.host + "/api/PlanList/Search";
    return this.http.get<PlanAppListSearchResult>(url, {
      params: {
        objectId: this.commonService.objectId,
        tollSpotUrl: tollSpotUrl === undefined?"":tollSpotUrl
      }
    });
  }

  // プラン一覧(詳細)を取得
  getPlanListDetail(
    options: PlanAppList
  ) {
    options.objectId = this.commonService.objectId;
    const url = this.host + "/api/PlanList/SearchDetail";
    return this.http.post<PlanAppList>(url, options, httpOptions);
  }

  // プラン一覧(詳細)を整形
  dataFormat(row: PlanAppList){
    row.planName = this.commonService.isValidJson(row.planName, this.translate.currentLang);
    row.seoKeyword = this.commonService.isValidJson(row.seoKeyword, this.translate.currentLang);
    row.isDetail = true;
  }

  // お気に入り登録(CT)
  registFavorite(
    planId: number,
    guid: string,
    isFavorite: boolean
  ) {
    // お気に入り登録データ作成
    let planFavorite: PlanFavorite = new PlanFavorite();
    planFavorite = {
      plan_id: planId,
      guid: guid,
      is_delete: !isFavorite,
      objectId: this.commonService.objectId
    };
    const url = this.host + "/api/PlanList/Favorite";
    return this.http.post<any>(url, planFavorite, httpOptions);
  }

  // お気に入り登録(ユーザ)
  registUserFavorite(
    planUserId: number,
    guid: string,
    isFavorite: boolean
  ) {
    // お気に入り登録データ作成
    let planUserFavorite: PlanUserFavorite = new PlanUserFavorite();
    planUserFavorite = {
      plan_user_id: planUserId,
      guid: guid,
      is_delete: !isFavorite,
      objectId: this.commonService.objectId
    };
    const url = this.host + "/api/PlanList/UserFavorite";
    return this.http.post<any>(url, planUserFavorite, httpOptions);
  }

  // プランに追加する
  async addPlan(isRemojuPlan: boolean, planId: number) {
    // 作成中プラン取得
    let myPlan: any = await this.indexedDBService.getEditPlan(true);
    if (!myPlan){
      myPlan = new MyPlanApp();
    }
    myPlan.languageCd1 = [ this.translate.currentLang ];

    let addPlan: AddPlan = new AddPlan();
    addPlan = {
      MyPlan: myPlan,
      isRemojuPlan: isRemojuPlan,
      planId: planId
    };
    const url = this.host + "/api/PlanList/Addplan";
    return this.http.post<MyPlanApp>(url, addPlan, httpOptions);
  }

  /*----------------------------------------
   *
   * プラン検索＆結果処理
   * 2020.6.4 MM UPDATE
   *
   *  -------------------------------------*/

  public result = new searchResult();
  public searchSubject = new Subject<searchResult>();
  public searchFilter = this.searchSubject.asObservable();
  public searchSubjectNoList = new Subject<searchResult>();
  public searchFilterNoList = this.searchSubjectNoList.asObservable();

  getSearchFilter(listSelected:ListSelectedPlan,condition:ListSearchCondition){
    /*-----------------------------------------
    * 1.絞り込み処理
    -----------------------------------------*/
    const areas:any = [];
    condition.areaId.forEach(x => {
      areas.push({ areaId: x });
    });

    condition.areaId2.forEach(x => {
      areas.push({ areaId2: x });
    });

    let _result = [];
    // エリア検索 (ngx-filter-pipe)
    const filterd1 = areas.length
      ? this.filterPipe.transform(listSelected.planList, {
        $or: areas
      }) : listSelected.planList;

    // カテゴリ検索(OR)
    _result = filterd1.filter((item: { searchCategories: any[]; }) => {
      if (!condition.searchCategories.length) {
        return true;
      }
      return item.searchCategories.find((c: { search_category_id: any; }) => {
        return condition.searchCategories.find(f => f === c.search_category_id);
      });
    });

    // モデルプラン みんなのプラン検索
    _result = _result.filter((item: { isRemojuPlan: boolean; }) => {
      // isRemojuPlan true:Remojuプラン false:ユーザ投稿プラン
      return item.isRemojuPlan ? item.isRemojuPlan === condition.isRemojuRecommended
      : !item.isRemojuPlan === condition.isUserPost;
    });

    /*-----------------------------------------
    * 2.検索条件文字列結合
    -----------------------------------------*/

    const _params = [];
    const _areaNums: string[] = [];
    const _areaId2Nums: string[] = [];
    const _category: string[] = [];
    const kws: any[] = [];

    const Categories = [
      ...listSelected.mSearchCategory[0].dataSelecteds,
      ...listSelected.mSearchCategory[1].dataSelecteds,
      ...listSelected.mSearchCategory[2].dataSelecteds
    ];

    const langpipe = new LangFilterPipe();

    if(condition.areaId.length){
      condition.areaId.forEach(v=>{
        _areaNums.push(listSelected.mArea.find(x=>x.parentId === v).parentName)
      });
    }

    if(condition.areaId2.length){
      condition.areaId2.forEach(e=>{
        const _areas = listSelected.mArea.find(
          v => v.parentId === Number(e.toString().slice(0, -2))
        );
        _areaId2Nums.push(_areas.dataSelecteds.find(x => x.id === e).name);
      })
    }

    if(condition.searchCategories.length){
      condition.searchCategories.forEach(v=>{
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
    _params.push("aid=" + condition.areaId.join(","));
    _params.push("era=" + condition.areaId2.join(","));
    _params.push("cat=" + condition.searchCategories.join(","));
    if (condition.isRemojuRecommended){
      _params.push("rep=1");
    }
    if (condition.isUserPost){
      _params.push("usp=1");
    }

    this.result.list = _result;
    this.result.searchTarm = kws.length > 0 ? kws.join(","):"";
    this.result.searchParams = _params.join("&");
    this.result.searchParamsObj = new SearchParamsObj;
    this.result.searchParamsObj.aid = condition.areaId.join(",");
    this.result.searchParamsObj.era = condition.areaId2.join(",");
    this.result.searchParamsObj.cat = condition.searchCategories.join(",");
    this.result.searchParamsObj.rep = condition.isRemojuRecommended;
    this.result.searchParamsObj.usp = condition.isUserPost;

    if (listSelected.isList) {
      this.searchSubject.next(this.result);
    } else {
      this.searchSubjectNoList.next(this.result);
    }
  }

  getSearchAreaFilter(listSelected:ListSelectedPlan,condition:ListSearchCondition){
    const areas: { areaId?: number; areaId2?: number; }[] = [];
    condition.areaId.forEach(x => {
      areas.push({ areaId: x });
    });

    condition.areaId2.forEach(x => {
      areas.push({ areaId2: x });
    });

    // エリア検索 (ngx-filter-pipe)
    return areas.length
      ? this.filterPipe.transform(listSelected.planList, {
        $or: areas
      }) : listSelected.planList;
    }

  /*----------------------------
   *
   * 検索処理(プラン)
   * 選択した条件でフィルタして、バインドフォームデータの登録数を更新する
   *
   *  ---------------------------*/
  filteringPlan(plan: PlanAppList[], condition: ListSearchCondition): PlanAppList[] {
    // エリア検索用パラメータ
    const areaIds: { areaId?: number; areaId2?: number; }[] = [];
    // 一旦セッション変数をクリア
    let result = [];

    condition.areaId.forEach(x => {
      areaIds.push({ areaId: x });
    });

    condition.areaId2.forEach(x => {
      areaIds.push({ areaId2: x });
    });

    // エリア検索 (ngx-filter-pipe)
    const filterd1: PlanAppList[] = areaIds.length
      ? this.filterPipe.transform(plan, {
        $or: areaIds
      })
      : plan;

    // カテゴリ検索（OR）
    const filterd2: PlanAppList[] = filterd1.filter(item => {
      if (!condition.searchCategories.length) {
        return true;
      }
      return item.searchCategories.find(c => {
        return condition.searchCategories.find(f => f === c.search_category_id);
      });
    });

    // モデルプラン みんなのプラン検索
    const filterd3: PlanAppList[] = filterd2.filter(item => {
      // isRemojuPlan true:Remojuプラン false:ユーザ投稿プラン
      return item.isRemojuPlan ? item.isRemojuPlan === condition.isRemojuRecommended
      : !item.isRemojuPlan === condition.isUserPost;
    })
      return filterd3;
    }

    //return filterd2;
  //}


  // test filteringPlanPromise
  // filteringPlanPromise(plan: PlanAppList[], condition: ListSearchCondition){
  //   return new Promise((resolve)=>{
  //     resolve("success")
  //   })
  // }
}
