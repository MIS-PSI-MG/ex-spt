import { Injectable, computed, signal, inject } from "@angular/core";
import {
  Checklist,
  ChecklistInput,
  ChecklistSummary,
  Section,
  Question,
  QuestionUnion,
  QuestionType,
  StandardQuestion,
  DataControlQuestion,
  ValidationResult,
  ChecklistUtils,
  DataPoint,
} from "../interfaces/chkLst.interface";
import { OrganizationService } from "./organization.service";
import { IdGeneratorService } from "./id-generator.service";
import { ScoringService } from "./scoring.service";

export interface ChecklistFilter {
  healthProgram?: string;
  organizationalLevel?: string;
  department?: string;
}

export interface ResultsGrouping {
  department: string;
  organizationalLevel: string;
  sections: SectionResult[];
  summary: ChecklistSummary;
}

export interface SectionResult {
  sectionId: string;
  sectionTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  questionResults: QuestionResult[];
}

export interface QuestionResult {
  questionId: string;
  questionTitle: string;
  score: number;
  maxScore: number;
  type: QuestionType;
  subQuestionResults?: QuestionResult[];
}

@Injectable({
  providedIn: "root",
})
export class ChecklistService {
  // Injected services
  private readonly organizationService = inject(OrganizationService);
  private readonly idGenerator = inject(IdGeneratorService);
  private readonly scoringService = inject(ScoringService);

  // State signals
  private readonly _checklists = signal<Checklist[]>([]);
  private readonly _currentChecklist = signal<Checklist | null>(null);
  private readonly _filter = signal<ChecklistFilter>({});
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Computed signals
  readonly checklists = this._checklists.asReadonly();
  readonly currentChecklist = this._currentChecklist.asReadonly();
  readonly filter = this._filter.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Filtered checklists based on current filter
  readonly filteredChecklists = computed(() => {
    const checklists = this._checklists();
    const filter = this._filter();

    if (
      !filter.healthProgram &&
      !filter.organizationalLevel &&
      !filter.department
    ) {
      return checklists;
    }

    return checklists.filter((checklist) => {
      const matchesProgram =
        !filter.healthProgram ||
        checklist.healthProgram === filter.healthProgram;
      const matchesLevel =
        !filter.organizationalLevel ||
        checklist.organizationalLevel === filter.organizationalLevel;
      const matchesDepartment =
        !filter.department || checklist.department === filter.department;

      return matchesProgram && matchesLevel && matchesDepartment;
    });
  });

  // Computed summaries for all checklists
  readonly checklistSummaries = computed(() => {
    return this._checklists().map((checklist) =>
      ChecklistUtils.generateSummary(checklist),
    );
  });

  // Results grouped by department and organizational level
  readonly resultsGrouping = computed(() => {
    const checklists = this.filteredChecklists();
    const groupingMap = new Map<string, ResultsGrouping>();

    checklists.forEach((checklist) => {
      const key = `${checklist.department}-${checklist.organizationalLevel}`;

      if (!groupingMap.has(key)) {
        groupingMap.set(key, {
          department: checklist.department,
          organizationalLevel: checklist.organizationalLevel,
          sections: [],
          summary: ChecklistUtils.generateSummary(checklist),
        });
      }

      const grouping = groupingMap.get(key)!;

      // Process sections
      checklist.sections.forEach((section) => {
        const sectionResult: SectionResult = {
          sectionId: section.id,
          sectionTitle: section.title,
          score: section.score,
          maxScore: section.maxScore,
          percentage:
            section.maxScore > 0 ? (section.score / section.maxScore) * 100 : 0,
          questionResults: this.processQuestionResults(section.questions),
        };

        grouping.sections.push(sectionResult);
      });
    });

    return Array.from(groupingMap.values());
  });

  // Unique values for filtering - now using organization service
  readonly availableHealthPrograms = computed(() => {
    return this.organizationService.healthProgramNames();
  });

  readonly availableOrganizationalLevels = computed(() => {
    return this.organizationService.organizationalLevelNames();
  });

  readonly availableDepartments = computed(() => {
    return this.organizationService.departmentNames();
  });

  // Current checklist validation
  readonly currentChecklistValidation = computed(() => {
    const checklist = this._currentChecklist();
    if (!checklist) {
      return {
        isValid: false,
        errors: ["No checklist selected"],
        warnings: [],
      };
    }
    return ChecklistUtils.validate(checklist);
  });

  // Methods
  async loadChecklists(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      // Simulate API call - replace with actual HTTP request
      await this.delay(1000);
      const mockChecklists = this.generateMockChecklists();
      this._checklists.set(mockChecklists);
    } catch (error) {
      this._error.set(
        error instanceof Error ? error.message : "Failed to load checklists",
      );
    } finally {
      this._loading.set(false);
    }
  }

  async saveChecklist(checklistInput: ChecklistInput): Promise<string> {
    this._loading.set(true);
    this._error.set(null);

    try {
      // Simulate API call
      await this.delay(500);

      // Ensure checklist has an ID
      const checklistId =
        checklistInput.id || this.idGenerator.generateChecklistId();

      // Update checklist with calculated max scores
      const checklistWithCalculatedScores =
        this.scoringService.updateChecklistWithCalculatedScores({
          ...checklistInput,
          id: checklistId,
        });

      const checklist: Checklist = {
        ...checklistWithCalculatedScores,
        createdAt: checklistInput.createdAt || new Date(),
        updatedAt: new Date(),
        version: checklistInput.version || "1.0.0",
      };

      const currentChecklists = this._checklists();
      const existingIndex = currentChecklists.findIndex(
        (c) => c.id === checklist.id,
      );

      if (existingIndex >= 0) {
        // Update existing
        const updatedChecklists = [...currentChecklists];
        updatedChecklists[existingIndex] = checklist;
        this._checklists.set(updatedChecklists);
      } else {
        // Add new
        this._checklists.set([...currentChecklists, checklist]);
      }

      return checklist.id;
    } catch (error) {
      this._error.set(
        error instanceof Error ? error.message : "Failed to save checklist",
      );
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async deleteChecklist(id: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      // Simulate API call
      await this.delay(300);

      const currentChecklists = this._checklists();
      const filteredChecklists = currentChecklists.filter((c) => c.id !== id);
      this._checklists.set(filteredChecklists);

      // Clear current checklist if it was deleted
      if (this._currentChecklist()?.id === id) {
        this._currentChecklist.set(null);
      }
    } catch (error) {
      this._error.set(
        error instanceof Error ? error.message : "Failed to delete checklist",
      );
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  setCurrentChecklist(checklist: Checklist | null): void {
    this._currentChecklist.set(checklist);
  }

  updateFilter(filter: Partial<ChecklistFilter>): void {
    this._filter.update((current) => ({ ...current, ...filter }));
  }

  clearFilter(): void {
    this._filter.set({});
  }

  clearError(): void {
    this._error.set(null);
  }

  // Helper methods
  private processQuestionResults(
    questions: readonly QuestionUnion[],
  ): QuestionResult[] {
    return questions.map((question) => {
      const result: QuestionResult = {
        questionId: question.id,
        questionTitle: question.title,
        score: question.score,
        maxScore: question.maxScore,
        type: question.type,
      };

      if (question.type === QuestionType.STANDARD && question.subQuestions) {
        result.subQuestionResults = this.processQuestionResults(
          question.subQuestions,
        );
      }

      return result;
    });
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private generateMockChecklists(): Checklist[] {
    const healthPrograms = this.organizationService.healthProgramNames();
    const orgLevels = this.organizationService.organizationalLevelNames();
    const departments = this.organizationService.departmentNames();

    const mockChecklists: Checklist[] = [];

    // Generate mock data using organization service data
    for (let i = 0; i < 5; i++) {
      const dataPoint1: DataPoint = {
        id: this.idGenerator.generateDataPointId(),
        name: "Patient Count",
        value: Math.floor(Math.random() * 200) + 50,
      };

      const dataPoint2: DataPoint = {
        id: this.idGenerator.generateDataPointId(),
        name: "Target Count",
        value: Math.floor(Math.random() * 250) + 100,
      };

      const standardQuestion: StandardQuestion = {
        id: this.idGenerator.generateQuestionId(),
        type: QuestionType.STANDARD,
        title: "Are safety protocols documented?",
        score: Math.floor(Math.random() * 10) + 1,
        maxScore: this.scoringService.config().defaultMaxScore,
        subQuestions: [
          {
            id: this.idGenerator.generateSubQuestionId(),
            type: QuestionType.STANDARD,
            title: "Are protocols up to date?",
            score: Math.floor(Math.random() * 8) + 2,
            maxScore: this.scoringService.config().defaultMaxScore,
          },
        ],
      };

      const dataControlQuestion: DataControlQuestion = {
        id: this.idGenerator.generateQuestionId(),
        type: QuestionType.DATA_CONTROL,
        title: "Patient Safety Metrics",
        score: Math.floor(Math.random() * 8) + 2,
        maxScore: this.scoringService.calculateQuestionMaxScore({
          id: "",
          type: QuestionType.DATA_CONTROL,
          title: "",
          score: 0,
          maxScore: 0,
        } as DataControlQuestion),
        indicator: "Patient Safety Score",
        month: new Date("2024-01-01"),
        dataSource: dataPoint1,
        dataCount: dataPoint2,
        hasDataDifference: Math.random() > 0.5,
      };

      const questions = [standardQuestion, dataControlQuestion];
      const sectionMaxScore =
        this.scoringService.calculateSectionMaxScore(questions);
      const sectionScore = questions.reduce((sum, q) => sum + q.score, 0);

      const section: Section = {
        id: this.idGenerator.generateSectionId(),
        title: `${departments[i % departments.length]} Standards`,
        score: sectionScore,
        maxScore: sectionMaxScore,
        questions: questions,
      };

      mockChecklists.push({
        id: this.idGenerator.generateChecklistId(),
        healthProgram: healthPrograms[i % healthPrograms.length],
        organizationalLevel: orgLevels[i % orgLevels.length],
        department: departments[i % departments.length],
        sections: [section],
        createdAt: new Date(2024, 0, i + 1),
        updatedAt: new Date(2024, 0, i + 15),
        version: "1.0.0",
      });
    }

    return mockChecklists;
  }
}
