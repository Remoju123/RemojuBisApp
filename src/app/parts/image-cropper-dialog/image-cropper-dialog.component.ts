import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
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
    public dialogRef: MatDialogRef<ImageCropperComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImageCropperParam
  ) { }

  @ViewChild("cropper") croper: ImageCropperComponent;

  aspectRatio:number = 4/3;
  cropperPosition: any;

  ngOnInit() {
    if (!this.data.roundCropper) {
      this.data.roundCropper = false;
    } else {
      this.data.isAspectRatio = false;
      this.data.aspectRatio = "1 / 1";
    }

    switch(this.data.aspectRatio){
      case "4 / 3":
        this.aspectRatio = 4/3;
        break;
      case "4 / 5":
        this.aspectRatio = 4/5;
        break;
      case "1 / 1":
        this.aspectRatio = 1;
        break;
      case "16 / 9":
        this.aspectRatio = 16/9;
        break;
      default:
        this.data.aspectRatio = "4 / 3";
        this.aspectRatio = 4/3;
        break;
    }
  }

  cropperReady() {
    if (this.data.cropperPosition) {
      this.croper.cropper = JSON.parse(JSON.stringify(this.data.cropperPosition));
      this.cropperPosition = JSON.parse(JSON.stringify(this.data.cropperPosition));
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.data.imageCropped = event.base64;
    // ロード時にデフォルトポジションのcrop処理が走るので、初期値がdata.cropperPositionに入らないように別変数に入れている
    this.cropperPosition = event.cropperPosition;
  }

  onClickOK(): void {
    this.data.cropperPosition = this.cropperPosition;
    this.dialogRef.close(this.data);
  }

  classes = ['1','2','3','4'];
  index = 0;
  onClickToggle(){
    if (!this.data.isAspectRatio){
      return;
    }

    const len = this.classes.length;
    this.index = this.index;
    const val = this.classes[this.index++ % len];
    switch(val){
      case "1":
        this.aspectRatio = 4/3;
        this.data.aspectRatio = "4 / 3"
        break;
      case "2":
        this.aspectRatio = 4/5;
        this.data.aspectRatio = "4 / 5"
        break;
      case "3":
        this.aspectRatio = 1;
        this.data.aspectRatio = "1 / 1"
        break;
      case "4":
        this.aspectRatio = 16/9;
        this.data.aspectRatio = "16 / 9"
        break;
    }
  }
}
