import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { throwToolbarMixedModesError } from '@angular/material/toolbar';
import { PlanAppList } from 'src/app/class/planlist.class';
import { PlanSpotList } from 'src/app/class/planspotlist.class';
import { CommonService } from 'src/app/service/common.service';
import { SpotService } from 'src/app/service/spot.service';
import { LangFilterPipe } from 'src/app/utils/lang-filter.pipe';


@Component({
  selector: 'app-planspot-list-item',
  templateUrl: './planspot-list-item.component.html',
  styleUrls: ['./planspot-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanspotListItemComponent implements OnInit {
  @Input() item: PlanSpotList;
  @Input() lang: string;
  @Input() isFavorite: boolean;

  @Output() linked = new EventEmitter<number>();
  
  constructor(
    private commonService: CommonService,
    private spotService: SpotService,
  ) { }

  ngOnInit(): void {
  }

  linktoDetail(id:number){
    this.linked.emit(id);
  }

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

  genUserPicture(){
    return this.item.userPictureUrl?
      this.item.userPictureUrl:
      '../../../../../assets/img/icon_who.svg'
  }

  genUserName(){
    return this.item.userName?
      this.item.userName:
      '---'
  }

  genMarkPath(){
    return this.item.isPlan?
      '../../../../../assets/img/mark_plan.svg':
      '../../../../../assets/img/mark_spot.svg';
  }

  genTitle(){
    return this.item.isPlan?
      this.commonService.isValidJson(this.item.planName,this.lang):
      this.commonService.isValidJson(this.item.spotName,this.lang);
  }

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
      return arr.join("/");
    }else{
      return null;
    }
  }

  onClickAddToPlan(item:any){
    //
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

}
