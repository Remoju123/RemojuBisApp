import { DataSelected, Recommended, PlanSpotCommon } from "./common.class";
import { ReviewResult } from "../class/review.class";

export class PlanApp {
  // バージョンNo
  versionNo: number;
  // プランID
  planId: number;
  // プラン名
  planName: string;
  // プラン説明
  planExplanation: string;
  // エリアID
  areaId: number;
  // お気に入り
  isFavorite: boolean;
  // プラン写真リスト
  pictures: string[];
  // sigle or multi pic
  picCnt: number;
  // true:CT作成プラン false:ユーザ作成プラン
  isRemojuPlan: boolean;
  // true:プラン作成 false:プラン投稿
  isCreation: boolean;
  // エリア名
  areaName:string;
  // 所用時間(時)
  timeRequiredHour: number;
  // 所用時間(分)
  timeRequiredMin:number
  // 開始時間
  startTime: string;
  // 終了時間
  endTime: string;
  // カテゴリ
  searchCategories: DataSelected[];
  // プランスポット
  spots: PlanSpotCommon[];
  // レビュー
  reviewResult: ReviewResult;
  // プラン作成者
  userStaff: UserStaff;
  // ユーザ
  user: OtherUser;
  // 国リスト
  country: DataSelected[];
  // メモ
  memo: string;
  // 近くのおすすめスポット(同一小エリア・PVAll降順)
  spotToGoList: Recommended[];
  // 特集
  featureList: mFeature[];
  // SEO
  seo: Seo;

  // おすすめプラン
  // recommendedPlanList: Recommended[];
  // 穴場スポット
  // hiddenSpotList: Recommended[];
}

export class Langary {
  lang: string;
  text: string;
}

export class Trans {
  line: Line;
  transtime: Number;
  transflow: string[];
}

export class Line {
  LineName: string;
  Minute: number;
  StationNameFrom: string;
  StationNameTo: string;
  LatitudeFrom: number;
  LongitudeFrom: number;
  TimeFrom: string;
  LatitudeTo: number;
  LongitudeTo: number;
  TimeTo: string;
  Type: string;
  Init: string;
  Pos: string;
}

export class Seo {
  version_no: number;
  plan_id: number;
  subtitle: string;
  keyword: string;
  description: string;
}

export class mFeature {
  feature_id: number;
  title: string;
  picture_url: string;
  url: string;
  langulage_cd: string;
}

export class UserStaff {
  pictureUrl: string;
  romanLetterName: string;
  departmentName: string;
  introduction: string;
}

export class OtherUser {
  // 自己紹介
  aboutMe: string;
  // 国コード
  country: number;
  // ユーザ名
  displayName: string;
  // 年代
  age: string;
  // プロフィール写真URL
  pictureUrl: string;
  // カバー写真URL
  coverUrl: string;
  // 性別
  gender: string;
}
