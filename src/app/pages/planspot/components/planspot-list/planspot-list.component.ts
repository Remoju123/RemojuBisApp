import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
  Input,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Subject } from 'rxjs';
import { ListSearchCondition } from 'src/app/class/indexeddb.class';
import { CommonService } from 'src/app/service/common.service';
import PlaceResult = google.maps.places.PlaceResult;
@Component({
  selector: 'app-planspot-list',
  templateUrl: './planspot-list.component.html',
  styleUrls: ['./planspot-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanspotListComponent implements OnInit {
  @Input() isList: boolean;
  @Input() condition: ListSearchCondition;
  @Output() scrolled = new EventEmitter();
  @Output() glink = new EventEmitter<any>();

  @ViewChild('box') box: ElementRef;
  scrollPos: number;
  isMobile: boolean;

  @ViewChild('keyword') keyrowd: ElementRef;
  private onDestroy$ = new Subject();
  map: any;
  zoom: number;
  place: any;
  autocomplete: any;

  constructor(private commonService: CommonService) {}

  ngOnInit(): void {
    this.isMobile = this.detectIsMobile(window.innerWidth);
  }

  scrolledEmit() {
    this.scrolled.emit();
  }

  googleLink(e: any) {
    this.glink.emit(e);
  }

  detectIsMobile(w: any) {
    if (w < 1024) {
      return true;
    } else {
      return false;
    }
  }

  onScroll(e: any) {
    this.scrollPos = e.target.scrollTop;
  }

  scrollToTop() {
    this.box.nativeElement.scrollTo(0, -156);
  }

  async mapReady(event: any) {
    this.map = event;
    // if (!this.data[0]) {
    //   this.data[0] = new PlanSpotCommon();
    // }

    // if (this.data[0].latitude) {
    //   this.place = {
    //     name: this.data[0].spotName,
    //     latitude: this.data[0].latitude,
    //     longitude: this.data[0].longitude,
    //   };
    // } else {
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
    //}

    // マップの中心を設定
    this.map.setCenter(
      new google.maps.LatLng(this.place.latitude, this.place.longitude)
    );
    this.map.setZoom(17);

    // 地図のクリック時にPOI(スポット)の場合、ポップアップを表示
    // GooglePOI(スポット)のポップアップを無視
    const set = google.maps.InfoWindow.prototype.set;
    google.maps.InfoWindow.prototype.set = function (key: string, val: any) {
      const self = this;
      if (key === 'map' && !this.get('noSuppress')) {
        return;
      }
      //set.apply(this, arguments);
    };
  }

  onAutocompleteSelected(result: PlaceResult) {
    const options = {
      fields: ['geometry', 'name'],
    };

    // this.autocomplete = new google.maps.places.PlacesService(
    //   this.keyrowd.nativeElement
    // );

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
}
