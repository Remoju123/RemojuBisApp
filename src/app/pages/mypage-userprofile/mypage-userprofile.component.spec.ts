import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { MypageUserprofileComponent } from "./mypage-userprofile.component";

describe("MypageUserprofileComponent", () => {
  let component: MypageUserprofileComponent;
  let fixture: ComponentFixture<MypageUserprofileComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MypageUserprofileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MypageUserprofileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
