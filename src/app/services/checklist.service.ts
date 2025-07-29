import { Injectable, computed, signal } from "@angular/core";
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

  // Unique values for filtering
  readonly availableHealthPrograms = computed(() => {
    const programs = new Set(this._checklists().map((c) => c.healthProgram));
    return Array.from(programs).sort();
  });

  readonly availableOrganizationalLevels = computed(() => {
    const levels = new Set(
      this._checklists().map((c) => c.organizationalLevel),
    );
    return Array.from(levels).sort();
  });

  readonly availableDepartments = computed(() => {
    const departments = new Set(this._checklists().map((c) => c.department));
    return Array.from(departments).sort();
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

      const checklist: Checklist = {
        ...checklistInput,
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
    const dataPoint1: DataPoint = {
      id: "dp1",
      name: "Patient Count",
      value: 150,
    };

    const dataPoint2: DataPoint = {
      id: "dp2",
      name: "Target Count",
      value: 200,
    };

    const standardQuestion: StandardQuestion = {
      id: "q1",
      type: QuestionType.STANDARD,
      title: "Are safety protocols documented?",
      score: 8,
      maxScore: 10,
      subQuestions: [
        {
          id: "sq1",
          type: QuestionType.STANDARD,
          title: "Are protocols up to date?",
          score: 7,
          maxScore: 10,
        },
      ],
    };

    const dataControlQuestion: DataControlQuestion = {
      id: "q2",
      type: QuestionType.DATA_CONTROL,
      title: "Patient Safety Metrics",
      score: 6,
      maxScore: 10,
      indicator: "Patient Safety Score",
      month: new Date("2024-01-01"),
      dataSource: dataPoint1,
      dataCount: dataPoint2,
      hasDataDifference: true,
    };

    const section: Section = {
      id: "s1",
      title: "Safety Standards",
      score: 14,
      maxScore: 20,
      questions: [standardQuestion, dataControlQuestion],
    };

    return [
      {
        id: "cl1",
        healthProgram: "Primary Care",
        organizationalLevel: "Regional",
        department: "Emergency",
        sections: [section],
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-15"),
        version: "1.0.0",
      },
      {
        id: "cl2",
        healthProgram: "Specialized Care",
        organizationalLevel: "National",
        department: "Surgery",
        sections: [
          {
            ...section,
            id: "s2",
            title: "Surgical Standards",
            score: 18,
            maxScore: 20,
          },
        ],
        createdAt: new Date("2024-01-02"),
        updatedAt: new Date("2024-01-16"),
        version: "1.1.0",
      },
    ];
  }
}
