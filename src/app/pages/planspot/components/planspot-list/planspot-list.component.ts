import { Component, OnInit, ChangeDetectionStrategy, EventEmitter, Output, Input } from '@angular/core';
import { ListSearchCondition } from 'src/app/class/indexeddb.class';

@Component({
  selector: 'app-planspot-list',
  templateUrl: './planspot-list.component.html',
  styleUrls: ['./planspot-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanspotListComponent implements OnInit {

  @Input() isList:boolean;
  @Input() condition:ListSearchCondition;
  @Output() scrolled = new EventEmitter();
  
  constructor() { }

  ngOnInit(): void {
  }

  scrolledEmit(){
    this.scrolled.emit();
  }

}
