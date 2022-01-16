import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OffcialRoutingModule } from './offcial-routing.module';
import { OffcialComponent } from './offcial.component';


@NgModule({
  declarations: [
    OffcialComponent
  ],
  imports: [
    CommonModule,
    OffcialRoutingModule
  ]
})
export class OffcialModule { }
