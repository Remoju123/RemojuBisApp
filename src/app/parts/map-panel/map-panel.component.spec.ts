import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { MapPanelComponent } from "./map-panel.component";

describe("MapPanelComponent", () => {
  let component: MapPanelComponent;
  let fixture: ComponentFixture<MapPanelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MapPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
