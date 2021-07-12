import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanspotListItemComponent } from './planspot-list-item.component';

describe('PlanspotListItemComponent', () => {
  let component: PlanspotListItemComponent;
  let fixture: ComponentFixture<PlanspotListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanspotListItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanspotListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
