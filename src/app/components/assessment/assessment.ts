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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./assessment.html",
  styleUrl: "./assessment.css",
})
export class Assessment implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly checklistService = inject(ChecklistService);

  assessmentForm!: FormGroup;

  private readonly _currentSectionIndex = signal<number>(0);
  private readonly _assessmentSections = signal<AssessmentSection[]>([]);

  protected readonly currentSectionIndex =
    this._currentSectionIndex.asReadonly();
  protected readonly assessmentSections = this._assessmentSections.asReadonly();
  protected readonly checklist = this.checklistService.currentChecklist;

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
}
