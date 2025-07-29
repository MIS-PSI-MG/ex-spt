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

import { ChecklistService } from "../../services/checklist.service";
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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./checklist-editor.html",
  styleUrl: "./checklist-editor.css",
})
export class ChecklistEditor implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly checklistService = inject(ChecklistService);

  protected readonly QuestionType = QuestionType;

  checklistForm!: FormGroup;
  protected readonly isEditMode = signal<boolean>(false);

  // Computed properties for dropdown options
  protected readonly availableHealthPrograms = computed(() =>
    this.checklistService.availableHealthPrograms().length > 0
      ? this.checklistService.availableHealthPrograms()
      : ["Primary Care", "Specialized Care", "Emergency Care", "Mental Health"],
  );

  protected readonly availableOrganizationalLevels = computed(() =>
    this.checklistService.availableOrganizationalLevels().length > 0
      ? this.checklistService.availableOrganizationalLevels()
      : ["Local", "Regional", "National", "International"],
  );

  protected readonly availableDepartments = computed(() =>
    this.checklistService.availableDepartments().length > 0
      ? this.checklistService.availableDepartments()
      : [
          "Emergency",
          "Surgery",
          "Pediatrics",
          "Cardiology",
          "Neurology",
          "Oncology",
        ],
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
      id: ["", [Validators.required]],
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
      id: checklist.id,
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
  }

  removeQuestion(sectionIndex: number, questionIndex: number): void {
    const questionsArray = this.getQuestionsArray(sectionIndex);
    questionsArray.removeAt(questionIndex);
  }

  getQuestionType(sectionIndex: number, questionIndex: number): QuestionType {
    const questionControl =
      this.getQuestionsArray(sectionIndex).at(questionIndex);
    return questionControl.get("type")?.value || QuestionType.STANDARD;
  }

  getQuestionTypeLabel(type: QuestionType): string {
    switch (type) {
      case QuestionType.STANDARD:
        return "Standard Question";
      case QuestionType.DATA_CONTROL:
        return "Data Control";
      default:
        return "Unknown";
    }
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
    const sectionForm = this.formBuilder.group({
      id: [section?.id || "", [Validators.required]],
      title: [section?.title || "", [Validators.required]],
      score: [section?.score || 0, [Validators.required, Validators.min(0)]],
      maxScore: [
        section?.maxScore || 10,
        [Validators.required, Validators.min(1)],
      ],
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
    if (type === QuestionType.DATA_CONTROL) {
      const dataControlQuestion = question as DataControlQuestion;
      return this.formBuilder.group({
        id: [question?.id || "", [Validators.required]],
        title: [question?.title || "", [Validators.required]],
        score: [question?.score || 0, [Validators.required, Validators.min(0)]],
        maxScore: [
          question?.maxScore || 10,
          [Validators.required, Validators.min(1)],
        ],
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
        id: [question?.id || "", [Validators.required]],
        title: [question?.title || "", [Validators.required]],
        score: [question?.score || 0, [Validators.required, Validators.min(0)]],
        maxScore: [
          question?.maxScore || 10,
          [Validators.required, Validators.min(1)],
        ],
        type: [type, [Validators.required]],
      });
    }
  }

  private createDataPointFormGroup(dataPoint?: DataPoint): FormGroup {
    return this.formBuilder.group({
      id: [dataPoint?.id || "", [Validators.required]],
      name: [dataPoint?.name || "", [Validators.required]],
      value: [dataPoint?.value || 0, [Validators.required]],
    });
  }

  private formValueToChecklist(formValue: any): ChecklistInput {
    return {
      id: formValue.id,
      healthProgram: formValue.healthProgram,
      organizationalLevel: formValue.organizationalLevel,
      department: formValue.department,
      sections: formValue.sections.map((section: any) => ({
        id: section.id,
        title: section.title,
        score: section.score,
        maxScore: section.maxScore,
        questions: section.questions.map((question: any) => {
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
        }),
      })),
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
