import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEqpsComponent } from './view-eqps.component';

describe('ViewEqpsComponent', () => {
  let component: ViewEqpsComponent;
  let fixture: ComponentFixture<ViewEqpsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewEqpsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewEqpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
