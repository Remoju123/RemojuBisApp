import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { SpotListComponent } from "./spot-list.component";

describe("SpotListComponent", () => {
  let component: SpotListComponent;
  let fixture: ComponentFixture<SpotListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SpotListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpotListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
