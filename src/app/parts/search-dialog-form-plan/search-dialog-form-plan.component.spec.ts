import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SearchDialogFormPlanComponent } from './search-dialog-form-plan.component';

describe('SearchDialogFormPlanComponent', () => {
  let component: SearchDialogFormPlanComponent;
  let fixture: ComponentFixture<SearchDialogFormPlanComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchDialogFormPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchDialogFormPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
