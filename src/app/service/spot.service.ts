import { Inject, Injectable } from "@angular/core";

import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

import { DataSelected } from "../class/common.class";
import { RegistReviewResult, ReviewResult, SpotReviews } from "../class/review.class";
import { SpotApp, SpotThanks } from "../class/spot.class";
import { CommonService } from "./common.service";
import { LangFilterPipe } from "../utils/lang-filter.pipe";
import { TranslateService } from "@ngx-translate/core";

const httpOptions = {
  headers: new HttpHeaders({
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json;charset=utf-8"
  })
};

const access:any = {}
access[0] = () => {
  return "directions_walk";
};
access[1] = () => {
  return "directions_subway";
};
access[2] = () => {
  return "directions_bus";
};
access[3] = () => {
  return "directions_walk";
};

@Injectable({
  providedIn: "root"
})
export class SpotService {
  // 定休日
  businessday: DataSelected[];

  // 予算枠
  budgetFrame: DataSelected[];

  constructor(
    private commonService: CommonService,
    private translate: TranslateService,
    private http: HttpClient,
    @Inject("BASE_API_URL") private host: string
  ) { }

  // スポット詳細を取得
  getSpotDetail(id: string, guid: string) {
    const url = this.host + "/api/spot/" + id;
    return this.http.get<SpotApp>(url, {
      params: {
        id: id,
        guid: guid,
        objectId: this.commonService.objectId
      }
    });
  }

  // Thanks初期値取得
  getThanks(_spot_id: number) {
    const url = this.host + "/api/spotthanks/" + _spot_id;
    return this.http.get<number>(url);
  }

  // Thanksを言おう
  registThanks(
    _spot_id: number,
    _guid: string
  ): Observable<number> {
    const data: SpotThanks = {
      spot_id: _spot_id,
      guid: _guid,
      is_delete: false,
      objectId: this.commonService.objectId
    };

    const url = this.host + "/api/spotthanks/thanks";
    return this.http.post<any>(url, data, httpOptions);
  }

  // 定休日文字列生成
  getRegularholidays(val: string) {
    if (!val) {
      return "";
    }
    let s: any[] = [];
    const holidays = val.split(",");
    holidays.map((h: string) => {
      const langpipe = new LangFilterPipe();
      s.push(langpipe.transform(this.businessday.find(b => b.id === Number(h)).name, this.translate.currentLang));
    });
    return s.join(",");
  }

  // 営業時間文字列生成
  getBusinessHours(data: any, remark: string = null) {
    const r: string[] = [];
    if (data.length === 0) {
      return "--";
    }
    data.map((x: any) => {
      const hours = JSON.parse(x.business_hours);
      const s2: string[] = [];
      const pipe = new LangFilterPipe();
      hours.map((h: { from: string; to: string; comment: any; }) => {
        const str =
          h.from +
          "~" +
          h.to +
          "<span class='sm pl05'>" +
          pipe.transform(h.comment, this.translate.currentLang) +
          "</span>";
        s2.push(str);
      });

      const strBusinessDay =
        this.setBusinessDay(x.business_day) !== ""
          ? this.setBusinessDay(x.business_day)
          : "";
      r.push(strBusinessDay + " " + s2.join("/ "));
    });

    if (remark !== null) {
      return r.join("<br>") + "<br>" + "<span class='sm'>" + remark + "</span>";
    } else {
      return r.join("<br>");
    }
  }

  // 営業時間main文字列生成
  getBusinessHourMain(data: any) {
    let r = "";
    if (data.length === 0) {
      return "--";
    }
    data.map((x: { is_main: boolean; business_hours: string; business_day: any; }) => {
      if (x.is_main === true) {
        const hours = JSON.parse(x.business_hours);
        const s2: string[] = [];
        hours.map((h: { from: string; to: string; }) => {
          s2.push(h.from + "~" + h.to);
        });
        r = this.setBusinessDay(x.business_day) + s2.join("/");
      }
    });
    return r;
  }

  // 営業時間header文字列生成
  getBusinessHourHead(data: any) {
    let r = "";
    if (data.length === 0) {
      return "--";
    }
    data.map((x: { is_main: boolean; business_hours: string; }) => {
      if (x.is_main === true) {
        const hours = JSON.parse(x.business_hours);
        const s2: string[] = [];

        hours.map((h: { to: string; from: string | any[]; }) => {
          const to =
            h.to !== "" ? " ~ " + h.to : h.from.length > 0 ? " ~ " : "";
          s2.push(h.from + to);
        });
        //営業時間は最初のひとつを表示に変更 2020.12.22MM
        //r = s2.join("/");
        r = s2[0];
      }
    });
    return r;
  }

  // 曜日取得
  setBusinessDay(v: any) {
    let r: string = "";
    if (v !== null) {
      switch (v) {
        case "1,2,3,4,5,6,7,8":
          r = "";
          break;
        case "1,2,3,4,5":
          r = this.translate.instant("Weekday");
          break;
        case "6,7,8":
          r = this.translate.instant("Holidays");
          break;
        default:
          const s: any[] = [];
          const ary = v.split(",");
          ary.map((d: any) => {
            const b = this.businessday.find(x => {
              return x.id === Number(d);
            });
            const langpipe = new LangFilterPipe();
            s.push(langpipe.transform(b.name, this.translate.currentLang));
          });
          r = s.join(",");
          break;
      }
    }
    return r;
  }

  getBudgetFrame(data: any, remark: string = null) {
    const r: string[] = [];
    data.map((x: { budget_lower_limit: number; budget_frame_id: any; budget_cap: number; }) => {
      if (x.budget_lower_limit !== null) {
        const n = this.budgetFrame.find(y => {
          return y.id === Number(x.budget_frame_id);
        });
        const lower =
          x.budget_lower_limit !== null && x.budget_lower_limit > 0
            ? x.budget_lower_limit.toLocaleString() + " " + this.translate.instant("Yen")
            : "";
        const cap =
          x.budget_cap !== null && x.budget_cap > 0 ? x.budget_cap.toLocaleString() + " " + this.translate.instant("Yen") : "";

        const langpipe = new LangFilterPipe();
        let colon = "：";
        if (n.id === 14){
          colon = "";
        }
        r.push(langpipe.transform(n.name, this.translate.currentLang) + colon + lower + " ~ " + cap);
      }
    });
    if (remark !== "") {
      return r.join("<br>") + "<br>" + remark;
    } else {
      return r.join("<br>");
    }
  }

  getBudgetFrameLine(data: any) {
    const r: string[] = [];
    data.map((x: { budget_lower_limit: number; budget_frame_id: any; budget_cap: number; }) => {
      if (x.budget_lower_limit != null) {
        const n = this.budgetFrame.find(y => {
          return y.id === Number(x.budget_frame_id);
        });
        // 朝は除外
        if (n.id !== 11) {
          const lower =
            x.budget_lower_limit !== null && x.budget_lower_limit > 0
              ? x.budget_lower_limit.toLocaleString() + " " + this.translate.instant("Yen")
              : "";
          const cap =
            x.budget_cap !== null && x.budget_cap > 0
              ? x.budget_cap.toLocaleString() + " " + this.translate.instant("Yen")
              : "";

          const langpipe = new LangFilterPipe();
          let colon = "：";
          if (n.id === 14){
            colon = "";
          }
          r.push(
            "<span class='badget'>"+ langpipe.transform(n.name, this.translate.currentLang) + colon +  lower + " ~ " + cap + "</span>"
          );
        }
      }
    });

    return r.join("");
  }

  getAccessIcon(data: any) {
    return access[data]();
  }

  getSearchCategories(data:any){
    const r = [];
    data.map((x: { name: any; })=>{
      if(x.name !== null){
        
      }
    })
    return;
  }

  // 検索カテゴリ
  genCategoryTexts() {
    return;
  }

  // レビュー登録
  registReview(review: SpotReviews){
    const url = this.host + "/api/Spot/RegistReview";
    return this.http.post<RegistReviewResult>(url, review, httpOptions);
  }

  // レビュー削除
  deleteReview(spotId: number, displayOrder: number){
    const url = this.host + "/api/spot/DeleteReview";
    return this.http.get<ReviewResult>(url, {
      params: {
        spotId: spotId.toString(),
        displayOrder: displayOrder.toString(),
        objectId: this.commonService.objectId
      }
    });
  }

  // レビュー通報
  reportReview(spotId: number, displayOrder: number){
    const url = this.host + "/api/spot/ReportReview";
    return this.http.get<boolean>(url, {
      params: {
        spotId: spotId.toString(),
        displayOrder: displayOrder.toString()
      }
    });
  }

  // ファイルアップロード
  fileUpload(
    file: File,
    fileName: string,
    spotId: number
  ) {
    const formData = new FormData();
    formData.append("param" , file, fileName);
    formData.append("objectId", spotId.toString());
    const url = this.host + "/api/User/SaveFile";
    return this.http.post<boolean>(url, formData, { headers: {}});
  }
}
