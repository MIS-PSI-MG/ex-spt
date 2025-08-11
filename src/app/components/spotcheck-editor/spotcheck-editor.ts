import {Component, computed, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

// Angular Material imports
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDividerModule} from '@angular/material/divider';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';

import {SpotchekService} from '../../services/spotcheck.service';
import {
  Checklist,
  ChecklistInput,
  DataControlQuestion,
  DataControlSubsection,
  Section,
  StandardQuestion,
  StandardSection,
  StandardSubsection
} from '../../interfaces/chk-sctst';

@Component({
  selector: 'app-spotchek-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatExpansionModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatRadioModule
  ],
  templateUrl: "./spotcheck-editor.html",
  styleUrl: "./spotcheck-editor.css"
})
export class SpotchekEditorComponent implements OnInit, OnDestroy {
  checklistForm!: FormGroup;
  isEditMode = signal<boolean>(false);
  currentChecklistId = signal<string | null>(null);
  sectionsArray = computed(() => this.checklistForm?.get('sections') as FormArray);

  // Department options based on init.data
  readonly departmentOptions = [
    {value: 'DPAL', label: 'Direction de la Prévention et de l\'Action Locale'},
    {value: 'M&E', label: 'Monitoring & Evaluation'},
    {value: 'PREVENTION', label: 'Prevention Department'},
    {value: 'OTHER', label: 'Other'}
  ];

  // Health program options
  readonly healthProgramOptions = [
    {value: 'Malaria Control Program', label: 'Malaria Control Program'},
    {value: 'Data Quality Assurance', label: 'Data Quality Assurance'},
    {value: 'Community Health Services', label: 'Community Health Services'},
    {value: 'Other', label: 'Other Health Program'}
  ];

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  private readonly spotchekService = inject(SpotchekService);

  // Computed properties
  loading = this.spotchekService.loading;
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeForm();
    this.checkRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Form manipulation methods
  addSection(): void {
    const sectionsArray = this.sectionsArray();
    sectionsArray.push(this.createSectionFormGroup());
  }

  removeSection(index: number): void {
    const sectionsArray = this.sectionsArray();
    if (sectionsArray.length > 1) {
      sectionsArray.removeAt(index);
    }
  }

  addSubsection(sectionIndex: number): void {
    const sectionGroup = this.getSectionFormGroup(sectionIndex);
    const subsectionArray = sectionGroup.get('subsection') as FormArray;
    subsectionArray.push(this.createSubsectionFormGroup());
  }

  removeSubsection(sectionIndex: number, subsectionIndex: number): void {
    const sectionGroup = this.getSectionFormGroup(sectionIndex);
    const subsectionArray = sectionGroup.get('subsection') as FormArray;
    if (subsectionArray.length > 1) {
      subsectionArray.removeAt(subsectionIndex);
    }
  }

  addQuestion(sectionIndex: number, subsectionIndex?: number): void {
    if (subsectionIndex !== undefined) {
      // Add question to subsection
      const questionsArray = this.getSubsectionQuestionsArray(sectionIndex, subsectionIndex);
      questionsArray.push(this.createQuestionFormGroup());
    } else {
      // Add question directly to section
      const questionsArray = this.getSectionQuestionsArray(sectionIndex);
      questionsArray.push(this.createQuestionFormGroup());
    }
  }

  removeQuestion(sectionIndex: number, questionIndex: number, subsectionIndex?: number): void {
    if (subsectionIndex !== undefined) {
      const questionsArray = this.getSubsectionQuestionsArray(sectionIndex, subsectionIndex);
      questionsArray.removeAt(questionIndex);
    } else {
      const questionsArray = this.getSectionQuestionsArray(sectionIndex);
      questionsArray.removeAt(questionIndex);
    }
  }

  // Helper methods
  getSectionFormGroup(index: number): FormGroup {
    return this.sectionsArray().at(index) as FormGroup;
  }

  getSubsectionFormGroup(sectionIndex: number, subsectionIndex: number): FormGroup {
    const sectionGroup = this.getSectionFormGroup(sectionIndex);
    const subsectionArray = sectionGroup.get('subsection') as FormArray;
    return subsectionArray.at(subsectionIndex) as FormGroup;
  }

  getSectionQuestionsArray(sectionIndex: number): FormArray {
    return this.getSectionFormGroup(sectionIndex).get('questions') as FormArray;
  }

  getSubsectionQuestionsArray(sectionIndex: number, subsectionIndex: number): FormArray {
    return this.getSubsectionFormGroup(sectionIndex, subsectionIndex).get('questions') as FormArray;
  }

  getQuestionFormGroup(sectionIndex: number, questionIndex: number, subsectionIndex?: number): FormGroup {
    if (subsectionIndex !== undefined) {
      return this.getSubsectionQuestionsArray(sectionIndex, subsectionIndex).at(questionIndex) as FormGroup;
    }
    return this.getSectionQuestionsArray(sectionIndex).at(questionIndex) as FormGroup;
  }

  getSectionTitle(index: number): string {
    return this.getSectionFormGroup(index).get('title')?.value || '';
  }

  getSectionType(index: number): string {
    // Determine if section has data control structure
    const sectionGroup = this.getSectionFormGroup(index);
    const subsectionArray = sectionGroup.get('subsection') as FormArray;

    if (subsectionArray.length > 0) {
      const firstSubsection = subsectionArray.at(0) as FormGroup;
      return firstSubsection.get('instruction') ? 'data_control' : 'standard';
    }

    return 'standard';
  }

  hasSubsections(sectionIndex: number): boolean {
    const sectionGroup = this.getSectionFormGroup(sectionIndex);
    const subsectionArray = sectionGroup.get('subsection') as FormArray;
    return subsectionArray.length > 0;
  }

  // Form submission
  async onSubmit(): Promise<void> {
    if (this.checklistForm.invalid) {
      this.markFormGroupTouched(this.checklistForm);
      this.showError('Please fill in all required fields');
      return;
    }

    try {
      const formValue = this.checklistForm.value;
      const checklistInput: ChecklistInput = {
        healthProgram: formValue.healthProgram,
        departement: formValue.departement,
        niveau: formValue.niveau,
        sections: this.buildSections(formValue.sections)
      };

      if (this.isEditMode()) {
        const id = this.currentChecklistId();
        if (id) {
          await this.spotchekService.updateChecklist(id, checklistInput);
          this.showSuccess('Checklist updated successfully');
        }
      } else {
        await this.spotchekService.createChecklist(checklistInput);
        this.showSuccess('Checklist created successfully');
      }

      this.router.navigate(['/spotcheks']);
    } catch (error) {
      this.showError(`Failed to ${this.isEditMode() ? 'update' : 'create'} checklist`);
    }
  }

  cancel(): void {
    this.router.navigate(['/spotcheks']);
  }

  private initializeForm(): void {
    this.checklistForm = this.fb.group({
      healthProgram: ['', [Validators.required]],
      departement: ['', [Validators.required]],
      niveau: [0, [Validators.required, Validators.min(0)]],
      sections: this.fb.array([])
    });

    // Add a default section
    this.addSection();
  }

  private checkRouteParams(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.isEditMode.set(true);
          this.currentChecklistId.set(params['id']);
          this.loadChecklist(params['id']);
        }
      });
  }

  private async loadChecklist(id: string): Promise<void> {
    try {
      const checklist = await this.spotchekService.getChecklistById(id);
      if (checklist) {
        this.populateForm(checklist);
      } else {
        this.showError('Checklist not found');
        this.router.navigate(['/spotcheks']);
      }
    } catch (error) {
      this.showError('Failed to load checklist');
      this.router.navigate(['/spotcheks']);
    }
  }

  private populateForm(checklist: Checklist): void {
    this.checklistForm.patchValue({
      healthProgram: checklist.healthProgram,
      departement: checklist.departement,
      niveau: checklist.niveau
    });

    // Clear existing sections
    const sectionsArray = this.sectionsArray();
    while (sectionsArray.length !== 0) {
      sectionsArray.removeAt(0);
    }

    // Add sections from checklist
    checklist.sections.forEach(section => {
      sectionsArray.push(this.createSectionFormGroup(section));
    });
  }

  private createSectionFormGroup(section?: Section): FormGroup {
    const group = this.fb.group({
      title: [section?.title || '', [Validators.required]],
      maxScore: [section?.maxScore || 0],
      score: [section?.score || 0],
      questions: this.fb.array([]),
      subsection: this.fb.array([])
    });

    // Add questions and subsections if section exists
    if (section) {
      const questionsArray = group.get('questions') as FormArray;
      const subsectionArray = group.get('subsection') as FormArray;

      // Handle direct questions on section
      if ('questions' in section && section.questions) {
        section.questions.forEach(question => {
          questionsArray.push(this.createQuestionFormGroup(question));
        });
      }

      // Handle subsections
      if ('subsection' in section && section.subsection) {
        if (Array.isArray(section.subsection)) {
          section.subsection.forEach(subsection => {
            subsectionArray.push(this.createSubsectionFormGroup(subsection));
          });
        } else {
          subsectionArray.push(this.createSubsectionFormGroup(section.subsection));
        }
      }
    }

    return group;
  }

  private createSubsectionFormGroup(subsection?: StandardSubsection | DataControlSubsection): FormGroup {
    let group: FormGroup = this.fb.group({});
    if (subsection) {
      group = this.fb.group({
        title: [subsection?.title || '', [Validators.required]],
        maxScore: ['maxScore' in subsection ? subsection.maxScore : 0],
        score: ['score' in subsection ? subsection.score : 0],
        instruction: ['instruction' in subsection ? subsection.instruction : ''],
        questions: this.fb.array([])
      });
      if (subsection.questions) {
        const questionsArray = group.get('questions') as FormArray;
        subsection.questions.forEach(question => {
          questionsArray.push(this.createQuestionFormGroup(question));
        });
      }

    }
    return group;
  }

  private createQuestionFormGroup(question?: StandardQuestion | DataControlQuestion | any): FormGroup {
    if (question && 'subquestion' in question && question.subquestion) {
      // Handle subquestion structure
      return this.fb.group({
        subquestion: this.fb.group({
          q: [question.subquestion.q || '', [Validators.required]],
          sq: this.fb.array(
            (question.subquestion.sq || []).map((sq: any) => this.createSubQuestionFormGroup(sq))
          )
        })
      });
    }

    // Handle simple question structure
    return this.fb.group({
      question: [question?.question || '', [Validators.required]],
      score: [question?.score || 'NA']
    });
  }

  private createSubQuestionFormGroup(subQuestion?: any): FormGroup {
    if (subQuestion && typeof subQuestion === 'object' && 'mois' in subQuestion) {
      // Data control month structure
      return this.fb.group({
        mois: [subQuestion.mois || ''],
        element1: this.fb.group({
          name: [subQuestion.element1?.name || ''],
          number: [subQuestion.element1?.number || 0]
        }),
        element2: this.fb.group({
          name: [subQuestion.element2?.name || ''],
          number: [subQuestion.element2?.number || 0]
        }),
        element3: this.fb.group({
          name: [subQuestion.element3?.name || ''],
          number: [subQuestion.element3?.number || 0]
        }),
        eval: this.fb.group({
          name: [subQuestion.eval?.name || ''],
          score: [subQuestion.eval?.score || 0]
        })
      });
    }

    // Standard subquestion structure
    return this.fb.group({
      question: [subQuestion?.question || subQuestion || ''],
      score: [subQuestion?.score || 'NA']
    });
  }

  private buildSections(formSections: any[]): Section[] {
    return formSections.map(section => {
      if (section.subsection && section.subsection.length > 0) {
        // Section with subsections
        const standardSection: StandardSection = {
          title: section.title,
          maxScore: section.maxScore,
          score: section.score,
          subsection: section.subsection.map((sub: any) => ({
            title: sub.title,
            maxScore: sub.maxScore,
            score: sub.score,
            instruction: sub.instruction,
            questions: sub.questions.map((q: any) => this.buildQuestion(q))
          }))
        };
        return standardSection;
      } else {
        // Section with direct questions
        const standardSection: StandardSection = {
          title: section.title,
          maxScore: section.maxScore,
          score: section.score,
          questions: section.questions.map((q: any) => this.buildQuestion(q))
        };
        return standardSection;
      }
    });
  }

  private buildQuestion(question: any): StandardQuestion | DataControlQuestion {
    if (question.subquestion) {
      return {
        subquestion: {
          q: question.subquestion.q,
          sq: question.subquestion.sq.map((sq: any) => {
            if (sq.mois) {
              return {
                mois: sq.mois,
                element1: sq.element1,
                element2: sq.element2,
                element3: sq.element3,
                eval: sq.eval
              };
            }
            return {
              question: sq.question,
              score: sq.score
            };
          })
        }
      };
    }

    return {
      question: question.question,
      score: question.score
    };
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
