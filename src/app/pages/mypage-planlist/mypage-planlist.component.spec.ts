import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { MypagePlanListComponent } from "./mypage-planlist.component";

describe("MypagePlanComponent", () => {
  let component: MypagePlanListComponent;
  let fixture: ComponentFixture<MypagePlanListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MypagePlanListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MypagePlanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
