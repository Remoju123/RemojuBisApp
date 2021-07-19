import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlanspotRoutingModule } from './planspot-routing.module';
import { PlanspotComponent } from './planspot.component';
import { PlanspotSelectorComponent } from './components/planspot-selector/planspot-selector.component';
import { PlanspotListComponent } from './components/planspot-list/planspot-list.component';
import { PlanspotListItemComponent } from './components/planspot-list-item/planspot-list-item.component';

//import { MatCardModule } from '@angular/material/card';
import { MaterialModule } from "../../material/material.module";
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { UtilsModule } from "../../utils/utils.module";


@NgModule({
  declarations: [
    PlanspotComponent,
    PlanspotSelectorComponent,
    PlanspotListComponent,
    PlanspotListItemComponent
  ],
  imports: [
    CommonModule,
    PlanspotRoutingModule,
    //MatCardModule,
    MaterialModule,
    InfiniteScrollModule,
    UtilsModule
  ],
  exports: [
    PlanspotComponent
  ]
})
export class PlanspotModule { }
