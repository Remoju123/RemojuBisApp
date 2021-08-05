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
    
  }

  onSwitchPlanSpot(e){
    //console.log(e.target.value)
    // let e = attr.target.dataset.index;
    // if(e==='0'){
    //   this.isSpot = !this.isSpot;
      
    // }else{
    //   this.isPlan = !this.isPlan;
      
    // }
    this.event.emit(e.target.value);
  }

}
