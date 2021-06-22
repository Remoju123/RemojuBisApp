import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { PlanPanelComponent } from "./plan-panel.component";

describe("PlanPanelComponent", () => {
  let component: PlanPanelComponent;
  let fixture: ComponentFixture<PlanPanelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
