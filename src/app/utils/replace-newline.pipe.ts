import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "replaceNewline"
})
export class ReplaceNewlinePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (typeof value === "string") {
      return value.replace(/\n|\r/g, "<br>");
    } else {
      return value;
    }
  }
}
