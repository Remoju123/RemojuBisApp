import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SpinnerLoadingIndicatorComponent } from './spinner-loading-indicator.component';

describe('SpinnerLoadingIndicatorComponent', () => {
  let component: SpinnerLoadingIndicatorComponent;
  let fixture: ComponentFixture<SpinnerLoadingIndicatorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SpinnerLoadingIndicatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpinnerLoadingIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
