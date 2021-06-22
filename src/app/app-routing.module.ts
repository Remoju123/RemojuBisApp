import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LanguageComponent } from "./language/language.component";
import { BlankComponent} from "./layout/blank/blank.component";
import { RootComponent } from './layout/root/root.component';
import { AuthGuard } from './auth.guard';

import { TopComponent } from './pages/top/top.component';
import { SpotListComponent } from './pages/spot-list/spot-list.component';
import { PlanListComponent } from './pages/plan-list/plan-list.component';
import { SpotDetailComponent } from './pages/spot-detail/spot-detail.component';

const routes: Routes = [
  {
    path: ":lang",
    component: LanguageComponent,
    children: [{
      path:"",
      component:RootComponent,
      children:[
        { path: "top", component: TopComponent },
        { path: "spots", component: SpotListComponent },
        // { path: "keihankyoto/spots", component: SpotListComponent },
        {
          path: "spots/detail",
          component: SpotDetailComponent
        },
        {
          path: "spots/detail/:id",
          component: SpotDetailComponent
        },
        // // { path: "keihankyoto/plans", component: PlanListComponent },
        { path: "plans", component: PlanListComponent },
        // { path: "plans/detail", component: PlanDetailComponent },
        // { path: "plans/detail/:id", component: PlanDetailComponent },
        // { path: "mypage", component: MypageComponent, canActivate:[AuthGuard] },
        // { path: "sharedplan/:id", component: SpotListComponent },
        // { path: "user/:id", component: UserComponent },
        // { path: "**", redirectTo: "404", pathMatch: "full" },
        // { path: "home", component: TopComponent },
        // { path: "systemerror", component: SystemErrorComponent },
        // { path: '404', component: NotfoundComponent },
      ]
    },
    {
      path:"",
      component:BlankComponent,
      children:[
        // { path: "map", component: MapComponent }
      ]
    }]
  },
  { path: "**", redirectTo: "/ja/top", pathMatch: "full" }
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
