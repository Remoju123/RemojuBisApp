import { Component, Input, OnInit } from '@angular/core';
import { PlanSpotList } from 'src/app/class/planspotlist.class';

@Component({
  selector: 'app-google-list-item',
  templateUrl: './google-list-item.component.html',
  styleUrls: ['./google-list-item.component.scss']
})
export class GoogleListItemComponent implements OnInit {
  @Input() item:PlanSpotList

  constructor() { }

  ngOnInit() {
  }

}
