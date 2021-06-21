import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { MyPlanApp } from "../class/common.class";
import { CommonService } from "../service/common.service";
import { TranslateService } from "@ngx-translate/core";

const httpOptions = {
  headers: new HttpHeaders({
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json;charset=utf-8"
  })
};

@Injectable({
  providedIn: "root"
})
export class UserplanpostService {

constructor(
  private http: HttpClient,
  private commonService: CommonService,
  private translate: TranslateService,
  @Inject("BASE_API_URL") private host: string
  ) { }

  // プラン投稿
  registPlanPost(
    options: MyPlanApp
  ) {
    options.languageCd1 = [ this.translate.currentLang ];
    options.objectId = this.commonService.objectId;
    const url = this.host + "/api/Myplan/RegistPlanPost";
    return this.http.post<MyPlanApp>(url, options, httpOptions);
  }
  
  // ファイルアップロード
  fileUpload(
    file: File,
    fileName: string,
    planId: number
  ) {
    const formData = new FormData();
    formData.append("param" , file, fileName);
    formData.append("objectId", planId.toString());
    const url = this.host + "/api/User/SaveFile";
    return this.http.post<boolean>(url, formData, { headers: {}});
  }
}