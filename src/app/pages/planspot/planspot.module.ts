import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PlanspotRoutingModule } from './planspot-routing.module';
import { PlanspotComponent } from './planspot.component';
import { PlanspotSelectorComponent } from './components/planspot-selector/planspot-selector.component';
import { PlanspotListComponent } from './components/planspot-list/planspot-list.component';
import { PlanspotListItemComponent } from './components/planspot-list-item/planspot-list-item.component';

import { MaterialModule } from '../../material/material.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { UtilsModule } from '../../utils/utils.module';
import { TranslateModule } from '@ngx-translate/core';
import { SearchDialogComponent } from './components/search-dialog/search-dialog.component';

import { NgxLoadingModule } from 'ngx-loading';

import { environment } from '../../../environments/environment';
import { AgmCoreModule } from '@agm/core';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';

import { AngularFireModule } from '@angular/fire/compat';
@NgModule({
  declarations: [
    PlanspotComponent,
    PlanspotSelectorComponent,
    PlanspotListComponent,
    PlanspotListItemComponent,
    SearchDialogComponent,
  ],
  imports: [
    CommonModule,
    PlanspotRoutingModule,
    MaterialModule,
    InfiniteScrollModule,
    UtilsModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    NgxLoadingModule.forRoot({}),
    AgmCoreModule.forRoot({
      apiKey: environment.apiKey,
      libraries: ['places', 'geometry'], //,
      //language: localStorage && localStorage.gml || 'ja'
    }),
    MatGoogleMapsAutocompleteModule,
    AngularFireModule.initializeApp(environment.firebase),
  ],
  exports: [
    PlanspotComponent,
    PlanspotListComponent,
    PlanspotListItemComponent,
    PlanspotSelectorComponent,
  ],
})
export class PlanspotModule {}
