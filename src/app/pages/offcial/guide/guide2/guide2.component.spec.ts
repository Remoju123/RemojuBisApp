/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Guide2Component } from './guide2.component';

describe('Guide2Component', () => {
  let component: Guide2Component;
  let fixture: ComponentFixture<Guide2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Guide2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Guide2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
