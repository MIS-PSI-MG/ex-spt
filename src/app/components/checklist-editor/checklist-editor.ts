import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatRadioModule } from "@angular/material/radio";
import { MatStepperModule } from "@angular/material/stepper";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatDividerModule } from "@angular/material/divider";
import { MatChipsModule } from "@angular/material/chips";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { MatDialogModule } from "@angular/material/dialog";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatListModule } from "@angular/material/list";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Observable } from "rxjs";
import { map, shareReplay } from "rxjs/operators";

import { ChecklistService } from "../../services/checklist.service";
import { OrganizationService } from "../../services/organization.service";
import { IdGeneratorService } from "../../services/id-generator.service";
import { ScoringService } from "../../services/scoring.service";
import {
  Checklist,
  ChecklistInput,
  Section,
  Question,
  QuestionUnion,
  QuestionType,
  StandardQuestion,
  DataControlQuestion,
  DataPoint,
  ValidationResult,
} from "../../interfaces/chkLst.interface";

@Component({
  selector: "app-checklist-editor",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatCheckboxModule,
    MatRadioModule,
    MatStepperModule,
    MatExpansionModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatListModule,
  ],
  templateUrl: "./checklist-editor.html",
  styleUrl: "./checklist-editor.css",
})
export class ChecklistEditor implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly checklistService = inject(ChecklistService);
  private readonly organizationService = inject(OrganizationService);
  private readonly idGenerator = inject(IdGeneratorService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly breakpointObserver = inject(BreakpointObserver);

  // Responsive breakpoints
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay(),
    );

  isTablet$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Tablet)
    .pipe(
      map((result) => result.matches),
      shareReplay(),
    );
  private readonly scoringService = inject(ScoringService);

  protected readonly QuestionType = QuestionType;

  checklistForm!: FormGroup;
  protected readonly isEditMode = signal<boolean>(false);

  // Computed properties for dropdown options from organization service
  protected readonly availableHealthPrograms = computed(() =>
    this.organizationService.healthProgramNames(),
  );

  protected readonly availableOrganizationalLevels = computed(() =>
    this.organizationService.organizationalLevelNames(),
  );

  protected readonly availableDepartments = computed(() =>
    this.organizationService.departmentNames(),
  );

  protected readonly validationResult = computed(() => {
    if (!this.checklistForm?.valid) {
      return { isValid: false, errors: [], warnings: [] };
    }

    const formValue = this.checklistForm.value;
    const checklist: Checklist = this.formValueToChecklist(formValue);
    return (
      this.checklistService.currentChecklistValidation() || {
        isValid: true,
        errors: [],
        warnings: [],
      }
    );
  });

  ngOnInit(): void {
    this.initializeForm();
    this.loadExistingChecklist();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.checklistForm = this.formBuilder.group({
      healthProgram: ["", [Validators.required]],
      organizationalLevel: ["", [Validators.required]],
      department: ["", [Validators.required]],
      sections: this.formBuilder.array([]),
    });
  }

  private loadExistingChecklist(): void {
    const currentChecklist = this.checklistService.currentChecklist();
    if (currentChecklist) {
      this.isEditMode.set(true);
      this.populateForm(currentChecklist);
    } else {
      this.addSection(); // Add at least one section for new checklists
    }
  }

  private populateForm(checklist: Checklist): void {
    this.checklistForm.patchValue({
      healthProgram: checklist.healthProgram,
      organizationalLevel: checklist.organizationalLevel,
      department: checklist.department,
    });

    // Clear existing sections
    while (this.sectionsArray.length !== 0) {
      this.sectionsArray.removeAt(0);
    }

    // Add sections
    checklist.sections.forEach((section) => {
      this.sectionsArray.push(this.createSectionFormGroup(section));
    });
  }

  get sectionsArray(): FormArray {
    return this.checklistForm.get("sections") as FormArray;
  }

  getQuestionsArray(sectionIndex: number): FormArray {
    return this.sectionsArray.at(sectionIndex).get("questions") as FormArray;
  }

  addSection(): void {
    this.sectionsArray.push(this.createSectionFormGroup());
  }

  removeSection(index: number): void {
    this.sectionsArray.removeAt(index);
  }

  addQuestion(sectionIndex: number, type: QuestionType): void {
    const questionsArray = this.getQuestionsArray(sectionIndex);
    questionsArray.push(this.createQuestionFormGroup(type));
    this.recalculateSectionMaxScore(sectionIndex);
  }

  removeQuestion(sectionIndex: number, questionIndex: number): void {
    const questionsArray = this.getQuestionsArray(sectionIndex);
    questionsArray.removeAt(questionIndex);
    this.recalculateSectionMaxScore(sectionIndex);
  }

  getQuestionType(sectionIndex: number, questionIndex: number): QuestionType {
    const questionControl =
      this.getQuestionsArray(sectionIndex).at(questionIndex);
    return questionControl.get("type")?.value || QuestionType.STANDARD;
  }

  protected getQuestionTypeLabel(type: QuestionType): string {
    switch (type) {
      case QuestionType.STANDARD:
        return "Standard Question";
      case QuestionType.DATA_CONTROL:
        return "Data Control Question";
      default:
        return "Unknown";
    }
  }

  protected getQuestionTypeColor(type: QuestionType): string {
    switch (type) {
      case QuestionType.STANDARD:
        return "primary";
      case QuestionType.DATA_CONTROL:
        return "accent";
      default:
        return "basic";
    }
  }

  // Method to recalculate section max scores when questions change
  protected recalculateSectionMaxScore(sectionIndex: number): void {
    const sectionControl = this.sectionsArray.at(sectionIndex);
    const questionsArray = sectionControl.get("questions") as FormArray;

    const questions = questionsArray.controls.map((control) => {
      const questionValue = control.value;
      return {
        id: questionValue.id,
        type: questionValue.type,
        title: questionValue.title,
        score: questionValue.score,
        maxScore: questionValue.maxScore,
      } as QuestionUnion;
    });

    const calculatedMaxScore =
      this.scoringService.calculateSectionMaxScore(questions);
    sectionControl.get("maxScore")?.setValue(calculatedMaxScore);
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.checklistForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  protected isSectionFieldInvalid(
    sectionIndex: number,
    fieldName: string,
  ): boolean {
    const sectionControl = this.sectionsArray.at(sectionIndex);
    const field = sectionControl.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  async save(): Promise<void> {
    if (this.checklistForm.valid) {
      try {
        const formValue = this.checklistForm.value;
        const checklistInput: ChecklistInput =
          this.formValueToChecklist(formValue);

        await this.checklistService.saveChecklist(checklistInput);
        this.router.navigate(["/checklists"]);
      } catch (error) {
        console.error("Failed to save checklist:", error);
      }
    } else {
      this.markFormGroupTouched(this.checklistForm);
    }
  }

  cancel(): void {
    this.router.navigate(["/checklists"]);
  }

  private createSectionFormGroup(section?: Section): FormGroup {
    const generatedId = section?.id || this.idGenerator.generateSectionId();
    const calculatedMaxScore = section?.questions
      ? this.scoringService.calculateSectionMaxScore(section.questions)
      : 0;

    const sectionForm = this.formBuilder.group({
      id: [generatedId],
      title: [section?.title || "", [Validators.required]],
      score: [section?.score || 0, [Validators.required, Validators.min(0)]],
      maxScore: [calculatedMaxScore],
      questions: this.formBuilder.array([]),
    });

    if (section?.questions) {
      const questionsArray = sectionForm.get("questions") as FormArray;
      section.questions.forEach((question) => {
        questionsArray.push(
          this.createQuestionFormGroup(question.type, question),
        );
      });
    }

    return sectionForm;
  }

  private createQuestionFormGroup(
    type: QuestionType,
    question?: QuestionUnion,
  ): FormGroup {
    const generatedId = question?.id || this.idGenerator.generateQuestionId();
    const calculatedMaxScore = question
      ? this.scoringService.calculateQuestionMaxScore(question)
      : this.scoringService.config().defaultMaxScore;

    if (type === QuestionType.DATA_CONTROL) {
      const dataControlQuestion = question as DataControlQuestion;
      return this.formBuilder.group({
        id: [generatedId],
        title: [question?.title || "", [Validators.required]],
        score: [question?.score || 0, [Validators.required, Validators.min(0)]],
        maxScore: [calculatedMaxScore],
        type: [type, [Validators.required]],
        indicator: [
          dataControlQuestion?.indicator || "",
          [Validators.required],
        ],
        month: [
          dataControlQuestion?.month
            ? this.formatDateForInput(dataControlQuestion.month)
            : "",
          [Validators.required],
        ],
        dataSource: this.createDataPointFormGroup(
          dataControlQuestion?.dataSource,
        ),
        dataCount: this.createDataPointFormGroup(
          dataControlQuestion?.dataCount,
        ),
        hasDataDifference: [dataControlQuestion?.hasDataDifference || false],
      });
    } else {
      return this.formBuilder.group({
        id: [generatedId],
        title: [question?.title || "", [Validators.required]],
        score: [question?.score || 0, [Validators.required, Validators.min(0)]],
        maxScore: [calculatedMaxScore],
        type: [type, [Validators.required]],
      });
    }
  }

  private createDataPointFormGroup(dataPoint?: DataPoint): FormGroup {
    const generatedId = dataPoint?.id || this.idGenerator.generateDataPointId();
    return this.formBuilder.group({
      id: [generatedId],
      name: [dataPoint?.name || "", [Validators.required]],
      value: [dataPoint?.value || 0, [Validators.required]],
    });
  }

  private formValueToChecklist(formValue: any): ChecklistInput {
    const checklistId = this.isEditMode()
      ? this.checklistService.currentChecklist()?.id ||
        this.idGenerator.generateChecklistId()
      : this.idGenerator.generateChecklistId();

    return {
      id: checklistId,
      healthProgram: formValue.healthProgram,
      organizationalLevel: formValue.organizationalLevel,
      department: formValue.department,
      sections: formValue.sections.map((section: any) => {
        const sectionQuestions = section.questions.map((question: any) => {
          const baseQuestion = {
            id: question.id,
            title: question.title,
            score: question.score,
            maxScore: question.maxScore,
            type: question.type,
          };

          if (question.type === QuestionType.DATA_CONTROL) {
            return {
              ...baseQuestion,
              indicator: question.indicator,
              month: new Date(question.month),
              dataSource: question.dataSource,
              dataCount: question.dataCount,
              hasDataDifference: question.hasDataDifference,
            };
          }

          return baseQuestion;
        });

        // Recalculate maxScore based on questions
        const calculatedMaxScore =
          this.scoringService.calculateSectionMaxScore(sectionQuestions);

        return {
          id: section.id,
          title: section.title,
          score: section.score,
          maxScore: calculatedMaxScore,
          questions: sectionQuestions,
        };
      }),
    };
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }
}
