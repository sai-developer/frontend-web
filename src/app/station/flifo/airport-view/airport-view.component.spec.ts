import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirportViewComponent } from './airport-view.component';

describe('AirportViewComponent', () => {
  let component: AirportViewComponent;
  let fixture: ComponentFixture<AirportViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirportViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirportViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
