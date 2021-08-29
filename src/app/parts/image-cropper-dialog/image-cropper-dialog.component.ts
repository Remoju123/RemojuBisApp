import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { ImageCropperParam } from "../../class/common.class";
import { ImageCroppedEvent, ImageCropperComponent, LoadedImage } from "ngx-image-cropper";
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

  @ViewChild("cropper") croper: ImageCropperComponent;

  isLoaded = false;
  temp:number = 0;

  ngOnInit() {
  }

  cropperReady() {
    // if (this.data.cropperPosition) {
    //   switch (this.data.aspectRatio){
    //     case "1":
    //       this.cropper43.cropper = this.data.cropperPosition;
    //       break;
    //     case "2":
    //       this.cropper45.cropper = this.data.cropperPosition;
    //       break;
    //     case "3":
    //       this.cropper11.cropper = this.data.cropperPosition;
    //       break;
    //     case "4":
    //       this.cropper169.cropper = this.data.cropperPosition;
    //       break;
    //   }
    // }
    // this.isLoaded = true;
    //console.log(this.data);
    switch(this.data.aspectRatio){
      case "4 / 3":
        this.temp = 4/3;
        break;
      case "4 / 5":
        this.temp = 4/5;
        break;
      case "1 / 1":
        this.temp = 1;
        break;
      case "16 / 9":
        this.temp = 16/9;
        break;
    }

    this.aspectRatio = this.temp === 0? 4/3:this.temp;
    //this.croper.cropper = this.data.cropperPosition;
    
    this.isLoaded = true;
  }

  imageCropped(event: ImageCroppedEvent) {
    // ロード時にデフォルトのcrop処理が走るので、初期値がcropperPositionに入ってしまわないように制御
    if (this.isLoaded) {
      this.data.imageCropped = event.base64;
      this.data.cropperPosition = event.cropperPosition;
    }
  }

  imageLoaded(image: LoadedImage) {
    // show cropper
  }

  onClickOK(): void {
    this.dialogRef.close(this.data);
  }

  aspectRatio:number = 4/3;

  classes = ['1','2','3','4'];
  index = 0;
  onClickToggle(){
    const len = this.classes.length;
    this.index = this.index;
    const val = this.classes[this.index++ % len];
    console.log(val);
    //this.data.aspectRatio = val;
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
    //this.temp = this.aspectRatio;
    
  }
}
