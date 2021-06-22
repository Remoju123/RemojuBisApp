import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlcopyDialogComponent } from './urlcopy-dialog.component';

describe('UrlcopyDialogComponent', () => {
  let component: UrlcopyDialogComponent;
  let fixture: ComponentFixture<UrlcopyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UrlcopyDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UrlcopyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
