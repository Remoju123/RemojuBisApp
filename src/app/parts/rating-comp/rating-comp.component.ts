import { Component, Input, OnInit, ChangeDetectorRef,AfterViewInit,AfterViewChecked } from '@angular/core';

@Component({
  selector: 'app-rating-comp',
  templateUrl: './rating-comp.component.html',
  styleUrls: ['./rating-comp.component.scss']
})
export class RatingCompComponent implements OnInit {

  constructor(public changeDetectorRef: ChangeDetectorRef) { }

  @Input() rating:number;
  @Input() size:any;

  rate:any;
  _rating:any;
  
  ngOnInit() {
    this.rate = this.rating/5*100 + "%";
    this._rating = this.size !== 12?this.rating.toFixed(2):this.rating.toFixed(1);
  }

  redraw(){
    this.changeDetectorRef.detectChanges();
  }

}
