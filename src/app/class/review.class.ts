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
    evaluation: number;
    visitDate: string;
    postedDate: string;
    objectId: string;
    userName: string;
    pictures: ReviewPicture[];
    reviews: Review[];
    // 表示時に取得
    // 表示時に取得
    age: number;
    gender: string;
    // expantion flag & label
    // expantion flag & label
    ismore: boolean;
    label: string;
  }
  
  export class ReviewPicture {
    picturedisplayOrder: number;
    pictureUrl: string;
    picturePreviewUrl: string;
    pictureFile: File;
  }
  
  export class RegistReviewResult{
    displayOrder: number;
    reviewResult: ReviewResult;
  }

  // スポット
  export interface SpotReviews {
    spot_id: number;
    display_order: number;
    user_id: number;
    title: string;
    contents: string;
    evaluation: number;
    visit_datetime: string;
    pictures: SpotReviewsPicture[];
    objectId: string;
  }
  
  export interface SpotReviewsPicture {
    spot_id: number;
    display_order: number;
    picture_display_order: number;
    picture_url: string;
  }
  
  // プラン
  export interface PlanReviews {
    plan_id: number;
    display_order: number;
    user_id: number;
    title: string;
    contents: string;
    evaluation: number;
    visit_datetime: string;
    pictures: PlanReviewsPicture[];
    objectId: string;
  }
  
  export interface PlanReviewsPicture {
    plan_id: number;
    display_order: number;
    picture_display_order: number;
    picture_url: string;
  }
  
  // プランユーザ
  export interface PlanUserReviews {
    plan_user_id: number;
    display_order: number;
    user_id: number;
    title: string;
    contents: string;
    evaluation: number;
    visit_datetime: string;
    pictures: PlanUserReviewsPicture[];
    objectId: string;
  }
  
  export interface PlanUserReviewsPicture {
    plan_user_id: number;
    display_order: number;
    picture_display_order: number;
    picture_url: string;
  }