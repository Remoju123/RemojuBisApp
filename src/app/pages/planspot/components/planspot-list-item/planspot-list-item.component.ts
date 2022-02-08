import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { throwToolbarMixedModesError } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { PlanSpotList } from 'src/app/class/planspotlist.class';
import { CommonService } from 'src/app/service/common.service';
import { SpotService } from 'src/app/service/spot.service';
import { LangFilterPipe } from 'src/app/utils/lang-filter.pipe';
import { environment } from 'src/environments/environment';
import { runInThisContext } from 'vm';


@Component({
  selector: 'app-planspot-list-item',
  templateUrl: './planspot-list-item.component.html',
  styleUrls: ['./planspot-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanspotListItemComponent implements OnInit {
  @Input() item: PlanSpotList;
  @Input() lang: string;
  @Input() myFavorite: boolean;
  @Input() myPlanSpots:any;

  @Output() linked = new EventEmitter<PlanSpotList>();
  @Output() addMyPlan = new EventEmitter<PlanSpotList>();
  @Output() setFav = new EventEmitter<PlanSpotList>();
  @Output() delFav = new EventEmitter<PlanSpotList>();
  @Output() keyword = new EventEmitter<any>();

  isProd:boolean;

  constructor(
    private commonService: CommonService,
    private spotService: SpotService,
    private router:Router
  ) { }

  ngOnInit(): void {
    this.isProd = environment.production;
  }

  linktoDetail(planSpot: PlanSpotList){
    this.linked.emit(planSpot);
  }

  // スポット：定休日
  genSpotHoliday(){
    if(!this.item.isPlan){
      try{
        return this.spotService.getRegularholidays(this.item.regularHoliday);
      }catch{
        //
      }
    }
    return ""
  }

  // スポット：営業時間
  genSpotBusinessHour(){
    if(!this.item.isPlan){
      try{
        const businessHour = this.item.businessHours!==null?this.item.businessHours:"";
          return businessHour!==""?this.spotService.getBusinessHourHead(this.item.businessHours):"";
      }catch{
        //
      }
    }
    return ""
  }

  // スポット：アクセス
  genSpotAccess(){
    const langpipe = new LangFilterPipe();
    if(!this.item.isPlan){
      try{
        const nearest = this.item.spotAccess.nearest!==null?this.item.spotAccess.nearest:"";
        if(nearest!=="")
          return langpipe.transform(nearest, this.lang);
      }catch{
        return ""
      }
    }
  }

  // ユーザー写真
  genUserPicture(){
    return this.item.userPictureUrl?
      this.item.userPictureUrl:
      '../../../../../assets/img/icon_who.svg'
  }

  // ユーザー名
  genUserName(){
    return this.item.userName?
      this.item.userName:
      '---'
  }

  // スポット、プランマーク
  genMarkPath(){
    return this.item.isPlan?
      '../../../../../assets/img/mark_plan.svg':
      '../../../../../assets/img/mark_spot.svg';
  }

  // タイトル
  genTitle(){
    return this.item.isPlan?
      this.commonService.isValidJson(this.item.planName,this.lang):
      this.commonService.isValidJson(this.item.spotName,this.lang);
  }

  // プラン：スポットリスト
  genPlanSpotNames(item:any){
    if(item){
      const arr: any[] = [];
      item.map((x: { isRemojuSpot: any; spotName: string; })=>{
        if(x.isRemojuSpot){
          arr.push(this.commonService.isValidJson(x.spotName,this.lang))
        }else{
          arr.push(x.spotName)
        }
      })
      let list = arr.join("</span><span>");
      return "<span>" + list + "</span>";
    }else{
      return null;
    }
  }

  onClickAddToPlan(item:PlanSpotList){
    this.addMyPlan.emit(item);
  }

  onClickFavorite(item:PlanSpotList){
    this.setFav.emit(item);
  }

  onClickDeleteFavorite(item:PlanSpotList){
    this.delFav.emit(item);
  }

  chkInMyPlanspot(item:PlanSpotList){
    try {
      if(!this.myFavorite){
        if(item.isPlan){
          if(item.planSpotNames!==null){
            let planSpotIds = [];
            Array.from(item.planSpotNames).map(n => {
              planSpotIds.push(n.spotId);
            });
            return this.getIsDuplicate(planSpotIds,this.myPlanSpots);
          }
          return false;
        }else{
          return Array.from(this.myPlanSpots).includes(item.id)
        }
      }else{
        return false;
      }
    } catch (error) {
      //
      return false;
    }
  }

  mainOptions: any = {
    rewindSpeed:0,
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: [
      "<i class='material-icons' aria-hidden='true'>keyboard_arrow_left</i>",
      "<i class='material-icons' aria-hidden='true'>keyboard_arrow_right</i>"
    ],
    stagePadding:40,
    margin:0,
    items: 1,
    nav: true
  };


  // 比較関数（同じ配列同士で重複する値があるか否か）
  getIsDuplicate(arr1, arr2) {
    if(arr2){
      return [...arr1, ...arr2].filter(item => arr1.includes(item) && arr2.includes(item)).length > 0
    }else{
      return false;
    }

  }

  toPostUser(id:any){
    this.keyword.emit(id);
  }

}
