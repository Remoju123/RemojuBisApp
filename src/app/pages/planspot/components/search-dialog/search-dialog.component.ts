import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, Inject } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Guid } from 'guid-typescript';
import { FilterPipe } from 'ngx-filter-pipe';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ListSelectMaster } from 'src/app/class/common.class';
import { ListSearchCondition } from 'src/app/class/indexeddb.class';
import { NestDataSelected, PlanSpotList } from 'src/app/class/planspotlist.class';
import { searchResult } from 'src/app/class/spotlist.class';
import { CommonService } from 'src/app/service/common.service';
import { IndexedDBService } from 'src/app/service/indexeddb.service';
import { PlanSpotListService } from 'src/app/service/planspotlist.service';

@Component({
  selector: 'app-search-dialog',
  templateUrl: './search-dialog.component.html',
  styleUrls: ['./search-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchDialogComponent implements OnInit,OnDestroy {

  private onDestroy$ = new Subject();

  tabIndex = 0;
  result: any;
  condition: ListSearchCondition;
  temparea: any[] = [];
  $mArea: any;
  searchTarm: any;
  searchForm = this.fb.group({
    areas: this.fb.array([]),
    cates: this.fb.array([]),
    addes: this.fb.array([])
  });

  get areas(): FormArray {
    return this.searchForm.get("areas") as FormArray;
  }

  get cates(): FormArray {
    return this.searchForm.get("cates") as FormArray;
  }

  get addes(): FormArray {
    return this.searchForm.get("addes") as FormArray;
  }

  get lang() {
    return this.translate.currentLang;
  }

  get guid() {
    return Guid.create().toString();
  }
  
  constructor(
    private translate: TranslateService,
    private planspots: PlanSpotListService,
    private cs: CommonService,
    private idx: IndexedDBService,
    private filterPipe: FilterPipe,
    public dialogRef: MatDialogRef<SearchDialogComponent>,
    public fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: ListSelectMaster
  ) { }

  ngOnDestroy(): void {
    // ローカル変数配列の重複除外
    this.condition.areaId = Array.from(new Set(this.condition.areaId));
    this.condition.areaId2 = Array.from(new Set(this.condition.areaId2));
    // this.condition.isOpens = Array.from(new Set(this.condition.isOpens));

    // 検索条件選択値を更新
    this.idx.registListSearchConditionSpot(this.condition);
    this.onDestroy$.next();
  }

  ngOnInit(): void {
    this.tabIndex = this.data.tabIndex;

    // Formデータ初期化
    this.initForm(this.data.planSpotList);

    this.planspots.searchFilter.pipe(takeUntil(this.onDestroy$)).subscribe(result=>{
      this.result = result.list;
      this.searchTarm = result.searchTarm;
    })
    
  }

  async initForm(list:PlanSpotList[]){
    // 検索条件選択値を取得
    let condition: any = await this.idx.getListSearchConditionSpot();
    if (condition){
      this.condition = condition;
    } else {
      this.condition = new ListSearchCondition();
    }

    // マスタエリアカウント取得
    const $mArea = this.planspots.reduceMasterArea(
      this.data.mArea,
      list,
      this.condition.areaId,
      this.condition.areaId2
    );

    this.temparea = [...$mArea];

    this.searchForm.setControl("areas", this.setFbArray($mArea));

    const arr1 = [
      this.condition.searchCategories,
      ...this.condition.searchOptions
    ].reduce((acc, val) => acc.concat(val), []);

    // マスタカテゴリカウント取得
    const $mCategory = this.planspots.reduceMasterCategory(
      this.data.mSearchCategory,
      list,
      arr1
    );

    // カテゴリ分解
    const $_Category = $mCategory.filter(x => x.parentId < 299);
    this.searchForm.setControl("cates", this.setFbArray($_Category));
    const $_AddOption = $mCategory.filter(x => x.parentId > 300);
    this.searchForm.setControl("addes", this.setFbArray($_AddOption));

  }

  filteringData() {
    // エリア検索用パラメータを整形
    const areaIds = [];
    this.condition.areaId = [];
    this.condition.areaId2 = [];

    // エリアIDを一括りにする
    this.areas.value.map((x: { selected: any; parentId: number; dataSelecteds: any[]; }) => {
      if (x.selected) {
        areaIds.push({ areaId: x.parentId });
        this.condition.areaId.push(x.parentId);
      }
      x.dataSelecteds.map((y: { selected: any; id: number; }) => {
        if (y.selected) {
          areaIds.push({ areaId2: y.id });
          this.condition.areaId2.push(y.id);
        }
      });
    });

    // エリア条件リストを更新
    this.temparea.forEach((x, i) => {
      this.areas.controls
        .find(y => y.value["parentId"] === x.parentId)
        .get("qty")
        .patchValue(x.qty);

      const sub = this.areas.controls
        .find(y => y.value["parentId"] === x.parentId)
        .get("dataSelecteds") as FormArray;

      x.dataSelecteds.forEach((y: { qty: number; }, j: any) => {
        sub.controls[j].get("qty").patchValue(y.qty);
        if (y.qty === 0) {
          sub.controls[j].get("selected").patchValue(false);
        }
      });
    });

    // 検索結果フィルタリング処理
    this.result = this.planspots.getSearchAreaFilter(this.data,this.condition);

    // カテゴリ・さらに条件追加条件を更新
    const $mCategory = this.planspots.reduceQty(
      this.data.mSearchCategory,
      this.result
    );

    // カテゴリ
    const $_Category = $mCategory.filter(x => x.parentId < 299);
    $_Category.forEach((x, i) => {
      this.cates.controls[i].get("qty").patchValue(x.qty);
      const sub = this.cates.controls[i].get("dataSelecteds") as FormArray;
      x.dataSelecteds.forEach((y: { qty: number; }, j: any) => {
        sub.controls[j].get("qty").patchValue(y.qty);
        if (y.qty === 0) {
          sub.controls[j].get("selected").patchValue(false);
          // categoryId選択の矛盾をクリア
          this.condition.searchCategories = this.condition.searchCategories.filter(
            z => z !== sub.controls[j].get("id").value
          );
        }
      });
    });

    // さらに条件追加
    const $_AddOption = $mCategory.filter(x => x.parentId > 300);
    $_AddOption.forEach((x, i) => {
      this.addes.controls[i].get("qty").patchValue(x.qty);
      const sub = this.addes.controls[i].get("dataSelecteds") as FormArray;
      x.dataSelecteds.forEach((y: { qty: number; }, j: any) => {
        sub.controls[j].get("qty").patchValue(y.qty);
        if (y.qty === 0) {
          sub.controls[j].get("selected").patchValue(false);
          // addedId選択の矛盾をクリア
          this.condition.searchOptions = this.condition.searchOptions.filter(
            z => z !== sub.controls[j].get("id").value
          );
        }
      });
    });

    // 検索結果フィルタリング処理
    this.planspots.filteringData(this.data.planSpotList,this.condition,this.data);
  }

  // フォーム作成 sub
  setFbArray(data: NestDataSelected[]) {
    return this.fb.array(
      data.map(p => {
        return this.fb.group({
          parentId: p.parentId,
          parentName: p.parentName,
          qty: p.qty,
          isHighlight:p.isHighlight,
          selected: p.selected,
          dataSelecteds: this.fb.array(
            p.dataSelecteds.map(q => {
              return this.fb.group({
                id: q.id,
                name: q.name,
                qty: q.qty,
                selected: q.selected
              });
            })
          )
        });
      })
    );
  }

  onAreaCollapseOpen(i: number, id: number) {
  }

  onAreaCollapseClose(i: number) {
  }

  isExpended(i: number) {
    return false;
  }

  onAreaAllClick(i: number) {
  }

  onAreaSelection(i: number, id: number) {
  }

  onCategoryChange(e: any) {
  }

  onAddesChange(e: any) {
  }

  onReset(): void {
  }
}
