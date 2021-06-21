// import { Pipe, PipeTransform } from "@angular/core";

// @Pipe({
//   name: "htmlEncode"
// })
// export class HtmlEncodePipe implements PipeTransform {
//   transform(value: any, args?: any): any {
//     let _value = null;
//     if (value !== null) {
//       _value = value.replace(/\r?\n/g, "").replace(/\s+/g, "");
//     }

//     if (_value !== null) {
//       return _value.replace(/[<>&"'`]/g, (match: string | number) => {
//         const escape = {
//           "<": "&lt;",
//           ">": "&gt;",
//           "&": "&amp;",
//           // tslint:disable-next-line
//           '"': "&quot;",
//           "'": "&#39;",
//           "`": "&#x60;"
//         };
//         return escape[match]
//       });
//     }
//   }
// }
