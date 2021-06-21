import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "langFilter"
})
export class LangFilterPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    const lang = args === undefined ? "ja" : args;
    if (typeof value === "string") {
      try {
        const arr = JSON.parse(value);
        return arr.filter((x: { lang: any; }) => x.lang === lang)[0].text;
      } catch {
        const res = value
          .slice(1)
          .slice(0, -1)
          .split(",");
        if (res[0] !== "") {
          const ret =
            "[" + JSON.parse(JSON.stringify(res[0] + "," + res[1])) + "]";
          // console.log(JSON.parse(JSON.stringify(res[0] + "," + res[1])));
          const arr = JSON.parse(ret);
          return arr.filter((x: { lang: any; }) => x.lang === lang)[0].text;
        }
      }
    } else if (Array.isArray(value)) {
      try {
        return value.filter(x => x.lang === lang)[0].text;
      } catch {
        return value;
      }
    } else {
      return value;
    }
  }
}
