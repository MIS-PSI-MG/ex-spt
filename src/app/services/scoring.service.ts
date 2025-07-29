import { Injectable, computed, signal } from "@angular/core";
import {
  Checklist,
  Section,
  QuestionUnion,
  StandardQuestion,
  DataControlQuestion,
  QuestionType,
  isStandardQuestion,
  isDataControlQuestion,
} from "../interfaces/chkLst.interface";

export enum ResponseOption {
  YES = "yes",
  NO = "no",
  NA = "na",
}

export interface QuestionResponse {
  questionId: string;
  response: ResponseOption;
  notes?: string;
}

export interface ScoreCalculation {
  totalScore: number;
  maxScore: number;
  percentage: number;
}

export interface SectionScore extends ScoreCalculation {
  sectionId: string;
  sectionTitle: string;
  questionScores: QuestionScore[];
}

export interface QuestionScore extends ScoreCalculation {
  questionId: string;
  questionTitle: string;
  questionType: QuestionType;
  subQuestionScores?: QuestionScore[];
}

export interface ScoringWeights {
  standardQuestion: number;
  dataControlQuestion: number;
  subQuestionMultiplier: number;
}

export interface ScoringConfig {
  defaultMaxScore: number;
  weights: ScoringWeights;
  enableWeighting: boolean;
  roundScores: boolean;
  decimalPlaces: number;
}

@Injectable({
  providedIn: "root",
})
export class ScoringService {
  private readonly _config = signal<ScoringConfig>({
    defaultMaxScore: 10,
    weights: {
      standardQuestion: 1.0,
      dataControlQuestion: 1.2,
      subQuestionMultiplier: 0.8,
    },
    enableWeighting: false,
    roundScores: true,
    decimalPlaces: 2,
  });

  readonly config = this._config.asReadonly();

  /**
   * Calculate the maximum score for a section based on answered questions only (excluding NA)
   */
  calculateSectionMaxScore(
    questions: readonly QuestionUnion[],
    responses?: QuestionResponse[],
  ): number {
    if (!responses) {
      // Default behavior: assume all questions are answerable
      return questions.length;
    }

    // Count only questions that have Yes/No responses (exclude NA)
    const answeredQuestions = responses.filter(
      (r) => r.response !== ResponseOption.NA,
    );
    return answeredQuestions.length;
  }

  /**
   * Calculate the maximum score for a question (always 1 for Yes/No/NA questions)
   */
  calculateQuestionMaxScore(
    question: QuestionUnion,
    response?: QuestionResponse,
  ): number {
    // For Yes/No/NA questions, max score is 1 if answered (not NA), 0 if NA
    if (response && response.response === ResponseOption.NA) {
      return 0;
    }
    return 1;
  }

  /**
   * Calculate the maximum score for an entire checklist based on answered questions
   */
  calculateChecklistMaxScore(
    checklist: Checklist,
    responses?: QuestionResponse[],
  ): number {
    let maxScore = 0;

    for (const section of checklist.sections) {
      // Get responses for this section's questions
      const sectionResponses = responses?.filter((r) =>
        section.questions.some((q) => q.id === r.questionId),
      );
      maxScore += this.calculateSectionMaxScore(
        section.questions,
        sectionResponses,
      );
    }

    return maxScore;
  }

  /**
   * Calculate scores for all questions in a section using Yes/No/NA responses
   */
  calculateSectionScores(
    section: Section,
    responses: QuestionResponse[] = [],
  ): SectionScore {
    const questionScores = section.questions.map((question) => {
      const questionResponse = responses.find(
        (r) => r.questionId === question.id,
      );
      return this.calculateQuestionScores(question, questionResponse);
    });

    // Only count questions that were answered (not NA)
    const answeredQuestions = questionScores.filter((q) => q.maxScore > 0);
    const totalScore = answeredQuestions.reduce(
      (sum, q) => sum + q.totalScore,
      0,
    );
    const maxScore = answeredQuestions.length;

    return {
      sectionId: section.id,
      sectionTitle: section.title,
      totalScore,
      maxScore,
      percentage: this.calculatePercentage(totalScore, maxScore),
      questionScores,
    };
  }

  /**
   * Calculate scores for a single question using Yes/No/NA response
   */
  calculateQuestionScores(
    question: QuestionUnion,
    response?: QuestionResponse,
  ): QuestionScore {
    let totalScore = 0;
    let maxScore = 0;

    if (response) {
      if (response.response === ResponseOption.YES) {
        totalScore = 1;
        maxScore = 1;
      } else if (response.response === ResponseOption.NO) {
        totalScore = 0;
        maxScore = 1;
      } else if (response.response === ResponseOption.NA) {
        // NA questions don't contribute to score
        totalScore = 0;
        maxScore = 0;
      }
    }

    const questionScore: QuestionScore = {
      questionId: question.id,
      questionTitle: question.title,
      questionType: question.type,
      totalScore,
      maxScore,
      percentage: this.calculatePercentage(totalScore, maxScore),
    };

    // Handle sub-questions for standard questions
    if (isStandardQuestion(question) && question.subQuestions) {
      questionScore.subQuestionScores = question.subQuestions.map((subQ) => {
        // For sub-questions, we'd need their individual responses
        // For now, just use the parent question's response
        return this.calculateQuestionScores(subQ, response);
      });

      // Recalculate totals including sub-questions
      const subQuestionsTotal = questionScore.subQuestionScores.reduce(
        (sum, subQ) => sum + subQ.totalScore,
        0,
      );
      const subQuestionsMax = questionScore.subQuestionScores.reduce(
        (sum, subQ) => sum + subQ.maxScore,
        0,
      );

      questionScore.totalScore = totalScore + subQuestionsTotal;
      questionScore.maxScore = maxScore + subQuestionsMax;
      questionScore.percentage = this.calculatePercentage(
        questionScore.totalScore,
        questionScore.maxScore,
      );
    }

    return questionScore;
  }

  /**
   * Calculate comprehensive scores for a checklist using Yes/No/NA responses
   */
  calculateChecklistScores(
    checklist: Checklist,
    responses: QuestionResponse[] = [],
  ): {
    overall: ScoreCalculation;
    sections: SectionScore[];
  } {
    const sectionScores = checklist.sections.map((section) => {
      const sectionResponses = responses.filter((r) =>
        section.questions.some((q) => q.id === r.questionId),
      );
      return this.calculateSectionScores(section, sectionResponses);
    });

    const totalScore = sectionScores.reduce(
      (sum, section) => sum + section.totalScore,
      0,
    );
    const maxScore = sectionScores.reduce(
      (sum, section) => sum + section.maxScore,
      0,
    );

    return {
      overall: {
        totalScore,
        maxScore,
        percentage: this.calculatePercentage(totalScore, maxScore),
      },
      sections: sectionScores,
    };
  }

  /**
   * Update section with calculated max scores based on responses
   */
  updateSectionWithCalculatedScores(
    section: Section,
    responses: QuestionResponse[] = [],
  ): Section {
    const sectionResponses = responses.filter((r) =>
      section.questions.some((q) => q.id === r.questionId),
    );
    const calculatedMaxScore = this.calculateSectionMaxScore(
      section.questions,
      sectionResponses,
    );

    return {
      ...section,
      maxScore: calculatedMaxScore,
    };
  }

  /**
   * Update checklist with calculated max scores for all sections based on responses
   */
  updateChecklistWithCalculatedScores(
    checklist: Checklist,
    responses: QuestionResponse[] = [],
  ): Checklist {
    const updatedSections = checklist.sections.map((section) =>
      this.updateSectionWithCalculatedScores(section, responses),
    );

    return {
      ...checklist,
      sections: updatedSections,
    };
  }

  /**
   * Validate score against maximum
   */
  validateScore(
    score: number,
    maxScore: number,
  ): {
    isValid: boolean;
    adjustedScore: number;
    warning?: string;
  } {
    const config = this._config();
    const adjustedScore = this.roundScore(score, config);

    if (adjustedScore < 0) {
      return {
        isValid: false,
        adjustedScore: 0,
        warning: "Score cannot be negative. Adjusted to 0.",
      };
    }

    if (adjustedScore > maxScore) {
      return {
        isValid: false,
        adjustedScore: maxScore,
        warning: `Score exceeds maximum (${maxScore}). Adjusted to maximum.`,
      };
    }

    return {
      isValid: true,
      adjustedScore,
    };
  }

  /**
   * Calculate performance grade based on percentage
   */
  calculateGrade(percentage: number): {
    grade: string;
    description: string;
    color: string;
  } {
    if (percentage >= 95) {
      return { grade: "A+", description: "Excellent", color: "#22c55e" };
    } else if (percentage >= 90) {
      return { grade: "A", description: "Very Good", color: "#16a34a" };
    } else if (percentage >= 85) {
      return { grade: "A-", description: "Good", color: "#15803d" };
    } else if (percentage >= 80) {
      return { grade: "B+", description: "Above Average", color: "#65a30d" };
    } else if (percentage >= 75) {
      return { grade: "B", description: "Average", color: "#84cc16" };
    } else if (percentage >= 70) {
      return { grade: "B-", description: "Below Average", color: "#a3a3a3" };
    } else if (percentage >= 65) {
      return { grade: "C+", description: "Fair", color: "#f59e0b" };
    } else if (percentage >= 60) {
      return { grade: "C", description: "Needs Improvement", color: "#f97316" };
    } else if (percentage >= 50) {
      return { grade: "D", description: "Poor", color: "#ef4444" };
    } else {
      return { grade: "F", description: "Failing", color: "#dc2626" };
    }
  }

  /**
   * Generate scoring recommendations
   */
  generateRecommendations(sectionScores: SectionScore[]): {
    strengths: string[];
    improvements: string[];
    priorities: string[];
  } {
    const strengths: string[] = [];
    const improvements: string[] = [];
    const priorities: string[] = [];

    sectionScores.forEach((section) => {
      if (section.percentage >= 85) {
        strengths.push(
          `Strong performance in ${section.sectionTitle} (${section.percentage.toFixed(1)}%)`,
        );
      } else if (section.percentage < 60) {
        priorities.push(
          `Critical improvement needed in ${section.sectionTitle} (${section.percentage.toFixed(1)}%)`,
        );
      } else if (section.percentage < 75) {
        improvements.push(
          `Room for improvement in ${section.sectionTitle} (${section.percentage.toFixed(1)}%)`,
        );
      }
    });

    return { strengths, improvements, priorities };
  }

  /**
   * Update scoring configuration
   */
  updateConfig(updates: Partial<ScoringConfig>): void {
    this._config.update((current) => ({ ...current, ...updates }));
  }

  /**
   * Reset configuration to defaults
   */
  resetConfig(): void {
    this._config.set({
      defaultMaxScore: 10,
      weights: {
        standardQuestion: 1.0,
        dataControlQuestion: 1.2,
        subQuestionMultiplier: 0.8,
      },
      enableWeighting: false,
      roundScores: true,
      decimalPlaces: 2,
    });
  }

  // Private helper methods
  private calculatePercentage(score: number, maxScore: number): number {
    if (maxScore === 0) return 0;
    const percentage = (score / maxScore) * 100;
    return this.roundScore(percentage, this._config());
  }

  private roundScore(score: number, config: ScoringConfig): number {
    if (!config.roundScores) return score;

    const factor = Math.pow(10, config.decimalPlaces);
    return Math.round(score * factor) / factor;
  }
}
