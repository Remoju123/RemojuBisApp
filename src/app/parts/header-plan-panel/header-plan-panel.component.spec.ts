import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HeaderPlanPanelComponent } from './header-plan-panel.component';

describe('HeaderPlanPanelComponent', () => {
  let component: HeaderPlanPanelComponent;
  let fixture: ComponentFixture<HeaderPlanPanelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderPlanPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderPlanPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
