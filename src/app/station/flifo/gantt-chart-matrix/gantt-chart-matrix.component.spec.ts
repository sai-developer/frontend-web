import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GanttChartMatrixComponent } from './gantt-chart-matrix.component';

describe('GanttChartMatrixComponent', () => {
  let component: GanttChartMatrixComponent;
  let fixture: ComponentFixture<GanttChartMatrixComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GanttChartMatrixComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GanttChartMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
