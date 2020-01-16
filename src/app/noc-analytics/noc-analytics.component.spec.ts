import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NocAnalyticsComponent } from './noc-analytics.component';

describe('NocAnalyticsComponent', () => {
  let component: NocAnalyticsComponent;
  let fixture: ComponentFixture<NocAnalyticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NocAnalyticsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NocAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
