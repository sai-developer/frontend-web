import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GrndSumTableComponent } from './grnd-sum-table.component';

describe('GrndSumTableComponent', () => {
  let component: GrndSumTableComponent;
  let fixture: ComponentFixture<GrndSumTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GrndSumTableComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GrndSumTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
