import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Spot } from "../class/spot.class";
import { GoogleSpot } from '../class/spotlist.class';
import { CommonService } from "./common.service";
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
export class MapService {
  private CloseDialog = new Subject();
  public CloseDialog$ = this.CloseDialog.asObservable();

  constructor(
    private http: HttpClient,
    private commonService: CommonService,
    @Inject("BASE_API_URL") private host: string
  ) { }

  // お気に入りスポットを取得
  getSpotFavorite(spotId: number, googleSpotId: number, guid: string) {
    const url = this.host + "/api/Map/GetSpotFavorite";
    return this.http.get<boolean>(url, {
      params: {
        spotId: String(spotId),
        googleSpotId: String(googleSpotId),
        guid: guid,
        objectId: this.commonService.objectId
      }
    });
  }

  // 地図のマーカー用のスポット一覧を取得
  getMapSpotList(guid: string) {
    const url = this.host + "/api/Map/GetMapSpotList";
    return this.http.get<Spot[]>(url, {
      params: {
        guid: guid,
        objectId: this.commonService.objectId
      }
    });
  }

  // 地図のマーカー用のスポット詳細を取得
  GetMapGoogleSpot(placeId: string, langCd: string, guid: string) {
    const url = this.host + "/api/Map/GetMapGoogleSpot";
    return this.http.get<GoogleSpot>(url, {
      params: {
        placeId: placeId,
        langCd: langCd
      }
    });
  }

  // プランスポット削除通知
  public closeDialog() {
    this.CloseDialog.next();
  }

}
