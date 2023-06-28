import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from "@ngx-translate/core";
import { Editparams, ImageCropperParam, MyPlanApp, PlanSpotCommon, PlanUserPicture } from 'src/app/class/common.class';
import { CommonService } from 'src/app/service/common.service';
import { ImageCropperDialogComponent } from '../image-cropper-dialog/image-cropper-dialog.component';

@Component({
  selector: 'app-myplan-spot-edit-dialog',
  templateUrl: './myplan-spot-edit-dialog.component.html',
  styleUrls: ['./myplan-spot-edit-dialog.component.scss']
})
export class MyplanSpotEditDialogComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject();

  constructor(
    public commonService: CommonService,
    private translate: TranslateService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<MyplanSpotEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public p: Editparams
  ) {
    this.row = p.myPlan;
  }

  // 作成中のプラン
  row: MyPlanApp;

  step:number;

  get lang() {
    return this.translate.currentLang;
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.onDestroy$.next();
  }

  onChangeTransfer(e:any) {
    this.row.isTransferSearch = true;
    this.row.optimized = false;
  }

  // スポット写真
  async onClickSelectPhotoSpot(e: any, planSpot: PlanSpotCommon) {
    if (e.target.files) {
      for (let i = 0; i < e.target.files.length; i++) {
        if (e.target.files[i]) {
          const file = e.target.files[i] as File;
          const img = await this.commonService.imageSize(file);
          let picture = new PlanUserPicture();
          picture.display_order = planSpot.displayOrder;
          if (planSpot.planUserpictures) {
            picture.picture_display_order = planSpot.planUserpictures.length + 1;
          } else {
            picture.picture_display_order = 1;
          }
          picture.pictureFile = img.file;
          picture.picturePreviewUrl = img.previewUrl;
          if (planSpot.planUserpictures) {
            planSpot.planUserpictures.push(picture);
          } else {
            planSpot.planUserpictures = [picture];
          }
        }
      }
    }
  }

  // スポット写真削除
  onClickPhotoDeleteSpot(planSpot: PlanSpotCommon, picture: PlanUserPicture) {
    planSpot.planUserpictures.splice(
      planSpot.planUserpictures.findIndex(
        v => v.picture_display_order === picture.picture_display_order
      ),
      1
    );
    let i = 1;
    planSpot.planUserpictures.forEach(picture => {
      picture.picture_display_order = i++;
    });
  }

  onClickCropSpot(planSpot: PlanSpotCommon, picture: PlanUserPicture) {
    let param = new ImageCropperParam();
    if (picture.picture_display_order === 1) {
      param.isAspectRatio = true;
    } else {
      param.isAspectRatio = false;
    }
    param.aspectRatio = planSpot.aspectRatio;
    param.cropperPosition = picture.cropperPosition;
    param.imageCropped = picture.imageCropped;
    param.pictureFile = picture.pictureFile;
    param.picturePreviewUrl = picture.picturePreviewUrl;
    const dialogRef = this.dialog.open(ImageCropperDialogComponent, {
      id: "imgcrop",
      maxWidth: "100%",
      width: "92vw",
      //position: { top: "10px" },
      data: param,
      autoFocus: false
    });

    dialogRef.afterClosed().pipe(takeUntil(this.onDestroy$)).subscribe((r: any) => {
      if (r && r !== "cancel") {


        const idx = this.row.planSpots.findIndex(x => x.displayOrder === planSpot.displayOrder);
        const idxPic = this.row.planSpots[idx].planUserpictures.findIndex(x => x.picture_display_order === picture.picture_display_order);

        this.row.planSpots[idx].planUserpictures[idxPic].imageCropped = r.imageCropped;
        this.row.planSpots[idx].aspectRatio = r.aspectRatio;
        this.row.planSpots[idx].planUserpictures[idxPic].cropperPosition = r.cropperPosition;
      }
    });
  }

  // 画像順番入れ替え
  onClickSpotPicture(picture: PlanUserPicture) {
    const index = picture.picture_display_order - 1;
    let pictures = this.row.planSpots[picture.display_order - 1].planUserpictures;
    // 下の画像-1
    pictures[index + 1].picture_display_order -= 1;
    // 上の画像+1
    pictures[index].picture_display_order += 1;
    // 配列の入れ替え
    [pictures[index], pictures[index + 1]] = [pictures[index + 1], pictures[index]];
    // 保存
  }

  myTrackBy(index: number): any {
    return index;
  }

  setStep(i:number){
    this.step = i;
  }

}
