import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { MypageFavoriteListComponent } from "./mypage-favoritelist.component";

describe("MypageFavoritelistComponent", () => {
  let component: MypageFavoriteListComponent;
  let fixture: ComponentFixture<MypageFavoriteListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MypageFavoriteListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MypageFavoriteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
