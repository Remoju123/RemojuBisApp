import { DataSelected } from "./common.class";
import { SpotSearchCategory } from "./spotlist.class";
import { PlanSearchCategory } from "./planlist.class";

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
    // ソート項目：プランに採用した回数
  planSpotQty: number;
    // ソート項目：レビュー評価
  reviewAvg: number;
    // ソート項目：投稿日時
  releaseCreateDatetime: string;
    // 検索カテゴリ
  spotSearchCategories: SpotSearchCategory[];

  planSearchCategories: PlanSearchCategory[];
}
  