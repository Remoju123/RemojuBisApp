import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { DataSelected, ListSelectMaster, NestDataSelected } from "../class/common.class";
import { PlanSpotList,searchResult,
  SearchParamsObj, 
  ListSelected} from "../class/planspotlist.class";
import { CommonService } from "./common.service";
import { Observable, Subject } from "rxjs";
import { ListSearchCondition } from "../class/indexeddb.class";
import { FilterPipe } from "ngx-filter-pipe";
import { LangFilterPipe } from "../utils/lang-filter.pipe";
import { TranslateService } from "@ngx-translate/core";
import { PlanspotComponent } from "../pages/planspot/planspot.component";
import { takeUntil } from "rxjs/operators";

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

  // 検索条件絞り込み処理
  getFilterbyCondition(data:PlanSpotList[], cond:ListSearchCondition){
    const areas:any = [];
    cond.areaId?.forEach(x => {
      areas.push({ areaId: x });
    });

    cond.areaId2?.forEach(x => {
      areas.push({ areaId2: x });
    });

    let _result = [];
    // エリア検索 (ngx-filter-pipe)
    const filterd1 = areas.length
      ? this.filterPipe.transform(data, {
        $or: areas
      }) : data;

    // カテゴリ検索(OR)
    _result = filterd1.filter((item: { searchCategoryIds: any[]; }) => {
      if (!cond.searchCategories?.length) {
        return true;
      }
      return item.searchCategoryIds.find(c => {
        return cond.searchCategories.find(f => f === c);
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

    // キーワード検索
    if(cond.keyword !== ""){
      _result = _result.filter(d => JSON.stringify(d.keyword).indexOf(cond.keyword) !== -1 || !cond.keyword);
    }

    return _result;
  }

  // データセット作成
  async filteringData(data:any,cond:ListSearchCondition,master:ListSelectMaster){
    /*-----------------------------------------
    * 1.絞り込み処理
    -----------------------------------------*/
    let _result = this.getFilterbyCondition(data,cond);

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

    /*-----------------------------------------
    * 2.検索条件文字列結合
    -----------------------------------------*/
    const _areaNams: string[] = [];
    const _areaId2Nams: string[] = [];
    const _category: string[] = [];
    const areas:any[] = [];
    const cates:any[] = [];

    const $master = master.mSearchCategoryPlan.concat(master.mSearchCategory);

    const Categories = [
      ...$master[0].dataSelecteds,
      ...$master[1].dataSelecteds,
      ...$master[2].dataSelecteds,
      ...$master[3].dataSelecteds,
      ...$master[4].dataSelecteds,
      ...$master[5].dataSelecteds,
      ...$master[6].dataSelecteds,
      ...$master[7].dataSelecteds,
      ...$master[8].dataSelecteds,
      ...$master[9].dataSelecteds,
    ]
    
    const langpipe = new LangFilterPipe();

    cond.areaId?.forEach(v=>{
      _areaNams.push(master.mArea.find(x=>x.parentId === v).parentName)
    });

    cond.areaId2?.forEach(e=>{
      const _areas = master.mArea.find(
        v => v.parentId === Number(e.toString().slice(0, -2))
      );
      _areaId2Nams.push(_areas.dataSelecteds.find(x => x.id === e).name);
    })

    let _areas = [..._areaNams,..._areaId2Nams];
    _areas.map(v => {
      areas.push(langpipe.transform(v,this.translate.currentLang));
    })
  
    if(cond.searchCategories?.length){
      cond.searchCategories.forEach(v=>{
        _category.push(Categories.find(x => x.id === v).name);
      })
    }

    if(cond.keyword !== ""){
      cates.push(cond.keyword);
    }

    _category.map(v => {
      cates.push(langpipe.transform(v,this.translate.currentLang));
    })

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
    this.result.searchTarm = {area : areas.length > 0 ? areas.join(' 、'):'----',cate : cates.length > 0 ? cates.join('、'):'----'};
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
    //return data.filter(x => x.qty > 0);
    return data;
  }

  reduceAreaCount(
    mArea: NestDataSelected[],
    list: any[],
    areaId: any[],
    areaId2: any[]
  ){
    const data = mArea.reduce((x, c) => {
      x.push({
        parentId: c["parentId"],
        parentName: c["parentName"],
        isHighlight:c["isHighlight"],
        qty: list.filter(i => i.areaId === c["parentId"]).length,
        selected: false,//areaId.includes(c["parentId"]), //  false,
        dataSelecteds: c["dataSelecteds"].reduce((y, d) => {
          y.push({
            id: d["id"],
            name: d["name"],
            qty: list.filter(j => j.areaId2 === d["id"]).length,
            selected: d["selected"]//areaId2.includes(d["id"]) // d["selected"]
          });
          return y;
        }, [])
      });
      return x;
    }, []);
    //return data.filter(x => x.qty > 0);
    return data;
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
        x.searchCategoryIds !== null ? x.searchCategoryIds.some(
          (s: { toString: () => string; }) => s.toString().slice(0, 3) === c["parentId"].toString()) : []
          ).length,
        selected: true,
        dataSelecteds: c["dataSelecteds"].reduce((y, d) => {
          y.push({
            id: d["id"],
            name: d["name"],
            qty: list.filter(x =>
              x.searchCategoryIds !== null ? x.searchCategoryIds.some(
                (s: number) => s === d["id"]) : []
            ).length,
            selected: categoryIds.includes(d["id"]) // d["selected"]
          });
          return y;
        }, [])
      });
      return x;
    }, []);
  }
}
