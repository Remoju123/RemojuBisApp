import { DataSelected, Recommended, PlanSpotCommon } from "./common.class";
import { ReviewResult } from "../class/review.class";

export class PlanApp {
  // バージョンNo
  // バージョンNo
  versionNo!: number;
  // プランID
  // プランID
  planId!: number;
  // プラン名
  // プラン名
  planName!: string;
  // プラン説明
  // プラン説明
  planExplanation!: string;
  // エリアID
  // エリアID
  areaId!: number;
  // お気に入り
  // お気に入り
  isFavorite!: boolean;
  // プラン写真リスト
  // プラン写真リスト
  pictures!: string[];
  // sigle or multi pic
  // sigle or multi pic
  picCnt!: number;
  // true:CT作成プラン false:ユーザ作成プラン
  // true:CT作成プラン false:ユーザ作成プラン
  isRemojuPlan!: boolean;
  // true:プラン作成 false:プラン投稿
  // true:プラン作成 false:プラン投稿
  isCreation!: boolean;
  // エリア名
  // エリア名
  areaName!: string;
  // 所用時間(時)
  // 所用時間(時)
  timeRequiredHour!: number;
  // 所用時間(分)
  // 所用時間(分)
  timeRequiredMin!: number;
  // 開始時間
  // 開始時間
  startTime!: string;
  // 終了時間
  // 終了時間
  endTime!: string;
  // カテゴリ
  // カテゴリ
  searchCategories!: DataSelected[];
  // プランスポット
  // プランスポット
  spots!: PlanSpotCommon[];
  // レビュー
  // レビュー
  reviewResult!: ReviewResult;
  // プラン作成者
  // プラン作成者
  userStaff!: UserStaff;
  // ユーザ
  // ユーザ
  user!: OtherUser;
  // 国リスト
  // 国リスト
  country!: DataSelected[];
  // メモ
  // メモ
  memo!: string;
  // 近くのおすすめスポット(同一小エリア・PVAll降順)
  // 近くのおすすめスポット(同一小エリア・PVAll降順)
  spotToGoList!: Recommended[];
  // 
  // 
  spotToGoCnt!: number;
  // 特集
  // 特集
  featureList!: mFeature[];
  // SEO
  // SEO
  seo!: Seo;

  // おすすめプラン
  // recommendedPlanList: Recommended[];
  // 穴場スポット
  // hiddenSpotList: Recommended[];
}

export class Langary {
  lang!: string;
  text!: string;
}

export class Trans {
  line!: Line;
  transtime!: Number;
  transflow!: string[];
}

export class Line {
  LineName!: string;
  Minute!: number;
  StationNameFrom!: string;
  StationNameTo!: string;
  LatitudeFrom!: number;
  LongitudeFrom!: number;
  TimeFrom!: string;
  LatitudeTo!: number;
  LongitudeTo!: number;
  TimeTo!: string;
  Type!: string;
  Init!: string;
  Pos!: string;
}

export class Seo {
  version_no!: number;
  plan_id!: number;
  subtitle!: string;
  keyword!: string;
  description!: string;
}

export class mFeature {
  feature_id!: number;
  title!: string;
  picture_url!: string;
  url!: string;
  langulage_cd!: string;
}

export class UserStaff {
  pictureUrl!: string;
  romanLetterName!: string;
  departmentName!: string;
  introduction!: string;
}

export class OtherUser {
  user_id!: number;
  login_id!: string;
  object_id!: string;
  gender!: string;
  user_staff_id!: boolean;
  last_login_datetime!: string;

  // 以下、ADの項目
  // 自己紹介
  // 以下、ADの項目
  // 自己紹介
  aboutMe!: string;
  // 年代
  // 年代
  age!: number;
  // 誕生日
  // 誕生日
  birthday!: string;
  // 国名
  // 国名
  countryName!: string;
  // 国コード
  // 国コード
  country!: number;
  // ユーザ名
  // ユーザ名
  displayName!: string;
  // ユーザの名
  // ユーザの名
  givenName!: string;
  // ユーザの姓
  // ユーザの姓
  surname!: string;
  // プロフィール画像プレビューURL
  picturePreviewUrl: any;
  // プロフィール写真URL
  pictureUrl: any;
  // プロフィール写真ファイル
  pictureFile: any;
  // カバー画像プレビューURL
  coverPreviewUrl: any;
  // カバー写真URL
  coverUrl: any;
  // カバー写真ファイル
  coverFile: any;
}