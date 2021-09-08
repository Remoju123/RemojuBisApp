import { Component, OnInit, ChangeDetectionStrategy, Input, Output,EventEmitter, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DataSelected } from 'src/app/class/common.class';
import { ListSearchCondition} from 'src/app/class/indexeddb.class';
import { tarms } from 'src/app/class/planspotlist.class';

@Component({
  selector: 'app-planspot-selector',
  templateUrl: './planspot-selector.component.html',
  styleUrls: ['./planspot-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanspotSelectorComponent implements OnInit {
  @Input() count:number;
  @Input() condition:ListSearchCondition;
  @Input() mSort:DataSelected[];
  @Input() searchTarms:tarms;
  
  @Output() event = new EventEmitter<any>();
  @Output() sort = new EventEmitter<any>();
  @Output() keyword = new EventEmitter<any>();
  @Output() open = new EventEmitter<number>();
  @Output() reset = new EventEmitter();

  @ViewChild("keywordInput") keywordInput:{ nativeElement: any };

  isVal:boolean = false;
  isChk:boolean = false; 

  get lang() {
    return this.translate.currentLang;
  }

  constructor(private translate: TranslateService,) { 
    
  }

  ngOnInit(): void {}

  onSwitchPlanSpot(e){
    this.event.emit(e.target.value);
  }

  onSortChange(e:{value:number}){
    this.sort.emit(e.value);
  }

  onKeywordSearch(e){
    const val = e.target.value.toLowerCase();
    val!==""?this.isVal=true:false;
    this.keyword.emit(val);
  }

  openDialog(e){
    this.open.emit(e);
  }

  inputClear(){
    this.isVal=false;
    this.keywordInput.nativeElement.value="";
    this.keyword.emit("");
  }

  @HostListener("window:scroll", [])
  onWindowScroll(){
    const h = 208;

    if((window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop) > h){
        //this.isChk = this.chkTarms();
        this.isChk = true;
      }
    else {
      this.isChk = false;
    }
  }

  chkTarms():boolean{
    return (this.searchTarms?.area !== "----" || this.searchTarms?.cate !== "----");
  }

  condReset(){
    this.reset.emit();
  }
}
