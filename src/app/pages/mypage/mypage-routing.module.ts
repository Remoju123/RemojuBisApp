import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MypageComponent } from './mypage.component';

const routes: Routes = [
  {
    path:'',
    component:MypageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MypageRoutingModule { }
