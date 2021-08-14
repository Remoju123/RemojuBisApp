import { Component, OnInit, ChangeDetectionStrategy, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-planspot-list',
  templateUrl: './planspot-list.component.html',
  styleUrls: ['./planspot-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanspotListComponent implements OnInit {

  @Input() isList:boolean;
  @Output() scrolled = new EventEmitter();
  
  constructor() { }

  ngOnInit(): void {
  }

  scrolledEmit(){
    this.scrolled.emit();
  }

}