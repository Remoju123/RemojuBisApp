import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanspotListComponent } from './planspot-list.component';

describe('PlanspotListComponent', () => {
  let component: PlanspotListComponent;
  let fixture: ComponentFixture<PlanspotListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanspotListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanspotListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
