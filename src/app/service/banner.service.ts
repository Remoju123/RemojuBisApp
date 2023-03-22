import { Inject, Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BannerType } from '../class/banner.class';

@Injectable({
  providedIn: 'root',
})
export class BannerService {
  bannerRef: AngularFirestoreCollection<BannerType>;
  banner: Observable<BannerType[]> | undefined;

  constructor(private db: AngularFirestore) {
    this.bannerRef = this.db.collection<BannerType>('a8', (ref) =>
      ref.orderBy('createDate', 'desc')
    );
  }

  getBannerDoc(id: any) {}

  getBannerList() {
    return this.bannerRef.snapshotChanges().pipe(
      map((datas) =>
        datas.map((d) => {
          const data = d.payload.doc.data() as BannerType;
          const id = d.payload.doc.id;
          return { id, ...data };
        })
      )
    );
  }
}
