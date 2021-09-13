import { Injectable, NgModule } from '@angular/core';
import { BrowserModule, HammerModule, HammerGestureConfig,
  HAMMER_GESTURE_CONFIG, HAMMER_LOADER, TransferState, BrowserTransferStateModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClient,  HttpClientModule} from "@angular/common/http";

import { AppComponent } from './app.component';
import { ServiceWorkerModule, SwPush } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

import { AgmCoreModule } from "@agm/core";
import { AgmDirectionModule } from "agm-direction";

import { ImageCropperModule } from "ngx-image-cropper";

// Materialモジュール
import { MaterialModule } from "./material/material.module";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  MatProgressSpinnerModule,
  MatSpinner
} from "@angular/material/progress-spinner";
import { MAT_DATE_LOCALE } from '@angular/material/core';
//import Hammer from '@egjs/hammerjs';
import { NgxPageScrollCoreModule } from "ngx-page-scroll-core";
import { NgxPageScrollModule } from "ngx-page-scroll";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterPipeModule } from "ngx-filter-pipe";
import { NgxMaterialTimepickerModule } from "ngx-material-timepicker";
import { OverlayModule } from "@angular/cdk/overlay";
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import {CrystalLightboxModule} from '@crystalui/angular-lightbox';

// サービス
import { DataService } from "./service/data.service";
import { PermissionService } from "./service/permission.service";
import { PushService } from "./service/push.service";

// ユーティリティ
import { UtilsModule } from "./utils/utils.module";
import { SharedModule } from "./shared/shared.module";

// ルーター関連
import { AppRoutingModule } from './app-routing.module';
import {
  Location,
  LocationStrategy,
  PathLocationStrategy,
  DatePipe
} from "@angular/common";

import { TransferHttpCacheModule } from '@nguniversal/common';
import { translateBrowserLoaderFactory } from './shared/loaders/translate-browser.loader';

// OAuth2
import { OAuthModule } from "angular-oauth2-oidc";

// 作成したコンポーネント
import { BlankComponent } from './layout/blank/blank.component';
import { FooterComponent } from './layout/footer/footer.component';
import { HeaderComponent } from './layout/header/header.component';
import { RootComponent } from './layout/root/root.component';
import { LanguageComponent } from './language/language.component';
import { TopComponent } from './pages/top/top.component';
import { AuthGuard } from './auth.guard';

import { UrlcopyDialogComponent } from './parts/urlcopy-dialog/urlcopy-dialog.component';
import { PullToRefreshComponent } from './parts/pull-to-refresh/pull-to-refresh.component';
import { NavMenuComponent } from './parts/nav-menu/nav-menu.component';
import { ConfirmMessageDialogComponent } from './parts/confirm-message-dialog/confirm-message-dialog.component';
import { SpotListComponent } from './pages/spot-list/spot-list.component';
import { SpotListPanelComponent } from './parts/spot-list-panel/spot-list-panel.component';
import { SearchDialogFormComponent } from './parts/search-dialog-form/search-dialog-form.component';
import { PlanListComponent } from './pages/plan-list/plan-list.component';
import { PlanListPanelComponent } from './parts/plan-list-panel/plan-list-panel.component';
import { SearchDialogFormPlanComponent } from './parts/search-dialog-form-plan/search-dialog-form-plan.component';
import { SpotDetailComponent } from './pages/spot-detail/spot-detail.component';
import { ReviewListPanelComponent } from './parts/review-list-panel/review-list-panel.component';
import { ReviewPostDialogComponent } from './parts/review-post-dialog/review-post-dialog.component';
import { RatingCompComponent } from './parts/rating-comp/rating-comp.component';
import { PlanDetailComponent } from './pages/plan-detail/plan-detail.component';
import { MapPanelComponent } from './parts/map-panel/map-panel.component';
import { TransferPanelComponent } from './parts/transfer-panel/transfer-panel.component';
import { UserprofilePanelComponent } from './parts/userprofile-panel/userprofile-panel.component';
import { MapDialogComponent } from './parts/map-dialog/map-dialog.component';
import { GoogleSpotDialogComponent } from './parts/google-spot-dialog/google-spot-dialog.component';
import { MemoDialogComponent } from './parts/memo-dialog/memo-dialog.component';
import { MapInfowindowDialogComponent } from './parts/map-infowindow-dialog/map-infowindow-dialog.component';
import { MapComponent } from './pages/map/map.component';
import { PlanPanelComponent } from './parts/plan-panel/plan-panel.component';
import { MyplanComponent } from './pages/myplan/myplan.component';
import { MessageDialogComponent } from './parts/message-dialog/message-dialog.component';
import { SystemErrorComponent } from './pages/system-error/system-error.component';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { PlanDetailPanelComponent } from './pages/plan-detail-panel/plan-detail-panel.component';
import { SpinnerLoadingIndicatorComponent } from './parts/spinner-loading-indicator/spinner-loading-indicator.component';
import { SpotDetailDialogComponent } from './parts/spot-detail-dialog/spot-detail-dialog.component';
import { UserComponent } from './pages/user/user.component';
import { UserplanPostComponent } from './pages/userplan-post/userplan-post.component';
import { HeaderPlanPanelComponent } from './parts/header-plan-panel/header-plan-panel.component';
import { MypageFavoriteListComponent } from './pages/mypage-favoritelist/mypage-favoritelist.component';
import { MypagePlanListComponent } from './pages/mypage-planlist/mypage-planlist.component';
import { MypageUserprofileComponent } from './pages/mypage-userprofile/mypage-userprofile.component';
import { MypageComponent } from './pages/mypage/mypage.component';
import { PlanspotModule } from './pages/planspot/planspot.module';
import { PlanDetailModule } from './pages/plan-detail/plan-detail.module';
import { ImageCropperDialogComponent } from "./parts/image-cropper-dialog/image-cropper-dialog.component";
import { NgDialogAnimationService } from 'ng-dialog-animation';
import { UserPlanListComponent } from './parts/user-plan-list/user-plan-list.component';

export function createTranslateLoader(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

export const CDK_MODULES = [
  OverlayModule
];

export const MATERIAL_MODULES = [
  MatProgressSpinnerModule,
];
@Injectable({providedIn:'root'})

/*export class MyHammerGestureConfig extends HammerGestureConfig {
  buildHammer(element: HTMLElement) {
    const mc = new Hammer(element, this.options);

    mc.get('pinch').set({enable: true});
    mc.get('rotate').set({enable: true});
    mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

    for (const eventName in this.overrides) {
      mc.get(eventName).set(this.overrides[eventName]);
    }
    return mc;
  }
}*/
@NgModule({
  declarations: [
    RootComponent,
    HeaderComponent,
    FooterComponent,
    BlankComponent,
    TopComponent,
    SpotListComponent,
    SpotDetailComponent,
    NavMenuComponent,
    PlanDetailComponent,
    PlanListComponent,
    PlanPanelComponent,
    MyplanComponent,
    MypagePlanListComponent,
    MypageFavoriteListComponent,
    SearchDialogFormComponent,
    SearchDialogFormPlanComponent,
    SystemErrorComponent,
    LanguageComponent,
    MemoDialogComponent,
    UrlcopyDialogComponent,
    MessageDialogComponent,
    MapPanelComponent,
    SpotDetailDialogComponent,
    MypageUserprofileComponent,
    MapComponent,
    AppComponent,
    MapInfowindowDialogComponent,
    MypageComponent,
    HeaderPlanPanelComponent,
    SpinnerLoadingIndicatorComponent,
    UserComponent,
    ConfirmMessageDialogComponent,
    UserplanPostComponent,
    ReviewListPanelComponent,
    ReviewPostDialogComponent,
    RatingCompComponent,
    TransferPanelComponent,
    MapDialogComponent,
    SpotListPanelComponent,
    PlanListPanelComponent,
    PlanDetailPanelComponent,
    PullToRefreshComponent,
    NotfoundComponent,
    GoogleSpotDialogComponent,
    UserprofilePanelComponent,
    ImageCropperDialogComponent,
    UserPlanListComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserTransferStateModule,
    TransferHttpCacheModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    // ngx-translateの登録
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: translateBrowserLoaderFactory,
        deps: [HttpClient,TransferState]
      }
    }),
    BrowserTransferStateModule,
    NgxPageScrollCoreModule,
    NgxPageScrollModule,
    AppRoutingModule,
    // Angular GoogleMapの登録
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyBLOda6eH_CRFBbZbdnpvPGDaHieIVa5RE"
    }),
    AgmDirectionModule,
    // Service Workerの登録
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: [environment.backend],
        sendAccessToken: true
      }
    }),
    UtilsModule,
    SharedModule,
    MaterialModule,
    MatDialogModule,
    MatTooltipModule,
    NgMultiSelectDropDownModule.forRoot(),
    FilterPipeModule,
    NgxMaterialTimepickerModule,
    ...CDK_MODULES,
    ...MATERIAL_MODULES,
    InfiniteScrollModule,
    HammerModule,
    CrystalLightboxModule,
    PlanspotModule,
    PlanDetailModule,
    ImageCropperModule,
  ],
  providers: [
    DataService,
    PermissionService,
    PushService,
    HttpClient,
    SwPush,
    DatePipe,
    Location,
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    { provide: "BASE_HOST_URL", useValue: environment.host },
    { provide: "BASE_API_URL", useValue: environment.backend },
    AuthGuard,
    {provide: MAT_DATE_LOCALE,useValue:"ja-JP"},
    NgDialogAnimationService
    //{ provide: HAMMER_GESTURE_CONFIG, useClass: MyHammerGestureConfig },
    //{ provide: HAMMER_LOADER, useValue: () => import('@egjs/hammerjs').then(m => (window as any)['Hammer'] = m) }
  ],
  entryComponents:[
    MatSpinner,
    SearchDialogFormComponent,
    SearchDialogFormPlanComponent,
    MemoDialogComponent,
    UrlcopyDialogComponent,
    MessageDialogComponent,
    SpotDetailComponent,
    MapPanelComponent,
    SpotDetailDialogComponent,
    MapInfowindowDialogComponent,
    AppComponent,
    SpinnerLoadingIndicatorComponent,
    ConfirmMessageDialogComponent,
    GoogleSpotDialogComponent,
    UserprofilePanelComponent,
    ReviewListPanelComponent,
    ReviewPostDialogComponent,
    TransferPanelComponent,
    MapDialogComponent,
    ImageCropperDialogComponent,
    UserPlanListComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
