import { NestDataSelected } from "./common.class";
import { OtherUser } from "./plan.class";
import { PlanSpotList } from "./planspotlist.class";

export class LoginParam {
  rjGuid: any;
  email: string;
  name: string;
  objectId: string;
  idp: string;
  picture: string;
}

export class User {
  user_id: number;
  login_id: string;
  object_id: string;
  gender: string;
  user_staff_id: number;
  user_name: string;
  last_login_datetime: string;
  aboutMe: string;
  age: number;
  birthday: string;
  countryName: string;
  country: number;
  displayName: string;
  givenName: string;
  surname: string;
  picturePreviewUrl: any;
  pictureUrl: any;
  pictureFile: File;
  imageCropped: any;
  cropperPosition: any;
  coverPreviewUrl: any;
  coverUrl: any;
  coverFile: File;
  coverImageCropped: any;
  coverCropperPosition: any;
  guid: any;
}

export class UserPlanList {
  mSearchCategoryPlan: NestDataSelected[];
  userPlanSpotList: PlanSpotList[];
}

export class UserPlanData {
  user: OtherUser;
  userPlanSpotList: PlanSpotList[]
}
