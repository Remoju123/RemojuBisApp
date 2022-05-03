import { Component, OnInit,OnDestroy, Inject } from '@angular/core';
import { CommonService } from "../../service/common.service";
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from "rxjs/operators";
import { ImageCropperParam, MyPlanApp } from 'src/app/class/common.class';
import { IndexedDBService } from 'src/app/service/indexeddb.service';
import { ImageCropperDialogComponent } from "../../parts/image-cropper-dialog/image-cropper-dialog.component";
import { PlanApp } from 'src/app/class/plan.class';

@Component({
  selector: 'app-myplan-plan-edit-dialog',
  templateUrl: './myplan-plan-edit-dialog.component.html',
  styleUrls: ['./myplan-plan-edit-dialog.component.scss']
})
export class MyplanPlanEditDialogComponent implements OnInit,OnDestroy {
  private onDestroy$ = new Subject();
  
  constructor(
    private commonService: CommonService,
    private indexedDBService: IndexedDBService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public p:MyPlanApp
  ) { 
    this.row = p;
  }

  row:MyPlanApp;

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.onDestroy$.next();
  }

  // 変更時保存
  onChange(value: boolean){
    // 移動方法(一旦trueになったらfalseがきてもtrueのままにする)
    if (!this.row.isTransferSearch){
      this.row.isTransferSearch = value;
    }
    if (value) {
      this.row.optimized = false;
    }
    // 保存
    this.registPlan(false);
  }

  // プランをIndexedDBに保存
  registPlan(isSaved: boolean){
    // 未保存プランの場合、常にステータスは未保存
    if(this.row.planUserId === 0){
      this.row.isSaved = false;
    } else {
      this.row.isSaved = isSaved;
    }
    this.indexedDBService.registPlan(this.row);
  }

  // プランメイン写真
  async onClickSelectPhotoPlan(e:any) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0] as File;
      const img = await this.commonService.imageSize(file);
      this.row.picturePreviewUrl = img.previewUrl;
      this.row.pictureFile = img.file;
      this.onChange(false);
    }
  }

  // プランメイン写真削除
  onClickPhotoDeletePlan(): void {
    this.row.pictureFile = null;
    this.row.picturePreviewUrl = null;
    this.row.pictureUrl = null;
    this.row.imageCropped = null;
    this.row.cropperPosition = null;
    this.onChange(false);
  }

  onClickCropPlan() {
    let param = new ImageCropperParam();

    param.isAspectRatio = true;
    param.aspectRatio = this.row.aspectRatio;
    param.cropperPosition = this.row.cropperPosition;
    param.imageCropped = this.row.imageCropped;
    param.pictureFile = this.row.pictureFile;
    param.picturePreviewUrl = this.row.picturePreviewUrl;
    const dialogRef = this.dialog.open(ImageCropperDialogComponent, {
      id: "imgcrop",
      maxWidth: "100%",
      width: "92vw",
      position: { top: "10px" },
      data: param,
      autoFocus: false
    });

    dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((r: any) => {
      if (r && r !== "cancel"){
        //console.log(r);
        this.row.imageCropped = r.imageCropped;
        this.row.aspectRatio = r.aspectRatio;
        this.row.cropperPosition = r.cropperPosition;
        this.onChange(false);
      }
    });
  }



}
