import { Component, signal, computed, effect, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from "@angular/forms";
import { CommonModule } from "@angular/common";

// Material UI imports
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatDividerModule } from "@angular/material/divider";
import { MatChipsModule } from "@angular/material/chips";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { MatDialogModule } from "@angular/material/dialog";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatListModule } from "@angular/material/list";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatProgressBarModule } from "@angular/material/progress-bar";

import {
  ChecklistBase,
  Section,
  StdQuestion,
  DQQuestion,
  Subsection,
  DataQualityEvaluation,
  MonthlyEntry,
  DataElement,
  Evaluation
} from "../../interfaces/new-models.interface";
import { ChecklistService } from "../../services/checklist.service";

// Interface for hierarchical question display
interface HierarchicalQuestion {
  control: AbstractControl;
  index: number;
  id: string;
  level: number;
  parentId: string;
  subject: string;
  children: HierarchicalQuestion[];
}

@Component({
  selector: "app-checklist-edit",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatExpansionModule,
    MatDividerModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatToolbarModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
  ],
  templateUrl: "./checklist-edit.html",
  styleUrl: "./checklist-edit.css",
})
export class ChecklistEdit implements OnInit {
  // Form signals
  checklistForm = signal<FormGroup | null>(null);

  // UI state signals
  isSubmitting = signal<boolean>(false);
  validationErrors = signal<string[]>([]);
  isDirty = signal<boolean>(false);

  // Form validation computed signals
  isFormValid = computed(() => {
    const form = this.checklistForm();
    return form ? form.valid : false;
  });
  isFormDirty = computed(() => {
    const form = this.checklistForm();
    return form ? form.dirty : false;
  });

  // Data signals
  currentChecklist = signal<ChecklistBase | null>(null);

  // Section type options
  sectionTypeOptions = signal([
    { value: "standard", label: "Standard Questions" },
    { value: "dq", label: "Data Quality Questions" },
  ]);

  constructor(
    private fb: FormBuilder,
    private checklistService: ChecklistService,
    private snackBar: MatSnackBar,
  ) {
    // Initialize the form after FormBuilder is available
    this.checklistForm.set(this.createChecklistForm());

    // Effect to watch form changes and update dirty state
    effect(() => {
      const form = this.checklistForm();
      if (form && form.dirty) {
        this.isDirty.set(true);
      }
    });
  }

  ngOnInit() {
    this.initializeForm();
    this.loadSampleData();
  }

  private createChecklistForm(): FormGroup {
    return this.fb.group({
      id: ["", [Validators.required, Validators.minLength(3)]],
      ou_level: [
        0,
        [Validators.required, Validators.min(0), Validators.max(10)],
      ],
      department: ["", [Validators.required, Validators.minLength(2)]],
      health_area: ["", [Validators.required, Validators.minLength(2)]],
      sections: this.fb.array([]),
    });
  }

  private initializeForm() {
    if (this.sectionsFormArray.length === 0) {
      this.addSection();
    }
  }

  private loadSampleData() {
    const sampleData = this.checklistService.generateSampleChecklist();
    this.currentChecklist.set(sampleData);
    this.populateForm(sampleData);
  }

  private populateForm(checklist: ChecklistBase) {
    const form = this.checklistForm();
    if (!form) return;

    form.patchValue({
      id: checklist.id,
      ou_level: checklist.ou_level,
      department: checklist.department,
      health_area: checklist.health_area,
    });

    // Clear existing sections
    const sectionsArray = this.sectionsFormArray;
    while (sectionsArray.length !== 0) {
      sectionsArray.removeAt(0);
    }

    // Add sections from checklist
    checklist.sections.forEach((section) => {
      const sectionForm = this.createSectionForm(section);
      sectionsArray.push(sectionForm);
    });
  }

  loadChecklist(id: string) {
    const checklist = this.checklistService.getChecklistById(id);
    if (checklist) {
      this.currentChecklist.set(checklist);
      this.populateForm(checklist);
      this.showMessage("Checklist loaded successfully");
    } else {
      this.showMessage("Checklist not found", "error");
    }
  }

  // Getters for form arrays
  get sectionsFormArray(): FormArray {
    const form = this.checklistForm();
    return form ? (form.get("sections") as FormArray) : this.fb.array([]);
  }

  // Section management
  createSectionForm(section?: Section): FormGroup {
    const sectionForm = this.fb.group({
      id: [section?.id || this.generateId(), Validators.required],
      title: [
        section?.title || "",
        [Validators.required, Validators.minLength(3)],
      ],
      maxScore: [
        section?.maxScore || 0,
        [Validators.required, Validators.min(0)],
      ],
      type: [section?.type || "standard", Validators.required],
      questions: this.fb.array([]),
    });

    // Populate questions based on section type
    if (section) {
      const questionsArray = sectionForm.get("questions") as FormArray;
      if (section.type === "standard") {
        (section.questions as StdQuestion[]).forEach((question) => {
          questionsArray.push(this.createStdQuestionForm(question));
        });
      } else {
        (section.questions as DQQuestion[]).forEach((question) => {
          questionsArray.push(this.createDQQuestionForm(question));
        });
      }
    }

    return sectionForm;
  }

  addSection() {
    this.sectionsFormArray.push(this.createSectionForm());
    this.isDirty.set(true);
  }

  removeSection(index: number) {
    if (this.sectionsFormArray.length > 1) {
      this.sectionsFormArray.removeAt(index);
      this.isDirty.set(true);
    } else {
      this.showMessage("At least one section is required", "error");
    }
  }

  getSectionQuestionsArray(sectionIndex: number): FormArray {
    const sectionsArray = this.sectionsFormArray;
    const sectionForm = sectionsArray.at(sectionIndex) as FormGroup;
    return sectionForm.get("questions") as FormArray;
  }

  // Standard Questions management
  createStdQuestionForm(question?: StdQuestion): FormGroup {
    return this.fb.group({
      id: [question?.id || this.generateId(), Validators.required],
      subject: [
        question?.subject || "",
        [Validators.required, Validators.minLength(5)],
      ],
      level: [
        question?.level || 1,
        [Validators.required, Validators.min(1), Validators.max(5)],
      ],
      parentId: [question?.parentId || ""],
      score: [question?.score || 0, [Validators.required, Validators.min(0)]],
    });
  }

  // Get hierarchical structure of standard questions
  getHierarchicalQuestions(sectionIndex: number): HierarchicalQuestion[] {
    const questionsArray = this.getSectionQuestionsArray(sectionIndex);
    const questions: HierarchicalQuestion[] = questionsArray.controls.map(
      (control, index) => ({
        control,
        index,
        id: control.get("id")?.value,
        level: control.get("level")?.value,
        parentId: control.get("parentId")?.value,
        subject: control.get("subject")?.value,
        children: [],
      }),
    );

    // Build hierarchy
    const hierarchy: HierarchicalQuestion[] = [];
    const questionMap = new Map<string, HierarchicalQuestion>();

    // First pass: create map and find root questions
    questions.forEach((q) => {
      questionMap.set(q.id, q);
      if (!q.parentId || q.level === 1) {
        hierarchy.push(q);
      }
    });

    // Second pass: build parent-child relationships
    questions.forEach((q) => {
      if (q.parentId && questionMap.has(q.parentId)) {
        const parent = questionMap.get(q.parentId);
        if (parent) {
          parent.children.push(q);
        }
      }
    });

    return hierarchy;
  }

  // Get available parent questions for a specific question
  getAvailableParentQuestions(
    sectionIndex: number,
    currentQuestionIndex: number,
  ): any[] {
    const questionsArray = this.getSectionQuestionsArray(sectionIndex);
    const currentLevel =
      questionsArray.at(currentQuestionIndex)?.get("level")?.value || 1;

    return questionsArray.controls
      .map((control, index) => ({
        id: control.get("id")?.value,
        subject: control.get("subject")?.value,
        level: control.get("level")?.value,
        index,
      }))
      .filter(
        (q, index) =>
          index !== currentQuestionIndex &&
          q.level < currentLevel &&
          q.subject &&
          q.subject.trim(),
      )
      .sort((a, b) => a.level - b.level);
  }

  addStdQuestion(sectionIndex: number, parentQuestionIndex?: number) {
    const questionsArray = this.getSectionQuestionsArray(sectionIndex);
    const newQuestion = this.createStdQuestionForm();

    // Set level and parentId based on parent
    if (parentQuestionIndex !== undefined) {
      const parentControl = questionsArray.at(parentQuestionIndex);
      const parentId = parentControl?.get("id")?.value;
      const parentLevel = parentControl?.get("level")?.value || 1;

      newQuestion.patchValue({
        level: parentLevel + 1,
        parentId: parentId,
      });
    } else {
      // Root level question
      newQuestion.patchValue({
        level: 1,
        parentId: "",
      });
    }

    questionsArray.push(newQuestion);
    this.isDirty.set(true);
  }

  addChildQuestion(sectionIndex: number, parentQuestionIndex: number) {
    this.addStdQuestion(sectionIndex, parentQuestionIndex);
  }

  removeStdQuestion(sectionIndex: number, questionIndex: number) {
    const questionsArray = this.getSectionQuestionsArray(sectionIndex);
    const questionToRemove = questionsArray.at(questionIndex);
    const questionId = questionToRemove?.get("id")?.value;

    if (questionsArray.length > 1) {
      // Remove the question
      questionsArray.removeAt(questionIndex);

      // Update parentId of children to point to the removed question's parent
      const removedParentId = questionToRemove?.get("parentId")?.value;
      questionsArray.controls.forEach((control) => {
        if (control.get("parentId")?.value === questionId) {
          control.patchValue({ parentId: removedParentId || "" });
        }
      });

      this.isDirty.set(true);
    }
  }

  // Handle level changes to update parentId
  onQuestionLevelChange(sectionIndex: number, questionIndex: number) {
    const questionsArray = this.getSectionQuestionsArray(sectionIndex);
    const questionControl = questionsArray.at(questionIndex);
    const newLevel = questionControl?.get("level")?.value;

    if (newLevel === 1) {
      // Root level, clear parentId
      questionControl?.patchValue({ parentId: "" });
    } else {
      // Find appropriate parent or clear if none available
      const availableParents = this.getAvailableParentQuestions(
        sectionIndex,
        questionIndex,
      );
      const currentParentId = questionControl?.get("parentId")?.value;

      // Check if current parent is still valid
      const isCurrentParentValid = availableParents.some(
        (p) => p.id === currentParentId,
      );

      if (!isCurrentParentValid) {
        // Auto-assign the most appropriate parent (highest level less than current)
        const bestParent = availableParents
          .filter((p) => p.level < newLevel)
          .sort((a, b) => b.level - a.level)[0];

        questionControl?.patchValue({
          parentId: bestParent?.id || "",
        });
      }
    }

    this.isDirty.set(true);
  }

  // Data Quality Questions management
  createDQQuestionForm(question?: DQQuestion): FormGroup {
    const dqForm = this.fb.group({
      id: [question?.id || this.generateId(), Validators.required],
      subsections: this.fb.array([]),
    });

    if (question?.subsections) {
      const subsectionsArray = dqForm.get("subsections") as FormArray;
      question.subsections.forEach((subsection) => {
        subsectionsArray.push(this.createSubsectionForm(subsection));
      });
    }

    return dqForm;
  }

  addDQQuestion(sectionIndex: number) {
    const questionsArray = this.getSectionQuestionsArray(sectionIndex);
    questionsArray.push(this.createDQQuestionForm());
    this.isDirty.set(true);
  }

  removeDQQuestion(sectionIndex: number, questionIndex: number) {
    const questionsArray = this.getSectionQuestionsArray(sectionIndex);
    questionsArray.removeAt(questionIndex);
    this.isDirty.set(true);
  }

  getDQSubsectionsArray(
    sectionIndex: number,
    questionIndex: number,
  ): FormArray {
    const questionsArray = this.getSectionQuestionsArray(sectionIndex);
    const questionForm = questionsArray.at(questionIndex) as FormGroup;
    return questionForm.get("subsections") as FormArray;
  }

  // Subsection management
  createSubsectionForm(subsection?: Subsection): FormGroup {
    const subsectionForm = this.fb.group({
      id: [subsection?.id || this.generateId(), Validators.required],
      instruction: [
        subsection?.instruction || "",
        [Validators.required, Validators.minLength(10)],
      ],
      questions: this.fb.array([]),
    });

    if (subsection?.questions) {
      const questionsArray = subsectionForm.get("questions") as FormArray;
      subsection.questions.forEach((evaluation) => {
        questionsArray.push(this.createDataQualityEvaluationForm(evaluation));
      });
    }

    return subsectionForm;
  }

  addSubsection(sectionIndex: number, questionIndex: number) {
    const subsectionsArray = this.getDQSubsectionsArray(
      sectionIndex,
      questionIndex,
    );
    subsectionsArray.push(this.createSubsectionForm());
    this.isDirty.set(true);
  }

  removeSubsection(
    sectionIndex: number,
    questionIndex: number,
    subsectionIndex: number,
  ) {
    const subsectionsArray = this.getDQSubsectionsArray(
      sectionIndex,
      questionIndex,
    );
    if (subsectionsArray.length > 1) {
      subsectionsArray.removeAt(subsectionIndex);
      this.isDirty.set(true);
    }
  }

  getSubsectionQuestionsArray(
    sectionIndex: number,
    questionIndex: number,
    subsectionIndex: number,
  ): FormArray {
    const subsectionsArray = this.getDQSubsectionsArray(
      sectionIndex,
      questionIndex,
    );
    const subsectionForm = subsectionsArray.at(subsectionIndex) as FormGroup;
    return subsectionForm.get("questions") as FormArray;
  }

  // Data Quality Evaluation management
  createDataQualityEvaluationForm(
    evaluation?: DataQualityEvaluation,
  ): FormGroup {
    const evalForm = this.fb.group({
      evaluationTopic: [
        evaluation?.evaluationTopic || "",
        [Validators.required, Validators.minLength(5)],
      ],
      monthlyEntries: this.fb.array([]),
    });

    if (evaluation?.monthlyEntries) {
      const entriesArray = evalForm.get("monthlyEntries") as FormArray;
      evaluation.monthlyEntries.forEach((entry) => {
        entriesArray.push(this.createMonthlyEntryForm(entry));
      });
    }

    return evalForm;
  }

  addDataQualityEvaluation(
    sectionIndex: number,
    questionIndex: number,
    subsectionIndex: number,
  ) {
    const questionsArray = this.getSubsectionQuestionsArray(
      sectionIndex,
      questionIndex,
      subsectionIndex,
    );
    questionsArray.push(this.createDataQualityEvaluationForm());
    this.isDirty.set(true);
  }

  removeDataQualityEvaluation(
    sectionIndex: number,
    questionIndex: number,
    subsectionIndex: number,
    evaluationIndex: number,
  ) {
    const questionsArray = this.getSubsectionQuestionsArray(
      sectionIndex,
      questionIndex,
      subsectionIndex,
    );
    if (questionsArray.length > 1) {
      questionsArray.removeAt(evaluationIndex);
      this.isDirty.set(true);
    }
  }

  // Monthly Entry management
  createMonthlyEntryForm(entry?: MonthlyEntry): FormGroup {
    const entryForm = this.fb.group({
      id: [entry?.id || this.generateId(), Validators.required],
      month: [
        entry?.month || "",
        [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{4}$/)],
      ],
      answer: [
        entry?.answer || "",
        [Validators.required, Validators.minLength(1)],
      ],
      elements: this.fb.array([]),
      evals: this.fb.array([]),
    });

    if (entry?.elements) {
      const elementsArray = entryForm.get("elements") as FormArray;
      entry.elements.forEach((element) => {
        elementsArray.push(this.createDataElementForm(element));
      });
    }

    if (entry?.evals) {
      const evalsArray = entryForm.get("evals") as FormArray;
      entry.evals.forEach((evaluation) => {
        evalsArray.push(this.createEvaluationForm(evaluation));
      });
    }

    return entryForm;
  }

  // Monthly Entry management
  getMonthlyEntriesArray(
    sectionIndex: number,
    questionIndex: number,
    subsectionIndex: number,
    evaluationIndex: number,
  ): FormArray {
    const subsectionQuestionsArray = this.getSubsectionQuestionsArray(
      sectionIndex,
      questionIndex,
      subsectionIndex,
    );
    const evaluationForm = subsectionQuestionsArray.at(
      evaluationIndex,
    ) as FormGroup;
    return evaluationForm.get("monthlyEntries") as FormArray;
  }

  addMonthlyEntry(
    sectionIndex: number,
    questionIndex: number,
    subsectionIndex: number,
    evaluationIndex: number,
  ) {
    const entriesArray = this.getMonthlyEntriesArray(
      sectionIndex,
      questionIndex,
      subsectionIndex,
      evaluationIndex,
    );
    entriesArray.push(this.createMonthlyEntryForm());
    this.isDirty.set(true);
  }

  removeMonthlyEntry(
    sectionIndex: number,
    questionIndex: number,
    subsectionIndex: number,
    evaluationIndex: number,
    entryIndex: number,
  ) {
    const entriesArray = this.getMonthlyEntriesArray(
      sectionIndex,
      questionIndex,
      subsectionIndex,
      evaluationIndex,
    );
    if (entriesArray.length > 1) {
      entriesArray.removeAt(entryIndex);
      this.isDirty.set(true);
    }
  }

  // Data Element management
  createDataElementForm(element?: DataElement): FormGroup {
    return this.fb.group({
      id: [element?.id || this.generateId(), Validators.required],
      name: [
        element?.name || "",
        [Validators.required, Validators.minLength(2)],
      ],
      data: [element?.data || 0, [Validators.required, Validators.min(0)]],
    });
  }

  getDataElementsArray(
    sectionIndex: number,
    questionIndex: number,
    subsectionIndex: number,
    evaluationIndex: number,
    entryIndex: number,
  ): FormArray {
    const entriesArray = this.getMonthlyEntriesArray(
      sectionIndex,
      questionIndex,
      subsectionIndex,
      evaluationIndex,
    );
    const entryForm = entriesArray.at(entryIndex) as FormGroup;
    return entryForm.get("elements") as FormArray;
  }

  addDataElement(
    sectionIndex: number,
    questionIndex: number,
    subsectionIndex: number,
    evaluationIndex: number,
    entryIndex: number,
  ) {
    const elementsArray = this.getDataElementsArray(
      sectionIndex,
      questionIndex,
      subsectionIndex,
      evaluationIndex,
      entryIndex,
    );
    elementsArray.push(this.createDataElementForm());
    this.isDirty.set(true);
  }

  removeDataElement(
    sectionIndex: number,
    questionIndex: number,
    subsectionIndex: number,
    evaluationIndex: number,
    entryIndex: number,
    elementIndex: number,
  ) {
    const elementsArray = this.getDataElementsArray(
      sectionIndex,
      questionIndex,
      subsectionIndex,
      evaluationIndex,
      entryIndex,
    );
    if (elementsArray.length > 1) {
      elementsArray.removeAt(elementIndex);
      this.isDirty.set(true);
    }
  }

  // Evaluation management
  createEvaluationForm(evaluation?: Evaluation): FormGroup {
    return this.fb.group({
      id: [evaluation?.id || this.generateId(), Validators.required],
      name: [
        evaluation?.name || "",
        [Validators.required, Validators.minLength(2)],
      ],
      score: [evaluation?.score || 0, [Validators.required, Validators.min(0)]],
    });
  }

  getEvaluationsArray(
    sectionIndex: number,
    questionIndex: number,
    subsectionIndex: number,
    evaluationIndex: number,
    entryIndex: number,
  ): FormArray {
    const entriesArray = this.getMonthlyEntriesArray(
      sectionIndex,
      questionIndex,
      subsectionIndex,
      evaluationIndex,
    );
    const entryForm = entriesArray.at(entryIndex) as FormGroup;
    return entryForm.get("evals") as FormArray;
  }

  addEvaluation(
    sectionIndex: number,
    questionIndex: number,
    subsectionIndex: number,
    evaluationIndex: number,
    entryIndex: number,
  ) {
    const evalsArray = this.getEvaluationsArray(
      sectionIndex,
      questionIndex,
      subsectionIndex,
      evaluationIndex,
      entryIndex,
    );
    evalsArray.push(this.createEvaluationForm());
    this.isDirty.set(true);
  }

  removeEvaluation(
    sectionIndex: number,
    questionIndex: number,
    subsectionIndex: number,
    evaluationIndex: number,
    entryIndex: number,
    evalIndex: number,
  ) {
    const evalsArray = this.getEvaluationsArray(
      sectionIndex,
      questionIndex,
      subsectionIndex,
      evaluationIndex,
      entryIndex,
    );
    if (evalsArray.length > 1) {
      evalsArray.removeAt(evalIndex);
      this.isDirty.set(true);
    }
  }

  // Form submission and validation
  onSubmit() {
    if (this.isSubmitting()) return;

    const form = this.checklistForm();
    if (!form) return;

    if (form.invalid) {
      this.markFormGroupTouched(form);
      this.showMessage("Please fix form errors before submitting", "error");
      return;
    }

    this.isSubmitting.set(true);

    try {
      const checklist: ChecklistBase = form.value;
      const errors = this.checklistService.validateChecklist(checklist);

      if (errors.length > 0) {
        this.validationErrors.set(errors);
        this.showMessage(`Validation failed: ${errors.join(", ")}`, "error");
        this.isSubmitting.set(false);
        return;
      }

      // Save the checklist
      if (this.currentChecklist()?.id === checklist.id) {
        this.checklistService.updateChecklist(checklist.id, checklist);
        this.showMessage("Checklist updated successfully");
      } else {
        this.checklistService.createChecklist(checklist);
        this.showMessage("Checklist created successfully");
      }

      this.currentChecklist.set(checklist);
      this.isDirty.set(false);
      form.markAsPristine();
    } catch (error) {
      this.showMessage(
        `Error saving checklist: ${(error as Error).message}`,
        "error",
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  onSectionTypeChange(sectionIndex: number) {
    const sectionForm = this.sectionsFormArray.at(sectionIndex) as FormGroup;
    const questionsArray = sectionForm.get("questions") as FormArray;

    // Clear existing questions when type changes
    while (questionsArray.length !== 0) {
      questionsArray.removeAt(0);
    }

    // Add initial question based on type
    const sectionType = sectionForm.get("type")?.value;
    if (sectionType === "standard") {
      questionsArray.push(this.createStdQuestionForm());
    } else {
      questionsArray.push(this.createDQQuestionForm());
    }

    this.isDirty.set(true);
  }

  getSectionType(sectionIndex: number): "standard" | "dq" {
    const sectionForm = this.sectionsFormArray.at(sectionIndex) as FormGroup;
    return sectionForm.get("type")?.value || "standard";
  }

  resetForm() {
    const form = this.createChecklistForm();
    this.checklistForm.set(form);
    this.currentChecklist.set(null);
    this.validationErrors.set([]);
    this.isDirty.set(false);
    this.initializeForm();
    this.showMessage("Form reset successfully");
  }

  exportChecklist() {
    const form = this.checklistForm();
    if (form && form.valid) {
      const checklist: ChecklistBase = form.value;
      const jsonData = JSON.stringify(checklist, null, 2);

      const blob = new Blob([jsonData], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `checklist_${checklist.id}.json`;
      link.click();
      window.URL.revokeObjectURL(url);

      this.showMessage("Checklist exported successfully");
    } else {
      this.showMessage("Please ensure form is valid before exporting", "error");
    }
  }

  importChecklist(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const jsonData = e.target?.result as string;
          const checklist: ChecklistBase = JSON.parse(jsonData);

          this.currentChecklist.set(checklist);
          this.populateForm(checklist);
          this.showMessage("Checklist imported successfully");
        } catch (error) {
          this.showMessage(
            `Import failed: ${(error as Error).message}`,
            "error",
          );
        }
      };

      reader.readAsText(file);
    }
  }

  private generateId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private showMessage(message: string, type: "success" | "error" = "success") {
    this.snackBar.open(message, "Close", {
      duration: type === "error" ? 5000 : 3000,
      panelClass: type === "error" ? ["error-snackbar"] : ["success-snackbar"],
    });
  }

  // TrackBy functions for better performance
  trackById(index: number, item: AbstractControl | any): string | number {
    // For FormGroups/FormControls, check for an 'id' control
    if (item && typeof item.get === 'function' && item.get('id')) {
      return item.get('id').value;
    }
    // For plain objects, check for an 'id' property
    if (item && item.id) {
      return item.id;
    }
    // Fallback for items without a unique ID
    return index;
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}
