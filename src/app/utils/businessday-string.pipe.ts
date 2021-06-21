import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "businessdayString"
})
export class BusinessdayStringPipe implements PipeTransform {
  // 定休日
  businessday: any[] = [
    { id: 1, text: "月" },
    { id: 2, text: "火" },
    { id: 3, text: "水" },
    { id: 4, text: "木" },
    { id: 5, text: "金" },
    { id: 6, text: "土" },
    { id: 7, text: "日" },
    { id: 8, text: "祝" },
    { id: 9, text: "不定休" },
    { id: 0, text: "無休" }
  ];

  transform(value: any, args?: any): any {
    return null;
  }
}
