import {
  Component,
  Inject,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { PlanSpotCommon } from '../../class/common.class';
import { CommonService } from '../../service/common.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import PlaceResult = google.maps.places.PlaceResult;
import { takeUntil } from 'rxjs/operators';

declare const google: any;

@Component({
  selector: 'app-google-spot-dialog',
  templateUrl: './google-spot-dialog.component.html',
  styleUrls: ['./google-spot-dialog.component.scss'],
})
export class GoogleSpotDialogComponent implements OnInit, OnDestroy {
  constructor(
    private commonService: CommonService,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<GoogleSpotDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: [PlanSpotCommon, boolean]
  ) {}

  @ViewChild('keyword') keyrowd: ElementRef;

  private onDestroy$ = new Subject();
  map: any;
  zoom: number;
  place: any;
  autocomplete: any;

  ngOnInit() {}

  ngOnDestroy() {
    if (this.autocomplete) {
      google.maps.event.clearInstanceListeners(this.autocomplete);
      const place: Object = this.autocomplete.gm_accessors_.place;

      const placeKey = Object.keys(place).find(
        (value) =>
          typeof place[value] === 'object' &&
          place[value].hasOwnProperty('gm_accessors_')
      );

      const input = place[placeKey].gm_accessors_.input[placeKey];

      const inputKey = Object.keys(input).find(
        (value) =>
          input[value].classList &&
          input[value].classList.contains('pac-container')
      );

      input[inputKey].remove();
    }
    this.onDestroy$.next();
  }

  async mapReady(event: any) {
    this.map = event;

    if (!this.data[0]) {
      this.data[0] = new PlanSpotCommon();
    }

    if (this.data[0].latitude) {
      this.place = {
        name: this.data[0].spotName,
        latitude: this.data[0].latitude,
        longitude: this.data[0].longitude,
      };
    } else {
      // ユーザの居場所を設定
      const location = await this.commonService.getGeoLocation();
      if (
        location.errorCd === 0 &&
        location.latitude !== null &&
        location.longitude !== null
      ) {
        this.place = {
          name: null,
          latitude: location.latitude,
          longitude: location.longitude,
        };
        // ユーザの居場所が取得できない場合、都庁を設定
      } else {
        this.place = {
          name: null,
          latitude: 35.6896342,
          longitude: 139.689912,
        };
      }
    }

    // マップの中心を設定
    this.map.setCenter(
      new google.maps.LatLng(this.place.latitude, this.place.longitude)
    );
    this.map.setZoom(17);

    // 地図のクリック時にPOI(スポット)の場合、ポップアップを表示
    // GooglePOI(スポット)のポップアップを無視
    // const set = google.maps.InfoWindow.prototype.set;
    // google.maps.InfoWindow.prototype.set = function (key: string, val: any) {
    //   const self = this;
    //   if (key === "map" && !this.get("noSuppress")) {
    //     return;
    //   }
    //   set.apply(this, arguments);
    // };
  }

  onAutocompleteSelected(result: PlaceResult) {
    const options = {
      fields: ['geometry', 'name'],
    };

    this.autocomplete = new google.maps.places.Autocomplete(
      this.keyrowd.nativeElement,
      options
    );

    this.place = result;

    if (!result.geometry || !result.geometry.location) {
      // window.alert("No details available for input: '" + this.place.name + "'");
      return;
    }

    this.map.setCenter(result.geometry.location);
    this.map.setZoom(17);

    this.keyrowd.nativeElement.value = result.name;
  }

  onClickOK(): void {
    this.data[0].type = 3;
    this.data[0].latitude = String(this.map.center.lat());
    this.data[0].longitude = String(this.map.center.lng());
    const latLngInput = new google.maps.LatLng(
      this.data[0].latitude,
      this.data[0].longitude
    );
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ latLng: latLngInput }).then(async (response) => {
      if (response.results[0]) {
        let address = response.results[0].formatted_address;
        address = address.replace('日本, ', '');
        address = address.replace('日本、', '');
        address = address.replace('日本 ', '');
        address = address.replace(/〒[0-9]{3}-[0-9]{4} /, '');
        this.data[0].spotName = address;
        this.dialogRef.close(this.data[0]);
      }
    });
  }
}
