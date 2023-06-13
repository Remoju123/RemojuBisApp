import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';

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
  ],
})
export class OffcialModule {}
