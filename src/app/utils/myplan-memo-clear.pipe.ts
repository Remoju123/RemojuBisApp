import { ContentObserver } from '@angular/cdk/observers';
import { Pipe, PipeTransform } from '@angular/core';
import { validateEventsArray } from '@angular/fire/compat/firestore';
import { Console } from 'console';
import { MyPlanApp } from '../class/common.class';

@Pipe({
  name: 'memo-clear',
})
export class MyplanMemoClearPipe implements PipeTransform {
  transform(value: MyPlanApp, args?: any): any {
    const new_ps = value.planSpots.reduce((target, obj, index) => {
      if (obj.memo !== '') {
        obj.memo = '';
      }
      target[index] = obj;
      return target;
    }, {});

    return null;
  }
}
