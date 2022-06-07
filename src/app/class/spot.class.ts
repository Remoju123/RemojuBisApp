import { UserStaff } from "./plan.class";
import { DataSelected, Recommended } from "./common.class"
import { ReviewResult } from "./review.class";

export class Spot {
  version_no: number;
  spot_id: number;
  latitude: number;
  longitude: number;
  spot_name: string;
  subheading: string;
  isFavorite: boolean;
  pictureUrl: string;
  categoryIcon: string;
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
  business_hours: BusinessHour[];
}

export class BusinessHour {
  business_days: string;
  business_hours_from: string;
  business_hours_to: string;
  comment: Langary[];
}

export class Pictures {
  version_no: number;
  spot_id: number;
  display_order: number;
  picture_url: string;
  is_main: boolean;
  subheading: Langary[];
  comment: Langary[];
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
  is_active: boolean;
  create_datetime: string;
  create_user_id: number;
  update_datetime: string;
  update_user_id: number;
}


export interface Langary {
  lang: string;
  text: string;
}

export class SpotApp {
  versionNo: number;
  spotId: number;
  area1: string;
  areaName1: string;
  area2: string;
  areaName2: string;
  subheading: string;
  spotName: string;
  isRegularHoliday: boolean;
  regularHoliday: string;
  pvQty: number;
  isThanks: boolean;
  thanksQty: number;
  isFavorite: boolean;
  spotOverview: string;
  address: string;
  tel: string;
  hp: string;
  latitude: string;
  longitude: string;
  budgetRemarks: string;
  averageStayTime: number;
  businessHoursRemarks: string;
  seo: Seo;
  userStaff: UserStaff;
  accesses: Accesses[];
  businessHours: SpotBusinessHours[];
  searchCategories: SpotSearchCategory[];
  pictures: Pictures[];
  budgetFrame: DataSelected[];
  budgets: SpotBudget[];
  businessDay: DataSelected[];
  reviewResult: ReviewResult;
  nearbySpotList: Recommended[];
  popularSpotList: Recommended[];
  modelPlanList: Recommended[];
}

export class SpotThanks {
  spot_id: number;
  guid: string;
  is_delete: boolean;

  objectId: string;
}

export class SpotReviewThanks {
  spot_id: number;
  display_order: number;
  guid: string;
  is_delete: boolean;

  objectId: string;
}

export class SpotThumb{
  spot_name:string;
  picture_url:string;
  latitude:number;
  longitude:number;
  start_time:string;
}

export class SpotFavorite {
  spot_id: number;
  google_spot_id: number;
  guid: string;
  is_delete: boolean;

  objectId: string;
}

export class SpotBudget {
  version_no: number;
  spot_id: number;
  budget_frame_id: number;
  budget_lower_limit: number;
  budget_cap: number;
}

export class SpotBusinessHours {
  version_no: number;
  spot_id: number;
  display_order: number;
  business_day: string;
  business_hours: string;
  is_main: boolean;
}

export class SpotSearchCategory {
  version_no: number;
  spot_id: number;
  search_category_id: number;
  name: string;
  parentId: number;
  parentName: string;
}
