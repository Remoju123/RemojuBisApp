import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SearchDialogFormComponent } from './search-dialog-form.component';

describe('SearchDialogFormComponent', () => {
  let component: SearchDialogFormComponent;
  let fixture: ComponentFixture<SearchDialogFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchDialogFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchDialogFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
