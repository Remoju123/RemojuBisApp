import { Recommended, DataSelected } from "./common.class";
import { Seo } from "./spot.class";

export class searchResult{
  list:SpotAppList[];
  searchTarm:string;
  searchParams:string;
  searchParamsObj:SearchParamsObj;
}

export class SearchParamsObj{
  aid: string;
  era: string;
  cat: string;
  opt: string;
}

export class SpotAppListSearchResult {
  // 1ページあたりの表示件数
  pageViewQty: number;
  // 検索結果
  spotAppList: SpotAppList[];
  // 予算枠
  budgetFrame: DataSelected[];
  // 営業曜日
  businessDay: DataSelected[];
  // 有料スポットのエリアID
  tollSpotAreaId: number;
}

export class SpotAppList {
  [x: string]: any;
  // 詳細取得済み:true
  isDetail: boolean;
  // バージョンNo
  versionNo: number;
  // スポットID
  spotId: number;
  // オブジェクトID
  objectId: string;
  // GUID
  guid: string;
  // 掲載終了の場合true
  isEndOfPublication: boolean;
  // 小見出し
  subheading: string;
  // 緯度
  latitude: number;
  // 経度
  longitude: number;
  // 住所
  address: string;
  // エリア名
  areaName: string;
  // エリア名2
  areaName2: string;
  // クーポン true:あり false:なし
  isCoupon: boolean;
  // 定休日
  isRegularHoliday: boolean;
  // お気に入り登録 true:している false:していない
  isFavorite: boolean;
  // お気に入りを登録している人数
  favoriteQty: number;
  // タイムセール true:あり false:なし
  isTimesale: boolean;
  // スポット名
  spotName: string;
  // 滞在時間
  averageStayTime: number;
  // 定休日
  regularHoliday: string;
  // SEOキーワード
  seoKeyword: string;
  // エリアID
  areaId: number;
  // エリアID2
  areaId2: number;
  // 検索カテゴリ
  searchCategory: SearchCategory;
  // googleスポット
  googleSpot: GoogleSpot;
  // アクセス
  spotAccess: SpotAccesses;
  // SEO
  seo: Seo;
  // 複数取得
  // スポット写真リスト
  pictures: SpotPicture[];
  // 営業時間リスト
  businessHours: SpotBusinessHours[];
  // 予算リスト
  budgets: SpotBudget[];
  // 検索カテゴリ
  searchCategories: any[]; // SpotSearchCategory[];
  // 以下、スクリプトで設定する項目
  // 営業時間
  businessHour: string;
  // 定休日
  holiday: string;
  // 予算
  budget: string;
  // お気に入り登録用
  favorite: SpotFavorite;
  // プラン追加用
  planUserJson: string;
  // 予算ヘッダ
  budgetFrameHead: string;
  // メイン営業時間
  businessHourMain: string;
  /*---add by mm ---*/
  // 営業時間ヘッダ表示用
  businessHourHead: string;
  // お気に入りカウント
  pvQty: number;
  // サンクスカウント
  thanksQty: number;
  // カテゴリーテキスト表示用
  categoryTexts: string;
  // カテゴリーアイコン表示用
  categoryIcons: string[];
  // 交通手段表示用
  nearest: string;
  // アクセス（アイコン）表示用
  access: string;

  searchKeys: string;

  createDate: string;

  // ソート項目：人気順(歴代)
  pvQtyAll: number;
  // ソート項目：人気順(今週)
  pvQtyWeek: number;
  // ソート項目：プランに採用した回数
  planSpotQty: number;
  // ソート項目：口コミ評価
  reviewAvg: number;
  // ソート項目：投稿日時
  releaseCreateDatetime: string;
  // ソート項目：居場所から近い順(要位置情報)
  closerOrder: number;
  // ソート項目：指定した有料スポットから近い順
  nearestOrder: number;

  overview: string;
}

export class SearchCategory {
  // カテゴリアイコン1
  categoryIcon1: string;
  // カテゴリ名1
  categoryName1: string;
  // カテゴリアイコン2
  categoryIcon2: string;
  // カテゴリ名2
  categoryName2: string;
  // カテゴリアイコン3
  categoryIcon3: string;
  // カテゴリ名3
  categoryName3: string;
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

export class SpotAccesses {
  version_no: number;
  spot_id: number;
  display_order: number;
  access: number;
  nearest: string;
}

export class SpotPicture {
  version_no: number;
  spot_id: number;
  display_order: number;
  picture_url: string;
  is_main: boolean;
  subheading: string;
  comment: string;
}

export class SpotBusinessHours {
  version_no: number;
  spot_id: number;
  display_order: number;
  business_day: string;
  business_hours: string;
  is_main: boolean;
}

export class SpotBudget {
  version_no: number;
  spot_id: number;
  budget_frame_id: number;
  budget_lower_limit: number;
  budget_cap: number;
}

export class SpotSearchCategory {
  version_no: number;
  spot_id: number;
  search_category_id: number;
  name: string;
  parentId: number;
  parentName: string;
}

export class SpotFavorite {
  spot_id: number;
  google_spot_id: number;
  guid: string;
  is_delete: boolean;

  objectId: string;
}

export class HistoryParam{
  spot: number[];
  plan: number[];
}

export class History{
  spot: Recommended[];
  plan: Recommended[];
}

export class FilterCondition {
  areaId: [];
  areaId2: [];
  search_category_id: [];
  AddedId: [];
  isOpens: [];
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
