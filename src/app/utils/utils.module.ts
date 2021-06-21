import { NgModule } from "@angular/core";
import { LangFilterPipe } from "./lang-filter.pipe";
import { TimestampStringPipe } from "./timestamp-string.pipe";
import { BusinessdayStringPipe } from "./businessday-string.pipe";

import { CarouselModule } from "ngx-owl-carousel-o";
import { ReplaceNewlinePipe } from "./replace-newline.pipe";
import { SafeUrlPipe } from "./safe-url.pipe";
//import { IconvPipe } from "./iconv.pipe";

@NgModule({
  imports: [
    //
    CarouselModule
  ],
  declarations: [
    LangFilterPipe,
    TimestampStringPipe,
    BusinessdayStringPipe,
    ReplaceNewlinePipe,
    SafeUrlPipe,
    //IconvPipe
  ],
  exports: [
    LangFilterPipe,
    TimestampStringPipe,
    BusinessdayStringPipe,
    CarouselModule,
    ReplaceNewlinePipe,
    SafeUrlPipe,
    //IconvPipe
  ],
  entryComponents: [
    //
  ]
})
export class UtilsModule {}
