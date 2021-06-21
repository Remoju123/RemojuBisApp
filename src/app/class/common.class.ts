import { Accesses, Businesshours }  from "./spot.class";
import {
  GoogleSpot,
  SpotFavorite,
  SpotAppList,
  SpotAccesses
} from "./spotlist.class";
import { Line } from "./plan.class";
import { PlanAppList } from "./planlist.class";
import { ListSearchCondition } from "./indexeddb.class";
import { PlanSpotList } from "./planspotlist.class";

// 選択
export interface DataSelected {
  id: number;
  name: string;
  qty: number;
  selected: boolean;
}

// 選択(エリア・カテゴリ用)
export interface NestDataSelected {
  parentId: number;
  parentName: string;
  isHighlight: boolean;
  qty: number;
  dataSelecteds: DataSelected[];
  selected: boolean;
}

// おすすめスポット/プラン
export interface Recommended {
  // true:スポット false:プラン
  isSpot: boolean;
  // 名称
  name: string;
  // バージョン番号
  versionNo: number;
  // スポットIDまたはプランID
  spotPlanID: number;
  // 写真
  pictureUrl: string;
}

// 一覧　選択値(共通)
export class ListSelected {
  // エリア
  // エリア
  mArea: NestDataSelected[] = [];
  // 検索カテゴリ(スポット)
  // 検索カテゴリ(スポット)
  mSearchCategory: NestDataSelected[] = [];
  // 検索カテゴリ(プラン)
  // 検索カテゴリ(プラン)
  mSearchCategoryPlan: NestDataSelected[] = [];
  // ソート順
  // ソート順
  mSort: DataSelected[] = [];
  // tabIndex
  // tabIndex
  tabIndex!: number;
  // source(list) 削除予定★★★
  // source(list) 削除予定★★★
  spotList: SpotAppList[] = [];
  // プランスポット一覧
  // プランスポット一覧
  planSpotList: PlanSpotList[] = [];
}

export class ListSelectedPlan {
  constructor() {
    this.isList = true;
  }
  // エリア
  // エリア
  mArea: NestDataSelected[] = [];
  // 検索カテゴリ
  // 検索カテゴリ
  mSearchCategory: NestDataSelected[] = [];
  // ソート順
  // ソート順
  mSort: DataSelected[] = [];
  // tabIndex
  // tabIndex
  tabIndex!: number;
  // source(list)
  // source(list)
  planList: PlanAppList[] = [];
  // 一覧の場合true(検索条件を保持する)　プラン投稿の場合false(検索条件を保持しない)
  isList: boolean;
  // プラン投稿の場合、選択値を保持する(indexeddbを使用しない)
  // プラン投稿の場合、選択値を保持する(indexeddbを使用しない)
  condition: ListSearchCondition = new ListSearchCondition;
}

// お気に入り登録
export class RegistFavorite {
  constructor() {
    this.spotFavorite = new SpotFavorite();
    this.googleSpot = new GoogleSpot();
  }
  // お気に入りスポット
  spotFavorite: SpotFavorite;
  // Googleスポット
  googleSpot: GoogleSpot;
}

// プランに追加する(スポット)
export class AddSpot {
  constructor() {
    this.googleSpot = new GoogleSpot();
  }
  // 作成中のプラン
  // 作成中のプラン
  MyPlan: MyPlanApp = new MyPlanApp;
  // 追加するスポットID
  // 追加するスポットID
  spotId!: number;
  // 1:Remojuスポット 2:Googleスポット 3:手入力スポット(指定しない場合のデフォルト：1)
  // 1:Remojuスポット 2:Googleスポット 3:手入力スポット(指定しない場合のデフォルト：1)
  type!: number;
  // Googleスポット(登録時のみ指定)
  googleSpot: GoogleSpot;
}

// 現在地
export class Location {
  // 緯度
  // 緯度
  latitude!: number;
  // 経度
  // 経度
  longitude!: number;
  // エラーコード
  // エラーコード
  errorCd!: number;
}

// プランに追加する(プラン)
export class AddPlan {
  // 作成中のプラン
  // 作成中のプラン
  MyPlan: MyPlanApp = new MyPlanApp;
  // true: Remojuプラン、プラン作成 false: プラン投稿
  // true: Remojuプラン、プラン作成 false: プラン投稿
  isRemojuPlan: boolean = false;
  // 追加するプランID
  // 追加するプランID
  planId!: number;
}

export class MyPlanApp {
  isSaved: boolean = false;
  isTransferSearch: boolean = false;
  planUserId!: number;
  isBus: boolean = false;
  isAuto: boolean = false;
  travelDate: any;
  planName!: string;
  planExplanation!: string;
  memo!: string;
  timeRequired!: string;
  isRelease: boolean = false;
//  isAnonymous: boolean;
  //  isAnonymous: boolean;
  isShare: boolean = false;
  shareUrl!: string;
  isCreation: boolean = false;
  basePlanId!: number;
  // 所要時間(表示用)
  // 所要時間(表示用)
  timeRequiredDisp!: string;
  // 出発時間
  // 出発時間
  startTime!: string;
  // オブジェクトID
  // オブジェクトID
  objectId!: string;
  // プランユーザスポットリスト
  // プランユーザスポットリスト
  planSpots: PlanSpotCommon[] = [];
  // 出発地
  // 出発地
  startPlanSpot: PlanSpotCommon = new PlanSpotCommon;
  // 到着地
  // 到着地
  endPlanSpot: PlanSpotCommon = new PlanSpotCommon;
  // 写真(編集用)
  // 写真(編集用)
  refPictureUrl!: string;
  // 写真(登録用)
  // 写真(登録用)
  pictureUrl!: string;
  // プレビュー画像URL
  // プレビュー画像URL
  picturePreviewUrl!: string;
  // 写真
  // 写真
  pictureFile!: File;
  // 写真拡張子
  // 写真拡張子
  pictureFileExt!: string;
  // エリアID(登録用)
  // エリアID(登録用)
  areaId!: number;
  areaId2!: number;
  // カテゴリ(登録用)
  // カテゴリ(登録用)
  categories: number[] = [];
  // url言語コード(m_language.language_cd_1と同様)
  // url言語コード(m_language.language_cd_1と同様)
  languageCd1: string[] = [];
  // 駅探検索結果ステータス
  // 駅探検索結果ステータス
  ekitanStatus!: string;
}

// プランスポット
export class PlanSpotCommon {
  // タイプ 1:Remojuスポット 2:Googleスポット 3:手入力スポット
  // タイプ 1:Remojuスポット 2:Googleスポット 3:手入力スポット
  type!: number;
  displayOrder!: number;
  spotId!: number;
  spotName!: string;
  subheading!: string;
  overview!: string;
  latitude!: string;
  longitude!: string;
  pictureUrl!: string;
  // プラン投稿用動画
  // プラン投稿用動画
  videos: string[] = [];
  startTime!: string;
  stayTime!: number;
  isFavorite: boolean = false;
  // スポット写真またはプラン投稿写真
  // スポット写真またはプラン投稿写真
  pictures: string[] = [];
  // PV数
  // PV数
  pvAllQty!: number;
  // true:掲載終了
  // true:掲載終了
  isEndOfPublication: boolean = false;
  memo!: string;
  transfer!: string;
  basePlanId!: number;

  line: Line[] = [];
  transtime: any;
  transflow: any;
  // plan-detail overview expantion flag
  // plan-detail overview expantion flag
  ismore: boolean = false;
  // plan-detail overview expantion button label
  // plan-detail overview expantion button label
  label!: string;
  destination!: string;

  // 以下、プラン作成で使用
  // 以下、プラン作成で使用
  areaName!: string;
  categoryText!: string;
  categoryIcon!: string;
  spotAccess: SpotAccesses = new SpotAccesses;
  businessHours: Businesshours[] = [];
  regularHoliday!: string;
  // 営業時間ヘッダ表示用
  // 営業時間ヘッダ表示用
  businessHourHead!: string;
  // 定休日
  // 定休日
  holiday!: string;
  // 画像
  // 画像
  planUserpictures: PlanUserPicture[] = [];
  // プレビュー画像
  // プレビュー画像
  previewPictures: string[] = [];

  // 以下、プラン投稿で使用
  // 撮影日時
  // 以下、プラン投稿で使用
  // 撮影日時
  dateTimeOriginal!: string;
// Googleスポット候補
  // Googleスポット候補
  googleSpotNearBySerach: GoogleNearBySearch[] = [];

  // Googleスポット
  // Googleスポット
  googleSpot: GoogleSpot = new GoogleSpot;
  // GoogleプレイスID(選択値)
  // GoogleプレイスID(選択値)
  place_id!: string;

  categoryName!: string;
}

export class PlanUserPicture {
  plan_user_id!: number;
  display_order!: number;
  picture_display_order!: number;
  picture_url!: string;
  is_video: boolean = false;
  is_main: boolean = false;
  // プレビュー画像URL
  // プレビュー画像URL
  picturePreviewUrl!: string;
  // 写真
  pictureFile: any;
  // 写真拡張子
  // 写真拡張子
  pictureFileExt!: string;
}

export class GoogleNearBySearch {
  business_status!: string;
  geometry: Geometry = new Geometry;
  icon!: string;
  name!: string;
  photos: Photo[] = [];
  place_id!: string;
  plus_code: PlusCode = new PlusCode;
  rating!: number;
  types: string[] = [];
  user_ratings_total!: number;
  vicinity!: string;
}

export class GoogleTextSearch {
  business_status!: string;
  formatted_address!: string;
  geometry: Geometry = new Geometry;
  icon!: string;
  name!: string;
  photos: Photo[] = [];
  place_id!: string;
  plus_code: PlusCode = new PlusCode;
  rating!: number;
  types: string[] = [];
  user_ratings_total!: number;
}

export class Geometry{
  location: GoogleLocation = new GoogleLocation;
  viewport: Viewport = new Viewport;
}

export class GoogleLocation{
  lat: any;
  lng: any;
}

export class Viewport{
  northeast: GoogleLocation = new GoogleLocation;
  southwest: GoogleLocation = new GoogleLocation;
}

export class Photo{
  height!: number;
  html_attributions: string[] = [];
  photo_reference!: string;
  width!: number;
}

export class PlusCode{
  compound_code!: string;
  global_code!: string;
}

// 全画面Mapパラメータ
export class MapFullScreenParam{
  planId!: number;
  isDetail: boolean = false;
  planSpots: PlanSpotCommon[] = [];
  startPlanSpot: PlanSpotCommon = new PlanSpotCommon;
  endPlanSpot: PlanSpotCommon = new PlanSpotCommon;
}

// Mapスポット
export class MapSpot {
  type!: number;
  spotId!: number;
  spotName!: string;
  spotNameLangDisp: any;
  subheading!: string;
  latitude!: number;
  longitude!: number;
  pictureUrl!: string;
  stayTime!: number;
  memo!: string;
  isFavorite: boolean = false;
  transfer!: string;
  polylineColor!: string;
  iconUrl: any;
  visible: boolean = false;
  zIndex!: number;
  directions!: string;
  displayOrder!: number;
  planId!: number;
  isStart: boolean = false;
  isEnd: boolean = false;
  // true:掲載終了
  // true:掲載終了
  isEndOfPublication: boolean = false;
  // プラン詳細から遷移した場合、true
  // プラン詳細から遷移した場合、true
  isDetail: boolean = false;
  // その他Remojuスポットの場合、true
  // その他Remojuスポットの場合、true
  isOhterSpot: boolean = false;
}

// お気に入り数
export class FavoriteCount{
  SpotCount!: number;
  PlanCount!: number;
}

// 確認ダイアログパラメータ
export class ComfirmDialogParam{
  title!: string;
  text!: string;
  subText!: string;
  leftButton!: string;
  rightButton!: string;
}

export interface OAuthErrorEventParams {
  error: string;
  error_description: string;
  state: string;
}

// 画像サイズ変換戻り値
export class ImageSize {
  file!: File;
  previewUrl!: string;
}

export class CachePlans{
  count!: number;
  offset!: number;
  data: PlanAppList[] = [];
  keyword!: string;
}

export class CacheSpots{
  count!: number;
  offset!: number;
  data: SpotAppList[] = [];
  keyword!: string;
}
