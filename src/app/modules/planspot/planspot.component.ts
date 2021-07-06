import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PlanAppList } from 'src/app/class/planlist.class';

@Component({
  selector: 'app-planspot',
  templateUrl: './planspot.component.html',
  styleUrls: ['./planspot.component.scss']
})
export class PlanspotComponent implements OnInit {

  details$: Observable<PlanAppList[]>;

  constructor() { }

  ngOnInit(): void {
  }

}
