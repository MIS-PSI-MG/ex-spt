/**
 * Core interfaces for the checklist system
 * Optimized for type safety, performance, and maintainability
 */

/**
 * Base interface for items with scoring capability
 */
export interface ScoredItem {
  readonly id: string;
  readonly title: string;
  readonly score: number;
  readonly maxScore: number;
}

/**
 * Data point interface for metrics and indicators
 */
export interface DataPoint {
  readonly id: string;
  readonly name: string;
  readonly value: number;
}

/**
 * Question type discriminator
 */
export enum QuestionType {
  STANDARD = "standard",
  DATA_CONTROL = "data_control",
}

/**
 * Base question interface
 */
export interface Question extends ScoredItem {
  readonly type: QuestionType;
}

/**
 * Standard question with potential sub-questions
 */
export interface StandardQuestion extends Question {
  readonly type: QuestionType.STANDARD;
  readonly subQuestions?: readonly StandardQuestion[];
}

/**
 * Data control question for metrics tracking
 */
export interface DataControlQuestion extends Question {
  readonly type: QuestionType.DATA_CONTROL;
  readonly indicator: string;
  readonly month: Date;
  readonly dataSource: DataPoint;
  readonly dataCount: DataPoint;
  readonly hasDataDifference: boolean;
}

/**
 * Union type for all question types
 */
export type QuestionUnion = StandardQuestion | DataControlQuestion;

/**
 * Type guard to check if a question is a standard question
 */
export function isStandardQuestion(
  question: QuestionUnion,
): question is StandardQuestion {
  return question.type === QuestionType.STANDARD;
}

/**
 * Type guard to check if a question is a data control question
 */
export function isDataControlQuestion(
  question: QuestionUnion,
): question is DataControlQuestion {
  return question.type === QuestionType.DATA_CONTROL;
}

/**
 * Section containing questions and scoring information
 */
export interface Section extends ScoredItem {
  readonly questions: readonly QuestionUnion[];
}

/**
 * Main checklist interface representing a complete assessment
 */
export interface Checklist {
  readonly id: string;
  readonly healthProgram: string;
  readonly organizationalLevel: string;
  readonly department: string;
  readonly sections: readonly Section[];
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly version?: string;
}

/**
 * Utility type for creating a new checklist (with optional readonly fields mutable)
 */
export type ChecklistInput = Omit<
  Checklist,
  "createdAt" | "updatedAt" | "version"
> & {
  createdAt?: Date;
  updatedAt?: Date;
  version?: string;
};

/**
 * Summary statistics for a checklist
 */
export interface ChecklistSummary {
  readonly id: string;
  readonly totalScore: number;
  readonly maxPossibleScore: number;
  readonly completionPercentage: number;
  readonly sectionCount: number;
  readonly questionCount: number;
  readonly lastUpdated?: Date;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

/**
 * Utility functions for working with checklists
 */
export namespace ChecklistUtils {
  /**
   * Calculate total score for a checklist
   */
  export function calculateTotalScore(checklist: Checklist): number {
    return checklist.sections.reduce(
      (total, section) => total + section.score,
      0,
    );
  }

  /**
   * Calculate maximum possible score for a checklist
   */
  export function calculateMaxScore(checklist: Checklist): number {
    return checklist.sections.reduce(
      (total, section) => total + section.maxScore,
      0,
    );
  }

  /**
   * Generate checklist summary
   */
  export function generateSummary(checklist: Checklist): ChecklistSummary {
    const totalScore = calculateTotalScore(checklist);
    const maxScore = calculateMaxScore(checklist);
    const questionCount = checklist.sections.reduce(
      (count, section) => count + countQuestionsInSection(section),
      0,
    );

    return {
      id: checklist.id,
      totalScore,
      maxPossibleScore: maxScore,
      completionPercentage: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
      sectionCount: checklist.sections.length,
      questionCount,
      lastUpdated: checklist.updatedAt,
    };
  }

  /**
   * Count questions in a section (including sub-questions)
   */
  function countQuestionsInSection(section: Section): number {
    return section.questions.reduce((count, question) => {
      if (isStandardQuestion(question) && question.subQuestions) {
        return count + 1 + question.subQuestions.length;
      }
      return count + 1;
    }, 0);
  }

  /**
   * Validate a checklist structure
   */
  export function validate(checklist: Checklist): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!checklist.id?.trim()) errors.push("Checklist ID is required");
    if (!checklist.healthProgram?.trim())
      errors.push("Health program is required");
    if (!checklist.organizationalLevel?.trim())
      errors.push("Organizational level is required");
    if (!checklist.department?.trim()) errors.push("Department is required");

    // Validate sections
    if (!checklist.sections?.length) {
      errors.push("At least one section is required");
    } else {
      checklist.sections.forEach((section, index) => {
        if (!section.id?.trim())
          errors.push(`Section ${index + 1}: ID is required`);
        if (!section.title?.trim())
          errors.push(`Section ${index + 1}: Title is required`);
        if (section.score < 0)
          errors.push(`Section ${index + 1}: Score cannot be negative`);
        if (section.maxScore <= 0)
          errors.push(`Section ${index + 1}: Max score must be positive`);
        if (section.score > section.maxScore) {
          warnings.push(`Section ${index + 1}: Score exceeds max score`);
        }

        // Validate questions
        if (!section.questions?.length) {
          warnings.push(`Section ${index + 1}: No questions found`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
