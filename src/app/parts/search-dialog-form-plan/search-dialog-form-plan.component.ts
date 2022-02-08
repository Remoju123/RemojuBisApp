import { Component, OnInit, Inject, OnDestroy } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ListSelectedPlan, NestDataSelected } from "../../class/common.class";
import { ListSearchCondition } from "../../class/indexeddb.class";
import { CommonService } from "../../service/common.service";
import { TranslateService } from "@ngx-translate/core";
import { FormBuilder, FormArray } from "@angular/forms";
import { Guid } from "guid-typescript";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
//import { FilterPipe } from "ngx-filter-pipe";

@Component({
  selector: "app-search-dialog-form-plan",
  templateUrl: "./search-dialog-form-plan.component.html",
  styleUrls: ["./search-dialog-form-plan.component.scss"]
})
export class SearchDialogFormPlanComponent implements OnInit, OnDestroy {
  result: any;
  condition: ListSearchCondition;
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
    public dialogRef: MatDialogRef<SearchDialogFormPlanComponent>,
    public fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: ListSelectedPlan
  ) {}

  ngOnInit() {
    this.initForm();

  }

  ngOnDestroy() {
    // ローカル変数配列の重複除外
    this.condition.areaId = Array.from(new Set(this.condition.areaId));
    this.condition.areaId2 = Array.from(new Set(this.condition.areaId2));

    this.onDestroy$.next();
  }

  // リセット
  onReset(): void {
      this.data.condition.areaId = [];
      this.data.condition.areaId2 = [];
      this.data.condition.searchCategories = [];

      this.data.mArea.map(x => {
        x.selected = false;
        x.dataSelecteds.map(y => y.selected = false);
      });
      this.data.mSearchCategory.map(x => x.dataSelecteds.map(y => y.selected = false));

      this.dialogRef.close();
  }

  async initForm() {
    this.condition = this.data.condition;

    // マスタエリアカウント取得
    let $mArea = this.data.mArea;
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
    this.searchForm.setControl("areas", this.setFbArray($mArea));

    // マスタカテゴリカウント取得
    let $mCategory = this.data.mSearchCategory.reduce((x, c) => {
      x.push({
        parentId: c["parentId"],
        parentName: c["parentName"],
        selected: true,
        dataSelecteds: c["dataSelecteds"].reduce((y, d) => {
          y.push({
            id: d["id"],
            name: d["name"],
            selected: this.condition.searchCategories.includes(d["id"]) // d["selected"]
          });
          return y;
        }, [])
      });
      return x;
    }, []);

    // カテゴリ分解
    this.searchForm.setControl("cates", this.setFbArray($mCategory));

    this.update();
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
      // 自身以外選択されていたらクリアする
      for (let idx = 0; idx < this.areas.controls.length; idx++) {
        if (i !== idx && this.areas.controls[idx].get("selected")?.value){
          this.onAreaCollapseClose(idx);
        }
      }
      // 選択状態にする
      this.areas.controls[i].get("selected")?.patchValue(true);
      this.update();
    }, 50);
  }

  // エリア-エクスパンションClose
  onAreaCollapseClose(i: number) {
    this.areas.controls[i].get("selected")?.patchValue(false);
    const fa = this.areas.controls[i].get("dataSelecteds") as FormArray;
    fa.controls.map(d => {
      d.get("selected")?.patchValue(false);
    });
    this.update();
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
    }
    this.update();
  }

  // エリア-チェックボックス選択
  onAreaSelection(i: number, j: number) {
    const fa = this.areas.controls[i].get("dataSelecteds") as FormArray;

    // 何か選択されていたらクリアする
    for (let idx = 0; idx < fa.controls.length; idx++){
      if (idx !== j){
        fa.controls[idx].get("selected")?.patchValue(false);
      }
    }
    this.update();
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
    this.update();
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
    this.update();
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

  update() {
    this.condition.areaId = [];
    this.condition.areaId2 = [];
    this.condition.searchCategories = [];

    this.areas.value.map((x: { selected: any; parentId: number; parentName: string; dataSelecteds: any[]; }) => {
      if (x.selected) {
        this.condition.areaId.push(x.parentId);
      }
      x.dataSelecteds.map((y: { selected: any; id: number; name: string; }) => {
        if (y.selected) {
          this.condition.areaId2.push(y.id);
        }
      });
    });

    this.cates.value.map((x: { selected: any; parentId: number; parentName: string; dataSelecteds: any[]; }) => {
      if (x.selected) {
        x.dataSelecteds.map((y: { selected: any; id: number; name: string;}) => {
          if (y.selected) {
            this.condition.searchCategories.push(y.id);
          }
        });
      }
    });
  }

  // フォーム作成 sub
  setFbArray(data: NestDataSelected[]) {
    return this.fb.array(
      data.map(p => {
        return this.fb.group({
          parentId: p.parentId,
          parentName: p.parentName,
          isHighlight:p.isHighlight,
          selected: p.selected,
          dataSelecteds: this.fb.array(
            p.dataSelecteds.map(q => {
              return this.fb.group({
                id: q.id,
                name: q.name,
                selected: q.selected
              });
            })
          )
        });
      })
    );
  }
}
