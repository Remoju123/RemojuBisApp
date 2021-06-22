import { FormControl } from "@angular/forms";
import { UserStaff } from "./plan.class";
import { DataSelected, Recommended } from "./common.class"
import { SpotBudget, SpotBusinessHours, SpotSearchCategory } from "./spotlist.class";
import { ReviewResult } from "./review.class";
export class Spot {
  accesses: Accesses[] = [];
  address: string;
  area_id: number;
  area_id_2: number;
  main_search_category_id: number;
  average_stay_time: number;
  budgets: Budgets[] = [];
  businessDay: DataSelected[] = [];
  cleak_comment: string;
  clerk_picture_url: string;
  creation_status: string;
  hp: string;
  isCopy: boolean = false;
  is_required_indication_1: boolean = false;
  is_required_indication_2: boolean = false;
  is_urgent_response: boolean = false;
  language_id: string;
  latitude: number;
  longitude: number;
  memo: string;
  overview: string;
  pictures: Pictures[] = [];
  regular_holiday: string;
  release_create_datetime: string;
  release_datetime: string;
  release_status: number;
  release_update_datetime: string;
  release_update_user_id: number;
  searchCategories: SpotSearchCategory[] = [];
  seo: Seo[] = [];
  spot_id: number;
  spot_memo: string;
  spot_name: string;
  staff: string;
  staff_comment: string;
  staff_picture_url: string;
  subheading: string;
  tel: string;
  toll: Toll[] = [];
  userSpot: UserSpot[] = [];
  verification_status: number;
  verification_update_datetime: string;
  verification_update_user_id: string;
  version_no: number;
  areaName: string;
  pictureUrl: string;
  isFavorite: boolean = false;
  categoryIcon: string;
  pvQty: number;
}

export class Accesses {
  version_no: number;
  spot_id: number;
  display_order: number;
  access: number;
  nearest: string;
}

export class Budgets {
  version_no: number;
  spot_id: number;
  budget_frame_id: number;
  budget_id: number;
}

export class Businesshours {
  version_no: number;
  spot_id: number;
  display_order: number;
  business_hours: BusinessHour[] = [];
}

export class BusinessHour {
  business_days: string;
  business_hours_from: string;
  business_hours_to: string;
  comment: Langary[] = [];
}

export class Pictures {
  version_no: number;
  spot_id: number;
  display_order: number;
  picture_url: string;
  is_main: boolean = false;
  subheading: Langary[] = [];
  comment: Langary[] = [];
}

export class SearchCategories {
  version_no: number;
  spot_id: number;
  search_category_id: number;
}

export class Seo {
  version_no: number;
  spot_id: number;
  subtitle: string;
  keyword: string;
  description: string;
}

export class Toll {
  version_no: number;
  spot_id: number;
  url: string;
}

export class UserSpot {
  spot_id: number;
  login_id: number;
  password: string;
  user_name: string;
  published_id: number;
  visitor: string;
  picture_id: number;
  draft_id: number;
  report_id: number;
  is_active: boolean = false;
  create_datetime: string;
  create_user_id: number;
  update_datetime: string;
  update_user_id: number;
}

export class SpotList {
  release_datetime: string;
  spot_id: number;
  status: number;
  spot_name: string;
  crate_user_name: string;
}

export class SearchCondition {
  releasestatus: string;
  isUrgentResponse: boolean = false;
  isAreaControl1: boolean = false;
  isAreaControl2: boolean = false;
  spotId: number;
  spotName: string;
  areas: FormControl = new FormControl;
  authors: FormControl = new FormControl;
  isStatusSelect1: boolean = false;
  StatusSelect1: string;
  isStatusSelect2: boolean = false;
  StatusSelect2: string;
  isStatusSelect3: boolean = false;
  StatusSelect3: string;
  creationStatus_selected: string[] = [];
}

export interface ChipColor {
  id: number;
  name: string;
  color: string;
  displayProperty: string;
}

export interface Dictionary {
  key: string;
  value: string;
}

export interface Dic {
  id: number;
  name: string;
}

export interface Category {
  parentId: string;
  parentName: string;
  id: string;
  name: string;
  selected: boolean;
}

export interface CreateStatus {
  id: string;
  name: string;
  selected: boolean;
  tip: string;
}

export interface SearchGroup {
  parentId: number;
  parentName: string;
  count: number;
  child: Category[];
}

export interface Langary {
  lang: string;
  text: string;
}

export class SpotApp {
  // バージョンNo
  // バージョンNo
  versionNo: number;
  // スポットID
  // スポットID
  spotId: number;
  // エリアID(都道府県)
  // エリアID(都道府県)
  area1: string;
  // エリア(都道府県)
  // エリア(都道府県)
  areaName1: string;
  // エリアID(地区)
  // エリアID(地区)
  area2: string;
  // エリア(地区)
  // エリア(地区)
  areaName2: string;
  // 小見出し
  // 小見出し
  subheading: string;
  // スポット名
  // スポット名
  spotName: string;
  // 定休日
  // 定休日
  isRegularHoliday: boolean = false;
  // 定休日
  // 定休日
  regularHoliday: string;
  // PV数
  // PV数
  pvQty: number;
  // Thanks数
  // Thanks数
  thanksQty: number;
  // お気に入り true:登録済み false:登録していない
  // お気に入り true:登録済み false:登録していない
  isFavorite: boolean = false;
  // スポット概要
  // スポット概要
  spotOverview: string;
  // 住所
  // 住所
  address: string;
  // TEL
  // TEL
  tel: string;
  // HP
  // HP
  hp: string;
  // 緯度
  // 緯度
  latitude: string;
  // 経度
  // 経度
  longitude: string;
  // 予算備考欄
  // 予算備考欄
  budgetRemarks: string;
  // 平均滞在時間
  // 平均滞在時間
  averageStayTime: number;
  // 営業時間備考
  // 営業時間備考
  businessHoursRemarks: string;
  // SEO
  // SEO
  seo: Seo = new Seo;
  // スタッフ情報
  // スタッフ情報
  userStaff: UserStaff = new UserStaff;
  // 複数取得
  // アクセス
  // 複数取得
  // アクセス
  accesses: Accesses[] = [];
  // 営業時間
  // 営業時間
  businessHours: SpotBusinessHours[] = [];
  // カテゴリ
  // カテゴリ
  searchCategories: SpotSearchCategory[] = [];
  // スポット写真リスト
  // スポット写真リスト
  pictures: SpotPicture[] = [];
  // 予算枠
  // 予算枠
  budgetFrame: DataSelected[] = [];
  // 予算
  // 予算
  budgets: SpotBudget[] = [];
  // 営業曜日
  // 営業曜日
  businessDay: DataSelected[] = [];
  // スポットレビューリスト
  // スポットレビューリスト
  reviewResult: ReviewResult = new ReviewResult;
  // 近くのスポットリスト
  // 近くのスポットリスト
  nearbySpotList: Recommended[] = [];
  // このスポットを見た人はこれも見ています
  // このスポットを見た人はこれも見ています
  popularSpotList: Recommended[] = [];
  // このスポットを含むおすすめのモデルプランリスト
  // このスポットを含むおすすめのモデルプランリスト
  modelPlanList: Recommended[] = [];
}

export interface SpotPicture {
  version_no: number;
  spot_id: number;
  display_order: number;
  picture_url: string;
  is_main: boolean;
  subheading: Langary[];
  comment: Langary[];
}



export interface ReservationDay {
  // 曜日
  day: string;
  // 空き状況
  available: string;
}

export class SpotThanks {
  spot_id: number;
  guid: string;
  is_delete: boolean = false;

  objectId: string;
}

export class SpotThumb{
  spot_name: string;
  picture_url: string;
  latitude: number;
  longitude: number;
  start_time: string;
}