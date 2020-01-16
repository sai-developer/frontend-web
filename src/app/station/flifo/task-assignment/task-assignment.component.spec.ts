import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskAssignmentComponent } from './task-assignment.component';

describe('TaskAssignmentComponent', () => {
  let component: TaskAssignmentComponent;
  let fixture: ComponentFixture<TaskAssignmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskAssignmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
