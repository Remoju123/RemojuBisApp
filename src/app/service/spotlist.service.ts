import { Inject, Injectable,OnDestroy } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
  ListSelected,
  RegistFavorite,
  AddSpot,
  Location,
  NestDataSelected,
  MyPlanApp
} from "../class/common.class";
import {
  SpotAppList,
  GoogleSpot,
  SpotAppListSearchResult,
  searchResult,
  SearchParamsObj
} from "../class/spotlist.class";
import { CommonService } from "./common.service";
import { IndexedDBService } from "./indexeddb.service";
import { SpotService } from "./spot.service";
import { TranslateService } from "@ngx-translate/core";
import { FilterPipe } from "ngx-filter-pipe";
import { LangFilterPipe } from "../utils/lang-filter.pipe";
import { ListSearchCondition } from '../class/indexeddb.class';
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
export class SpotListService implements OnDestroy {
  private onDestroy$ = new Subject();
  constructor(
    private http: HttpClient,
    private commonService: CommonService,
    private spotService: SpotService,
    private translate: TranslateService,
    private indexedDBService: IndexedDBService,
    @Inject("BASE_API_URL") private host: string,
    private filterPipe: FilterPipe
  ) { }


  //
  public getCondition(callback: any) {
    this.http.get(this.host + "/api/SpotList/ListSelected")
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
    // this.http.get("https://remojuapi.azurewebsites.net/api/SpotList/ListSelected").subscribe(
      (res) => {
        const response: any = res;
        callback(response);
      },
      (error) => {
        console.log(error);
      }
    )
  }

  // 検索条件を取得
  getSpotListSearchCondition(isTollSpot: boolean) {
    const url = this.host + "/api/SpotList/ListSelected";
    return this.http.get<ListSelected>(url, {
      params: {
        isTollSpot: String(isTollSpot)
      }
    });
  }

  // スポット一覧を取得
  getSpotList(tollSpotURL: string) {
    const url = this.host + "/api/SpotList/Search";
    return this.http.get<SpotAppListSearchResult>(url, {
      params: {
        tollSpotURL: tollSpotURL === undefined?"":tollSpotURL
      }
    });
  }

  // スポット一覧(詳細)を取得
  getSpotListDetail(options: SpotAppList) {
    options.objectId = this.commonService.objectId;
    const url = this.host + "/api/SpotList/SearchDetail";
    return this.http.post<SpotAppList>(url, options, httpOptions);
  }

  // スポット一覧(詳細)を整形
  dataFormat(row: SpotAppList){
    row.holiday = this.spotService.getRegularholidays(row.regularHoliday);
    row.businessHour = this.spotService.getBusinessHourMain(row.businessHours);
    row.budget = this.spotService
      .getBudgetFrame(row.budgets)
      .replace(/<br>/g, "&nbsp;");
    row.budgetFrameHead = this.spotService.getBudgetFrameLine(row.budgets);
    row.businessHourMain = this.spotService.getBusinessHourMain(row.businessHours);
    row.businessHourHead = this.spotService.getBusinessHourHead(row.businessHours);
    row.categoryTexts = this.getCategoryTexts(row.searchCategory);
    // カテゴリアイコン
    let icons = [];
    if (row.searchCategory.categoryIcon1){
      icons.push(row.searchCategory.categoryIcon1);
    }
    if (row.searchCategory.categoryIcon2){
      icons.push(row.searchCategory.categoryIcon2);
    }
    if (row.searchCategory.categoryIcon3){
      icons.push(row.searchCategory.categoryIcon3);
    }
    row.categoryIcons = icons;

    if (row.spotAccess !== null && row.spotAccess.nearest !== null) {
      row.nearest = row.spotAccess.nearest;
      row.access = this.spotService.getAccessIcon(row.spotAccess.access);
    }
    row.isDetail = true;
  }

  // カテゴリ名をつなげる
  getCategoryTexts(data: any) {
    const langpipe = new LangFilterPipe();
    const r = [];
    for (let i = 1; i <= 3; i++) {
      const text = langpipe.transform(data["categoryName" + i], this.translate.currentLang);
      if (text !== null) {
        r.push(text);
      }
    }

    return r.join(" / ");
  }

  // Googleスポット検索
  getGoogleSpotList(keyword: string, langCd: string, guid: string) {
    const url = this.host + "/api/SpotList/GoogleSpot";
    return this.http.get<SpotAppList[]>(url, {
      params: {
        keyword: keyword,
        langCd: langCd,
        guid: guid,
        objectId: this.commonService.objectId
      }
    });
  }

  // お気に入り登録
  registFavorite(
    spotId: number,
    isFavorite: boolean,
    guid: string,
    googleSpot: GoogleSpot = null
  ) {
    // お気に入り登録データ作成
    const registFavorite: RegistFavorite = new RegistFavorite();
    registFavorite.spotFavorite = {
      spot_id: spotId,
      google_spot_id: 0,
      guid: guid,
      is_delete: !isFavorite,
      objectId: this.commonService.objectId
    };
    if (spotId === 0) {
      registFavorite.googleSpot = googleSpot;
    }
    const url = this.host + "/api/SpotList/Favorite";
    return this.http.post<any>(url, registFavorite, httpOptions);
  }

  // プランに追加する
  async addSpot(spotId: number, type: number = 1, googleSpot: GoogleSpot = null) {
    // 作成中プラン取得
    let myPlan: any = await this.indexedDBService.getEditPlan(true);
    if (!myPlan){
      myPlan = new MyPlanApp();
    }
    myPlan.languageCd1 = [ this.translate.currentLang ];
    myPlan.isTransferSearch = true;

    let addSpot: AddSpot = new AddSpot();
    addSpot = {
      MyPlan: myPlan,
      spotId: spotId,
      type: type,
      googleSpot: googleSpot
    };
    const url = this.host + "/api/SpotList/AddSpot";
    return this.http.post<MyPlanApp>(url, addSpot, httpOptions);
  }

  // 現在地の取得
  getGeoLocation() {
    return new Promise<Location>((resolve, reject) => {
      // 端末がGeoLocation APIに対応している場合
      if (navigator.geolocation) {
        // 現在地を取得
        navigator.geolocation.getCurrentPosition(
          // [第1引数] 成功
          position => {
            const data = position.coords;
            let location: Location = new Location();
            location = {
              latitude: data.latitude,
              longitude: data.longitude,
              errorCd: 0
            };
            resolve(location);
          },
          // [第2引数] 失敗
          error => {
            // エラーコード(error.code)の番号
            // 0:UNKNOWN_ERROR				原因不明のエラー
            // 1:PERMISSION_DENIED			利用者が位置情報の取得を許可しなかった
            // 2:POSITION_UNAVAILABLE		電波状況などで位置情報が取得できなかった
            // 3:TIMEOUT					位置情報の取得に時間がかかり過ぎた…

            const location: Location = new Location();
            location.errorCd = error.code;

            resolve(location);
            // reject(location);
          }
        );
        return location;
      } else {
        const location: Location = new Location();
        location.errorCd = 9;

        reject(location);
        return location;
      }
    });
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

  reduceQtyArea(master: NestDataSelected[], list: SpotAppList[]) {
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


  /*----------------------------------------
   *
   * 検索処理
   * 2020.5.25 MM UPDATE
   *
   *  -------------------------------------*/
  //

  public result = new searchResult();
  public searchSubject = new Subject<searchResult>();
  public searchFilter = this.searchSubject.asObservable();

  getSearchFilter(listSelected:ListSelected,condition:ListSearchCondition){
    /*-----------------------------------------
    * 1.絞り込み処理
    -----------------------------------------*/
    const areas: { areaId?: number; areaId2?: number; }[] = [];
    condition.areaId.forEach(x => {
      areas.push({ areaId: x });
    });

    condition.areaId2.forEach(x => {
      areas.push({ areaId2: x });
    });

    let _result: any[] = [];
    // エリア検索 (ngx-filter-pipe)
    const filterd1 = areas.length
      ? this.filterPipe.transform(listSelected.spotList, {
        $or: areas
      }) : listSelected.spotList;

    // カテゴリ検索(OR)
    _result = filterd1.filter((item: { searchCategories: any[]; }) => {
      if (!condition.searchCategories.length) {
        return true;
      }
      return item.searchCategories.find((c: { search_category_id: any; }) => {
        return condition.searchCategories.find(f => f === c.search_category_id);
      });
    });

    // その他の条件検索(AND)
    if (condition.searchOptions.length > 0) {
      condition.searchOptions.forEach(v => {
        _result = _result.filter(x =>
          x.searchCategories.some((y: { search_category_id: any; }) => y.search_category_id === v)
        );
      });
    }

    /*-----------------------------------------
    * 2.検索条件文字列結合
    -----------------------------------------*/

    const _params = [];
    const _areaNums: string[] = [];
    const _areaId2Nums: string[] = [];
    const _category: string[] = [];
    const _option: string[] = [];
    const kws: any[] = [];

    const Categories = [
      ...listSelected.mSearchCategory[0].dataSelecteds,
      ...listSelected.mSearchCategory[1].dataSelecteds,
      ...listSelected.mSearchCategory[2].dataSelecteds,
      ...listSelected.mSearchCategory[3].dataSelecteds,
      ...listSelected.mSearchCategory[4].dataSelecteds
    ];

    const keyword = [
      ...listSelected.mSearchCategory[5].dataSelecteds,
      ...listSelected.mSearchCategory[6].dataSelecteds
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

    if(condition.searchOptions.length){
      condition.searchOptions.forEach(v=>{
        _option.push(keyword.find(x => x.id === v).name);
      })
    }

    let kw = [..._areaNums, ..._areaId2Nums, ..._category, ..._option];
    kw.map(k => {
      kws.push(langpipe.transform(k, this.translate.currentLang));
    });

    /*-----------------------------------------
    * 3.検索パラメータ結合
    -----------------------------------------*/
    _params.push("aid=" + condition.areaId.join(","));
    _params.push("era=" + condition.areaId2.join(","));
    _params.push("cat=" + condition.searchCategories.join(","));
    _params.push("opt=" + condition.searchOptions.join(","));

    this.result.list = _result;
    this.result.searchTarm = kws.length > 0 ? kws.join(","):"";
    this.result.searchParams = _params.join("&");
    this.result.searchParamsObj = new SearchParamsObj;
    this.result.searchParamsObj.aid = condition.areaId.join(",");
    this.result.searchParamsObj.era = condition.areaId2.join(",");
    this.result.searchParamsObj.cat = condition.searchCategories.join(",");
    this.result.searchParamsObj.opt = condition.searchOptions.join(",");
    this.searchSubject.next(this.result);
  }

  // 一覧をエリアで絞り込み
  getSearchAreaFilter(listSelected:ListSelected, condition:ListSearchCondition){
    const areas: { areaId?: number; areaId2?: number; }[] = [];
    condition.areaId.forEach(x => {
      areas.push({ areaId: x });
    });

    condition.areaId2.forEach(x => {
      areas.push({ areaId2: x });
    });

    // エリア検索 (ngx-filter-pipe)
    return areas.length
      ? this.filterPipe.transform(listSelected.spotList, {
        $or: areas
      }) : listSelected.spotList;
  }

  /*----------------------------
   *
   * 検索処理(スポット)
   * 選択した条件でフィルタして、バインドフォームデータの登録数を更新する
   *
   *  ---------------------------*/
  filteringSpot(spot: any[], condition: { areaId: any[]; areaId2: any[]; searchCategories: any[]; searchOptions: any[]; }) {
    // エリア検索用パラメータ
    const areaIds: { areaId?: any; areaId2?: any; }[] = [];
    // 一旦セッション変数をクリア
    let result: any[] = [];

    condition.areaId.forEach((x: any) => {
      areaIds.push({ areaId: x });
    });

    condition.areaId2.forEach((x: any) => {
      areaIds.push({ areaId2: x });
    });

    // エリア検索 (ngx-filter-pipe)
    const filterd1 = areaIds.length
      ? this.filterPipe.transform(spot, {
        $or: areaIds
      })
      : spot;

    // カテゴリ検索（OR）
    const filterd2 = filterd1.filter((item: { searchCategories: any[]; }) => {
      if (!condition.searchCategories.length) {
        return true;
      }
      return item.searchCategories.find((c: { search_category_id: any; }) => {
        return condition.searchCategories.find((f: any) => f === c.search_category_id);
      });
    });

    // その他検索（AND）
    result = filterd2;

    if (condition.searchOptions.length > 0) {
      condition.searchOptions.forEach((v: any) => {
        result = result.filter(x =>
          x.searchCategories.some((y: { search_category_id: any; }) => y.search_category_id === v)
        );
      });
    }

    return result;
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }
}
