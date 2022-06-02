export class ReviewResult{
  qty: number;
  reviews: Review[];
  avgEvaluation: number;
}

export class Review {
  id: number;
  userId: number;
  displayOrder: number;
  parentDisplayOrder: number;
  title: string;
  contents: string;
  editContents: string;
  evaluation: number;
  visitDate: string;
  postedDate: string;
  objectId: string;
  userName: string;
  pictureUrl: string;
  pictures: ReviewPicture[];
  childReviews: Review[];
  // 表示時に取得
  age: number;
  gender: string;
  // expantion flag & label
  ismore:boolean;
  label:string;
  isPlan:boolean;
  planSpotName:string;
  type:number;
  isEdit: boolean;
  isReply: boolean;
}

export class ReviewPicture {
  picturedisplayOrder: number;
  pictureUrl: string;
  picturePreviewUrl: string;
  pictureFile: File;
  // トリミング画像
  imageCropped: any;
  cropperPosition: any;
}

export class RegistReviewResult{
  displayOrder: number;
  reviewResult: ReviewResult;
}

// スポット
export class SpotReviews {
  spot_id: number;
  display_order: number;
  parent_display_order: number;
  user_id: number;
  title: string;
  contents: string;
  evaluation: number;
  visit_datetime: string;
  pictures: SpotReviewsPicture[];
  objectId: string;
}

export class SpotReviewsPicture {
  spot_id: number;
  display_order: number;
  picture_display_order: number;
  picture_url: string;
}

// プラン
export class PlanReviews {
  plan_id: number;
  display_order: number;
  parent_display_order: number;
  user_id: number;
  title: string;
  contents: string;
  evaluation: number;
  visit_datetime: string;
  pictures: PlanReviewsPicture[];
  objectId: string;
}

export class PlanReviewsPicture {
  plan_id: number;
  display_order: number;
  picture_display_order: number;
  picture_url: string;
}

// プランユーザ
export class PlanUserReviews {
  plan_user_id: number;
  display_order: number;
  parent_display_order: number;
  user_id: number;
  title: string;
  contents: string;
  evaluation: number;
  visit_datetime: string;
  pictures: PlanUserReviewsPicture[];
  objectId: string;
}

export class PlanUserReviewsPicture {
  plan_user_id: number;
  display_order: number;
  picture_display_order: number;
  picture_url: string;
}
