import { DataSelected, ListSelectMaster } from "./common.class";
import { Businesshours, Accesses, Seo } from "./spot.class";

export class PlanSpotList {
  address: string;
  areaId: number;
  areaId2: number;
  areaName: string;
  areaName2: string;
  averageStayTime: number;
  //budgets: Budgets[];//
  businessHours: Businesshours[];//
  createDate: string;
  favoriteQty: number;
  googleSpot: GoogleSpot;
  guid: string;
  id: number;
  isDetail: boolean;
  isCreation: boolean;
  isEndOfPublication: boolean;
  isFavorite: boolean;
  isPlan: boolean;
  isRegularHoliday: boolean;
  isRemojuPlan: boolean
  keyword: string;
  objectId: string;
  overview: null;//
  pictures: string[];
  planName: string;
  planSpotNames: PlanSpotName[];
  planSpotQty: number;
  postObjectId:string;
  pvQtyAll: number;
  regularHoliday: string;
  releaseCreateDatetime: string;
  reviewAvg: number;
  searchCategories: DataSelected[];
  searchCategoryIds: number[];
  seo: Seo[];
  spotAccess: Accesses;
  spotName: string;
  spotQty: number;
  subheading: string;
  timeRequiredHour: number;
  timeRequiredMin: number;
  travelDate: string;
  userName: string;
  userPictureUrl: string;
  versionNo: number;
}
export class UserPlanList {
  userPlans:PlanSpotList[];
  searchCategories:string[];

  constructor(){
    this.userPlans = [];
    this.searchCategories = [];
  }

  reset():void{
    this.userPlans = [];
    this.searchCategories = [];
  }
}

export class searchResult{
  constructor(){
    this.searchParamsObj = new SearchParamsObj;
  }
  list: PlanSpotList[];
  searchTarm: tarms;
  searchParams: string;
  searchParamsObj: SearchParamsObj;
  googleSearchArea: string;
}

export class tarms{
  area:string;
  cate:string;
}

export class SearchParamsObj{
  aid: string;
  era: string;
  cat: string;
  lst: string;
  srt: string;
  rep: boolean;
  usp:boolean;
  kwd: string;
}

export class CacheStore {
  data: PlanSpotList[];
  p:number;
  end:number;
  offset:number;
  select:string;
  sortval:string;
  keyword:string;
  mSort:DataSelected[];
  isList:boolean;
  tabIndex:number;
  ListSelectMaster:ListSelectMaster;
  optionKeywords: tarms;
  googleSearchArea: string;
}

export class GoogleSpot {
  google_spot_id: number;
  areaId: number;
  spot_name: string;
  address: string;
  picture_url: string;
  latitude: string;
  longitude: string;
  place_id: string;
  create_user_id: string;
  create_datetime: string;
  mArea: MArea;
  formatAddress: string;
  isFavorite: boolean;
  compoundCode: string;
}

export class MArea {
  area_id: number;
  display_order: number;
  parent_area_id: number;
  is_display_search: boolean;
  is_active: boolean;
  level: number;
  map_url: string;
  area_name_1: string;
  area_name_2: string;
}

export class GoogleSearchResult {
  // 次ページ検索token
  tokenGoogle: string;
  // 検索結果
  planSpotList: PlanSpotList[];
}

export class PlanSearchCategory {
  version_no: number;
  plan_id: number;
  search_category_id: number;
  name: string;
  icon: string;
}

export class PlanSpotName{
  isRemojuSpot: boolean;
  spotName: string;
  spotId:number;
}
