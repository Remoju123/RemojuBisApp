import { DataSelected, MyPlanApp, PlanSpotCommon, ListSelectedPlan } from "./common.class";

export class MypagePlanAppList {
  isDetail: boolean;
  planUserId: number;
  areaId: number;
  areaId2: number;
  areaName: string;
  updateDatetime: string;
  createDatetime: string;
  travelDate: string;
  planName: string;
  favoriteQty: number;
  isRelease: boolean;
  timeRequired: string;
  timeRequiredHour: string;
  timeRequiredMin: string;
  thanksQty: number;
  objectId: string;
  isCreation: boolean;
  isShare: boolean;
  shareUrl: string;
  memo: string;
  spots: PlanSpotCommon[];
}

export class MyPlanAppListSelected{
  stayTime: DataSelected[];
  businessDay: DataSelected[];
  listSelectedPlan: ListSelectedPlan;
  myPlan: MyPlanApp;
}

export class MyplanListCacheStore {
  data: MypagePlanAppList[];
  p:number;
  end:number;
  offset:number;
}

export class UpdFavorite {
  spotId: number;
  type: number;
  isFavorite: boolean;
}
