import { Line } from "./plan.class";
import { PlanUserPicture } from "./common.class"

// 検索条件
export class ListSearchCondition {
  constructor() {
    this.areaId = [];
    this.areaId2 = [];
    this.searchCategories = [];
    this.searchOptions = [];
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
  // 保存ステータス
  isSaved: boolean = false;
  // 駅探検索フラグ
  // 駅探検索フラグ
  isTransferSearch: boolean = false;
  // プランユーザID
  // プランユーザID
  planUserId!: number;
  // バス検索フラグ
  // バス検索フラグ
  isBus: boolean = false;
  // 旅行予定日
  // 旅行予定日
  travelDate!: string;
  // プラン名
  // プラン名
  planName!: string;
  // プレビュー画像URL
  // プレビュー画像URL
  picturePreviewUrl!: string;
  // 写真
  pictureFile: any;
  // 写真拡張子
  // 写真拡張子
  pictureFileExt!: string;
  // 写真URL
  // 写真URL
  pictureUrl!: string;
  // プラン概要
  // プラン概要
  planExplanation!: string;
  // フリー文章
  // フリー文章
  memo!: string;
  // エリアID
  // エリアID
  areaId!: number;
  areaId2!: number;
  // カテゴリ
  // カテゴリ
  categories: number[] = [];  
  // 所要時間
  // 所要時間
  timeRequired!: string;
  // 共有フラグ
  // 共有フラグ
  isShare: boolean = false;
  // ベースになったプランID
  // ベースになったプランID
  basePlanId!: number;
  // 所要時間(表示用)
  // 所要時間(表示用)
  timeRequiredDisp!: string;
  // 出発時間
  // 出発時間
  startTime!: string;
  // 最終更新日時
  // 最終更新日時
  lastUpdatetime!: string;
  // スポットリスト
  // スポットリスト
  planSpots: PlanUserSpot[] = [];
  // 出発地
  // 出発地
  startPlanSpot: PlanUserSpot = new PlanUserSpot;
  // 到着地
  // 到着地
  endPlanSpot: PlanUserSpot = new PlanUserSpot;
}
  
export class PlanUserSpot{
  // タイプ 1:Remoju 2:Google 3:手入力
  // タイプ 1:Remoju 2:Google 3:手入力
  type: number | undefined;
  // 表示順
  // 表示順
  displayOrder: number | undefined;
  // スポットID
  // スポットID
  spotId: number | undefined;
  // 緯度
  // 緯度
  latitude: string | undefined;
  // 経度
  // 経度
  longitude: string | undefined;
  // スポット名
  // スポット名
  spotName: string | undefined;
  // スポット概要
  // スポット概要
  memo: string | undefined;
  // 開始時間(到着時間)
  // 開始時間(到着時間)
  startTime: string | undefined;
  // 滞在時間
  // 滞在時間
  stayTime: number | undefined;
  // 移動経路(駅探)
  // 移動経路(駅探)
  transfer: string | undefined;
  // ベースになったプランID
  // ベースになったプランID
  basePlanId: number | undefined;
  // 移動経路
  // 移動経路
  line: Line[] = [];
  // 移動時間
  // 移動時間
  transtime: string | undefined;
  // 移動手段
  // 移動手段
  transflow: string[] = [];
  // 画像
  // 画像
  planUserpictures: PlanUserPicture[] = [];
}
