// ====================
// PushNotificationサービス
//   Push通知のリクエストとキャンセル
// ====================

import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { SwPush } from "@angular/service-worker";
import { Alarm } from "../class/alarm.class";
import { Catch, getNowStr, promiseError } from "../class/log.class";

@Injectable()
export class PushService {
  // アプリサーバーの公開鍵
  publicKey = "";
  // Pushサービスの許可情報
  pushSubscription: PushSubscription;

  constructor(private http: HttpClient, private swPush: SwPush) {}

  // アプリサーバーへPush通知の予約
  @Catch()
  async pushReq(alarm: Alarm) {
    // Pushサービスから許可情報の取得
    this.pushSubscription = await this.getPushSubscription().catch(e =>
      promiseError()
    );

    // アプリサーバーへPush通知のリクエスト
    const alarmNotification = {
      pushSubscription: this.pushSubscription,
      ...alarm,
      baseUrl: location.protocol + "//" + location.host
    };
    console.log("Push通知リクエスト");
    console.dir(alarmNotification);

    // アップロード実行
    const headers = new HttpHeaders({ "Cache-Control": "no-cache" });
    headers.append("Content-Type", "application/json");
    const res: any = await this.http
      .post("/api/addAlarm", alarmNotification, { headers })
      .toPromise()
      .catch(e => promiseError());
    console.dir(res);
    if (res.success) {
      console.log("アプリサーバーへのアップロード成功");
      return true;
    } else {
      throw new Error(`アプリサーバーへのアップロードで
          falseが返されました`);
    }
  }

  // Pushサービスから許可情報取得
  @Catch()
  private async getPushSubscription() {
    // 動作環境の確認(Push機能を利用可能か?)
    if (!("serviceWorker" in navigator)) {
      throw new Error("ServiceWorkerがサポートされていません");
    }
    if (!this.swPush.isEnabled) {
      throw new Error("現在 swPushが使えません");
    }
    if (!navigator.onLine) {
      throw new Error("現在 オフラインのためPush通知予約できません");
    }
    // アプリサーバから公開キーを取得
    const headers = new HttpHeaders({ "Cache-Control": "no-cache" });
    const res: any = await this.http
      .get("/api/pubKey", { headers })
      .toPromise()
      .catch(e => promiseError());
    console.log(res);
    if (res.success) {
      this.publicKey = res.data;
      console.log("アプリサーバー公開鍵=" + this.publicKey);
    } else {
      throw new Error(`アプリサーバーの公開キー取得失敗`);
    }
    // Pushサービスから許可情報を取得
    const ret: any = await this.swPush
      .requestSubscription({ serverPublicKey: this.publicKey })
      .catch(e => {
        console.log("@@@" + e);
        promiseError();
      });
    console.dir(ret);
    if (ret) {
      console.log(getNowStr() + " Pushサービスから許可情報取得");
      return ret;
    } else {
      throw new Error("PushSubscriptionが空白");
    }
  }

  // 予約したPush通知のキャンセル
  @Catch()
  async cancelReq(alarm: Alarm) {
    const headers = new HttpHeaders({ "Cache-Control": "no-cache" });
    headers.append("Content-Type", "application/json");
    const ret: any = await this.http
      .post("/api/removeAlarm", { id: alarm.id }, { headers })
      .toPromise();
    if (ret.success) {
      return true;
    } else {
      throw new Error("Push通知のキャンセルに失敗しました" + ret.data);
    }
  }
}
