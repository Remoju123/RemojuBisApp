import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { PlanAppList } from 'src/app/class/planlist.class';
import { PlanSpotList } from 'src/app/class/planspotlist.class';


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

  @Output() linked = new EventEmitter<Number>();

  constructor() { }

  ngOnInit(): void {
  }

  linktoPlan(id:number){
    this.linked.emit(id);
  }

}
