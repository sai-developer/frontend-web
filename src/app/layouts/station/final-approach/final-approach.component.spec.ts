import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalApproachComponent } from './final-approach.component';

describe('FinalApproachComponent', () => {
  let component: FinalApproachComponent;
  let fixture: ComponentFixture<FinalApproachComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinalApproachComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinalApproachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
