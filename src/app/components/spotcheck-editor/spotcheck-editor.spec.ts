import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotcheckEditor } from './spotcheck-editor';

describe('SpotcheckEditor', () => {
  let component: SpotcheckEditor;
  let fixture: ComponentFixture<SpotcheckEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotcheckEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpotcheckEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
