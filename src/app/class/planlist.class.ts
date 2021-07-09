import { Seo } from "./plan.class";

export class searchResult{
  constructor(){
    this.searchParamsObj = new SearchParamsObj;
  }
  list: PlanAppList[];
  searchTarm: string;
  searchParams: string;
  searchParamsObj: SearchParamsObj;
}

export class SearchParamsObj{
  aid: string;
  era: string;
  cat: string;
  rep: boolean = false;
  usp: boolean = false;
}

export class PlanAppListSearchResult {
  // 1ページあたりの表示件数
  pageViewQty: number;
  // 検索結果
  planAppList: PlanAppList[] = [];
  // 有料スポットのエリアID
  tollSpotAreaId: number;
}

export class PlanAppList {
  // 詳細取得済み:true
  isDetail: boolean = false;
  // Remojuプラン:true ユーザ作成プラン:false
  isRemojuPlan: boolean = false;
  // バージョンNo
  versionNo: number;
  // プランID
  planId: number;
  // SEOキーワード
  seoKeyword: string;
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
  // ソート項目：有料スポット用プラン優先表示
  isTollSpot: boolean = false;

  // 検索カテゴリ
  searchCategories: PlanSearchCategory[] = [];
  // オブジェクトID
  objectId: string;
  // GUID
  guid: string;
  // 掲載終了の場合true
  isEndOfPublication: boolean = false;
  // エリア名
  areaName: string;
  // エリア名2
  areaName2: string;
  // プラン名
  planName: string;
  // お気に入り登録 true:している false:していない
  isFavorite: boolean = false;
  // お気に入りを登録している人数
  favoriteQty: number;
  // 周遊時間(時間)
  timeRequiredHour: string;
  // 周遊時間(分)
  timeRequiredMin: string;
  // 予算
  budget: string;
  // 旅行予定日
  travelDate: string;
  // 作成日時
  createDate: string;
  // スポット数
  spotQty: number;
  // ユーザ名(スタッフ名)
  userName: string;
  // プロフィール画像
  userPictureUrl: string;
  // SEO
  seo: Seo = new Seo;
  // true:プラン作成 false:プラン投稿
  isCreation: boolean = false;
  // 複数取得
  // スポット写真リスト
  pictures: string[] = [];
  // プランスポット名
  planSpotNames: PlanSpotName[] = [];
  // プランスポットID
  planSpotIds: number[] = [];
}

export class PlanSpotName{
  isRemojuSpot: boolean = false;
  spotName: string;
  spotId: number;
}

export class PlanSearchCategory {
  version_no: number;
  plan_id: number;
  search_category_id: number;
  name: string;
  icon: string;
}

export class PlanFavorite {
  plan_id: number;
  guid: string;
  is_delete: boolean = false;

  objectId: string;
}

export class PlanUserFavorite {
  plan_user_id: number;
  guid: string;
  is_delete: boolean = false;

  objectId: string;
}

export interface Langary {
  lang: string;
  text: string;
}
