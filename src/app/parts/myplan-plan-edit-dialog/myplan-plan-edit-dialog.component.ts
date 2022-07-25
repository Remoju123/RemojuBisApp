import { Component, OnInit,OnDestroy, Inject } from '@angular/core';
import { CommonService } from "../../service/common.service";
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from "rxjs/operators";
import { NestDataSelected, ImageCropperParam, EditPlanParam, MyPlanApp } from 'src/app/class/common.class';
import { IndexedDBService } from 'src/app/service/indexeddb.service';
import { ImageCropperDialogComponent } from "../../parts/image-cropper-dialog/image-cropper-dialog.component";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-myplan-plan-edit-dialog',
  templateUrl: './myplan-plan-edit-dialog.component.html',
  styleUrls: ['./myplan-plan-edit-dialog.component.scss']
})
export class MyplanPlanEditDialogComponent implements OnInit,OnDestroy {
  private onDestroy$ = new Subject();

  constructor(
    public commonService: CommonService,
    private indexedDBService: IndexedDBService,
    private translate: TranslateService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public p:EditPlanParam
  ) {
    this.row = p.myPlanApp;
  }

  row:MyPlanApp;
  $area: NestDataSelected[];

  get lang() {
    return this.translate.currentLang;
  }

  ngOnInit(): void {
    this.$area = this.p.mArea;
  }

  ngOnDestroy() {
    this.onDestroy$.next();
  }

  // プランメイン写真
  async onClickSelectPhotoPlan(e:any) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0] as File;
      const img = await this.commonService.imageSize(file);
      this.row.picturePreviewUrl = img.previewUrl;
      this.row.pictureFile = img.file;
    }
  }

  // プランメイン写真削除
  onClickPhotoDeletePlan(): void {
    this.row.pictureFile = null;
    this.row.picturePreviewUrl = null;
    this.row.pictureUrl = null;
    this.row.imageCropped = null;
    this.row.cropperPosition = null;
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
      //position: { top: "10px" },
      data: param,
      autoFocus: false
    });

    dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((r: any) => {
      if (r && r !== "cancel"){
        //console.log(r);
        this.row.imageCropped = r.imageCropped;
        this.row.aspectRatio = r.aspectRatio;
        this.row.cropperPosition = r.cropperPosition;
      }
    });
  }



}
