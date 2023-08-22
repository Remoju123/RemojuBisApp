import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LanguageComponent } from './language/language.component';
import { BlankComponent } from './layout/blank/blank.component';
import { RootComponent } from './layout/root/root.component';
import { AuthGuard } from './auth.guard';

import { TopComponent } from './pages/top/top.component';
//import { MapComponent } from './pages/map/map.component';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { SystemErrorComponent } from './pages/system-error/system-error.component';

const routes: Routes = [
  {
    path: ':lang',
    component: LanguageComponent,
    children: [
      {
        path: '',
        component: RootComponent,
        children: [
          { path: '', redirectTo: '/ja/planspot', pathMatch: 'full' },
          {
            path: 'planspot',
            title: 'みんなのおすすめ一覧',
            loadChildren: () =>
              import('./pages/planspot/planspot.module').then(
                (m) => m.PlanspotModule
              ),
          },
          {
            path: 'spots/detail',
            title: 'スポット詳細',
            loadChildren: () =>
              import('./pages/spot-detail/spot-detail.module').then(
                (m) => m.SpotDetailModule
              ),
          },
          {
            path: 'spots/detail/:id',
            title: 'スポット詳細',
            loadChildren: () =>
              import('./pages/spot-detail/spot-detail.module').then(
                (m) => m.SpotDetailModule
              ),
          },
          {
            path: 'plans/detail',
            title: 'プラン詳細',
            loadChildren: () =>
              import('./pages/plan-detail/plan-detail.module').then(
                (m) => m.PlanDetailModule
              ),
          },
          {
            path: 'plans/detail/:id',
            title: 'プラン詳細',
            loadChildren: () =>
              import('./pages/plan-detail/plan-detail.module').then(
                (m) => m.PlanDetailModule
              ),
          },
          {
            path: 'userplans/:id',
            title: 'ユーザープラン',
            loadChildren: () =>
              import('./pages/user-plan-list/user-plan-list.module').then(
                (m) => m.UserPlanListModule
              ),
          },
          {
            path: 'mypage',
            title: 'マイページ',
            canActivate: [AuthGuard],
            loadChildren: () =>
              import('./pages/mypage/mypage.module').then(
                (m) => m.MypageModule
              ),
          },
          {
            path: 'mypage#list',
            title: 'マイページ',
            canActivate: [AuthGuard],
            loadChildren: () =>
              import('./pages/mypage/mypage.module').then(
                (m) => m.MypageModule
              ),
          },
          {
            path: 'offcial',
            title: '運営会社・利用規約・',
            loadChildren: () =>
              import('./pages/offcial/offcial.module').then(
                (m) => m.OffcialModule
              ),
          },
          { path: 'systemerror', component: SystemErrorComponent },
          { path: '404', component: NotfoundComponent },
        ],
      },
      {
        path: '',
        component: BlankComponent,
        children: [
          { path: 'top', component: TopComponent }, //,
          //{ path: "map", component: MapComponent }
        ],
      },
      { path: '', redirectTo: '/ja/planspot', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: '/ja/planspot', pathMatch: 'full' },
  { path: '**', component: NotfoundComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      relativeLinkResolution: 'legacy',
      initialNavigation: 'enabledBlocking',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
