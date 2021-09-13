import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { DatePipe, isPlatformBrowser } from "@angular/common";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { MyPlanApp } from "../class/common.class";
import { MyPlanAppListSelected } from "../class/mypageplanlist.class";
import { CommonService } from "./common.service";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { IndexedDBService } from "./indexeddb.service";

const httpOptions = {
  headers: new HttpHeaders({
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json;charset=utf-8"
  })
};

@Injectable({
  providedIn: "root"
})
export class MyplanService  {
  private PlanUser = new Subject<MyPlanApp>();
  public PlanUser$ = this.PlanUser.asObservable();

  private PlanUserEdit = new Subject<MyPlanApp>();
  public PlanUserEdit$ = this.PlanUserEdit.asObservable();

  private PlanUserSaved = new Subject<MyPlanApp>();
  public PlanUserSaved$ = this.PlanUserSaved.asObservable();

  private RemoveDisplayOrder = new Subject<number>();
  public RemoveDisplayOrder$ = this.RemoveDisplayOrder.asObservable();

  private RemovePlanUser = new Subject<number>();
  public RemovePlanUser$ = this.RemovePlanUser.asObservable();

  private MySpots = new Subject();
  public MySpots$ = this.MySpots.asObservable();

  constructor(
    private http: HttpClient,
    private datepipe: DatePipe,
    private commonService: CommonService,
    private indexedDBService: IndexedDBService,
    private translate: TranslateService,
    @Inject("BASE_API_URL") private host: string,
    @Inject(PLATFORM_ID) private platformId:Object
  ) { }

  // 選択値を取得
  getDataSelected() {
    const url = this.host + "/api/Myplan/ListSelected";
    return this.http.get<MyPlanAppListSelected>(url);
  }

  // ユーザ作成プランを取得
  getPlanUser(id: string) {
    const url = this.host + "/api/Myplan/";
    return this.http.get<MyPlanApp>(url, {
      params: {
        id: String(id),
        objectId: this.commonService.objectId
      }
    });
  }

  // IndexedDBの足りない項目を補完
  async getPlanComplement() {
    let myPlan:any = null;
    if(isPlatformBrowser(this.platformId)){
      myPlan = await this.indexedDBService.getEditPlan(true);
    }
    const myPlanApp: MyPlanApp = myPlan;
    this.SetItem(myPlanApp);
    const url = this.host + "/api/Myplan/GetPlanComplement";
    return this.http.post<MyPlanApp>(url,myPlanApp, httpOptions);
  }

  // スポット入れ替え・バスONOFF・経路最適化ONOFF
  async setTransfer() {
    let myPlan:any = null;
    if(isPlatformBrowser(this.platformId)){
      myPlan = await this.indexedDBService.getEditPlan(true);
    }
    const myPlanApp: MyPlanApp = myPlan;
    this.SetItem(myPlanApp);
    const url = this.host + "/api/Myplan/SetTransfer";
    return this.http.post<MyPlanApp>(url, myPlanApp, httpOptions);
  }

  // プラン登録
  async registPlan() {
    let myPlan:any = null;
    if(isPlatformBrowser(this.platformId)){
      myPlan = await this.indexedDBService.getEditPlan(true);
    }
    const myPlanApp: MyPlanApp = myPlan;
    this.SetItem(myPlanApp);
    const url = this.host + "/api/Myplan/RegistMyPlan";
    return this.http.post<MyPlanApp>(url, myPlanApp, httpOptions);
  }

  // プランを共有
  registShare(planUserId: number) {
    const url = this.host + "/api/Myplan/RegistIsShare";
    const options = {
      params: {
        planUserId: String(planUserId),
        isShare: String(true)
      },
      responseType: "text" as "json"
    };
    return this.http.get<string>(url, options);
  }

  // プラン更新通知
  public onPlanUserChanged(myPlanApp: MyPlanApp) {
    this.PlanUser.next(myPlanApp);
  }

  public onPlanUserEdit(myPlanApp: MyPlanApp) {
    this.PlanUserEdit.next(myPlanApp);
  }

  // プラン保存通知
  public onPlanUserSaved(myPlanApp: MyPlanApp) {
    this.PlanUserSaved.next(myPlanApp);
  }

  // プランスポット削除通知
  public onPlanUserSpotRemoved(displayOrder: number) {
    this.RemoveDisplayOrder.next(displayOrder);
  }

  // プラン削除通知
  public onPlanUserRemoved() {
    this.RemovePlanUser.next();
  }

  // MyPlanスポットを更新
  public async FetchMyplanSpots(){
    let myPlan:any = null;
    if(isPlatformBrowser(this.platformId)){
      myPlan = await this.indexedDBService.getEditPlan();
    }
    const _mySpots = new Array();
    if(myPlan && myPlan.planSpots){
      myPlan.planSpots.map((x: { spotId: any; })=>{
        _mySpots.push(x.spotId);
      })
    }
    this.MySpots.next(_mySpots);
  }

  private SetItem(myPlanApp: MyPlanApp){
    if (myPlanApp.planSpots) {
      myPlanApp.planSpots.forEach(x => x.stayTime = Number(x.stayTime));
    }
    myPlanApp.languageCd1 = [ this.translate.currentLang ];
    myPlanApp.objectId = this.commonService.objectId;
    if (myPlanApp.travelDate) {
      myPlanApp.travelDate = this.datepipe.transform(new Date(myPlanApp.travelDate), 'yyyy-MM-dd');
    }
  }
}
