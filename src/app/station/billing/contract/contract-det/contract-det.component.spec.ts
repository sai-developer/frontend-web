import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractDetComponent } from './contract-det.component';

describe('ContractDetComponent', () => {
  let component: ContractDetComponent;
  let fixture: ComponentFixture<ContractDetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractDetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractDetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
