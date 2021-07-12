import { DataSelected } from "./common.class";
import { SpotSearchCategory } from "./spotlist.class";
import { PlanSearchCategory } from "./planlist.class";

import { ListSearchCondition } from "./indexeddb.class";


// 選択(エリア・カテゴリ用)
export interface NestDataSelected {
  parentId: number;
  parentName: string;
  isHighlight: boolean;
  qty: number;
  dataSelecteds: DataSelected[];
  selected: boolean;
}
export class PlanSpotListSearchResult {
    // 1ページあたりの表示件数
    pageViewQty: number;
    // 検索結果
    planSpotList: PlanSpotList[];
    // 営業曜日
    businessDay: DataSelected[];
  }

// プラン/スポット一覧
export class PlanSpotList {
  // 詳細取得済み:true
  isDetail: boolean;
  // プラン:true スポット:false
  isPlan: boolean;
  // true:CT作成プラン false:ユーザ作成プラン
  isRemojuPlan: boolean;
  // バージョンNo
  versionNo: number;
  // プラン/スポットID
  id: number;
  // キーワード
  keyword: string;
  // エリアID
  areaId: number;
  // エリアID2
  areaId2: number;
  // ソート項目：人気順(歴代)
  pvQtyAll: number;
  // ソート項目：人気順(今週)
  pvQtyWeek: number;
  // ソート項目：プランに採用した回数
  planSpotQty: number;
  // ソート項目：レビュー評価
  reviewAvg: number;
  // ソート項目：投稿日時
  releaseCreateDatetime: string;
  // 検索カテゴリ
  spotSearchCategories: SpotSearchCategory[];
  
  planSearchCategories: PlanSearchCategory[];

  pictures: string[];

  isEndOfPublication: boolean;
}


export class searchResult{
  constructor(){
    this.searchParamsObj = new SearchParamsObj;
  }
  list: PlanSpotList[];
  searchTarm: string;
  searchParams: string;
  searchParamsObj: SearchParamsObj;
}

export class SearchParamsObj{
  aid: string;
  era: string;
  cat: string;
  rep: boolean;
  usp:boolean;
}


export class ListSelected {
  constructor() {
    this.isList = true;
    this.condition = new ListSearchCondition();
  }
  // エリア
  mArea: NestDataSelected[];
  // 検索カテゴリ
  mSearchCategory: NestDataSelected[];
  // 検索カテゴリ(プラン)
  mSearchCategoryPlan: NestDataSelected[];
  // ソート順
  mSort: DataSelected[];
  // 営業曜日
  businessDay: DataSelected[];
  // tabIndex
  tabIndex: number;
  // source(list)
  planspotList: PlanSpotList[];
  // 一覧の場合true(検索条件を保持する)　プラン投稿の場合false(検索条件を保持しない)
  isList: boolean;
  // プラン投稿の場合、選択値を保持する(indexeddbを使用しない)
  condition: ListSearchCondition;
}