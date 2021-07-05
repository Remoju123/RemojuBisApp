import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-planspot-list-item',
  templateUrl: './planspot-list-item.component.html',
  styleUrls: ['./planspot-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanspotListItemComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
