import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';

import { OffcialRoutingModule } from './offcial-routing.module';
import { OffcialComponent } from './offcial.component';
import { ContactFormComponent } from './contact-form/contact-form.component';

import { GsapComponent } from './guide/gsap/gsap.component';
import { SampleComponent } from './guide/sample/sample.component';
import { Guide2Component } from './guide/guide2/guide2.component';

@NgModule({
  declarations: [
    OffcialComponent,
    ContactFormComponent,
    GsapComponent,
    SampleComponent,
    Guide2Component,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    OffcialRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class OffcialModule {}
