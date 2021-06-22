import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { MapInfowindowDialogComponent } from "./map-infowindow-dialog.component";

describe("MapInfowindowDialogComponent", () => {
  let component: MapInfowindowDialogComponent;
  let fixture: ComponentFixture<MapInfowindowDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MapInfowindowDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapInfowindowDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
