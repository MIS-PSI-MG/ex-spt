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
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSliderModule } from "@angular/material/slider";
import { MatChipsModule } from "@angular/material/chips";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatDividerModule } from "@angular/material/divider";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { MatStepperModule } from "@angular/material/stepper";
import { MatTabsModule } from "@angular/material/tabs";

import { ChecklistService } from "../../services/checklist.service";
import {
  Checklist,
  Section,
  Question,
  QuestionUnion,
  QuestionType,
  StandardQuestion,
  DataControlQuestion,
  ChecklistUtils,
  isStandardQuestion,
  isDataControlQuestion,
} from "../../interfaces/chkLst.interface";

interface AssessmentQuestion extends Question {
  answered: boolean;
  userScore: number;
}

interface AssessmentSection {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  questions: AssessmentQuestion[];
  completed: boolean;
  currentScore: number;
}

@Component({
  selector: "app-assessment",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSliderModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule,
    MatSnackBarModule,
    MatStepperModule,
    MatTabsModule,
  ],
  templateUrl: "./assessment.html",
  styleUrl: "./assessment.css",
})
export class Assessment implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly checklistService = inject(ChecklistService);

  assessmentForm!: FormGroup;

  private readonly _currentSectionIndex = signal<number>(0);
  private readonly _currentQuestionIndex = signal<number>(0);
  private readonly _assessmentSections = signal<AssessmentSection[]>([]);

  protected readonly currentSectionIndex =
    this._currentSectionIndex.asReadonly();
  protected readonly currentQuestionIndex =
    this._currentQuestionIndex.asReadonly();
  protected readonly assessmentSections = this._assessmentSections.asReadonly();
  protected readonly checklist = this.checklistService.currentChecklist;

  // Expose QuestionType enum for template
  protected readonly QuestionType = QuestionType;

  // Computed properties
  protected readonly currentSection = computed(() => {
    const sections = this._assessmentSections();
    const index = this._currentSectionIndex();
    return sections[index] || null;
  });

  protected readonly totalCurrentScore = computed(() => {
    return this._assessmentSections().reduce(
      (total, section) => total + section.currentScore,
      0,
    );
  });

  protected readonly totalMaxScore = computed(() => {
    return this._assessmentSections().reduce(
      (total, section) => total + section.maxScore,
      0,
    );
  });

  protected readonly completionPercentage = computed(() => {
    const sections = this._assessmentSections();
    if (sections.length === 0) return 0;

    const totalQuestions = sections.reduce(
      (total, section) => total + section.questions.length,
      0,
    );
    const answeredQuestions = sections.reduce(
      (total, section) =>
        total + section.questions.filter((q) => q.answered).length,
      0,
    );

    return totalQuestions > 0
      ? Math.round((answeredQuestions / totalQuestions) * 100)
      : 0;
  });

  protected readonly answeredQuestionsInCurrentSection = computed(() => {
    const section = this.currentSection();
    return section ? section.questions.filter((q) => q.answered).length : 0;
  });

  protected readonly isAssessmentComplete = computed(() => {
    return this._assessmentSections().every((section) => section.completed);
  });

  ngOnInit(): void {
    this.initializeAssessment();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async initializeAssessment(): Promise<void> {
    // Get checklist ID from route
    const checklistId = this.route.snapshot.paramMap.get("id");

    if (!checklistId) {
      this.router.navigate(["/checklists"]);
      return;
    }

    // Load checklist if not already loaded
    const currentChecklist = this.checklistService.currentChecklist();
    if (!currentChecklist || currentChecklist.id !== checklistId) {
      await this.checklistService.loadChecklists();
      const checklist = this.checklistService
        .checklists()
        .find((c) => c.id === checklistId);
      if (checklist) {
        this.checklistService.setCurrentChecklist(checklist);
      } else {
        this.router.navigate(["/checklists"]);
        return;
      }
    }

    this.initializeForm();
    this.setupAssessmentSections();
  }

  private initializeForm(): void {
    this.assessmentForm = this.formBuilder.group({
      sections: this.formBuilder.array([]),
    });
  }

  private setupAssessmentSections(): void {
    const checklist = this.checklistService.currentChecklist();
    if (!checklist) return;

    const assessmentSections: AssessmentSection[] = checklist.sections.map(
      (section) => ({
        ...section,
        questions: section.questions.map((question) => ({
          ...question,
          answered: false,
          userScore: 0,
        })),
        completed: false,
        currentScore: 0,
      }),
    );

    this._assessmentSections.set(assessmentSections);
    this.buildFormArray();
  }

  private buildFormArray(): void {
    const sectionsArray = this.assessmentForm.get("sections") as FormArray;

    // Clear existing controls
    while (sectionsArray.length !== 0) {
      sectionsArray.removeAt(0);
    }

    // Add section form groups
    this._assessmentSections().forEach((section) => {
      const sectionGroup = this.formBuilder.group({
        questions: this.formBuilder.array(
          section.questions.map((question) =>
            this.createQuestionFormGroup(question),
          ),
        ),
      });
      sectionsArray.push(sectionGroup);
    });
  }

  private createQuestionFormGroup(question: AssessmentQuestion): FormGroup {
    return this.formBuilder.group({
      userScore: [
        question.userScore,
        [Validators.min(0), Validators.max((question as any).maxScore)],
      ],
      notes: [""],
    });
  }

  protected setCurrentSection(index: number): void {
    if (index >= 0 && index < this._assessmentSections().length) {
      this._currentSectionIndex.set(index);
      this._currentQuestionIndex.set(0);
    }
  }

  protected previousSection(): void {
    const currentIndex = this._currentSectionIndex();
    if (currentIndex > 0) {
      this._currentSectionIndex.set(currentIndex - 1);
    }
  }

  protected nextSection(): void {
    const currentIndex = this._currentSectionIndex();
    if (currentIndex < this._assessmentSections().length - 1) {
      this._currentSectionIndex.set(currentIndex + 1);
    }
  }

  protected onScoreChange(
    sectionIndex: number,
    questionIndex: number,
    event: Event,
  ): void {
    const target = event.target as HTMLInputElement;
    const score = parseInt(target.value, 10) || 0;

    // Update the assessment sections
    const sections = [...this._assessmentSections()];
    const section = { ...sections[sectionIndex] };
    const questions = [...section.questions];
    const question = { ...questions[questionIndex] };

    question.userScore = score;
    question.answered = score > 0;

    questions[questionIndex] = question;
    section.questions = questions;
    section.currentScore = questions.reduce(
      (total, q) => total + q.userScore,
      0,
    );
    section.completed = questions.every((q) => q.answered);

    sections[sectionIndex] = section;
    this._assessmentSections.set(sections);
  }

  protected async saveProgress(): Promise<void> {
    // Here you would typically save the current progress to a backend
    // For now, we'll just show a success message
    console.log("Progress saved", this.getAssessmentData());

    // You could also save to localStorage for persistence
    localStorage.setItem(
      "assessment-progress",
      JSON.stringify(this.getAssessmentData()),
    );
  }

  protected async completeAssessment(): Promise<void> {
    if (!this.isAssessmentComplete()) {
      return;
    }

    const assessmentData = this.getAssessmentData();

    // Here you would typically submit the completed assessment
    console.log("Assessment completed", assessmentData);

    // Navigate to results
    this.router.navigate(["/results"], {
      queryParams: { checklistId: this.checklist()?.id },
    });
  }

  private getAssessmentData() {
    const checklist = this.checklist();
    const sections = this._assessmentSections();

    return {
      checklistId: checklist?.id,
      checklistTitle: checklist?.healthProgram,
      department: checklist?.department,
      organizationalLevel: checklist?.organizationalLevel,
      totalScore: this.totalCurrentScore(),
      maxScore: this.totalMaxScore(),
      completionPercentage: this.completionPercentage(),
      sections: sections.map((section) => ({
        id: section.id,
        title: section.title,
        score: section.currentScore,
        maxScore: section.maxScore,
        questions: section.questions.map((question) => ({
          id: (question as any).id,
          title: (question as any).title,
          userScore: question.userScore,
          maxScore: (question as any).maxScore,
          answered: question.answered,
          type: (question as any).type,
        })),
      })),
      completedAt: new Date().toISOString(),
    };
  }

  protected getQuestionTypeLabel(type: QuestionType): string {
    switch (type) {
      case QuestionType.STANDARD:
        return "Standard";
      case QuestionType.DATA_CONTROL:
        return "Data Control";
      default:
        return "Unknown";
    }
  }

  protected formatMonth(date: Date): string {
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  }

  protected isStandardQuestion(
    question: Question,
  ): question is StandardQuestion {
    return question.type === QuestionType.STANDARD;
  }

  protected isDataControlQuestion(
    question: Question,
  ): question is DataControlQuestion {
    return question.type === QuestionType.DATA_CONTROL;
  }

  // New methods for Material Design template
  protected currentQuestion() {
    const section = this.currentSection();
    const questionIndex = this._currentQuestionIndex();
    return section?.questions[questionIndex] || null;
  }

  protected currentQuestionForm() {
    const sectionIndex = this._currentSectionIndex();
    const questionIndex = this._currentQuestionIndex();
    const sectionsArray = this.assessmentForm.get("sections") as FormArray;
    const sectionGroup = sectionsArray.at(sectionIndex) as FormGroup;
    const questionsArray = sectionGroup.get("questions") as FormArray;
    return questionsArray.at(questionIndex) as FormGroup;
  }

  protected getOverallProgress(): number {
    return this.completionPercentage();
  }

  protected getQuestionTypeColor(type?: QuestionType): string {
    switch (type) {
      case QuestionType.STANDARD:
        return "primary";
      case QuestionType.DATA_CONTROL:
        return "accent";
      default:
        return "basic";
    }
  }

  protected getDataControlIndicator(): string {
    const question = this.currentQuestion();
    if (this.isDataControlQuestion(question)) {
      return question.indicator;
    }
    return "";
  }

  protected getDataControlMonth(): string {
    const question = this.currentQuestion();
    if (this.isDataControlQuestion(question)) {
      return this.formatMonth(question.month);
    }
    return "";
  }

  protected getDataControlAssessmentScore(): string {
    const question = this.currentQuestion();
    if (question) {
      return `${question.userScore}/${question.maxScore}`;
    }
    return "";
  }

  protected hasSubQuestions(): boolean {
    const question = this.currentQuestion();
    return (
      this.isStandardQuestion(question) &&
      !!question.subQuestions &&
      question.subQuestions.length > 0
    );
  }

  protected getSubQuestions() {
    const question = this.currentQuestion();
    if (this.isStandardQuestion(question)) {
      return question.subQuestions || [];
    }
    return [];
  }

  protected getSubQuestionScore(subQuestionId: string): number {
    // This would need implementation based on how sub-questions are handled
    return 0;
  }

  protected previousQuestion(): void {
    const currentQuestionIndex = this._currentQuestionIndex();
    const currentSectionIndex = this._currentSectionIndex();

    if (currentQuestionIndex > 0) {
      this._currentQuestionIndex.set(currentQuestionIndex - 1);
    } else if (currentSectionIndex > 0) {
      this._currentSectionIndex.set(currentSectionIndex - 1);
      const previousSection =
        this._assessmentSections()[currentSectionIndex - 1];
      this._currentQuestionIndex.set(previousSection.questions.length - 1);
    }
  }

  protected nextQuestion(): void {
    const currentQuestionIndex = this._currentQuestionIndex();
    const currentSectionIndex = this._currentSectionIndex();
    const currentSection = this._assessmentSections()[currentSectionIndex];

    if (currentQuestionIndex < currentSection.questions.length - 1) {
      this._currentQuestionIndex.set(currentQuestionIndex + 1);
    } else if (currentSectionIndex < this._assessmentSections().length - 1) {
      this._currentSectionIndex.set(currentSectionIndex + 1);
      this._currentQuestionIndex.set(0);
    }
  }

  protected isLastQuestion(): boolean {
    const currentSectionIndex = this._currentSectionIndex();
    const currentQuestionIndex = this._currentQuestionIndex();
    const sections = this._assessmentSections();
    const lastSectionIndex = sections.length - 1;
    const lastQuestionIndex = sections[lastSectionIndex]?.questions.length - 1;

    return (
      currentSectionIndex === lastSectionIndex &&
      currentQuestionIndex === lastQuestionIndex
    );
  }

  protected isCurrentQuestionAnswered(): boolean {
    const question = this.currentQuestion();
    return question?.answered ?? false;
  }

  protected jumpToQuestion(sectionIndex: number, questionIndex: number): void {
    if (sectionIndex >= 0 && sectionIndex < this._assessmentSections().length) {
      const section = this._assessmentSections()[sectionIndex];
      if (questionIndex >= 0 && questionIndex < section.questions.length) {
        this._currentSectionIndex.set(sectionIndex);
        this._currentQuestionIndex.set(questionIndex);
      }
    }
  }

  protected totalQuestionsInCurrentSection(): number {
    const section = this.currentSection();
    return section?.questions.length || 0;
  }
}
