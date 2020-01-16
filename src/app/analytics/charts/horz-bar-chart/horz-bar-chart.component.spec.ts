import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HorzBarChartComponent } from './horz-bar-chart.component';

describe('HorzBarChartComponent', () => {
  let component: HorzBarChartComponent;
  let fixture: ComponentFixture<HorzBarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HorzBarChartComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HorzBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
