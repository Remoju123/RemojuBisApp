import { Component, OnInit, ChangeDetectionStrategy, Input, Output,EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DataSelected } from 'src/app/class/common.class';
import { ListSearchCondition} from 'src/app/class/indexeddb.class';

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
  
  @Output() event = new EventEmitter<any>();
  @Output() sort = new EventEmitter<any>();
  @Output() keyword = new EventEmitter<any>();
  @Output() open = new EventEmitter();

  keywordControl = new FormControl();

  get lang() {
    return this.translate.currentLang;
  }

  constructor(private translate: TranslateService,) { }

  ngOnInit(): void {}

  onSwitchPlanSpot(e){
    this.event.emit(e.target.value);
  }

  onSortChange(e:{value:number}){
    this.sort.emit(e.value);
  }

  onKeywordSearch(e){
    const val = e.target.value.toLowerCase();
    this.keyword.emit(val);
  }

  openDialog(){
    this.open.emit();
  }

}
