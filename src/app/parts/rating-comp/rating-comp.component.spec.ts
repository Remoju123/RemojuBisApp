import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingCompComponent } from './rating-comp.component';

describe('RatingCompComponent', () => {
  let component: RatingCompComponent;
  let fixture: ComponentFixture<RatingCompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RatingCompComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RatingCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
