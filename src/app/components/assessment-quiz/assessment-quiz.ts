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
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatStepperModule } from "@angular/material/stepper";
import { MatRadioModule } from "@angular/material/radio";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { MatDividerModule } from "@angular/material/divider";
import { MatChipsModule } from "@angular/material/chips";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatDialogModule } from "@angular/material/dialog";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Observable } from "rxjs";
import { map, shareReplay } from "rxjs/operators";

import { ChecklistService } from "../../services/checklist.service";
import { OrganizationService } from "../../services/organization.service";
import { IdGeneratorService } from "../../services/id-generator.service";
import {
  ScoringService,
  SectionScore,
  QuestionScore,
} from "../../services/scoring.service";
import {
  Checklist,
  ChecklistInput,
  Section,
  QuestionUnion,
  QuestionType,
  StandardQuestion,
  DataControlQuestion,
  DataPoint,
  isStandardQuestion,
  isDataControlQuestion,
} from "../../interfaces/chkLst.interface";

interface AssessmentResponse {
  questionId: string;
  score: number;
  notes?: string;
  timestamp: Date;
}

interface AssessmentSession {
  id: string;
  checklistId: string;
  startTime: Date;
  endTime?: Date;
  responses: AssessmentResponse[];
  currentSectionIndex: number;
  currentQuestionIndex: number;
  isCompleted: boolean;
  totalScore: number;
  maxPossibleScore: number;
}

@Component({
  selector: "app-assessment-quiz",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: "./assessment-quiz.html",
  styleUrl: "./assessment-quiz.css",
})
export class AssessmentQuiz implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly checklistService = inject(ChecklistService);
  private readonly organizationService = inject(OrganizationService);
  private readonly idGenerator = inject(IdGeneratorService);
  protected readonly scoringService = inject(ScoringService);
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

  // Component state
  private readonly _currentChecklist = signal<Checklist | null>(null);
  private readonly _assessmentSession = signal<AssessmentSession | null>(null);
  private readonly _currentSectionIndex = signal<number>(0);
  private readonly _currentQuestionIndex = signal<number>(0);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _showResults = signal<boolean>(false);
  private readonly _autoSave = signal<boolean>(true);

  // Form state
  assessmentForm!: FormGroup;
  responseForm!: FormGroup;

  // Read-only computed properties
  readonly currentChecklist = this._currentChecklist.asReadonly();
  readonly assessmentSession = this._assessmentSession.asReadonly();
  readonly currentSectionIndex = this._currentSectionIndex.asReadonly();
  readonly currentQuestionIndex = this._currentQuestionIndex.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly showResults = this._showResults.asReadonly();
  readonly autoSave = this._autoSave.asReadonly();

  // Computed properties for navigation and progress
  readonly currentSection = computed(() => {
    const checklist = this._currentChecklist();
    const sectionIndex = this._currentSectionIndex();
    return checklist?.sections[sectionIndex] || null;
  });

  readonly currentQuestion = computed(() => {
    const section = this.currentSection();
    const questionIndex = this._currentQuestionIndex();
    return section?.questions[questionIndex] || null;
  });

  readonly totalSections = computed(() => {
    return this._currentChecklist()?.sections.length || 0;
  });

  readonly totalQuestionsInCurrentSection = computed(() => {
    return this.currentSection()?.questions.length || 0;
  });

  readonly progressPercentage = computed(() => {
    const session = this._assessmentSession();
    if (!session) return 0;

    const checklist = this._currentChecklist();
    if (!checklist) return 0;

    const totalQuestions = checklist.sections.reduce(
      (total, section) => total + section.questions.length,
      0,
    );

    const answeredQuestions = session.responses.length;
    return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  });

  readonly canNavigateNext = computed(() => {
    const sectionIndex = this._currentSectionIndex();
    const questionIndex = this._currentQuestionIndex();
    const totalSections = this.totalSections();
    const totalQuestions = this.totalQuestionsInCurrentSection();

    if (sectionIndex < totalSections - 1) {
      return true;
    }
    return questionIndex < totalQuestions - 1;
  });

  readonly canNavigatePrevious = computed(() => {
    const sectionIndex = this._currentSectionIndex();
    const questionIndex = this._currentQuestionIndex();
    return sectionIndex > 0 || questionIndex > 0;
  });

  readonly isLastQuestion = computed(() => {
    const sectionIndex = this._currentSectionIndex();
    const questionIndex = this._currentQuestionIndex();
    const totalSections = this.totalSections();
    const totalQuestions = this.totalQuestionsInCurrentSection();

    return (
      sectionIndex === totalSections - 1 && questionIndex === totalQuestions - 1
    );
  });

  readonly assessmentResults = computed(() => {
    const session = this._assessmentSession();
    const checklist = this._currentChecklist();
    if (!session || !checklist || !session.isCompleted) return null;

    return this.scoringService.calculateChecklistScores(checklist);
  });

  readonly QuestionType = QuestionType;

  ngOnInit(): void {
    this.initializeForms();
    this.loadAssessment();
    this.setupAutoSave();
  }

  ngOnDestroy(): void {
    this.saveSession();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.assessmentForm = this.formBuilder.group({
      healthProgram: ["", [Validators.required]],
      organizationalLevel: ["", [Validators.required]],
      department: ["", [Validators.required]],
    });

    this.responseForm = this.formBuilder.group({
      score: [0, [Validators.required, Validators.min(0)]],
      notes: [""],
    });
  }

  protected async loadAssessment(): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const checklistId = this.route.snapshot.paramMap.get("id");
      if (!checklistId) {
        // Start new assessment
        await this.startNewAssessment();
      } else {
        // Load existing checklist for assessment
        await this.loadExistingChecklist(checklistId);
      }
    } catch (error) {
      this._error.set(
        error instanceof Error ? error.message : "Failed to load assessment",
      );
    } finally {
      this._isLoading.set(false);
    }
  }

  private async loadExistingChecklist(checklistId: string): Promise<void> {
    await this.checklistService.loadChecklists();
    const checklists = this.checklistService.checklists();
    const checklist = checklists.find((c) => c.id === checklistId);

    if (!checklist) {
      throw new Error("Checklist not found");
    }

    this._currentChecklist.set(checklist);
    this.initializeAssessmentSession(checklist);

    // Populate form with checklist data
    this.assessmentForm.patchValue({
      healthProgram: checklist.healthProgram,
      organizationalLevel: checklist.organizationalLevel,
      department: checklist.department,
    });
  }

  private initializeAssessmentSession(checklist: Checklist): void {
    const session: AssessmentSession = {
      id: this.idGenerator.generateUuid(),
      checklistId: checklist.id,
      startTime: new Date(),
      responses: [],
      currentSectionIndex: 0,
      currentQuestionIndex: 0,
      isCompleted: false,
      totalScore: 0,
      maxPossibleScore:
        this.scoringService.calculateChecklistMaxScore(checklist),
    };

    this._assessmentSession.set(session);
  }

  private setupAutoSave(): void {
    if (!this._autoSave()) return;

    // Auto-save every 30 seconds
    setInterval(() => {
      this.saveSession();
    }, 30000);
  }

  public nextQuestion(): void {
    this.saveCurrentResponse();

    const currentSectionIndex = this._currentSectionIndex();
    const currentQuestionIndex = this._currentQuestionIndex();
    const totalQuestions = this.totalQuestionsInCurrentSection();

    if (currentQuestionIndex < totalQuestions - 1) {
      // Move to next question in current section
      this._currentQuestionIndex.set(currentQuestionIndex + 1);
    } else if (currentSectionIndex < this.totalSections() - 1) {
      // Move to first question of next section
      this._currentSectionIndex.set(currentSectionIndex + 1);
      this._currentQuestionIndex.set(0);
    }

    this.loadCurrentQuestionResponse();
  }

  public previousQuestion(): void {
    this.saveCurrentResponse();

    const currentSectionIndex = this._currentSectionIndex();
    const currentQuestionIndex = this._currentQuestionIndex();

    if (currentQuestionIndex > 0) {
      // Move to previous question in current section
      this._currentQuestionIndex.set(currentQuestionIndex - 1);
    } else if (currentSectionIndex > 0) {
      // Move to last question of previous section
      this._currentSectionIndex.set(currentSectionIndex - 1);
      const previousSection = this.currentSection();
      if (previousSection) {
        this._currentQuestionIndex.set(previousSection.questions.length - 1);
      }
    }

    this.loadCurrentQuestionResponse();
  }

  public jumpToQuestion(sectionIndex: number, questionIndex: number): void {
    this.saveCurrentResponse();
    this._currentSectionIndex.set(sectionIndex);
    this._currentQuestionIndex.set(questionIndex);
    this.loadCurrentQuestionResponse();
  }

  public async completeAssessment(): Promise<void> {
    this.saveCurrentResponse();

    const session = this._assessmentSession();
    if (!session) return;

    // Mark session as completed
    const completedSession: AssessmentSession = {
      ...session,
      endTime: new Date(),
      isCompleted: true,
    };

    this._assessmentSession.set(completedSession);

    // Calculate final scores and update checklist
    await this.finalizeAssessment();

    this._showResults.set(true);
  }

  private async finalizeAssessment(): Promise<void> {
    const session = this._assessmentSession();
    const checklist = this._currentChecklist();

    if (!session || !checklist) return;

    // Apply scores from responses to checklist
    const updatedChecklist = this.applyResponsesToChecklist(
      checklist,
      session.responses,
    );

    // Save the completed assessment
    try {
      const checklistInput: ChecklistInput = {
        ...updatedChecklist,
        updatedAt: new Date(),
      };

      await this.checklistService.saveChecklist(checklistInput);
    } catch (error) {
      console.error("Failed to save completed assessment:", error);
    }
  }

  private applyResponsesToChecklist(
    checklist: Checklist,
    responses: AssessmentResponse[],
  ): Checklist {
    const responseMap = new Map(responses.map((r) => [r.questionId, r]));

    const updatedSections = checklist.sections.map((section) => {
      const updatedQuestions = section.questions.map((question) => {
        const response = responseMap.get(question.id);
        if (response) {
          return { ...question, score: response.score };
        }
        return question;
      });

      // Recalculate section score
      const sectionScore = updatedQuestions.reduce(
        (sum, q) => sum + q.score,
        0,
      );
      const maxScore =
        this.scoringService.calculateSectionMaxScore(updatedQuestions);

      return {
        ...section,
        questions: updatedQuestions,
        score: sectionScore,
        maxScore,
      };
    });

    return { ...checklist, sections: updatedSections };
  }

  private saveCurrentResponse(): void {
    const currentQuestion = this.currentQuestion();
    const session = this._assessmentSession();

    if (!currentQuestion || !session) return;

    const formValue = this.responseForm.value;
    const response: AssessmentResponse = {
      questionId: currentQuestion.id,
      score: formValue.score || 0,
      notes: formValue.notes || "",
      timestamp: new Date(),
    };

    // Update or add response
    const updatedResponses = session.responses.filter(
      (r) => r.questionId !== currentQuestion.id,
    );
    updatedResponses.push(response);

    const updatedSession: AssessmentSession = {
      ...session,
      responses: updatedResponses,
      totalScore: updatedResponses.reduce((sum, r) => sum + r.score, 0),
    };

    this._assessmentSession.set(updatedSession);
  }

  private loadCurrentQuestionResponse(): void {
    const currentQuestion = this.currentQuestion();
    const session = this._assessmentSession();

    if (!currentQuestion || !session) return;

    const existingResponse = session.responses.find(
      (r) => r.questionId === currentQuestion.id,
    );

    if (existingResponse) {
      this.responseForm.patchValue({
        score: existingResponse.score,
        notes: existingResponse.notes,
      });
    } else {
      this.responseForm.reset({
        score: 0,
        notes: "",
      });
    }

    // Update max score validator
    const maxScore =
      this.scoringService.calculateQuestionMaxScore(currentQuestion);
    this.responseForm
      .get("score")
      ?.setValidators([
        Validators.required,
        Validators.min(0),
        Validators.max(maxScore),
      ]);
    this.responseForm.get("score")?.updateValueAndValidity();
  }

  private saveSession(): void {
    const session = this._assessmentSession();
    if (!session) return;

    // Save to localStorage for persistence
    localStorage.setItem(
      `assessment_session_${session.id}`,
      JSON.stringify(session),
    );
  }

  public async startOver(): Promise<void> {
    const confirmed = confirm(
      "Are you sure you want to start over? All progress will be lost.",
    );
    if (!confirmed) return;

    // Clear session
    const session = this._assessmentSession();
    if (session) {
      localStorage.removeItem(`assessment_session_${session.id}`);
    }

    // Reset state
    this._currentSectionIndex.set(0);
    this._currentQuestionIndex.set(0);
    this._showResults.set(false);

    // Reinitialize
    const checklist = this._currentChecklist();
    if (checklist) {
      this.initializeAssessmentSession(checklist);
      this.loadCurrentQuestionResponse();
    }
  }

  public async saveAndExit(): Promise<void> {
    this.saveCurrentResponse();
    this.saveSession();
    this.router.navigate(["/checklists"]);
  }

  public viewResults(): void {
    this._showResults.set(true);
  }

  public exportResults(): void {
    const results = this.assessmentResults();
    const session = this._assessmentSession();

    if (!results || !session) return;

    const exportData = {
      session,
      results,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assessment-results-${session.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  public getQuestionTypeLabel(type: QuestionType): string {
    switch (type) {
      case QuestionType.STANDARD:
        return "Standard Question";
      case QuestionType.DATA_CONTROL:
        return "Data Control";
      default:
        return "Unknown";
    }
  }

  protected getResponseForQuestion(
    questionId: string,
  ): AssessmentResponse | undefined {
    const session = this._assessmentSession();
    return session?.responses.find((r) => r.questionId === questionId);
  }

  public isQuestionAnswered(questionId: string): boolean {
    return this.getResponseForQuestion(questionId) !== undefined;
  }

  public getMaxScoreForCurrentQuestion(): number {
    const currentQuestion = this.currentQuestion();
    return currentQuestion
      ? this.scoringService.calculateQuestionMaxScore(currentQuestion)
      : 0;
  }

  // Organization service computed properties
  protected readonly healthPrograms = computed(() =>
    this.organizationService.healthProgramNames(),
  );

  protected readonly organizationalLevels = computed(() =>
    this.organizationService.organizationalLevelNames(),
  );

  protected readonly departments = computed(() =>
    this.organizationService.departmentNames(),
  );

  // Additional helper methods
  protected showQuestionList = signal<boolean>(false);

  protected toggleQuestionList(): void {
    this.showQuestionList.update((show) => !show);
  }

  protected getQuestionsAnsweredInSection(sectionIndex: number): number {
    const session = this._assessmentSession();
    const checklist = this._currentChecklist();

    if (!session || !checklist || !checklist.sections[sectionIndex]) {
      return 0;
    }

    const section = checklist.sections[sectionIndex];
    return section.questions.filter((question) =>
      session.responses.some((response) => response.questionId === question.id),
    ).length;
  }

  protected getScoreClass(percentage: number): string {
    if (percentage >= 90) return "excellent";
    if (percentage >= 75) return "good";
    if (percentage >= 60) return "fair";
    return "poor";
  }

  protected getProgressColor(percentage: number): string {
    if (percentage >= 90) return "primary";
    if (percentage >= 75) return "accent";
    if (percentage >= 60) return "warn";
    return "warn";
  }

  // Helper methods for type-safe template access
  protected getCurrentDataControlQuestion(): any {
    const question = this.currentQuestion();
    return question?.type === QuestionType.DATA_CONTROL
      ? (question as any)
      : null;
  }

  protected getCurrentStandardQuestion(): any {
    const question = this.currentQuestion();
    return question?.type === QuestionType.STANDARD ? (question as any) : null;
  }

  protected getDataControlIndicator(): string {
    const dcQuestion = this.getCurrentDataControlQuestion();
    return dcQuestion?.indicator || "N/A";
  }

  protected getDataControlMonth(): string {
    const dcQuestion = this.getCurrentDataControlQuestion();
    if (dcQuestion?.month) {
      return new Date(dcQuestion.month).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
    }
    return "N/A";
  }

  protected getDataControlSourceName(): string {
    const dcQuestion = this.getCurrentDataControlQuestion();
    return dcQuestion?.dataSource?.name || "N/A";
  }

  protected getStandardSubQuestions(): any[] {
    const standardQuestion = this.getCurrentStandardQuestion();
    return standardQuestion?.subQuestions || [];
  }

  protected hasSubQuestions(): boolean {
    return this.getStandardSubQuestions().length > 0;
  }

  protected async startNewAssessment(): Promise<void> {
    if (this.assessmentForm.invalid) return;

    const formValue = this.assessmentForm.value;

    // Create a basic checklist structure for assessment
    const assessmentId = this.idGenerator.generateAssessmentId();

    const newChecklist: Checklist = {
      id: assessmentId,
      healthProgram: formValue.healthProgram,
      organizationalLevel: formValue.organizationalLevel,
      department: formValue.department,
      sections: this.createDefaultSections(),
      createdAt: new Date(),
      updatedAt: new Date(),
      version: "1.0.0",
    };

    this._currentChecklist.set(newChecklist);
    this.initializeAssessmentSession(newChecklist);
    this.loadCurrentQuestionResponse();
  }

  private createDefaultSections(): Section[] {
    // Create default sections for a new assessment
    const sections: Section[] = [
      {
        id: this.idGenerator.generateSectionId(),
        title: "Safety and Quality Standards",
        score: 0,
        maxScore: 0,
        questions: [
          {
            id: this.idGenerator.generateQuestionId(),
            type: QuestionType.STANDARD,
            title: "Are safety protocols documented and accessible?",
            score: 0,
            maxScore: this.scoringService.config().defaultMaxScore,
          } as StandardQuestion,
          {
            id: this.idGenerator.generateQuestionId(),
            type: QuestionType.STANDARD,
            title: "Are quality assurance measures in place?",
            score: 0,
            maxScore: this.scoringService.config().defaultMaxScore,
          } as StandardQuestion,
        ],
      },
      {
        id: this.idGenerator.generateSectionId(),
        title: "Staff Training and Competency",
        score: 0,
        maxScore: 0,
        questions: [
          {
            id: this.idGenerator.generateQuestionId(),
            type: QuestionType.STANDARD,
            title: "Is staff training up to date?",
            score: 0,
            maxScore: this.scoringService.config().defaultMaxScore,
          } as StandardQuestion,
          {
            id: this.idGenerator.generateQuestionId(),
            type: QuestionType.STANDARD,
            title: "Are competency assessments conducted regularly?",
            score: 0,
            maxScore: this.scoringService.config().defaultMaxScore,
          } as StandardQuestion,
        ],
      },
    ];

    // Calculate max scores for sections
    return sections.map((section) => ({
      ...section,
      maxScore: this.scoringService.calculateSectionMaxScore(section.questions),
    }));
  }
}
