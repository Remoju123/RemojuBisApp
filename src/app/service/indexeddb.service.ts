import { isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { environment } from "../../environments/environment";
import { MyPlanApp, Recommended } from "../class/common.class";
import { ListSearchCondition, MyPlan } from "../class/indexeddb.class";

@Injectable({
  providedIn: "root"
})
export class IndexedDBService {
  constructor(@Inject(PLATFORM_ID) private platformId:Object) { }

  // DB
  dbName = "Remoju";
  version = 5;

  // オブジェクトストア
  storeListSearchCondition = "ListSearchCondition";
  storeListSearchConditionSpot = "ListSearchConditionSpot";
  storeListSearchConditionPlan = "ListSearchConditionPlan";
  storeMyplan = "Myplan";
  storeGuid = "Guid";
  storeHistorySpot = "HistorySpot";
  storeHistoryPlan = "HistoryPlan";

  async getListSearchCondition(){
    return this.getStoreValue(this.storeListSearchCondition);
  }

  // スポット一覧検索条件取得
  async getListSearchConditionSpot() {
    return this.getStoreValue(this.storeListSearchConditionSpot);
  }

  // プラン一覧検索条件取得
  async getListSearchConditionPlan() {
    return this.getStoreValue(this.storeListSearchConditionPlan);
  }

  // プラン取得
  async getEditPlan(isApi = false) {
    let result: any = await this.getStoreValue(this.storeMyplan);
    const myPlan: MyPlan = result;

    if (myPlan && myPlan.lastUpdatetime) {
      // 現在日付
      const now = new Date().getTime();

      // 有効期間を過ぎていたら削除
      if ((now - Date.parse(myPlan.lastUpdatetime)) / 86400000 > environment.indexeddbValidityPeriod) {
        this.clearMyPlan();
        return null;
      }
    }

    // APIに渡す場合はFileを削除
    if (isApi && myPlan) {
      if (myPlan.pictureFile) {
        myPlan.pictureFile = null;
      }
      myPlan.planSpots.forEach(x => {
        if (x.planUserpictures) {
          x.planUserpictures.forEach(y => y.pictureFile = null);
        }
      });
    }

    return myPlan;
  }

  // GUID取得
  async getGuid(){
    return this.getStoreValue(this.storeGuid);
  }

  // スポット閲覧履歴取得
  async getHistorySpot(){
    return this.getStoreValue(this.storeHistorySpot);
  }

  // プラン閲覧履歴取得
  async getHistoryPlan(){
    return this.getStoreValue(this.storeHistoryPlan);
  }

  async registListSearchCondition(value: ListSearchCondition) {
    return this.registStore(this.storeListSearchCondition, value);
  }

  // スポット一覧検索条件保存
  async registListSearchConditionSpot(value: ListSearchCondition) {
    return this.registStore(this.storeListSearchConditionSpot, value);
  }

  // プラン一覧検索条件保存
  async registListSearchConditionPlan(value: ListSearchCondition) {
    return this.registStore(this.storeListSearchConditionPlan, value);
  }

  // プラン保存
  async registPlan(myPlanApp: MyPlanApp){
    // 保存用クラスに変換
    let myPlan = new MyPlan();
    myPlan = {
      isSaved: myPlanApp.isSaved,
      isTransferSearch: myPlanApp.isTransferSearch,
      planUserId: myPlanApp.planUserId,
      isBus: myPlanApp.isBus,
      travelDate: myPlanApp.travelDate,
      planName: myPlanApp.planName,
      pictureFile: myPlanApp.pictureFile,
      imageCropped: myPlanApp.imageCropped,
      cropperPosition: myPlanApp.cropperPosition,
      aspectRatio: myPlanApp.aspectRatio,
      pictureUrl: myPlanApp.pictureUrl,
      picturePreviewUrl: myPlanApp.picturePreviewUrl,
      planExplanation: myPlanApp.planExplanation,
      memo: myPlanApp.memo,
      areaId: myPlanApp.areaId,
      areaId2: myPlanApp.areaId2,
      categories: myPlanApp.categories,
      timeRequired: myPlanApp.timeRequired,
      isShare: myPlanApp.isShare,
      basePlanId: myPlanApp.basePlanId,
      timeRequiredDisp: myPlanApp.timeRequiredDisp,
      startTime: myPlanApp.startTime,
      lastUpdatetime: new Date().toLocaleString(),
      planSpots: myPlanApp.planSpots.reduce((x, c) => {
        x.push({
          type: c.type,
          displayOrder: c.displayOrder,
          spotId: c.spotId,
          spotName: c.spotName,
          memo: c.memo,
          latitude: c.latitude,
          longitude: c.longitude,
          startTime: c.startTime,
          stayTime: c.stayTime,
          aspectRatio: c.aspectRatio,
          transfer: c.transfer,
          basePlanId: c.basePlanId,
          line: c.line,
          transtime: c.transtime,
          transflow: c.transflow,
          planUserpictures: c.planUserpictures
        });
        return x;
      }, []),
      startPlanSpot: myPlanApp.startPlanSpot ? {
        type: myPlanApp.startPlanSpot.type,
        displayOrder: myPlanApp.startPlanSpot.displayOrder,
        spotId: myPlanApp.startPlanSpot.spotId,
        spotName: myPlanApp.startPlanSpot.spotName,
        memo: myPlanApp.startPlanSpot.memo,
        latitude: myPlanApp.startPlanSpot.latitude,
        longitude: myPlanApp.startPlanSpot.longitude,
        startTime: myPlanApp.startPlanSpot.startTime,
        stayTime: myPlanApp.startPlanSpot.stayTime,
        aspectRatio: null,
        transfer: myPlanApp.startPlanSpot.transfer,
        basePlanId: null,
        line: myPlanApp.startPlanSpot.line,
        transtime: myPlanApp.startPlanSpot.transtime,
        transflow: myPlanApp.startPlanSpot.transflow,
        planUserpictures: myPlanApp.startPlanSpot.planUserpictures
     } : null,
      endPlanSpot: myPlanApp.endPlanSpot ? {
        type: myPlanApp.endPlanSpot.type,
        displayOrder: myPlanApp.endPlanSpot.displayOrder,
        spotId: myPlanApp.endPlanSpot.spotId,
        spotName: myPlanApp.endPlanSpot.spotName,
        memo: myPlanApp.endPlanSpot.memo,
        latitude: myPlanApp.endPlanSpot.latitude,
        longitude: myPlanApp.endPlanSpot.longitude,
        startTime: myPlanApp.endPlanSpot.startTime,
        stayTime: myPlanApp.endPlanSpot.stayTime,
        aspectRatio: null,
        transfer: myPlanApp.endPlanSpot.transfer,
        basePlanId: null,
        line: myPlanApp.endPlanSpot.line,
        transtime: myPlanApp.endPlanSpot.transtime,
        transflow: myPlanApp.endPlanSpot.transflow,
        planUserpictures: myPlanApp.endPlanSpot.planUserpictures
     } : null
    };

    // 保存
    return this.registStore(this.storeMyplan, myPlan);
  }
/*
  // ImageCropperEventがそのままだと保存できないので変換
  getImageCropper(event: ImageCroppedEvent) : ImageCropped{
    let imageCropped = new ImageCropped();
    if (event) {
      imageCropped.base64 = event.base64;
      imageCropped.cropperPosition = event.cropperPosition;
      imageCropped.height = event.height;
      imageCropped.imagePosition = event.imagePosition;
      imageCropped.offsetImagePosition = event.offsetImagePosition;
      imageCropped.width = event.width;
    }
    return imageCropped;
  }
*/
  // GUID保存
  async registGuid(value: string) {
    return this.registStore(this.storeGuid, value);
  }

  // スポット閲覧履歴追加保存
  async registHistorySpot(value: Recommended) {
    let spot: any = await this.getHistorySpot();
    const addSpot = this.addHistory(spot, value);
    return this.registStore(this.storeHistorySpot, addSpot);
  }

  // プラン閲覧履歴追加保存
  async registHistoryPlan(value: Recommended) {
    let plan: any = await this.getHistoryPlan();
    const addPlan = this.addHistory(plan, value);
    return this.registStore(this.storeHistoryPlan, addPlan);
  }

  // 閲覧履歴追加
  addHistory(history: any, value: Recommended){
    let addHistory: Recommended[] = history;
    // 同じスポットIDが存在する場合は削除
    if (addHistory){
      const sameSpotIdx = addHistory.findIndex(x => x.spotPlanID === value.spotPlanID);
      if (sameSpotIdx >= 0){
        addHistory.splice(sameSpotIdx, 1);
      }
      // 最大10件保持するので、超える場合は古い履歴を1件削除
      if (addHistory.length === 10){
        addHistory.splice(0, 1);
      }
      // 履歴を追加
      addHistory.push(value);
    } else {
      // 履歴を追加
      addHistory = [value];
    }
    return addHistory;
  }

  // プランを削除
  async clearMyPlan(){
    return this.clearStore(this.storeMyplan);
  }

  // データ操作メソッド
  // DBオープン、オブジェクトストア作成
  openDb(){
    const openRequest = indexedDB.open(this.dbName, this.version);
    const storeListSearchCondition = this.storeListSearchCondition;
    const storeListSearchConditionSpot = this.storeListSearchConditionSpot;
    const storeListSearchConditionPlan = this.storeListSearchConditionPlan;
    const storeMyplan = this.storeMyplan;
    const storeGuid = this.storeGuid;
    const storeHistorySpot = this.storeHistorySpot;
    const storeHistoryPlan = this.storeHistoryPlan;

    // 初期処理
    openRequest.onupgradeneeded = function(){
      let db = openRequest.result;
      // オブジェクトストアを削除
      if (db.objectStoreNames.contains(storeListSearchCondition)) {
        db.deleteObjectStore(storeListSearchCondition);
      }
      if (db.objectStoreNames.contains(storeListSearchConditionSpot)) {
        db.deleteObjectStore(storeListSearchConditionSpot);
      }
      if (db.objectStoreNames.contains(storeListSearchConditionPlan)) {
        db.deleteObjectStore(storeListSearchConditionPlan);
      }
      if (db.objectStoreNames.contains(storeMyplan)) {
        db.deleteObjectStore(storeMyplan);
      }
      if (db.objectStoreNames.contains(storeGuid)) {
        db.deleteObjectStore(storeGuid);
      }
      if (db.objectStoreNames.contains(storeHistorySpot)) {
        db.deleteObjectStore(storeHistorySpot);
      }
      if (db.objectStoreNames.contains(storeHistoryPlan)) {
        db.deleteObjectStore(storeHistoryPlan);
      }

      // オブジェクトストアを作成
      if (!db.objectStoreNames.contains(storeListSearchCondition)){
        db.createObjectStore(storeListSearchCondition);
      }
      if (!db.objectStoreNames.contains(storeListSearchConditionSpot)){
        db.createObjectStore(storeListSearchConditionSpot);
      }
      if (!db.objectStoreNames.contains(storeListSearchConditionPlan)){
        db.createObjectStore(storeListSearchConditionPlan);
      }
      if (!db.objectStoreNames.contains(storeMyplan)){
        db.createObjectStore(storeMyplan);
      }
      if (!db.objectStoreNames.contains(storeGuid)){
        db.createObjectStore(storeGuid);
      }
      if (!db.objectStoreNames.contains(storeHistorySpot)){
        db.createObjectStore(storeHistorySpot);
      }
      if (!db.objectStoreNames.contains(storeHistoryPlan)){
        db.createObjectStore(storeHistoryPlan);
      }
    };

    return openRequest;
  }

  // 指定したオブジェクトストア名のデータを取得(1レコードのみ)
  async getStoreValue(storeName: string){
    if(isPlatformBrowser(this.platformId)){
      return new Promise(resolve => {
        // DBオープン、オブジェクトストア作成
        const openRequest = this.openDb();

        // 接続成功
        openRequest.onsuccess = function(){
          let db = openRequest.result;
          let request = db.transaction(storeName, "readonly")
                        .objectStore(storeName)
                        .get(0);
          request.onsuccess = function () {
            resolve(this.result);
          }
          db.close();
        };
        openRequest.onerror = function(){
          console.log("error");
        };
      });
    }
  }

  // 指定したオブジェクトストア名のデータを更新(1レコードのみ)
  async registStore(storeName: string, value: any){
    if(isPlatformBrowser(this.platformId)){
      return new Promise(resolve => {
        // DBオープン、オブジェクトストア作成
        const openRequest = this.openDb();

        // 接続成功
        openRequest.onsuccess = function(){
          let db = openRequest.result;
          let putReq = db.transaction(storeName, "readwrite")
                        .objectStore(storeName)
                        .put(value, 0);
          putReq.onsuccess = function(){
            resolve(true);
          }
          putReq.onerror = function(){
            console.log("put data success");
          }
          db.close();
        };
        openRequest.onerror = function(){
          console.log("error");
        };
      });
    }
  }

  // 指定したオブジェクトストア名のデータを一括削除
  async clearStore(storeName: string){
    if(isPlatformBrowser(this.platformId)){
      return new Promise(resolve => {
        // DBオープン、オブジェクトストア作成
        const openRequest = this.openDb();

        // 接続成功
        openRequest.onsuccess = function(){
          let db = openRequest.result;
          let req = db.transaction(storeName, "readwrite")
                    .objectStore(storeName)
                    .clear();
          req.onsuccess = function(){
            resolve(true);
          }
          db.close();
        };
        openRequest.onerror = function(event){
          console.log("error");
        };
      });
    }
  }
}
