import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { ImageCropperParam } from "../../class/common.class";
import { ImageCroppedEvent, ImageCropperComponent } from "ngx-image-cropper";
import * as Hammer from "hammerjs";

@Component({
  selector: "app-image-cropper-dialog",
  templateUrl: "./image-cropper-dialog.component.html",
  styleUrls: ["./image-cropper-dialog.component.scss"]
})
export class ImageCropperDialogComponent implements OnInit {
  constructor(
    private translate: TranslateService,
    public dialogRef: MatDialogRef<ImageCropperComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImageCropperParam
  ) { }

  @ViewChild("cropper43") cropper43: ImageCropperComponent;
  @ViewChild("cropper45") cropper45: ImageCropperComponent;
  @ViewChild("cropper11") cropper11: ImageCropperComponent;
  @ViewChild("cropper169") cropper169: ImageCropperComponent;

  isLoaded = false;

  ngOnInit() {

  }

  cropperReady() {
    if (this.data.cropperPosition) {
      switch (this.data.aspectRatio){
        case "1":
          this.cropper43.cropper = this.data.cropperPosition;
          break;
        case "2":
          this.cropper45.cropper = this.data.cropperPosition;
          break;
        case "3":
          this.cropper11.cropper = this.data.cropperPosition;
          break;
        case "4":
          this.cropper169.cropper = this.data.cropperPosition;
          break;
      }
    }
    this.isLoaded = true;
  }

  imageCropped(event: ImageCroppedEvent) {
    // ロード時にデフォルトのcrop処理が走るので、初期値がcropperPositionに入ってしまわないように制御
    if (this.isLoaded) {
      this.data.imageCropped = event.base64;
      this.data.cropperPosition = event.cropperPosition;
    }
  }

  onClickOK(): void {
    this.dialogRef.close(this.data);
  }
}
