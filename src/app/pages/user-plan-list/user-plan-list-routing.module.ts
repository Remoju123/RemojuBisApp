import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserPlanListComponent } from './user-plan-list.component';

const routes: Routes = [
  {
    path: '',
    component: UserPlanListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserPlanListRoutingModule { }
