import { DataSelected, MyPlanApp, PlanSpotCommon, ListSelectedPlan } from "./common.class";

export class MypagePlanAppListSearchResult {
  // 1ページあたりの表示件数
  pageViewQty: number;
  // 検索結果
  mypagePlanAppList: MypagePlanAppList[];
}

export class MypagePlanAppList {
  // プランユーザID
  // プランユーザID
  planUserId: number;
  // エリアID
  // エリアID
  areaId: number;
  // エリアID2
  // エリアID2
  areaId2: number;
  // 都道府県名
  // 都道府県名
  areaName: string;
  // 最終更新日
  // 最終更新日
  updateDatetime: string;
  // 作成日
  // 作成日
  createDatetime: string;
  // 旅行予定日
  // 旅行予定日
  travelDate: string;
  // プラン名
  // プラン名
  planName: string;
  // お気に入り数
  // お気に入り数
  favoriteQty: number;
  // 公開/非公開
  // 公開/非公開
  isRelease: boolean;
  // 周遊時間
  // 周遊時間
  timeRequired: string;
  // 周遊時間(時間)
  // 周遊時間(時間)
  timeRequiredHour: string;
  // 周遊時間(分)
  // 周遊時間(分)
  timeRequiredMin: string;
  // Thanks数
  // Thanks数
  thanksQty: number;
  // オブジェクトID
  // オブジェクトID
  objectId: string;
  // true:プラン作成 false:プラン投稿
  // true:プラン作成 false:プラン投稿
  isCreation: boolean;
  // プランユーザスポットリスト
  // プランユーザスポットリスト
  spots: PlanSpotCommon[];
}

export class MyPlanAppListSelected{
  stayTime: DataSelected[];
  businessDay: DataSelected[];
  listSelectedPlan: ListSelectedPlan;
  planSpots: PlanSpotCommon[];
}