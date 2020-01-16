import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObdTableComponent } from './obd-table.component';

describe('ObdTableComponent', () => {
  let component: ObdTableComponent;
  let fixture: ComponentFixture<ObdTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ObdTableComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObdTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
