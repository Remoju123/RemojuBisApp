import { Component, OnInit, Inject, OnDestroy } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ListSelectedPlan } from "../../class/common.class";
import { ListSearchCondition } from "../../class/indexeddb.class";
import { PlanAppList, searchResult} from "../../class/planlist.class";
import { CommonService } from "../../service/common.service";
import { IndexedDBService } from "../../service/indexeddb.service";
import { PlanListService } from "../../service/planlist.service";
import { TranslateService } from "@ngx-translate/core";
import { SpotListService } from "../../service/spotlist.service";
import { FormBuilder, FormArray } from "@angular/forms";
import { Guid } from "guid-typescript";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FilterPipe } from "ngx-filter-pipe";

@Component({
  selector: "app-search-dialog-form-plan",
  templateUrl: "./search-dialog-form-plan.component.html",
  styleUrls: ["./search-dialog-form-plan.component.scss"]
})
export class SearchDialogFormPlanComponent implements OnInit, OnDestroy {
  tabIndex = 0;
  result: any;
  condition: ListSearchCondition;
  temparea: any[];
  $mArea: any;
  searchTarm: any;

  private onDestroy$ = new Subject();

  get lang() {
    return this.translate.currentLang;
  }

  get guid() {
    return Guid.create().toString();
  }

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

  constructor(
    private translate: TranslateService,
    private cs: CommonService,
    private idx: IndexedDBService,
    private ps: PlanListService,
    private ss: SpotListService,
    public dialogRef: MatDialogRef<SearchDialogFormPlanComponent>,
    public fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: ListSelectedPlan
  ) {}

  ngOnInit() {
    this.tabIndex = this.data.tabIndex;
    // Formデータ初期化
    this.initForm(this.data.planList);

    this.ps.searchFilter.pipe(takeUntil(this.onDestroy$)).subscribe((result:searchResult)=>{
      this.result = result.list;
      this.searchTarm = result.searchTarm;
    });

    this.ps.searchFilterNoList.pipe(takeUntil(this.onDestroy$)).subscribe((result:searchResult)=>{
      this.result = result.list;
      this.searchTarm = result.searchTarm;
    });

  }

  ngOnDestroy() {
    // ローカル変数配列の重複除外
    this.condition.areaId = Array.from(new Set(this.condition.areaId));
    this.condition.areaId2 = Array.from(new Set(this.condition.areaId2));
    // this.condition.isOpens = Array.from(new Set(this.condition.isOpens));
   
    // 検索条件選択値を更新
    if (this.data.isList) {
      this.idx.registListSearchConditionPlan(this.condition);
    }

    this.onDestroy$.next();
  }

  // リセット
  onReset(): void {
    // setTimeout(() => {
      this.areas.controls.map(x => {
        x.get("selected")?.patchValue(false);
        const sub = x.get("dataSelecteds") as FormArray;
        sub.controls.map(y => {
          y.get("selected")?.patchValue(false);
        });
      });

      this.cates.controls.map(x => {
        const sub = x.get("dataSelecteds") as FormArray;
        sub.controls.map(y => {
          y.get("selected")?.patchValue(false);
        });
      });

      this.addes.controls.map(x => {
        const sub = x.get("dataSelecteds") as FormArray;
        sub.controls.map(y => {
          y.get("selected")?.patchValue(false);
        });
      });

      this.condition.areaId = [];
      this.condition.areaId2 = [];
      this.condition.searchCategories = [];
      this.condition.searchOptions = [];

      this.filteringData();

      if (!this.data.isList){
        this.data.mArea.map(x => {
          x.selected = false;
          x.dataSelecteds.map(y => y.selected = false);
        });
        this.data.mSearchCategory.map(x => x.dataSelecteds.map(y => y.selected = false));
      }
      this.dialogRef.close(this.result);
    // }, 1000);
  }

  async initForm(list: PlanAppList[]) {
    // 検索条件選択値を取得
    let condition: any = await this.idx.getListSearchConditionPlan();
    if (condition && this.data.isList){
      this.condition = condition;
    } else if (this.data.condition && !this.data.isList) {
      this.condition = this.data.condition;
    } else {
      this.condition = new ListSearchCondition();
    }

    // マスタエリアカウント取得
    let $mArea = this.data.mArea;
    if (this.data.isList) {
      $mArea = this.ss.reduceMasterArea(
        this.data.mArea,
        list,
        this.condition.areaId,
        this.condition.areaId2
      );
    } else {
      $mArea.map(x => {
        if (this.condition.areaId && this.condition.areaId.length > 0){
          x.selected = x.parentId === this.condition.areaId[0] ? true: false;
        }
        if (this.condition.areaId2 && this.condition.areaId2.length > 0){
          x.dataSelecteds.map(x => {
            x.selected = x.id === this.condition.areaId2[0] ? true: false;
          });
        }
      });
    }

    this.temparea = [...$mArea];

    this.searchForm.setControl("areas", this.setFbArray($mArea));

    // マスタカテゴリカウント取得
    const $mCategory = this.ss.reduceMasterCategory(
      this.data.mSearchCategory,
      list,
      this.condition.searchCategories
    );
    // カテゴリ分解
    this.searchForm.setControl("cates", this.setFbArray($mCategory));

    this.filteringData();
  }
  
  /*----------------------------
   *
   * エリア
   *
   *  ---------------------------*/
  // エリア-エクスパンションOpen
  onAreaCollapseOpen(i: number) {
    // subエリアを再現する場合にExpression has changed after it was checked.となることを防止する。
    setTimeout(() => {
      // 複数選択可
      if (this.data.isList) {      
        this.areas.controls[i].get("selected")?.patchValue(true);
        const fa = this.areas.controls[i].get("dataSelecteds") as FormArray;

        // エリアのsubエリアがひとつしかない場合、最初のサブエリアをチェックする
        if (fa.length === 1) {
          if (fa.controls[0].get("qty")?.value > 0) {
            this.areas.controls[i].get("selected")?.patchValue(false);
            fa.controls[0].get("selected")?.patchValue(true);
          }
        }
        // subエリアがチェックされていた場合は、親エリアのチェツクを外す
        if (this.cs.isSome(fa)) {
          this.areas.controls[i].get("selected")?.patchValue(false);
        }
      // 1つのみ選択可
      } else {
        // 自身以外選択されていたらクリアする
        for (let idx = 0; idx < this.areas.controls.length; idx++) {
          if (i !== idx && this.areas.controls[idx].get("selected")?.value){
            this.onAreaCollapseClose(idx);
          }
        }
        // 選択状態にする
        this.areas.controls[i].get("selected")?.patchValue(true);
      }
      // this.condition.isOpens.push(i);
      this.filteringData();
    }, 50);
  }

  // エリア-エクスパンションClose
  onAreaCollapseClose(i: number) {
    this.areas.controls[i].get("selected")?.patchValue(false);
    const fa = this.areas.controls[i].get("dataSelecteds") as FormArray;
    fa.controls.map(d => {
      d.get("selected")?.patchValue(false);
    });

    // this.condition.isOpens = this.condition.isOpens.filter(x => x !== i);
    this.filteringData();
  }

  // エリア-サブエリア選択時のすべて選択
  onAreaAllClick(i: number) {
    const fa = this.areas.controls[i].get("dataSelecteds") as FormArray;
    if (this.areas.controls[i].get("selected")?.value === false) {
      this.areas.controls[i].get("selected")?.patchValue(true);
      fa.controls.map(d => {
        d.get("selected")?.patchValue(false);
      });
    } else {
        this.areas.controls[i].get("selected")?.patchValue(false);
        // this.condition.isOpens = this.condition.isOpens.filter(x => x !== i);
    }
    this.filteringData();
  }

  // エリア-チェックボックス選択
  onAreaSelection(i: number, j: number) {
    const fa = this.areas.controls[i].get("dataSelecteds") as FormArray;

    // 複数選択可
    if (this.data.isList) {
      if (fa.length !== 1) {
        if (this.cs.isSome(fa)) {
          this.areas.controls[i].get("selected")?.patchValue(false);
        } else {
          this.areas.controls[i].get("selected")?.patchValue(true);
        }

        // 全選択時に選択状態をクリアして親のみを選択状態にする⇒なし
        /*if (this.cs.isEvery(fa)) {
          fa.controls.map(d => {
            d.get("selected").patchValue(false);
          });
          this.areas.controls[i].get("selected").patchValue(true);
        }*/
        this.filteringData();
      }
    // 1つのみ選択可
    } else {
      // 何か選択されていたらクリアする
      for (let idx = 0; idx < fa.controls.length; idx++){
        if (idx !== j){
          fa.controls[idx].get("selected")?.patchValue(false);
        }
      }
      this.filteringData();
    }
  }

  // エリア-エクスパンション状態
  // *isOpensのパラメータはindexです。
  isExpended(i: number) {
    // return this.condition.isOpens.some(x => x === i);
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

  /*----------------------------
   *
   * カテゴリ
   *
   *  ---------------------------*/
  // カテゴリ-全選択
  onCatSelectAll(i: number) {
    const data = this.cates.controls[i].get("dataSelecteds") as FormArray;
    data.controls.map(x => {
      if (x.get("qty")?.value > 0) {
        this.condition.searchCategories.push(x.get("id")?.value);
        x.get("selected")?.patchValue(true);
      }
    });

    this.filteringData();
  }
  // カテゴリ-キャンセル
  onCatCancelAll(i: number) {
    const data = this.cates.controls[i].get("dataSelecteds") as FormArray;
    data.controls.map(x => {
      this.condition.searchCategories = this.condition.searchCategories.filter(
        v => v === x.get("id")?.value
      );
      x.get("selected")?.patchValue(false);
    });
    this.filteringData();
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
    this.filteringData();
  }

  /*----------------------------
   *
   * 検索処理
   * 選択した条件でフィルタして、バインドフォームデータの登録数を更新する
   *
   *  ---------------------------*/
  filteringData() {
    // エリア検索用パラメータ
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
    this.temparea.forEach((x) => {
      this.areas.controls
        .find(y => y.value["parentId"] === x.parentId)
        .get("qty")
        .patchValue(x.qty);

      const sub = this.areas.controls
        .find(y => y.value["parentId"] === x.parentId)
        .get("dataSelecteds") as FormArray;

      x.dataSelecteds.forEach((y: { qty: number; }, j: any) => {
        sub.controls[j].get("qty").patchValue(y.qty);
        if (y.qty === 0 && this.data.isList) {
          sub.controls[j].get("selected").patchValue(false);
        }
      });
    });

    // 検索結果フィルタリング処理
    // this.ps.getSearchFilter(this.data,this.condition);
    this.result = this.ps.getSearchAreaFilter(this.data,this.condition);

    // カテゴリ・さらに条件追加
    const $mCategory = this.ss.reduceQty(
      this.data.mSearchCategory,
      this.result
    );
    // カテゴリ
    $mCategory.forEach((x, i) => {
      this.cates.controls[i].get("qty")?.patchValue(x.qty);
      const sub = this.cates.controls[i].get("dataSelecteds") as FormArray;
      x.dataSelecteds.forEach((y: { qty: number; }, j: any) => {
        sub.controls[j].get("qty").patchValue(y.qty);
        if (y.qty === 0 && this.data.isList) {
          sub.controls[j].get("selected").patchValue(false);
          // categoryId選択の矛盾をクリア
          this.condition.searchCategories = this.condition.searchCategories.filter(
            z => z !== sub.controls[j].get("id").value
          );
        }
      });
    });

    // 検索結果フィルタリング処理
    this.ps.getSearchFilter(this.data,this.condition);
  }

  // フォーム作成 sub
  setFbArray(data: any) {
    return this.fb.array(
      data.map((p: { parentId: any; parentName: any; qty: any; isHighlight: any; selected: any; dataSelecteds: any[]; }) => {
        return this.fb.group({
          parentId: p.parentId,
          parentName: p.parentName,
          qty: p.qty,
          isHighlight:p.isHighlight,
          selected: p.selected,
          dataSelecteds: this.fb.array(
            p.dataSelecteds.map((q: { id: any; name: any; qty: any; selected: any; }) => {
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
}
