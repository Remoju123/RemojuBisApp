import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { OffcialRoutingModule } from './offcial-routing.module';
import { OffcialComponent } from './offcial.component';
import { ContactFormComponent } from './contact-form/contact-form.component';

import { AboutModule } from './about/about.module';


@NgModule({
  declarations: [
    OffcialComponent,
    ContactFormComponent
  ],
  imports: [
    CommonModule,
    OffcialRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    
  ]
})
export class OffcialModule { }
