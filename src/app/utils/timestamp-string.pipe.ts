import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "timestampString"
})
export class TimestampStringPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (typeof value === "string") {
      if (value.match(/:/)) {
        const _val = value.split(":");
        return _val[0] + ":" + _val[1];
      }
    }
    return value;
  }
}
