import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffcialComponent } from './offcial.component';

describe('OffcialComponent', () => {
  let component: OffcialComponent;
  let fixture: ComponentFixture<OffcialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OffcialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OffcialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
