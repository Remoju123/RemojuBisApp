import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, Inject } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Guid } from 'guid-typescript';
import { FilterPipe } from 'ngx-filter-pipe';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ListSelectMaster } from 'src/app/class/common.class';
import { ListSearchCondition } from 'src/app/class/indexeddb.class';
import { NestDataSelected, PlanSpotList } from 'src/app/class/planspotlist.class';
import { CommonService } from 'src/app/service/common.service';
import { IndexedDBService } from 'src/app/service/indexeddb.service';
import { PlanSpotListService } from 'src/app/service/planspotlist.service';

export const PLANSPOTLIST_KEY = makeStateKey<PlanSpotList[]>('PLANSPOTLIST_KEY');
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
  $mArea: any;
  temparea: any;
  searchTarm: any;
  searchForm = this.fb.group({
    areas: this.fb.array([]),
    cates: this.fb.array([])
  });
  $mSearchCategory:NestDataSelected[];

  list:PlanSpotList[];

  get areas(): FormArray {
    return this.searchForm.get("areas") as FormArray;
  }

  get cates(): FormArray {
    return this.searchForm.get("cates") as FormArray;
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
    private transferState: TransferState,
    @Inject(MAT_DIALOG_DATA) public data: ListSelectMaster
  ) {
    this.$mSearchCategory = this.data.mSearchCategoryPlan.concat(this.data.mSearchCategory);
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  ngOnInit(): void {
    this.tabIndex = this.data.tabIndex;

    this.list = this.transferState.get<PlanSpotList[]>(PLANSPOTLIST_KEY,null);

    // Formデータ初期化
    this.initForm();

    this.planspots.searchFilter.pipe(takeUntil(this.onDestroy$)).subscribe(result=>{
      this.result = result.list;
      this.searchTarm = result.searchTarm;
    })

  }

  async initForm(){
    // 検索条件選択値を取得
    let condition: any = await this.idx.getListSearchCondition();
    if (condition){
      this.condition = condition;
    } else {
      this.condition = new ListSearchCondition();
    }
    // マスタエリアカウント取得
    let $mArea: NestDataSelected[];
    if (this.data.isGoogle) {
      // 都道府県順にソート
      let temp = [...this.data.mArea];
      temp.sort((a, b) => Number(a.parentId) - Number(b.parentId));
      this.list = [];
      $mArea = this.planspots.reduceMasterArea(
        temp,
        this.list,
        this.condition.googleAreaId,
        []
      );
    } else {
      $mArea = this.planspots.reduceMasterArea(
        this.data.mArea,
        this.list,
        this.condition.areaId,
        this.condition.areaId2
      );
    }

    this.temparea = [...$mArea];

    // エリアフォーム
    this.searchForm.setControl("areas", this.setFbArray($mArea));

    // マスタカテゴリカウント取得
    const $mCategory = this.planspots.reduceMasterCategory(
      this.$mSearchCategory,
      this.list,
      //arr1
      this.condition.searchCategories
    );

    // カテゴリフォーム
    this.searchForm.setControl("cates", this.setFbArray($mCategory));

    this.update();
  }

  // Google検索のエリアクリック時
  onClickGoogleArea(i: number) {
    const selected = this.areas.controls[i].get("selected");
    this.areas.controls[i].get("selected").patchValue(!selected.value);
    this.condition.googleAreaId = [];
    this.areas.value.map((x: { selected: any; parentId: number; }) => {
      if (x.selected) {
        this.condition.googleAreaId.push(x.parentId);
      }
    });
    this.update();
  }  

  // エリア-エクスパンションOpen
  onAreaCollapseOpen(i: number, id: number) {
    this.areas.controls[i].get("selected").patchValue(true);
    const fa = this.areas.controls[i].get("dataSelecteds") as FormArray;
    // エリアのsubエリアがひとつしかない場合、最初のサブエリアをチェックする
    if (fa.length === 1) {
      if (fa.controls[0].get("qty").value > 0) {
        this.areas.controls[i].get("selected").patchValue(false);
        fa.controls[0].get("selected").patchValue(true);
      }
    }
    // subエリアがチェックされていた場合は、親エリアのチェツクを外す
    if (this.cs.isSome(fa)) {
      this.areas.controls[i].get("selected").patchValue(false);
    }
    this.update();
  }

  // エリア-エクスパンションClose
  onAreaCollapseClose(i: number) {
    this.areas.controls[i].get("selected").patchValue(false);
    const fa = this.areas.controls[i].get("dataSelecteds") as FormArray;
    fa.controls.map(d => {
      d.get("selected").patchValue(false);
    });
    this.update();
  }

  // エリア-サブエリア選択時のすべて選択
  onAreaAllClick(i: number) {
    const fa = this.areas.controls[i].get("dataSelecteds") as FormArray;
    if (this.areas.controls[i].get("selected").value === false) {
      this.areas.controls[i].get("selected").patchValue(true);
      fa.controls.map(d => {
        d.get("selected").patchValue(false);
      });
    } else {
      this.areas.controls[i].get("selected").patchValue(false);
    }
    this.update();
  }

  // エリア-チェックボックス選択
  onAreaSelection(i: number) {
    const fa = this.areas.controls[i].get("dataSelecteds") as FormArray;

    if (fa.controls.length !== 1) {
      if (this.cs.isSome(fa)) {
        this.areas.controls[i].get("selected").patchValue(false);
      } else {
        this.areas.controls[i].get("selected").patchValue(true);
      }
      this.update();
    }
  }

  // エリア-エクスパンション状態
  isExpended(i: number) {
    // 都道府県が選択されている場合
    if (this.areas.controls[i].get("selected")?.value){
      return true;
    }
    // サブエリアが選択されている場合
    const fa = this.areas.controls[i].get("dataSelecteds") as FormArray;
    if (this.cs.isSome(fa)) {
      return true;
    }
    return false;
  }

  // カテゴリチェック
  onCategoryChange(e: any) {
    if (e.target.checked) {
      this.condition.searchCategories.push(Number(e.target["id"]));
    } else {
      this.condition.searchCategories = this.condition.searchCategories.filter(
        x => x !== Number(e.target["id"])
      );
    }
    this.update();
  }

  // リセット
  onReset(): void {
    this.areas.controls.map(x => {
      x.get("selected").patchValue(false);
      const sub = x.get("dataSelecteds") as FormArray;
      sub.controls.map(y => {
        y.get("selected").patchValue(false);
      });
    });

    this.cates.controls.map(x => {
      const sub = x.get("dataSelecteds") as FormArray;
      sub.controls.map(y => {
        y.get("selected").patchValue(false);
      });
    });

    if (this.data.isGoogle) {
      this.condition.googleAreaId = [];
    } else {
      this.condition.areaId = [];
      this.condition.areaId2 = [];
      this.condition.searchCategories = [];
    }
    this.condition.keyword = '';

    this.dialogRef.close(this.condition);
  }

  // 更新処理
  update() {
    // エリア検索用パラメータを整形
    //const areaIds = [];
    this.condition.areaId = [];
    this.condition.areaId2 = [];

    // エリアIDを一括りにする
    this.areas.value.map((x: { selected: any; parentId: number; dataSelecteds: any[]; }) => {
      if (x.selected) {
        //areaIds.push({ areaId: x.parentId });
        this.condition.areaId.push(x.parentId);
      }
      x.dataSelecteds.map((y: { selected: any; id: number; }) => {
        if (y.selected) {
          //areaIds.push({ areaId2: y.id });
          this.condition.areaId2.push(y.id);
        }
      });
    });

    // 検索結果を再取得
    this.result = this.planspots.getFilterbyCondition(this.list,this.condition);

    // エリアオブジェクトを更新
    // const $mArea = this.planspots.reduceAreaCount(
    //   this.data.mArea,
    //   this.result,
    //   this.condition.areaId,
    //   this.condition.areaId2
    // );

    // エリアコントロールを再レンダリング
    this.temparea.forEach((x, i) => {
    //$mArea.forEach((x, i) => {
      this.areas.controls[i].get("qty").patchValue(x.qty);
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

    // カテゴリオブジェクトを更新
    const $mCategory = this.planspots.reduceMasterCategory(
      this.$mSearchCategory,
      this.result,
      this.condition.searchCategories
    );

    // カテゴリコントロールを再レンダリング
    $mCategory.forEach((x, i) => {
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
  }

  // フォーム作成バッチ
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

  // タブ切り替え（念のために更新処理）
  onTabChanged(e){
    this.update();
  }

}
