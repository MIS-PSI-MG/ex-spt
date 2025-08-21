import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistEdit } from './checklist-edit';

describe('ChecklistEdit', () => {
  let component: ChecklistEdit;
  let fixture: ComponentFixture<ChecklistEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChecklistEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChecklistEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
