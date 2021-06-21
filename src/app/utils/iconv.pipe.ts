import { Pipe, PipeTransform } from "@angular/core";
import * as iconv from "iconv-lite";
import { Buffer as buffer } from "buffer";

@Pipe({
  name: "iconv"
})
export class IconvPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    const codecfrom = "ISO-8859-1";
    const codecto = "UTF-8";
    if (typeof value === "string") {
      const encoded = iconv.encode(value, codecfrom);
      return iconv.decode(buffer.from(encoded), codecto);
    }
    return null;
  }
}
