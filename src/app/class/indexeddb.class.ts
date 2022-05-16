import { Line } from "./plan.class";
import { PlanUserPicture } from "./common.class"

export class ListSearchCondition {
  constructor() {
    this.areaId = [];
    this.areaId2 = [];
    this.googleAreaId = [];
    this.searchCategories = [];
    this.searchOptions = [];
    this.select = 'all';
    this.sortval = '11';
    this.keyword = '';
    this.isRemojuRecommended = true;
    this.isUserPost = true;
  }
  areaId: number[];
  areaId2: number[];
  googleAreaId: number[];
  searchCategories: any[];
  searchOptions: any[];
  select:string;
  sortval:string;
  keyword:string;
  isRemojuRecommended: boolean;
  isUserPost: boolean;
}

export class MyPlan {
  isSaved: boolean;
  isTransferSearch: boolean;
  planUserId: number;
  isBus: boolean;
  isCar: boolean;
  overviewPolyline: string;
  optimized: boolean;
  travelDate: string;
  planName: string;
  picturePreviewUrl: string;
  pictureFile: File;
  imageCropped: any;
  cropperPosition: any;
  aspectRatio: string;
  pictureUrl: string;
  planExplanation: string;
  memo: string;
  areaId: number;
  areaId2: number;
  categories: number[];
  timeRequired: string;
  isShare: boolean;
  isRelease: boolean;
  basePlanId: number;
  timeRequiredDisp: string;
  startTime: string;
  lastUpdatetime: string;
  planSpots: PlanUserSpot[];
  startPlanSpot: PlanUserSpot;
  endPlanSpot: PlanUserSpot;
}

export class PlanUserSpot{
  type: number;
  displayOrder: number;
  spotId: number;
  latitude: string;
  longitude: string;
  spotName: string;
  memo: string;
  startTime: string;
  stayTime: number;
  aspectRatio: string;
  transfer: string;
  basePlanId: number;
  line: Line[];
  transtime: string;
  transflow: string[];
  planUserpictures: PlanUserPicture[];
}
