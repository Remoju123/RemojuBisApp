import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactFormComponent } from './contact-form/contact-form.component';

import { GsapComponent } from './guide/gsap/gsap.component';
import { SampleComponent } from './guide/sample/sample.component';
import { Guide2Component } from './guide/guide2/guide2.component';

const routes: Routes = [
  //{ path: '', redirectTo: 'privacy', pathMatch: 'full' },
  {
    path: 'about',
    loadChildren: () =>
      import('./about/about.module').then((m) => m.AboutModule),
  },
  {
    path: 'guide',
    loadChildren: () =>
      import('./guide/guide.module').then((m) => m.GuideModule),
  },
  {
    path: 'privacy',
    loadChildren: () =>
      import('./privacy/privacy.module').then((m) => m.PrivacyModule),
  },
  { path: 'contact', component: ContactFormComponent },

  { path: 'gsap', component: GsapComponent },
  { path: 'sample', component: SampleComponent },
  { path: 'guide2', component: Guide2Component },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OffcialRoutingModule {}
