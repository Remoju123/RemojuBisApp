import { NgModule } from '@angular/core';
import { LangFilterPipe } from './lang-filter.pipe';
import { TimestampStringPipe } from './timestamp-string.pipe';
import { BusinessdayStringPipe } from './businessday-string.pipe';

import { CarouselModule } from 'ngx-owl-carousel-o';
import { ReplaceNewlinePipe } from './replace-newline.pipe';
import { SafeUrlPipe } from './safe-url.pipe';
//import { IconvPipe } from "./iconv.pipe";
import { MyplanMemoClearPipe } from './myplan-memo-clear.pipe';

@NgModule({
  imports: [
    //
    CarouselModule,
  ],
  declarations: [
    LangFilterPipe,
    TimestampStringPipe,
    BusinessdayStringPipe,
    ReplaceNewlinePipe,
    SafeUrlPipe,
    MyplanMemoClearPipe,
  ],
  exports: [
    LangFilterPipe,
    TimestampStringPipe,
    BusinessdayStringPipe,
    CarouselModule,
    ReplaceNewlinePipe,
    SafeUrlPipe,
    MyplanMemoClearPipe,
  ],
})
export class UtilsModule {}
