import { Component, OnInit, ChangeDetectionStrategy, EventEmitter, Output, Input, ViewChild, ElementRef } from '@angular/core';
import { ListSearchCondition } from 'src/app/class/indexeddb.class';

@Component({
  selector: 'app-planspot-list',
  templateUrl: './planspot-list.component.html',
  styleUrls: ['./planspot-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanspotListComponent implements OnInit {

  @Input() isList: boolean;
  @Input() condition: ListSearchCondition;
  @Output() scrolled = new EventEmitter();
  @Output() glink = new EventEmitter<any>();

  @ViewChild('box') box: ElementRef;
  scrollPos: number;

  isMobile: boolean;

  constructor() {
  }

  ngOnInit(): void {
    this.isMobile = this.detectIsMobile(window.innerWidth);
    
  }

  scrolledEmit() {
    this.scrolled.emit();
  }

  googleLink(e: any) {
    this.glink.emit(e);
  }

  detectIsMobile(w: any) {
    if (w < 1024) {
      return true;
    } else {
      return false;
    }
  }

  onScroll(e: any) {
    this.scrollPos = e.target.scrollTop;
  }

  scrollToTop(){
    this.box.nativeElement.scrollTo(0,-156);
  }

}
