import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendDdrComponent } from './send-ddr.component';

describe('SendDdrComponent', () => {
  let component: SendDdrComponent;
  let fixture: ComponentFixture<SendDdrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendDdrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendDdrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
