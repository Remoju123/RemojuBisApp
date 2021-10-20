import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MypageReviewlistComponent } from './mypage-reviewlist.component';

describe('MypageReviewlistComponent', () => {
  let component: MypageReviewlistComponent;
  let fixture: ComponentFixture<MypageReviewlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MypageReviewlistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MypageReviewlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
