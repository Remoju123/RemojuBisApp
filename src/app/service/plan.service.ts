import { Inject, Injectable } from "@angular/core";

import { HttpClient, HttpHeaders } from "@angular/common/http";

import { CommonService } from "./common.service";
import { TranslateService } from "@ngx-translate/core";
import { PlanApp, Line, PlanThanks, PlanReviewThanks, PlanUserThanks, PlanUserReviewThanks } from "../class/plan.class";
import { RegistReviewResult, ReviewResult, PlanReviews, PlanUserReviews, Review } from "../class/review.class";
import { Observable } from "rxjs";

const httpOptions = {
  headers: new HttpHeaders({
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json;charset=utf-8"
  })
};

@Injectable({
  providedIn: "root"
})
export class PlanService {
  constructor(
    private commonService: CommonService,
    private translate: TranslateService,
    private http: HttpClient,
    @Inject("BASE_API_URL") private host: string
  ) { }

  // プラン詳細を取得
  getPlanDetail(id: string, guid: string) {
    const url = this.host + "/api/plan/" + id;
    return this.http.get<PlanApp>(url, {
      params: {
        id: id,
        guid: guid,
        objectId: this.commonService.objectId
      }
    });
  }

  transline(data: any) {
    if (data) {
      const len = data.length - 1;
      const sta = this.translate.instant("station");
      let prevStationNameTo = "";
      return data.reduce((p:any, c:any, i:any) => {
        p.push({
          LineName: c.Type === "徒歩" || c.Type === "Walk" ? c.Type : c.LineName,
          Minute: c.Minute,
          StationNameFrom: c.Type !== "徒歩" && c.Type !== "Walk" ?
            c.StationNameFrom + (c.Type === "私鉄" || c.Type === "PrivateRailway" || c.Type === "JR" ? sta : "") : prevStationNameTo,
          StationNameTo:i === len ? "" : c.StationNameTo,
          Type: c.Type,
          TimeFrom: c.TimeHourFrom + ":" + (c.TimeMinuteFrom.length === 1 ? "0" + c.TimeMinuteFrom : c.TimeMinuteFrom),
          TimeTo: c.TimeHourTo + ":" + (c.TimeMinuteTo.length === 1 ? "0" + c.TimeMinuteTo : c.TimeMinuteTo),
          Init: this.replaceType(c),
          Pos: i === 0 ? "first" : i === len ? "last" : ""
        });
        prevStationNameTo = p[p.length - 1].StationNameTo;
        return p;
      }, []);
    } else {
      return null;
    }
  }

  findSpotNameById(data:any,name:string){
    const num = new Number(name).valueOf();
    if(num!==NaN){
      return data.spots.find((x: { spot_id: number; })=>x.spot_id===num).spot.spot_name;
    }else{
      return name;
    }
  }

  transtimes(data: any) {
    if (data && data.length > 0) {
      // 開始時間
      const timeFrom = new Date("1970/1/1 " + data[0].TimeHourFrom + ":" + data[0].TimeMinuteFrom);
      // 終了時刻
      const timeTo = new Date("1970/1/1 " + data[data.length - 1].TimeHourTo + ":" + data[data.length - 1].TimeMinuteTo);
      // 到着時間－出発時間を「分」にする
      const min = (timeTo.getTime() - timeFrom.getTime()) / 1000 / 60;
      const hour = Math.floor(min / 60);
      const minute = Number(("00" + (min - hour * 60)).slice(-2));
      return (hour > 0 ? hour + " " + this.translate.instant("Hour") + " " : "")
      + minute + " " + this.translate.instant("Minute");
    } else {
      return null;
    }
  }

  transflows(data: any) {
    if (data) {
      const a: string[] = [];
      data.forEach((element: Line) => {
        a.push(this.replaceType(element));
      });
      return a;
    } else {
      return null;
    }
  }

  replaceType(line: Line) {
    switch (line.Type) {
      case "徒歩":
      case "Walk":
        return "walk";
        break;
      case "バス":
      case "Bus":
        return "bus";
        break;
      case "私鉄":
      case "PrivateRailway":
        return "rail";
        break;
      case "JR":
        if (line.LineName.indexOf('新幹線') === -1
        && line.LineName.indexOf('Shinkansen') === -1){
          return "JR";
        } else {
          return "bullettrain";
        }
        break;
      case "飛行機":
      case "Airline":
        return "plane";
        break;
      case "その他":
      case "Other":
        return "ship";
        break;
      default:
        return "";
    }
  }

  // Thanks登録(CTプラン)
  registPlanThanks(
    planId: number,
    isThanks: boolean,
    guid: string
  ) {
    const thanks: PlanThanks = {
      plan_id: planId,
      guid: guid,
      is_delete: !isThanks,
      objectId: this.commonService.objectId
    };

    const url = this.host + "/api/plan/RegistPlanThanks";
    return this.http.post<number>(url, thanks, httpOptions);
  }

  // レビューThanks登録(CTプラン)
  registReviewPlanThanks(
    review: Review,
    guid: string
  ) {
    const thanks: PlanReviewThanks = {
      plan_id: review.id,
      display_order: review.displayOrder,
      guid: guid,
      is_delete: !review.isThanks,
      objectId: this.commonService.objectId
    };

    const url = this.host + "/api/plan/RegistPlanReviewThanks";
    return this.http.post<number>(url, thanks, httpOptions);
  }

  // Thanks登録(ユーザプラン)
  registPlanUserThanks(
    planUserId: number,
    isThanks: boolean,
    guid: string
  ) {
    const thanks: PlanUserThanks = {
      plan_user_id: planUserId,
      guid: guid,
      is_delete: !isThanks,
      objectId: this.commonService.objectId
    };

    const url = this.host + "/api/plan/RegistPlanUserThanks";
    return this.http.post<number>(url, thanks, httpOptions);
  }

  // レビューThanks登録(ユーザプラン)
  registReviewPlanUserThanks(
    review: Review,
    guid: string
  ) {
    const thanks: PlanUserReviewThanks = {
      plan_user_id: review.id,
      display_order: review.displayOrder,
      guid: guid,
      is_delete: !review.isThanks,
      objectId: this.commonService.objectId
    };

    const url = this.host + "/api/plan/RegistPlanUserReviewThanks";
    return this.http.post<number>(url, thanks, httpOptions);
  }

  // ユーザプラン違反報告
  reportPlanUser(planUserId: number){
    const url = this.host + "/api/plan/ReportPlanUser";
    return this.http.get<boolean>(url, {
      params: {
        planUserId: planUserId.toString()
      }
    });
  }

  // レビュー登録(Remojuプラン)
  registPlanReview(review: PlanReviews){
    const url = this.host + "/api/Plan/RegistPlanReview";
    return this.http.post<RegistReviewResult>(url, review, httpOptions);
  }

  // レビュー削除(Remojuプラン)
  deletePlanReview(planId: number, displayOrder: number){
    const url = this.host + "/api/Plan/DeletePlanReview";
    return this.http.get<ReviewResult>(url, {
      params: {
        planId: planId.toString(),
        displayOrder: displayOrder.toString(),
        objectId: this.commonService.objectId
      }
    });
  }

  // レビュー違反報告(Remojuプラン)
  reportPlanReview(planId: number, displayOrder: number){
    const url = this.host + "/api/Plan/ReportPlanReview";
    return this.http.get<boolean>(url, {
      params: {
        planId: planId.toString(),
        displayOrder: displayOrder.toString()
      }
    });
  }

  // レビュー登録(ユーザプラン)
  registPlanUserReview(review: PlanUserReviews){
    const url = this.host + "/api/Plan/RegistPlanUserReview";
    return this.http.post<RegistReviewResult>(url, review, httpOptions);
  }

  // レビュー削除(ユーザプラン)
  deletePlanUserReview(planUserId: number, displayOrder: number){
    const url = this.host + "/api/plan/DeletePlanUserReview";
    return this.http.get<ReviewResult>(url, {
      params: {
        planUserId: planUserId.toString(),
        displayOrder: displayOrder.toString(),
        objectId: this.commonService.objectId
      }
    });
  }

  // レビュー違反報告(ユーザプラン)
  reportPlanUserReview(planUserId: number, displayOrder: number){
    const url = this.host + "/api/plan/ReportPlanUserReview";
    return this.http.get<boolean>(url, {
      params: {
        planUserId: planUserId.toString(),
        displayOrder: displayOrder.toString()
      }
    });
  }

  // ファイルアップロード
  fileUpload(
    file: File,
    fileName: string,
    planId: number
  ) {
    const formData = new FormData();
    formData.append("param" , file, fileName);
    formData.append("objectId", "pr" + planId.toString());
    const url = this.host + "/api/User/SaveFile";
    return this.http.post<boolean>(url, formData, { headers: {}});
  }
}
