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

  constructor() { }

  ngOnInit(): void {
    console.log(this.condition);
  }

  onSwitchPlanSpot(e){
    this.event.emit(e.target.value);
  }

}
