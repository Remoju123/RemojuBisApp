import {
  Accesses,
  Businesshours,
  SpotFavorite
 } from "./spot.class";
import { Line } from "./plan.class";
import { ListSearchCondition } from "./indexeddb.class";
import { GoogleSpot, PlanSpotList } from "./planspotlist.class";

export interface DataSelected {
  id: number;
  name: string;
  qty: number;
  selected: boolean;
}

export interface NestDataSelected {
  parentId: number;
  parentName: string;
  isHighlight: boolean;
  qty: number;
  dataSelecteds: DataSelected[];
  selected: boolean;
}

export interface Recommended {
  isSpot: boolean;
  name: string;
  versionNo: number;
  spotPlanID: number;
  pictureUrl: string;
}

export class ListSelectMaster {
  mArea: NestDataSelected[];
  mSearchCategory: NestDataSelected[];
  mSearchCategoryPlan: NestDataSelected[];
  mSort: DataSelected[];
  businessDay: DataSelected[];
  tabIndex: number;
  isGoogle: boolean;
  planSpotList: PlanSpotList[];
}

export class ListSelectedPlan {
  mArea: NestDataSelected[];
  mSearchCategory: NestDataSelected[];
  mSearchCategoryPlan: NestDataSelected[];
  mSort: DataSelected[];
  tabIndex: number;
  planSpotList: PlanSpotList[];
  condition: ListSearchCondition;
}

export class RegistFavorite {
  constructor() {
    this.spotFavorite = new SpotFavorite();
    this.googleSpot = new GoogleSpot();
  }
  spotFavorite: SpotFavorite;
  googleSpot: GoogleSpot;
}

export class AddSpot {
  constructor() {
    this.googleSpot = new GoogleSpot();
  }
  MyPlan: MyPlanApp;
  spotId: number;
  type: number;
  googleSpot: GoogleSpot;
  basePlanId: number;
  isTransferSearch: boolean;
}

export class Location {
  latitude: number;
  longitude: number;
  errorCd: number;
}

export class AddPlan {
  MyPlan: MyPlanApp;
  isRemojuPlan: boolean;
  planId: number;
  isTransferSearch: boolean;
}

export class MyPlanApp {
  isSaved: boolean;
  isTransferSearch: boolean;
  planUserId: number;
  isBus: boolean;
  isAuto: boolean;
  optimized: boolean;
  travelDate: string;
  planName: string;
  planExplanation: string;
  memo: string;
  timeRequired: string;
  isRelease: boolean;
  isShare: boolean;
  shareUrl: string;
  isCreation: boolean;
  basePlanId: number;
  timeRequiredDisp: string;
  startTime: string;
  objectId: string;
  guid: string;
  planSpots: PlanSpotCommon[];
  startPlanSpot: PlanSpotCommon;
  endPlanSpot: PlanSpotCommon;
  refPictureUrl: string;
  pictureUrl: string;
  picturePreviewUrl: string;
  pictureFile: File;
  imageCropped: any;
  cropperPosition: any;
  aspectRatio: string;
  areaId: number;
  areaId2: number;
  categories: number[];
  languageCd1: string[];
  ekitanStatus: string;
}

export class PlanSpotCommon {
  type: number;
  displayOrder: number;
  spotId: number;
  spotName: string;
  subheading: string;
  overview: string;
  latitude: string;
  longitude: string;
  pictureUrl: string;
  startTime: string;
  stayTime: number;
  isFavorite: boolean;
  pictures: string[];
  PictureMemos: string[];
  pvAllQty: number;
  isEndOfPublication: boolean;
  memo: string;
  transfer: string;
  basePlanId: number;

  line: Line[];
  transtime: string;
  transflow: string[];
  ismore: boolean;
  label: string;
  destination: string;

  areaName: string;
  categoryText: string;
  categoryIcon: string;
  spotAccess: Accesses;
  businessHours: Businesshours[];
  regularHoliday: string;
  businessHourHead: string;
  holiday: string;
  planUserpictures: PlanUserPicture[];
  previewPictures: string[];

  googleSpot: GoogleSpot;
  place_id: string;
  aspectRatio: string;
}

export class PlanUserPicture {
  plan_user_id: number;
  display_order: number;
  picture_display_order: number;
  picture_url: string;
  memo: string;
  is_video: boolean;
  is_main: boolean;
  picturePreviewUrl: string;
  pictureFile: File;
  imageCropped: any;
  cropperPosition: any;
}

export class MapFullScreenParam {
  planId: number;
  isDetail: boolean;
  planSpots: PlanSpotCommon[];
  startPlanSpot: PlanSpotCommon;
  endPlanSpot: PlanSpotCommon;
}

export class MapSpot {
  type: number;
  spotId: number;
  spotName: string;
  spotNameLangDisp: any;
  subheading: string;
  latitude: number;
  longitude: number;
  pictureUrl: string;
  stayTime: number;
  memo: string;
  isFavorite: boolean;
  transfer: string;
  polylineColor: string;
  iconUrl: any;
  visible: boolean;
  zIndex: number;
  directions: string;
  displayOrder: number;
  planId: number;
  isStart: boolean;
  isEnd: boolean;
  isEndOfPublication: boolean;
  isDetail: boolean;
  isOhterSpot: boolean;
}

export class FavoriteCount {
  SpotCount: number;
  PlanCount: number;
}

export class ComfirmDialogParam {
  id: string;
  title: string;
  text: string;
  textRep: string[];
  subText: string;
  subTextRep: string[];
  leftButton: string;
  rightButton: string;
}

export class ImageCropperParam {
  isAspectRatio: boolean;
  aspectRatio: string;
  pictureFile: File;
  cropperPosition: any;
  picturePreviewUrl: string;
  imageCropped: any;
  roundCropper: boolean;
}

export interface OAuthErrorEventParams {
  error: string;
  error_description: string;
  state: string;
}

export class ImageSize {
  file: File;
  previewUrl: string;
}

