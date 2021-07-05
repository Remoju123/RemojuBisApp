import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanspotSelectorComponent } from './planspot-selector.component';

describe('PlanspotSelectorComponent', () => {
  let component: PlanspotSelectorComponent;
  let fixture: ComponentFixture<PlanspotSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanspotSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanspotSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
