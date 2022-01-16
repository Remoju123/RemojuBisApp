import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpotDetailComponent } from './spot-detail.component';


const routes: Routes = [
  {
    path: '',
    component:SpotDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpotDetailRoutingModule { }
