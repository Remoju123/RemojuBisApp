import { Component, OnInit, ChangeDetectionStrategy, EventEmitter, Output, Input, ViewChild, ElementRef } from '@angular/core';
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
  @Output() glink = new EventEmitter<any>();

  @ViewChild('box') box:ElementRef;

  isMobile:boolean;
  
  constructor() {
  }

  ngOnInit(): void {
    if (navigator.userAgent.match(/iPhone|iPad|Android.+Mobile/)) {
      this.isMobile = true;
    }else{
      this.isMobile = false;
    }
  }

  scrolledEmit(){
    this.scrolled.emit();
  }

  googleLink(e:any){
    this.glink.emit(e);
  }

}
