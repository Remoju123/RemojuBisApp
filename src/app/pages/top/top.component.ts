import { HttpUrlEncodingCodec } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { JsonHubProtocol } from '@aspnet/signalr';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ListSearchCondition } from 'src/app/class/indexeddb.class';
import { CommonService } from 'src/app/service/common.service';
import { IndexedDBService } from 'src/app/service/indexeddb.service';
import { PlanSpotListService } from 'src/app/service/planspotlist.service';
import { UserService } from 'src/app/service/user.service';
import { LoadingIndicatorService } from '../../service/loading-indicator.service';

@Component({
  selector: 'app-top',
  templateUrl: './top.component.html',
  styleUrls: ['./top.component.scss'],
})
export class TopComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject();

  condition: ListSearchCondition;
  mode: any = 'over';
  opened: boolean;
  currentLang: string;

  isVal: boolean = false;

  codec = new HttpUrlEncodingCodec();

  get lang() {
    return this.translate.currentLang;
  }

  constructor(
    private translate: TranslateService,
    public loading: LoadingIndicatorService,
    private commonService: CommonService,
    private indexedDBService: IndexedDBService,
    private planspots: PlanSpotListService,
    private userService: UserService,
    private router: Router
  ) {
    this.condition = new ListSearchCondition();
  }
  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  redirectUri = '';

  profile: any;

  profile_utf8: any;

  _url: any = `${window.location.origin}`;

  pictureUrl: string = '../../../assets/img/icon_who.svg';

  condtion: ListSearchCondition;

  ngOnInit() {
    // // this.authService.profile.subscribe(p => (this.profile = p));
    // if (this.authService.getUser() !== null) {
    //   this.profile = this.authService.getUser();

    //   const iconvpipe = new IconvPipe();
    //   this.profile_utf8 = JSON.parse(
    //     iconvpipe.transform(JSON.stringify(this.profile.idToken))
    //   );
    // }

    if (this.commonService.loggedIn) {
      this.userService
        .getUser()
        .pipe(takeUntil(this.onDestroy$))
        .subscribe((r: { pictureUrl: string; displayName: string }) => {
          if (r) {
            if (r.pictureUrl) {
              this.pictureUrl = r.pictureUrl;
            }
          }
        });
    }
  }

  // サイトナビ開閉状態の切り替え
  onhandleSiteNav(eventData: boolean) {
    this.opened = !eventData;
  }

  toggleactive() {
    this.opened = true;
  }

  onKeywordSearch(e) {
    const val = e.target.value.toLowerCase();
    val !== '' ? (this.isVal = true) : false;
    if (val !== '') {
      let encval = this.codec.encodeValue(val);
      this.router.navigate(['/' + this.lang + '/planspot'], {
        queryParams: {
          aid: '',
          era: '',
          cat: '',
          srt: '11',
          lst: 'all',
          kwd: val,
        },
      });
    }
  }

  linktolist() {
    this.router.navigate(['/' + this.lang + '/planspot']);
  }
}
