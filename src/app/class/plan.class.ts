import { DataSelected, NestDataSelected, Recommended, PlanSpotCommon } from "./common.class";
import { ReviewResult } from "./review.class";
import { PlanSpotList } from "./planspotlist.class";

export class PlanApp {
  versionNo: number;
  planId: number;
  planName: string;
  planExplanation: string;
  areaId: number;
  isFavorite: boolean;
  pictures: string[];
  picCnt: number;
  isRemojuPlan: boolean;
  isCreation: boolean;
  areaName:string;
  timeRequiredHour: number;
  timeRequiredMin:number
  startTime: string;
  endTime: string;
  searchCategories: DataSelected[];
  mSearchCategory: NestDataSelected[];
  spots: PlanSpotCommon[];
  reviewResult: ReviewResult;
  userStaff: UserStaff;
  user: OtherUser;
  userPlanQty: number;
  memo: string;
  spotToGoList: Recommended[];
  featureList: mFeature[];
  seo: Seo;
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
  aboutMe: string;
  countryName: string;
  displayName: string;
  age: number;
  pictureUrl: string;
  coverUrl: string;
  gender: string;
  objectId: string;
}

export class UserPlanData{
  user: OtherUser;
  userPlanList: PlanSpotList[];
  mSearchCategory: NestDataSelected[];

  myplanspot: any;
}

export class PlanFavorite {
  plan_id: number;
  guid: string;
  is_delete: boolean;

  objectId: string;
}

export class PlanUserFavorite {
  plan_user_id: number;
  guid: string;
  is_delete: boolean;

  objectId: string;
}
