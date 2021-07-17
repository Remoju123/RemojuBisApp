import { Component, OnInit, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-planspot-list',
  templateUrl: './planspot-list.component.html',
  styleUrls: ['./planspot-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanspotListComponent implements OnInit {

  @Output() scrolled = new EventEmitter();
  
  constructor() { }

  ngOnInit(): void {
  }

  onScrollDown(){
    this.scrolled.emit();
  }

}
