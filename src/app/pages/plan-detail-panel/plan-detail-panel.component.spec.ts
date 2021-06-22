import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanDetailPanelComponent } from './plan-detail-panel.component';

describe('PlanDetailPanelComponent', () => {
  let component: PlanDetailPanelComponent;
  let fixture: ComponentFixture<PlanDetailPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanDetailPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanDetailPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
