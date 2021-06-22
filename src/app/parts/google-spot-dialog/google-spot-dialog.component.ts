import { Component, Inject, OnInit, OnDestroy } from "@angular/core";
import { GoogleSpot } from "../../class/spotlist.class";
import { PlanSpotCommon } from "../../class/common.class";
import { SpotListService } from "../../service/spotlist.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AgmMap, LatLngBounds } from "@agm/core";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";

declare const google: any;

@Component({
  selector: "app-google-spot-dialog",
  templateUrl: "./google-spot-dialog.component.html",
  styleUrls: ["./google-spot-dialog.component.scss"]
})
export class GoogleSpotDialogComponent implements OnInit, OnDestroy {

  constructor(
    private spotListService: SpotListService,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<GoogleSpotDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: [ PlanSpotCommon, boolean ]
  ) { }

  private onDestroy$ = new Subject();
  map: any;
  zoom: number;
  place: any;

  ngOnInit() {

  }

  ngOnDestroy(){
    this.onDestroy$.next();
  }

  async mapReady(event: any) {
    this.map = event;

    if (!this.data[0]){
      this.data[0] = new PlanSpotCommon();
    }
    
    if (this.data[0].latitude){
      this.place = {
        name: this.data[0].spotName,
        latitude: this.data[0].latitude,
        longitude: this.data[0].longitude
      }
    } else {
      // ユーザの居場所を設定
      const location = await this.spotListService.getGeoLocation();
      if (location.errorCd === null &&
        location.latitude !== null &&
        location.longitude !== null){
          this.place = {
            name: null,
            latitude: location.latitude,
            longitude: location.longitude
          }
      // ユーザの居場所が取得できない場合、都庁を設定
      } else {
        this.place = {
          name: null,
          latitude: 35.6896342,
          longitude: 139.689912
        }
      }
    }

    // マップの中心を設定
    this.map.setCenter(new google.maps.LatLng(this.place.latitude, this.place.longitude));
    this.map.setZoom(17);

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

    this.googleAutocomplete();
  }

  onClickOK(): void {
    this.data[0].type = 3;
    this.data[0].spotName = this.place.name;
    this.data[0].latitude = String(this.map.center.lat());
    this.data[0].longitude = String(this.map.center.lng());

    this.dialogRef.close(this.data[0]);
  }

  googleAutocomplete() {
    const input = document.getElementById("keyword") as HTMLInputElement;
    const options = {
      fields: ["geometry", "name"]
    };    
    const autocomplete = new google.maps.places.Autocomplete(input, options);

    autocomplete.addListener("place_changed", () => {
      this.place = autocomplete.getPlace();
  
      if (!this.place.geometry || !this.place.geometry.location) {
        // window.alert("No details available for input: '" + this.place.name + "'");
        return;
      }
  
      this.map.setCenter(this.place.geometry.location);
      this.map.setZoom(17);

      input.value = this.place.name;
    });
  }
}
