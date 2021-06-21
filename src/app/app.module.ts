import { Injectable, NgModule } from '@angular/core';
import { BrowserModule, HammerModule, HammerGestureConfig, 
  HAMMER_GESTURE_CONFIG, HAMMER_LOADER, TransferState } from '@angular/platform-browser';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClient,  HttpClientModule} from "@angular/common/http";

import { AppComponent } from './app.component';
import { ServiceWorkerModule, SwPush } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

// Materialモジュール
import { MaterialModule } from "./material/material.module";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  MatProgressSpinnerModule,
  MatSpinner
} from "@angular/material/progress-spinner";
import { MAT_DATE_LOCALE } from '@angular/material/core';
import Hammer from '@egjs/hammerjs';
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


import { PullToRefreshComponent } from './parts/pull-to-refresh/pull-to-refresh.component';
import { NavMenuComponent } from './parts/nav-menu/nav-menu.component';
import { ConfirmMessageDialogComponent } from './parts/confirm-message-dialog/confirm-message-dialog.component';

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

export class MyHammerGestureConfig extends HammerGestureConfig {
  buildHammer(element: HTMLElement) {
    const mc = new Hammer(element, this.options);

    mc.get('pinch').set({enable: true});
    mc.get('rotate').set({enable: true});

    for (const eventName in this.overrides) {
      mc.get(eventName).set(this.overrides[eventName]);
    }
    return mc;
  }
}
@NgModule({
  declarations: [
    RootComponent,
    HeaderComponent,
    FooterComponent,
    BlankComponent,
    TopComponent,
    // SpotListComponent,
    // SpotDetailComponent,
    NavMenuComponent,
    // PlanListComponent,
    // PlanDetailComponent,
    // PlanListComponent,
    // PlanPanelComponent,
    // MyplanComponent,
    // MypagePlanListComponent,
    // MypageFavoriteListComponent,
    // SearchDialogFormComponent,
    // SearchDialogFormPlanComponent,
    // SystemErrorComponent,
    LanguageComponent,
    // MemoDialogComponent,
    // UrlcopyDialogComponent,
    // MessageDialogComponent,
    // MapPanelComponent,
    // SpotDetailDialogComponent,
    // MypageUserprofileComponent,
    // MapComponent,
    AppComponent,
    // MapInfowindowDialogComponent,
    // MypageComponent,
    // HeaderPlanPanelComponent,
    // SpinnerLoadingIndicatorComponent,
    // UserComponent,
    // ConfirmMessageDialogComponent,
    // UserplanPostComponent,
    // ReviewListPanelComponent,
    // ReviewPostDialogComponent,
    // RatingCompComponent,
    // TransferPanelComponent,
    // MapDialogComponent,
    // SpotListPanelComponent,
    // PlanListPanelComponent,
    // PlanDetailPanelComponent,
    PullToRefreshComponent,
    // NotfoundComponent,
    // GoogleSpotDialogComponent,
    // UserprofilePanelComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
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
    NgxPageScrollCoreModule,
    NgxPageScrollModule,
    AppRoutingModule,
    // Angular GoogleMapの登録
    // AgmCoreModule.forRoot({
    //   apiKey: "AIzaSyBLOda6eH_CRFBbZbdnpvPGDaHieIVa5RE"
    // }),
    // AgmDirectionModule,
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
    MatTooltipModule,
    NgMultiSelectDropDownModule.forRoot(),
    FilterPipeModule,
    NgxMaterialTimepickerModule,
    ...CDK_MODULES,
    ...MATERIAL_MODULES,
    InfiniteScrollModule,
    HammerModule,
    CrystalLightboxModule,
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
    { provide: HAMMER_GESTURE_CONFIG, useClass: MyHammerGestureConfig },
    { provide: HAMMER_LOADER, useValue: () => import('@egjs/hammerjs').then(m => (window as any)['Hammer'] = m) }
  ],
  entryComponents:[
    MatSpinner,
    // SearchDialogFormComponent,
    // SearchDialogFormPlanComponent,
    // MemoDialogComponent,
    // UrlcopyDialogComponent,
    // MessageDialogComponent,
    // SpotDetailComponent,
    // MapPanelComponent,
    // SpotDetailDialogComponent,
    // MapInfowindowDialogComponent,
    AppComponent,
    // SpinnerLoadingIndicatorComponent,
    ConfirmMessageDialogComponent,
    // GoogleSpotDialogComponent,
    // UserprofilePanelComponent,
    // ReviewListPanelComponent,
    // ReviewPostDialogComponent,
    // TransferPanelComponent,
    // MapDialogComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
