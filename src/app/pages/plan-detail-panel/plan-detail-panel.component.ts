import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-plan-detail-panel',
  templateUrl: './plan-detail-panel.component.html',
  styleUrls: ['./plan-detail-panel.component.scss']
})
export class PlanDetailPanelComponent implements OnInit {

  @Output() closed = new EventEmitter();
  @Input() planId:number;
  

  constructor() { }

  ngOnInit(): void {
    
  }

  onclose(){
    this.closed.emit();
  }

}
