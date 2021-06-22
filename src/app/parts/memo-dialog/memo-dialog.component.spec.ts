import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { MemoDialogComponent } from "./memo-dialog.component";

describe("MemoDialogComponent", () => {
  let component: MemoDialogComponent;
  let fixture: ComponentFixture<MemoDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MemoDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
