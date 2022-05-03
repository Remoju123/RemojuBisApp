import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyplanEditDialogComponent } from './myplan-spot-edit-dialog.component';

describe('MyplanEditDialogComponent', () => {
  let component: MyplanEditDialogComponent;
  let fixture: ComponentFixture<MyplanEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyplanEditDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyplanEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
