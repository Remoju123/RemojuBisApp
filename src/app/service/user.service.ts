import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { DataSelected } from "../class/common.class";
import { LoginParam, User } from "../class/user.class";
import { CommonService } from "./common.service";
import { Observable } from "rxjs";
import { isPlatformBrowser } from "@angular/common";
import { Subject } from "rxjs";

const httpOptions = {
  headers: new HttpHeaders({
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json;charset=utf-8"
  })
};

@Injectable({
  providedIn: "root"
})
export class UserService {

  private isupdUserName = new Subject<boolean>();
  public isupdUserName$ = this.isupdUserName.asObservable();

  constructor(
    private commonService: CommonService,
    private http: HttpClient,
    @Inject("BASE_API_URL") private host: string,
    @Inject(PLATFORM_ID) private platformId:Object
  ) { }

  // サーバー側ユーザー情報補完処理
  userCompletion(guid: string){
    let loginParam = new LoginParam();
    if(isPlatformBrowser(this.platformId)){
      loginParam = {
        rjGuid: guid,
        email: this.commonService.email,
        name: this.commonService.name,
        objectId: this.commonService.objectId,
        idp: this.commonService.idp,
        picture: this.commonService.picture
      };
    }
    const url = this.host + "/api/User/Login";
    return this.http.post<boolean>(url, loginParam, httpOptions);
  }

  // 国選択値を取得
  getDataSelected() {
    const url = this.host + "/api/User/ListSelected";
    return this.http.get<DataSelected[]>(url);
  }

  // ユーザ取得
  getUser(){
    const url = this.host + "/api/User/GetUser";
    return this.http.get<User>(url, {
      params: { objectId: this.commonService.objectId}
    });
  }

  // 他ユーザ取得
  getOtherUser(objectId: string){
    const url = this.host + "/api/User/GetOtherUser";
    return this.http.get<User>(url, {
      params: { objectId: objectId}
    });
  }

  // ユーザ更新
  registUser(
    user: User
  ) {
    const url = this.host + "/api/User/RegistUser";
    return this.http.post<boolean>(url, user, httpOptions);
  }

  // ファイルアップロード
  fileUpload(
    user: User,
    isCover: boolean
  ) {
    const formData = new FormData();
    if (isCover){
      if (user.coverImageCropped) {
        // blobに再変換
        var blob = this.commonService.base64toBlob(user.coverImageCropped);
        // blob object array( fileに再変換 )
        var file = this.commonService.blobToFile(blob, user.coverFile.name);
        formData.append("param" , file, file.name);
      } else {
        formData.append("param" , user.coverFile, user.coverFile.name);
      }
    } else {
      if (user.imageCropped){
        // blobに再変換
        var blob = this.commonService.base64toBlob(user.imageCropped);
        // blob object array( fileに再変換 )
        var file = this.commonService.blobToFile(blob, user.pictureFile.name);
        formData.append("param" , file, file.name);
      } else {
        formData.append("param" , user.pictureFile, user.pictureFile.name);
      }
    }
    formData.append("objectId", user.object_id);
    const url = this.host + "/api/User/SaveFile";
    return this.http.post<boolean>(url, formData, { headers: {}});
  }

  public onupdUserName() {
    this.isupdUserName.next();
  }
}
