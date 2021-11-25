import { DataSelected, MyPlanApp, PlanSpotCommon, ListSelectedPlan } from "./common.class";

export class MypagePlanAppListSearchResult {
  // 1ページあたりの表示件数
  pageViewQty: number;
  // 検索結果
  mypagePlanAppList: MypagePlanAppList[];
}

export class MypagePlanAppList {
  // プランユーザID
  planUserId: number;
  // エリアID
  areaId: number;
  // エリアID2
  areaId2: number;
  // 都道府県名
  areaName: string;
  // 最終更新日
  updateDatetime: string;
  // 作成日
  createDatetime: string;
  // 旅行予定日
  travelDate: string;
  // プラン名
  planName: string;
  // お気に入り数
  favoriteQty: number;
  // 公開/非公開
  isRelease: boolean;
  // 周遊時間
  timeRequired: string;
  // 周遊時間(時間)
  timeRequiredHour: string;
  // 周遊時間(分)
  timeRequiredMin: string;
  // Thanks数
  thanksQty: number;
  // オブジェクトID
  objectId: string;
  // true:プラン作成 false:プラン投稿
  isCreation: boolean;
  // true:URL共有済 false:URL共有していない
  isShare: boolean;
  // URL
  shareUrl: string;
  // メモ
  memo: string;
  // プランユーザスポットリスト
  spots: PlanSpotCommon[];
}

export class MyPlanAppListSelected{
  stayTime: DataSelected[];
  businessDay: DataSelected[];
  listSelectedPlan: ListSelectedPlan;
  myPlan: MyPlanApp;
}
