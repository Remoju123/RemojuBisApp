import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DataSelected } from 'src/app/class/common.class';
import { ListSearchCondition } from 'src/app/class/indexeddb.class';
import { tarms } from 'src/app/class/planspotlist.class';

@Component({
  selector: 'app-planspot-selector',
  templateUrl: './planspot-selector.component.html',
  styleUrls: ['./planspot-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanspotSelectorComponent implements OnInit {
  @Input() count: number;
  @Input() condition: ListSearchCondition;
  @Input() mSort: DataSelected[];
  @Input() searchTarms: tarms;
  @Input() myFavorite: boolean;
  @Input() isShow:boolean;
  @Output() switch = new EventEmitter<any>();
  @Output() sort = new EventEmitter<any>();
  @Output() keyword = new EventEmitter<any>();
  @Output() open = new EventEmitter<number>();
  @Output() reset = new EventEmitter();
  @Input() close: boolean;

  @ViewChild('keywordInput') keywordInput: { nativeElement: any };

  isVal: boolean = false;
  isChk: boolean = false;
  val: string;

  get lang() {
    return this.translate.currentLang;
  }

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {}

  onSwitchPlanSpot(e) {
    this.switch.emit(e.target.value);
  }

  onSortChange(e: { value: number }) {
    this.sort.emit(e.value);
  }

  onKeywordSearch(e) {
    const enterVal = e.target.value.toLowerCase();
    if (enterVal === this.val) {
      return;
    }
    this.val = enterVal;
    enterVal !== '' ? (this.isVal = true) : false;
    //console.log("Search" + enterVal);
    this.keyword.emit(enterVal);
  }

  openDialog(e) {
    this.open.emit(e);
  }

  inputClear() {
    this.isVal = false;
    this.keywordInput.nativeElement.value = '';
    this.keyword.emit('');
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const h = 208;
    if (
      (window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop) > h
    ) {
      this.isChk = this.chkTarms();
      //this.isChk = true;
    } else {
      this.isChk = false;
    }
  }

  chkTarms(): boolean {
    if (this.condition.select && this.condition.select === 'google') {
      return false;
    } else {
      return (
        this.condition.areaId.length > 0 ||
        this.condition.areaId2.length > 0 ||
        this.condition.searchCategories.length > 0
      );
    }
  }

  condReset() {
    this.reset.emit();
  }

  selectorClose() {
    event.stopPropagation();
  }
}
