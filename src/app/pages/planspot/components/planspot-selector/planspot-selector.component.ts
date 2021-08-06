import { Component, OnInit, ChangeDetectionStrategy, Input, Output,EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DataSelected, ListSelectMaster } from 'src/app/class/common.class';
import { ListSearchCondition} from 'src/app/class/indexeddb.class';
import { PlanSpotListService } from 'src/app/service/planspotlist.service';

@Component({
  selector: 'app-planspot-selector',
  templateUrl: './planspot-selector.component.html',
  styleUrls: ['./planspot-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanspotSelectorComponent implements OnInit {
  @Input() count:number;
  @Input() condition:ListSearchCondition;
  
  @Output() event = new EventEmitter<any>();
  @Output() sort = new EventEmitter<any>();

  mSort:DataSelected[];

  get lang() {
    return this.translate.currentLang;
  }

  constructor(private translate: TranslateService,private planspots: PlanSpotListService,) { }

  ngOnInit(): void {
    this.planspots.masterSubject.subscribe(m => {
      this.mSort = m;
    })
    //console.log(this.condition.sortval);
  }

  onSwitchPlanSpot(e){
    this.event.emit(e.target.value);
  }

  onSortChange(e:{value:number}){
    this.sort.emit(e.value);
  }

}
