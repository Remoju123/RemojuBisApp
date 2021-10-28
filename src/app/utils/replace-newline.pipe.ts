import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "replaceNewline"
})
export class ReplaceNewlinePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (typeof value === "string") {
      var regexp_url = /((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))/g; // ']))/;
      var regexp_makeLink = function(all, url, h, href) {
          return '<a href="h' + href + '" target="_blank">' + url + '</a>';
      }
      value = value.replace(regexp_url, regexp_makeLink);
      return value.replace(/\n|\r/g, "<br>");
    } else {
      return value;
    }
  }
}
