import { Component, OnInit, Inject, OnDestroy } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ListSelected } from "../../class/common.class";
import { ListSearchCondition } from "../../class/indexeddb.class";
import { SpotAppList, searchResult } from "../../class/spotlist.class";
import { TranslateService } from "@ngx-translate/core";
import { SpotListService } from "../../service/spotlist.service";
import { CommonService } from "../../service/common.service";
import { IndexedDBService } from "../../service/indexeddb.service";
import { FormBuilder, FormArray } from "@angular/forms";
import { Guid } from "guid-typescript";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FilterPipe } from "ngx-filter-pipe";

@Component({
  selector: "app-search-dialog-form",
  templateUrl: "./search-dialog-form.component.html",
  styleUrls: ["./search-dialog-form.component.scss"]
})
export class SearchDialogFormComponent implements OnInit, OnDestroy {
  tabIndex = 0;
  result: any;
  condition: ListSearchCondition;
  temparea: any[] = [];
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
    private ls: SpotListService,
    private cs: CommonService,
    private idx: IndexedDBService,
    private filterPipe: FilterPipe,
    public dialogRef: MatDialogRef<SearchDialogFormComponent>,
    public fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: ListSelected
  ) {}

  ngOnInit() {
    this.tabIndex = this.data.tabIndex;
    // Formデータ初期化
    this.initForm(this.data.spotList);

    this.ls.searchFilter.pipe(takeUntil(this.onDestroy$)).subscribe((result:searchResult)=>{
      this.result = result.list;
      this.searchTarm = result.searchTarm;
    })
  }

  ngOnDestroy() {
    // ローカル変数配列の重複除外
    this.condition.areaId = Array.from(new Set(this.condition.areaId));
    this.condition.areaId2 = Array.from(new Set(this.condition.areaId2));
    // this.condition.isOpens = Array.from(new Set(this.condition.isOpens));

    // 検索条件選択値を更新
    this.idx.registListSearchConditionSpot(this.condition);

    this.onDestroy$.next();
  }
  // リセット
  onReset(): void {-
    // setTimeout(() => {
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

      this.addes.controls.map(x => {
        const sub = x.get("dataSelecteds") as FormArray;
        sub.controls.map(y => {
          y.get("selected").patchValue(false);
        });
      });

      this.condition.areaId = [];
      this.condition.areaId2 = [];
      this.condition.searchCategories = [];
      this.condition.searchOptions = [];

      this.filteringData();
      this.dialogRef.close(this.result);
    // }, 1000);
  }

  async initForm(spots: SpotAppList[]) {
    // 検索条件選択値を取得
    let condition: any = await this.idx.getListSearchConditionSpot();
    if (condition){
      this.condition = condition;
    } else {
      this.condition = new ListSearchCondition();
    }

    // マスタエリアカウント取得
    const $mArea = this.ls.reduceMasterArea(
      this.data.mArea,
      spots,
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
    const $mCategory = this.ls.reduceMasterCategory(
      this.data.mSearchCategory,
      spots,
      arr1
    );
    // カテゴリ分解
    const $_Category = $mCategory.filter(x => x.parentId < 299);
    this.searchForm.setControl("cates", this.setFbArray($_Category));
    const $_AddOption = $mCategory.filter(x => x.parentId > 300);
    this.searchForm.setControl("addes", this.setFbArray($_AddOption));

    this.filteringData();
  }

  /*----------------------------
   *
   * エリア
   *
   *  ---------------------------*/
  // エリア-エクスパンションOpen
  onAreaCollapseOpen(i: number, id: number) {
    // subエリアを再現する場合にExpression has changed after it was checked.となることを防止する。
    setTimeout(() => {
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
      // this.condition.isOpens.push(i);
      this.filteringData();
    }, 50);
  }

  // エリア-エクスパンションClose
  onAreaCollapseClose(i: number) {
    this.areas.controls[i].get("selected").patchValue(false);
    const fa = this.areas.controls[i].get("dataSelecteds") as FormArray;
    fa.controls.map(d => {
      d.get("selected").patchValue(false);
    });

    // this.condition.isOpens = this.condition.isOpens.filter(x => x !== i);
    this.filteringData();
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
      // this.condition.isOpens = this.condition.isOpens.filter(x => x !== i);
    }
    this.filteringData();
  }

  // エリア-チェックボックス選択
  onAreaSelection(i: number, id: number) {
    const fa = this.areas.controls[i].get("dataSelecteds") as FormArray;

    if (fa.controls.length !== 1) {
      if (this.cs.isSome(fa)) {
        this.areas.controls[i].get("selected").patchValue(false);
      } else {
        this.areas.controls[i].get("selected").patchValue(true);
      }

      // 全選択時に選択状態をクリアして親のみを選択状態にする⇒なし
      // if (this.cs.isEvery(fa)) {
      //   fa.controls.map(d => {
      //     d.get("selected").patchValue(false);
      //   });
      //   this.areas.controls[i].get("selected").patchValue(true);
      // }
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
      if (x.get("qty").value > 0) {
        this.condition.searchCategories.push(x.get("id").value);
        x.get("selected").patchValue(true);
      }
    });

    this.filteringData();
  }
  // カテゴリ-キャンセル
  onCatCancelAll(i: number) {
    const data = this.cates.controls[i].get("dataSelecteds") as FormArray;
    data.controls.map(x => {
      this.condition.searchCategories = this.condition.searchCategories.filter(
        v => v === x.get("id").value
      );
      x.get("selected").patchValue(false);
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
   * さらに条件追加
   *
   *  ---------------------------*/
  // さらに条件追加チェック
  onAddesChange(e: any) {
    if (e.target.checked) {
      this.condition.searchOptions.push(Number(e.target["id"]));
    } else {
      this.condition.searchOptions = this.condition.searchOptions.filter(
        x => x !== Number(e.target["id"])
      );
    }
    this.filteringData();
  }

  onAddesChancelAll(i: number) {
    const data = this.addes.controls[i].get("dataSelecteds") as FormArray;
    data.controls.map(x => {
      this.condition.searchOptions = this.condition.searchOptions.filter(
        v => v !== x.get("id").value
      );
      x.get("selected").patchValue(false);
    });
    this.filteringData();
  }

  /*----------------------------
   *
   * 検索処理
   * 選択した条件でフィルタして、バインドフォームデータの登録数を更新する
   *
   *  ---------------------------*/
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
    // this.ls.getSearchFilter(this.data,this.condition);
    this.result = this.ls.getSearchAreaFilter(this.data,this.condition);

    // カテゴリ・さらに条件追加条件を更新
    const $mCategory = this.ls.reduceQty(
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
    this.ls.getSearchFilter(this.data,this.condition);
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
