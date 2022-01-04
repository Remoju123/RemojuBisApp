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
import { PlanDetailComponent } from './pages/plan-detail/plan-detail.component';
import { MapComponent } from './pages/map/map.component';
import { MypageComponent } from './pages/mypage/mypage.component';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { SystemErrorComponent } from './pages/system-error/system-error.component';
import { UserComponent } from './pages/user/user.component';
// official
import { PrivacyComponent } from './pages/offcial/privacy/privacy.component';
import { AboutComponent } from './pages/offcial/about/about.component';
import { GuideComponent } from './pages/offcial/guide/guide.component';


const routes: Routes = [
  {
    path: ":lang",
    component: LanguageComponent,
    children: [{
      path:"",
      component:RootComponent,
      children:[
        { path: "planspot",loadChildren:() => import('./pages/planspot/planspot.module').then(m => m.PlanspotModule)},
        { path: "spots", component: SpotListComponent },
        { path: "spots/detail", component: SpotDetailComponent},
        { path: "spots/detail/:id", component: SpotDetailComponent},
        { path: "plans", component: PlanListComponent },
        { path: "plans/detail", component: PlanDetailComponent },
        { path: "plans/detail/:id", component: PlanDetailComponent },
        { path: "mypage", component: MypageComponent, canActivate:[AuthGuard] },
        { path: "user/:id", component: UserComponent },
        { path: "home", component: TopComponent },
        { path: "systemerror", component: SystemErrorComponent },
        { path: "", redirectTo:"/ja/planspot",pathMatch:"full" },
        { path: '404', component: NotfoundComponent },
        { path: 'privacy',component:PrivacyComponent},
        { path: 'about',component:AboutComponent},
        { path: 'guide',component:GuideComponent}
      ]
    },
    {
      path:"",
      component:BlankComponent,
      children:[
        { path: "top", component: TopComponent },
        { path: "map", component: MapComponent }
      ]
    },
  ]
  },
  { path: "", redirectTo: "/ja/planspot",pathMatch:"full"},
  { path: "**", redirectTo: "/ja/planspot", pathMatch: "full" }
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
