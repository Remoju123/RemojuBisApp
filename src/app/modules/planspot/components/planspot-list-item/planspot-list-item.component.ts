import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { PlanAppList } from 'src/app/class/planlist.class';


@Component({
  selector: 'app-planspot-list-item',
  templateUrl: './planspot-list-item.component.html',
  styleUrls: ['./planspot-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanspotListItemComponent implements OnInit {
  @Input() planapplist: PlanAppList;
  @Input() isFavorite: boolean;

  @Output() linked = new EventEmitter<Number>();

  constructor() { }

  ngOnInit(): void {
  }

  linktoPlan(id:number){
    this.linked.emit(id);
  }

}
