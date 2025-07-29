import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistEditor } from './checklist-editor';

describe('ChecklistEditor', () => {
  let component: ChecklistEditor;
  let fixture: ComponentFixture<ChecklistEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChecklistEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChecklistEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
