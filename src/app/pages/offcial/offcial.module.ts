import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';
import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core';
import { NgxPageScrollModule } from 'ngx-page-scroll';

import { OffcialRoutingModule } from './offcial-routing.module';
import { OffcialComponent } from './offcial.component';
import { ContactFormComponent } from './contact-form/contact-form.component';

@NgModule({
  declarations: [
    OffcialComponent,
    ContactFormComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    OffcialRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPageScrollCoreModule,
    NgxPageScrollModule
  ],
})
export class OffcialModule {}
