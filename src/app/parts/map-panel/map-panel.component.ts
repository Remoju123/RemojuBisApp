import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { CommonService } from "../../service/common.service";
import { MapService } from "../../service/map.service";
import { MyplanService } from "../../service/myplan.service";
import { PlanService } from "../../service/plan.service";
import { MapDialogComponent } from "../../parts/map-dialog/map-dialog.component";
import { MapInfowindowDialogComponent } from "../map-infowindow-dialog/map-infowindow-dialog.component";
import { MapFullScreenParam, MapSpot, PlanSpotCommon } from "../../class/common.class";
import { Router } from "@angular/router";
import { LangFilterPipe } from "../../utils/lang-filter.pipe";
import { MatDialog } from "@angular/material/dialog";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

declare const google: any;

@Component({
  selector: "app-map-panel",
  templateUrl: "./map-panel.component.html",
  styleUrls: ["./map-panel.component.scss"]
})
export class MapPanelComponent implements OnInit,OnDestroy {

  @Input() planSpots: PlanSpotCommon[];
  @Input() startPlanSpot: PlanSpotCommon;
  @Input() endPlanSpot: PlanSpotCommon;
  @Input() isFull: boolean;
  @Input() planId: number;
  @Input() isDetail: boolean;

  // @ViewChild("AgmMap", { static: false }) agmMap: AgmMap;
  private onDestroy$ = new Subject();

  constructor(
    private commonService: CommonService,
    private mapService: MapService,
    private myplanService: MyplanService,
    private planService: PlanService,
    private translate: TranslateService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  guid: string;

  map: any;

  mapHeight: string;

  // 表示用
  mapSpotsDisp: MapSpot[];
  otherMapSpotsDisp: MapSpot[];
  // 編集用
  mapSpots: MapSpot[];
  otherMapSpots: MapSpot[];

  userLocation: any;

  markerIcon = "../../../assets/img/mk{0}.svg";
  markerSubIcon = "../../../assets/img/mks{0}.svg";
  markerNoDispIcon = "../../../assets/img/pin_gray-r.svg";
  markerStartEndIcon = "../../../assets/img/pin_red.svg";

  polylineColor = "#6699ff";
  polylineColorSelected = "#ff6666";

  spotMarkerFrom: string;
  spotMarkerTo: string;
  spotIndex = 0;

  locationDisabled: boolean;
  prevDisabled: boolean;
  nextDisabled: boolean;

  directions: string;
  transtime:any;
  spotNameFrom:string;
  spotNameTo:string;
  spotSrcFrom:string;
  spotSrcTo:string;

  get lang() {
    return this.translate.currentLang;
  }

  /*------------------------------
   *
   * イベント
   *
   * -----------------------------*/

  async ngOnInit() {
    // 全画面表示フラグを更新
    if (!this.isFull) {
      this.isFull = false;
    }

    // GUID取得
    this.guid = await this.commonService.getGuid();
    // データの整形
    this.dataFormat();
  }

  mapReady(event: any) {
    // Mapにボタンを追加
    this.map = event;
    // 地図の中心を設定
    this.setMapFitBounds(false);
    // 地図にコントロールを追加(移動方法の表示等)
    if (this.isFull) {
      // this.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(document.getElementById("routeDiv"));
      // 拡大縮小ボタンを右上に移動
      this.map.zoomControlOptions = { position: google.maps.ControlPosition.TOP_RIGHT ,
        style:google.maps.ZoomControlStyle.SMALL};
    } else {
      this.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById("fullScreenButton"));
    }
    // 地図のクリック時にPOI(スポット)の場合、ポップアップを表示
    // GooglePOI(スポット)のポップアップを無視
    const set = google.maps.InfoWindow.prototype.set;
    google.maps.InfoWindow.prototype.set = function (key: string, val: any) {
      const self = this;
      if (key === "map" && !this.get("noSuppress")) {
        return;
      }
      set.apply(this, arguments);
    };
  }

  mapClick(event: any) {
    if (!this.isFull) {
      return;
    }
    /* Googleスポットのマーカーを表示する処理
    this.mapService.GetMapGoogleSpot(
      event.placeId,
      this.currentlang,
      this.commonService.guid,
      this.commonService.getUserId())
      .subscribe(r => {
        const mapSpot = new MapSpot();
        mapSpot.spotId = 0;
        mapSpot.googleSpot = r;
        this.onClickMarker(mapSpot);
      });*/
  }

  zoomChange(event: any) {
    if (this.isFull) {
      // スポット名表示切り替え
      if (event > 13) {
        if (this.mapSpots.length > 0 && this.mapSpots[0].spotNameLangDisp === "　") {
          for (let i = 0; i < this.mapSpots.length; i++) {
            // fontFamily、fontWeightも設定可能
            this.mapSpots[i].spotNameLangDisp = { color: "black", fontSize: "12px", text: this.mapSpots[i].spotName };
          }
          this.mapSpots.map(x => x.visible = true);
          this.mapSpotsDisp = [...this.mapSpots];
        }
      } else {
        if (this.mapSpots.length > 0 && this.mapSpots[0].spotNameLangDisp !== "　") {
            for (let i = 0; i < this.mapSpots.length; i++) {
            this.mapSpots[i].spotNameLangDisp = "　";
          }
          this.mapSpotsDisp = [...this.mapSpots];
        }
      }
      // その他Remojuスポット表示切り替え
      this.zoomChangeOtherSpot(event);
    }

    if (!this.mapSpotsDisp) {
      // マップへ設定
      this.mapSpotsDisp = [...this.mapSpots];
    }
  }

  // マーカークリック
  onClickMarker(mapSpot: MapSpot) {
    if (!this.isFull) {
      return;
    }

    if (mapSpot.isStart || mapSpot.isEnd) {
      return;
    }

    const dialog = this.dialog.open(MapInfowindowDialogComponent, {
      id:"mapinfo",
      maxWidth: "100%",
      width: "92vw",
      maxHeight: "90vh",
      position: { top: "30vh" },
      data: mapSpot,
      autoFocus: false
    });

    dialog.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe(result => {
      // スポット詳細へ遷移する
      if (!isNaN(result)){
        this.mapService.closeDialog();
        this.router.navigate(["/" + this.lang + "/spots/detail/" + result]);
        return;
      }

      // スポット削除
      if (result === "delete") {
        // スポット削除通知
        this.myplanService.onPlanUserSpotRemoved(mapSpot.displayOrder);
        // プランから削除
        this.mapSpots.splice(
          this.mapSpots.findIndex(
            v => v.displayOrder === mapSpot.displayOrder
          ),
          1
        );
        // 並び順を更新
        let i = 1;
        this.mapSpots.forEach(x => {
          if (!x.isStart && !x.isEnd) {
            // 削除された前のスポット移動経度をクリア
            if (x.displayOrder === mapSpot.displayOrder - 1){
              x.directions = "";
              x.transfer = "";
            }
            x.displayOrder = i++;
            x.iconUrl.url = this.markerIcon.replace("{0}", (x.displayOrder).toString());
          }
        });
        this.mapSpotsDisp = [...this.mapSpots];
        this.setMapFitBounds(false);
        this.spotIndex = 0;
        this.setPlanMarker();
        return;
      }

      // スポット追加
      if (result && !this.isDetail) {
        this.planSpots = result;
        this.dataFormat();
      }
    });
  }

  // 現在地からの行き方
  onClickMapApp(mapSpot: MapSpot) {
    this.commonService.locationGoogleMap(this.lang, mapSpot.latitude, mapSpot.longitude);
  }

  // 地図内のボタンイベント

  // 全画面表示
  onClickFullScreen() {
    const param = new MapFullScreenParam();
    param.isDetail = true;
    param.planId = this.planId;
    param.planSpots = this.planSpots;
    this.dialog.open(MapDialogComponent, {
      maxWidth: "100%",
      width: "100vw",
      height:"100vh",//
      position: { top: "0" },
      data: param,
      autoFocus: false,
      id:"fullmap"
    });
  }

  // 現在地
  onClickCurrentLocation() {
    this.getLocation();
  }

  // スポットへの行き方
  onClickSpotLocation() {
    this.onClickMapApp(this.mapSpots[this.spotIndex + 1]);
  }

  // 移動経路を表示　＜
  onClickPrevSpot() {
    this.spotIndex--;
    if(this.spotIndex < 0){
      this.spotIndex = 0;
      return;
    }else{
      this.setPlanMarker();
      this.setMapFitBoundsTwoSpot();
    }
  }

  // 移動経路を表示　＞
  onClickNextSpot() {
    this.spotIndex++;
    if(this.spotIndex > (this.mapSpots.length - 2)){
      this.spotIndex = this.mapSpots.length - 2;
      return
    }else{
      this.setPlanMarker();
      this.setMapFitBoundsTwoSpot();
    }
  }

  // スポット詳細に遷移
  onClickSpotDetail(isFrom: boolean) {
    if(isFrom){
      this.onClickMarker(this.mapSpotsDisp[this.spotIndex]);
    } else if(this.mapSpots.length > 1) {
      this.onClickMarker(this.mapSpotsDisp[this.spotIndex + 1]);
    }
  }

  /*------------------------------
   *
   * メソッド
   *
   * -----------------------------*/

  // その他Remojuスポット表示切り替え
  zoomChangeOtherSpot(zoom: number) {
    if (zoom > 16 && (!this.otherMapSpotsDisp || this.otherMapSpotsDisp.length === 0)) {
      this.otherMapSpotsDisp = this.otherMapSpots;
    }
    if (zoom <= 16) {
      this.otherMapSpotsDisp = [];
    }
  }

  // データの整形
  dataFormat() {
    const langpipe = new LangFilterPipe();
    const lang = this.lang;
    const isDetail = this.isDetail;

    if (this.planSpots) {
      this.mapSpots = this.planSpots.map(function (planSpot, index): MapSpot {
        const mapSpot = new MapSpot();
        mapSpot.type = planSpot.type;
        mapSpot.isStart = false;
        mapSpot.isEnd = false;
        mapSpot.spotId = planSpot.spotId;
        mapSpot.spotName = planSpot.spotName;
        if (planSpot.type === 3) {
          mapSpot.subheading = planSpot.memo;
        } else {
          mapSpot.subheading = planSpot.subheading;
        }
        mapSpot.latitude = Number(planSpot.latitude);
        mapSpot.longitude = Number(planSpot.longitude);
        if (planSpot.pictures && planSpot.pictures.length > 0) {
          mapSpot.pictureUrl = planSpot.pictures[0];
        }
        mapSpot.stayTime = planSpot.stayTime;
        mapSpot.memo = planSpot.memo;
        mapSpot.transfer = planSpot.transfer;
        mapSpot.displayOrder = planSpot.displayOrder;
        mapSpot.isDetail = isDetail;
        return mapSpot;
      });

      // 出発地がある場合、追加
      if (this.startPlanSpot){
        if (this.startPlanSpot.spotName)
        this.mapSpots.unshift(this.convMapSpot(true));
      }
      // 到着地がある場合、追加
      if (this.endPlanSpot){
        if(this.endPlanSpot.spotName)
        this.mapSpots.push(this.convMapSpot(false));
      }
    }

    let $width = 30;
    let $height = 38;
    let $anchor = {x:15,y:33};
    if(this.isFull){
      $width = 47;
      $height = 59.53333;
      $anchor = {x:23.5,y:51.7};
    }

    for (let i = 0; i < this.mapSpots.length; i++) {
      // マーカーを表示
      this.mapSpots[i].visible = true;

      // プランスポットのマーカーが上に表示されるように大きい値を設定
      this.mapSpots[i].zIndex = 999999;

      // 線の色
      this.mapSpots[i].polylineColor = this.polylineColor;

      // 出発地と到着地のアイコンURL
      if (this.mapSpots[i].isStart || this.mapSpots[i].isEnd){
        this.mapSpots[i].iconUrl = {
          url: this.markerStartEndIcon,
          scaledSize: {
            width: $width,
            height: $height
          },
          anchor:$anchor,
          labelOrigin: { x: $anchor.x, y: $anchor.y+12 }
        };
      } else if (!this.mapSpots[i].isEndOfPublication) {
        // アイコンURL
        this.mapSpots[i].iconUrl = {
          url: this.markerIcon.replace("{0}", (this.mapSpots[i].displayOrder).toString()),
          scaledSize: {
            width: $width,
            height: $height
          },
          anchor:$anchor,
          labelOrigin: { x: $anchor.x, y: $anchor.y+12 }
        };

        // お気に入り
        if (this.mapSpots[i].type === 1) {
          this.mapService.getSpotFavorite(
            this.mapSpots[i].spotId,
            0,
            this.guid)
            .pipe(takeUntil(this.onDestroy$))
            .subscribe(r => {
              this.mapSpots[i].isFavorite = r;
            });
        } else if (this.mapSpots[i].type === 2){
          this.mapService.getSpotFavorite(
            0,
            this.mapSpots[i].spotId,
            this.guid)
            .pipe(takeUntil(this.onDestroy$))
            .subscribe(r => {
              this.mapSpots[i].isFavorite = r;
            });
        }
      } else {
        // 掲載終了アイコンURL
        this.mapSpots[i].iconUrl = {
          url: this.markerNoDispIcon,
          scaledSize: {
            width: $width,
            height: $height
          },
          anchor:$anchor,
          labelOrigin: { x: $anchor.x, y: $anchor.y+12 }
        };
      }

      // ラベルに何か入っていないとアイコンのscaledSizeが効かなくなる
      this.mapSpots[i].spotNameLangDisp = "　";

      // 移動方法
      if (this.mapSpots[i].transfer) {
        const dir = this.direction(
          langpipe.transform(JSON.parse(this.mapSpots[i].transfer), this.lang)
          , i);

        let _dir = [];

        for (let j = 0; j < dir.length; j++) {
          _dir.push(dir[j]);
        };

        this.mapSpots[i].directions = "<dl><dd>" + _dir.join("</dd><dd>") + "</dd></dl>";

      // 移動方法設定なしかつ最終スポットではない場合
      } else if (i < this.mapSpots.length){
        this.mapSpots[i].directions = "<dl><dd>" + this.translate.instant("DuringRouteCalculation") + "</dd></dl>";
      }
    }



    // 全画面表示かつユーザ作成プランの場合、その他Remojuスポットを表示
    if (this.isFull && !this.isDetail) {
      // マーカー用のスポットを取得し、ストレージから取得したスポット情報にマージ
      this.otherMapSpots = [];
      this.mapService.getMapSpotList(this.guid)
        .pipe(takeUntil(this.onDestroy$))
        .subscribe(r => {
          if (r) {
            // 同じスポットIDは除く
            const result = r.filter(x => !this.mapSpots.map(m => m.spotId).includes(x.spot_id));
            result.forEach(x => {
              x.spot_name = this.commonService.isValidJson(x.spot_name, lang);
              x.subheading = this.commonService.isValidJson(x.subheading, lang);
            })
            // スポットを別アイコンで追加
            this.otherMapSpots = this.otherMapSpots.concat(result.map(function (spot, index): MapSpot {
              const mapSpot = new MapSpot();
              // console.log(mapSpot);
              mapSpot.isStart = false;
              mapSpot.isEnd = false;
              mapSpot.spotId = spot.spot_id;
              mapSpot.spotName = spot.spot_name;
              mapSpot.subheading = spot.subheading;
              mapSpot.spotNameLangDisp = spot.spot_name;
              mapSpot.latitude = Number(spot.latitude);
              mapSpot.longitude = Number(spot.longitude);
              mapSpot.iconUrl = {
                url: "../../../assets/img/" + spot.categoryIcon,
                scaledSize: {
                  width: $width,
                  height: $height
                },
                anchor:$anchor
              };
              mapSpot.visible = false;
              mapSpot.pictureUrl = spot.pictureUrl;
              mapSpot.isFavorite = spot.isFavorite;
              mapSpot.isOhterSpot = true;
              return mapSpot;
            }));
            this.zoomChangeOtherSpot(this.map.zoom);
          }
        });
    }
    // 地図の中心を設定
    this.setMapFitBounds(false);
    // プランのスポットの地図内の表示切替
    this.setPlanMarker();
  }

  // 地図の中心を設定
  setMapFitBounds(currentLocation: boolean) {
    if (google && this.mapSpots && this.mapSpots.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      for (let i = 0; i < this.mapSpots.length; i++) {
        bounds.extend(new google.maps.LatLng(this.mapSpots[i].latitude, this.mapSpots[i].longitude));
      }
      if (currentLocation) {
        bounds.extend(new google.maps.LatLng(this.userLocation.latitude, this.userLocation.longitude));
      }
      this.map.fitBounds(bounds);
    }
  }

  // 地図の中心を2点スポットの中心に設定
  setMapFitBoundsTwoSpot() {
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(new google.maps.LatLng(
      this.mapSpots[this.spotIndex].latitude,
      this.mapSpots[this.spotIndex].longitude));
    bounds.extend(new google.maps.LatLng(
      this.mapSpots[this.spotIndex + 1].latitude,
      this.mapSpots[this.spotIndex + 1].longitude));
    this.map.fitBounds(bounds);
  }

  // 移動経路を整形
  direction(data: any, index: number) {
    if (data) {
      return data.reduce((p: string[], c: { Type: string; Minute: string; LineName: string; StationNameFrom: string; StationNameTo: string; }, i: any) => {
        switch (c.Type) {
          case "徒歩":
          case "Walk":
            p.push(c.Type + " " + c.Minute + this.translate.instant("Minute"));
            break;
          default:
            p.push(c.LineName + " " + c.StationNameFrom + "→" + c.StationNameTo + " "
              + c.Minute + this.translate.instant("Minute"));
            break;
        }
        return p;
      }, []);
    } else {
      return null;
    }
  }

  // ユーザの現在地を表示
  async getLocation() {
    // ユーザの位置を取得
    const location = await this.commonService.getGeoLocation();

    // マーカーを表示
    if (
      location.errorCd === null &&
      location.latitude !== null &&
      location.longitude !== null
    ) {
      this.userLocation = {
        latitude: Number(location.latitude),
        longitude: Number(location.longitude)
      };

      // 地図の中心を設定
      this.setMapFitBounds(true);
    }
  }

  // プランのスポットの地図内の表示切替
  setPlanMarker() {
    const langpipe = new LangFilterPipe();
    // アイコンを変更
    if(this.mapSpots[this.spotIndex].isStart || this.mapSpots[this.spotIndex].isEnd) {
      this.spotMarkerFrom = this.markerStartEndIcon;
    } else if (this.mapSpots[this.spotIndex].isEndOfPublication){
      this.spotMarkerFrom = this.markerNoDispIcon;
    } else {
      this.spotMarkerFrom = this.markerSubIcon.replace("{0}", (this.mapSpots[this.spotIndex].displayOrder).toString());
    }
    if (this.mapSpots.length > 1){
      if(this.mapSpots[this.spotIndex + 1].isEnd) {
        this.spotMarkerTo = this.markerStartEndIcon;
      } else if (this.mapSpots[this.spotIndex + 1].isEndOfPublication){
        this.spotMarkerTo = this.markerNoDispIcon;
      } else {
        this.spotMarkerTo = this.markerSubIcon.replace("{0}", (this.mapSpots[this.spotIndex + 1].displayOrder).toString());
      }
    }

    // 移動経路を設定
    this.directions = this.mapSpots[this.spotIndex].directions;
    // 移動時間合計を計算
    this.transtime = this.planService.transtimes(langpipe.transform(JSON.parse(this.mapSpots[this.spotIndex].transfer),this.lang));
    // スポット名From
    this.spotNameFrom = this.mapSpots[this.spotIndex].spotName;
    // スポット写真From
    this.spotSrcFrom = this.mapSpots[this.spotIndex].pictureUrl;
    if (this.mapSpots.length > 1){
      // スポット名To
      this.spotNameTo = this.mapSpots[this.spotIndex+1].spotName;
      // スポット写真To
      this.spotSrcTo = this.mapSpots[this.spotIndex+1].pictureUrl;
    }
    // 線の色を設定
    for (let i = 0; i < this.mapSpots.length; i++) {
      if (i === this.spotIndex) {
        this.mapSpots[i].polylineColor = this.polylineColorSelected;
      } else {
        this.mapSpots[i].polylineColor = this.polylineColor;
      }
    }

    // 現在地からスポットへの行き方の制御
    if (this.mapSpots.length === 1){
      this.locationDisabled = true;
    } else {
      this.locationDisabled = false;
    }
  }

  // 出発地到着地をMapSpotに変換
  convMapSpot(isStart: boolean){
    let planSpot = this.startPlanSpot;
    if (!isStart){
      planSpot = this.endPlanSpot;
    }
    const mapSpot = new MapSpot();
    mapSpot.spotId = planSpot.spotId;
    mapSpot.isStart = isStart;
    mapSpot.isEnd = !isStart;
    mapSpot.spotName = planSpot.spotName;
    mapSpot.latitude = Number(planSpot.latitude);
    mapSpot.longitude = Number(planSpot.longitude);
    mapSpot.transfer = planSpot.transfer;
    return mapSpot;
  }

  /*------------------------------
   *
   * メソッド(他のコンポーネントから実行)
   *
   * -----------------------------*/

  // 地図の中心を指定された緯度経度で設定(プラン詳細)
  setMapCenter(latitude: number, longitude: number) {
    //console.log(latitude + " " + longitude);
    this.map.setCenter({ lat: Number(latitude), lng: Number(longitude) });
  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }
}
