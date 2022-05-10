import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyplanPlanEditDialogComponent } from './myplan-plan-edit-dialog.component';

describe('MyplanPlanEditDialogComponent', () => {
  let component: MyplanPlanEditDialogComponent;
  let fixture: ComponentFixture<MyplanPlanEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyplanPlanEditDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyplanPlanEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
