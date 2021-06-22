import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { SystemErrorComponent } from "./system-error.component";

describe("SystemErrorComponent", () => {
  let component: SystemErrorComponent;
  let fixture: ComponentFixture<SystemErrorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
