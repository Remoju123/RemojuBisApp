import { DataSelected } from "./common.class";
import { SpotSearchCategory } from "./spotlist.class";
import { PlanSearchCategory, PlanSpotName } from "./planlist.class";

import { ListSearchCondition } from "./indexeddb.class";
import { Businesshours } from "./spot.class";


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
export class PlanSpotList_bk {
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

  objectId:string;
  
  guid:string;
}

export class PlanSpotList {
  address: string;
  areaId: number;
  areaId2: number;
  areaName: string;
  areaName2: string;
  averageStayTime: number;
  budgets: Budgets[];//
  businessHours: Businesshours[];//
  createDate: string;
  favoriteQty: number;
  googleSpot: GoogleSpot;
  guid: string;
  id: number;
  isCreation: boolean;
  isEndOfPublication: boolean;
  isFavorite: boolean;
  isPlan: number;
  isRegularHoliday: boolean;
  isRemojuPlan: boolean
  keyword: string;
  objectId: string;
  overview: null;//
  pictures: string[];
  planName: string;
  planSpotNames: PlanSpotName[];//
  pvQtyAll: number;
  regularHoliday: string;
  releaseCreateDatetime: string;
  reviewAvg: number;
  searchCategories: DataSelected[];
  searchCategoryIds: number[];
  seo: Seo[];
  spotAccess: SpotAccesses;
  spotName: string;
  spotQty: number;
  subheading: string;
  timeRequiredHour: number;
  timeRequiredMin: number;
  travelDate: string;
  userName: string;
  userPictureUrl: string;
  versionNo: number;
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
  lst: string;
  srt: string;
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

export class Budgets {
  version_no: number;
  spot_id: number;
  budget_frame_id: number;
  budget_id: number;
}

export class Seo {
  version_no: number;
  spot_id: number;
  subtitle: string;
  keyword: string;
  description: string;
}

export class SpotAccesses {
  version_no: number;
  spot_id: number;
  display_order: number;
  access: number;
  nearest: string;
}

export class CacheStore {
  data: PlanSpotList[];
  p:number;
  end:number;
  offset:number;
  select:string;
  sortval:string;
  keyword:string;
  mSort:DataSelected[];
}

export class GoogleSpot {
  google_spot_id: number;
  areaId: number;
  spot_name: string;
  address: string;
  picture_url: string;
  latitude: string;
  longitude: string;
  place_id: string;
  create_user_id: string;
  create_datetime: string;
  mArea: MArea;
  formatAddress: string;
  isFavorite: boolean;
  compoundCode: string;
}

export class MArea {
  area_id: number;
  display_order: number;
  parent_area_id: number;
  is_display_search: boolean;
  is_active: boolean;
  level: number;
  map_url: string;
  area_name_1: string;
  area_name_2: string;
}