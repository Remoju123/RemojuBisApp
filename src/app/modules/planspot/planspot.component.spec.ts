import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanspotComponent } from './planspot.component';

describe('PlanspotComponent', () => {
  let component: PlanspotComponent;
  let fixture: ComponentFixture<PlanspotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanspotComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanspotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
