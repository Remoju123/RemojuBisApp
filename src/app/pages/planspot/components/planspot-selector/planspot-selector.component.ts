import { Component, OnInit, ChangeDetectionStrategy, Input, Output,EventEmitter } from '@angular/core';
import { ListSearchCondition } from 'src/app/class/indexeddb.class';


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

  isSpot:boolean;
  isPlan:boolean;

  constructor() { }

  ngOnInit(): void {
    //console.log(this.condition);
    this.isSpot = this.condition.isSpot;
    this.isPlan = this.condition.isPlan;
  }

  onSwitchPlanSpot(attr){
    console.log(attr.target.dataset)
    let e = attr.target.dataset.index;
    if(e==='0'){
      this.isSpot = !this.isSpot;
      this.condition.isSpot = this.isSpot;
    }else{
      this.isPlan = !this.isPlan;
      this.condition.isPlan = this.isPlan;
    }
    this.event.emit(this.condition);
  }

}
