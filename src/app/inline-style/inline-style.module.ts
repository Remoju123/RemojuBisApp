import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InlineStyleComponent } from './inline-style.component';

@NgModule({
  declarations: [InlineStyleComponent],
  imports: [CommonModule],
  exports:[InlineStyleComponent]
})
export class InlineStyleModule { }
