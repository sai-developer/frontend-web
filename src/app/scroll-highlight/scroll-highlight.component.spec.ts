import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollHighlightComponent } from './scroll-highlight.component';

describe('ScrollHighlightComponent', () => {
  let component: ScrollHighlightComponent;
  let fixture: ComponentFixture<ScrollHighlightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScrollHighlightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrollHighlightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
