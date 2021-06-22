import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { SpotDetailDialogComponent } from "./spot-detail-dialog.component";

describe("SpotDetailDialogComponent", () => {
  let component: SpotDetailDialogComponent;
  let fixture: ComponentFixture<SpotDetailDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SpotDetailDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpotDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
