import { Line } from "./plan.class";
import { PlanUserPicture } from "./common.class"

// 検索条件
export class ListSearchCondition {
  constructor() {
    this.areaId = [];
    this.areaId2 = [];
    this.searchCategories = [];
    this.searchOptions = [];
    this.select = 'all';
    this.sortval = '11';
    this.keyword = '';
    // this.isOpens = [];
    this.isRemojuRecommended = true;
    this.isUserPost = true;
  }
  // エリアID
  areaId: number[];
  areaId2: number[];
  // 検索カテゴリ
  searchCategories: any[];
  // さらに条件追加
  searchOptions: any[];
  // プランスポット選択
  select:string;
  // ソート順
  sortval:string;
  // キーワード
  keyword:string;
  // エリアEXPオープン
  // isOpens: number[];
  // プラン一覧用 Remojuおすすめ
  isRemojuRecommended: boolean;
  // プラン一覧用 ユーザー投稿
  isUserPost: boolean;
}

// 作成・編集中のプラン
export class MyPlan {
  // 保存ステータス
  isSaved: boolean;
  // 駅探検索フラグ
  isTransferSearch: boolean;
  // プランユーザID
  planUserId: number;
  // バス検索フラグ
  isBus: boolean;
  // 旅行予定日
  travelDate: string;
  // プラン名
  planName: string;
  // プレビュー画像URL
  picturePreviewUrl: string;
  // 写真
  pictureFile: File;
  // トリミング画像
  imageCropped: any;
  cropperPosition: any;
  // 画角
  aspectRatio: string;
  // 写真URL
  pictureUrl: string;
  // プラン概要
  planExplanation: string;
  // フリー文章
  memo: string;
  // エリアID
  areaId: number;
  areaId2: number;
  // カテゴリ
  categories: number[];
  // 所要時間
  timeRequired: string;
  // 共有フラグ
  isShare: boolean;
  // ベースになったプランID
  basePlanId: number;
  // 所要時間(表示用)
  timeRequiredDisp: string;
  // 出発時間
  startTime: string;
  // 最終更新日時
  lastUpdatetime: string;
  // スポットリスト
  planSpots: PlanUserSpot[];
  // 出発地
  startPlanSpot: PlanUserSpot;
  // 到着地
  endPlanSpot: PlanUserSpot;
}

export class PlanUserSpot{
  // タイプ 1:Remoju 2:Google 3:手入力
  type: number;
  // 表示順
  displayOrder: number;
  // スポットID
  spotId: number;
  // 緯度
  latitude: string;
  // 経度
  longitude: string;
  // スポット名
  spotName: string;
  // スポット概要
  memo: string;
  // 開始時間(到着時間)
  startTime: string;
  // 滞在時間
  stayTime: number;
  // 画角
  aspectRatio: string;
  // 移動経路(駅探)
  transfer: string;
  // ベースになったプランID
  basePlanId: number;
  // 移動経路
  line: Line[];
  // 移動時間
  transtime: string;
  // 移動手段
  transflow: string[];
  // 画像
  planUserpictures: PlanUserPicture[];
}
