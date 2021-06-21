import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "htmlDecode"
})
export class HtmlDecodePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (value !== null) {
      return (
        value
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&")
          // tslint:disable-next-line
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&#x60;/g, "`")
          .replace(/&#044;/g, ",")
      );
    }
  }
}
