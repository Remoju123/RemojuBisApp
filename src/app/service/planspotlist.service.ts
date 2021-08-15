import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ListSelectMaster, NestDataSelected } from "../class/common.class";
import { PlanSpotList,searchResult,
  SearchParamsObj, 
  ListSelected} from "../class/planspotlist.class";
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

  // Googleスポット検索
  async getGoogleSpotList(keyword: string) {
    const url = this.host + "/api/SpotList/GoogleSpot";
    return this.http.get<PlanSpotList[]>(url, {
      params: {
        keyword: keyword,
        langCd: this.translate.currentLang,
        guid: await this.commonService.getGuid(),
        objectId: this.commonService.objectId
      }
    });
  }

  // プランスポット一覧、詳細データ
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


  // フィルタ & データセット作成
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

    // プラン・スポット選択
    switch(cond.select){
      case 'plan':
        _result = _result.filter(d => d.isPlan === 1);  
        break;
      case 'spot':
        _result = _result.filter(d => d.isPlan === 0);  
        break;
      case 'google':
        _result = [];
        break;
    }

    // ソート処理
    switch(parseInt(cond.sortval)){
      case 7: // 閲覧順
        _result = _result.sort((a,b) => {
          return a.pvQtyAll < b.pvQtyAll ? 1 : -1
        })
        break;
      case 10: // レビュー評価
        _result = _result.sort((a,b) => {
          return a.reviewAvg < b.reviewAvg ? 1 : -1
        })
        break;
      case 11: // 新着純
        _result = _result.sort((a,b) => {
          return a.releaseCreateDatetime < b.releaseCreateDatetime ? 1 : -1
        })
        break;
      case 9: // プランに追加された件数
        
        break;
    }

    // キーワード検索
    if(cond.keyword !== ""){
      _result = _result.filter(d => JSON.stringify(d.keyword).indexOf(cond.keyword) !== -1 || !cond.keyword);
    }

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
    _params.push("srt=" + cond.sortval);
    _params.push("lst=" + cond.select);

    this.result.list = _result;
    this.result.searchTarm = kws.length > 0 ? kws.join(","):"";
    this.result.searchParams = _params.join("&");
    this.result.searchParamsObj = new SearchParamsObj;
    this.result.searchParamsObj.aid = cond.areaId.join(",");
    this.result.searchParamsObj.era = cond.areaId2.join(",");
    this.result.searchParamsObj.cat = cond.searchCategories.join(",");
    this.result.searchParamsObj.srt = cond.sortval;
    this.result.searchParamsObj.lst = cond.select;

    if (master.isList) {
      this.searchSubject.next(this.result);
    } else {
      this.searchSubjectNoList.next(this.result);
    }
  }

  // プラン一覧(詳細)を整形
  dataFormat(row: PlanSpotList){
    row.planName = this.commonService.isValidJson(row.planName, this.translate.currentLang);
  }

  // 一覧をエリアで絞り込み
  getSearchAreaFilter(listSelected:ListSelectMaster, condition:ListSearchCondition){
    const areas: { areaId?: number; areaId2?: number; }[] = [];
    condition.areaId.forEach(x => {
      areas.push({ areaId: x });
    });

    condition.areaId2.forEach(x => {
      areas.push({ areaId2: x });
    });

    // エリア検索 (ngx-filter-pipe)
    return areas.length
      ? this.filterPipe.transform(listSelected.planSpotList, {
        $or: areas
      }) : listSelected.planSpotList;
  }

  /* マスタ：エリア/サブエリア別カウント
   * mArea:this.listSelected.mArea
   * list:r.spotAppList
   */
  reduceMasterArea(
    mArea: NestDataSelected[],
    list: any[],
    areaId: any[],
    areaId2: any[]
  ) {
    const data = mArea.reduce((x, c) => {
      x.push({
        parentId: c["parentId"],
        parentName: c["parentName"],
        isHighlight:c["isHighlight"],
        qty: list.filter(i => i.areaId === c["parentId"]).length,
        selected: areaId.includes(c["parentId"]), //  false,
        dataSelecteds: c["dataSelecteds"].reduce((y, d) => {
          y.push({
            id: d["id"],
            name: d["name"],
            qty: list.filter(j => j.areaId2 === d["id"]).length,
            selected: areaId2.includes(d["id"]) // d["selected"]
          });
          return y;
        }, [])
      });
      return x;
    }, []);
    return data.filter(x => x.qty > 0);
    // return data;
  }

  /* マスタ：カテゴリ別カウント
   * mSearchCategory:this.listSelected.mSearchCategory
   * list:r.spotAppList
   */
  reduceMasterCategory(
    mSearchCategory: NestDataSelected[],
    list: any[],
    categoryIds: any[]
  ) {
    return mSearchCategory.reduce((x, c) => {
      x.push({
        parentId: c["parentId"],
        parentName: c["parentName"],
        qty: list.filter(x =>
          x.searchCategories !== null
            ? x.searchCategories.some(
              (              s: { search_category_id: { toString: () => string; }; }) =>
                s.search_category_id.toString().slice(0, 3) ===
                c["parentId"].toString()
            )
            : []
        ).length,
        selected: true,
        dataSelecteds: c["dataSelecteds"].reduce((y, d) => {
          y.push({
            id: d["id"],
            name: d["name"],
            qty: list.filter(x =>
              x.searchCategories !== null
                ? x.searchCategories.some((s: { search_category_id: number; }) => s.search_category_id === d["id"])
                : []
            ).length,
            selected: categoryIds.includes(d["id"]) // d["selected"]
          });
          return y;
        }, [])
      });
      return x;
    }, []);
  }

  reduceQtyArea(master: NestDataSelected[], list: PlanSpotList[]) {
    const data = master.reduce((x, c) => {
      x.push({
        parentId: c["parentId"],
        qty: list.filter(i => i.areaId === c["parentId"]).length,
        dataSelecteds: c["dataSelecteds"].reduce((y, d) => {
          y.push({
            id: d["id"],
            qty: list.filter(j => j.areaId2 === d["id"]).length
          });
          return y;
        }, [])
      });
      return x;
    }, []);
    return data.filter(x => x.qty > 0);
    // return data;
  }

  reduceQty(master: NestDataSelected[], list: any[]) {
    return master.reduce((x, c) => {
      x.push({
        parentId: c["parentId"],
        qty: list.filter(x =>
          x.searchCategories !== null
            ? x.searchCategories.some(
              (              s: { search_category_id: { toString: () => string; }; }) =>
                s.search_category_id.toString().slice(0, 3) ===
                c["parentId"].toString()
            )
            : []
        ).length,
        dataSelecteds: c["dataSelecteds"].reduce((y, d) => {
          y.push({
            id: d["id"],
            qty: list.filter(x =>
              x.searchCategories !== null
                ? x.searchCategories.some((s: { search_category_id: number; }) => s.search_category_id === d["id"])
                : []
            ).length
          });
          return y;
        }, [])
      });
      return x;
    }, []);
  }
}
