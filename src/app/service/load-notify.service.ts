import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadNotifyService {
  private requestLoad = new Subject<any>();
  public requestLoad$ = this.requestLoad.asObservable();

  public notify(): void {
    this.requestLoad.next();
  }
}