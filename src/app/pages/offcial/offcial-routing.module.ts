import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PrivacyComponent } from './privacy/privacy.component';
import { GuideComponent } from './guide/guide.component';
import { AboutComponent } from './about/about.component';
import { OffcialComponent } from './offcial.component';

const routes: Routes = [
  //{ path: '', redirectTo: 'privacy', pathMatch: 'full' },
  { path: 'about', component: AboutComponent },
  { path: 'guide', component: GuideComponent },
  { path: 'privacy', component: PrivacyComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OffcialRoutingModule { }
