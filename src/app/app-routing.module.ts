import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LanguageComponent } from "./language/language.component";
import { BlankComponent } from "./layout/blank/blank.component";
import { RootComponent } from './layout/root/root.component';
import { AuthGuard } from './auth.guard';

import { TopComponent } from './pages/top/top.component';
//import { MapComponent } from './pages/map/map.component';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { SystemErrorComponent } from './pages/system-error/system-error.component';

const routes: Routes = [
  {
    path: ":lang",
    component: LanguageComponent,
    children: [{
      path: "",
      component: RootComponent,
      children: [
        { path: "", redirectTo: "/ja/planspot", pathMatch: "full" },
        { path: "planspot", loadChildren: () => import('./pages/planspot/planspot.module').then(m => m.PlanspotModule) },
        { path: "spots/detail", loadChildren: () => import('./pages/spot-detail/spot-detail.module').then(m => m.SpotDetailModule) },
        { path: "spots/detail/:id", loadChildren: () => import('./pages/spot-detail/spot-detail.module').then(m => m.SpotDetailModule) },
        { path: "plans/detail", loadChildren: () => import('./pages/plan-detail/plan-detail.module').then(m => m.PlanDetailModule) },
        { path: "plans/detail/:id", loadChildren: () => import('./pages/plan-detail/plan-detail.module').then(m => m.PlanDetailModule) },
        { path: "mypage", canActivate: [AuthGuard], loadChildren: () => import('./pages/mypage/mypage.module').then(m => m.MypageModule) },
        { path: "offcial", loadChildren: () => import('./pages/offcial/offcial.module').then(m => m.OffcialModule) },
        { path: "systemerror", component: SystemErrorComponent },
        { path: '404', component: NotfoundComponent }
      ]
    },
    {
      path: "",
      component: BlankComponent,
      children: [
        { path: "top", component: TopComponent }//,
        //{ path: "map", component: MapComponent }
      ]
    },
    { path: "", redirectTo: "/ja/planspot", pathMatch: "full" }
    ],
  },
  { path: "", redirectTo: "/ja/planspot", pathMatch: "full" },
  //{ path: "**", component: NotfoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: "enabled",
    anchorScrolling: "enabled",
    relativeLinkResolution: 'legacy',
    initialNavigation: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
