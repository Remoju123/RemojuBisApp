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
