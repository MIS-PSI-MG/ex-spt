import { Injectable, signal, computed } from "@angular/core";
import {
  ChecklistBase,
  Section,
  StdQuestion,
  DQQuestion,
  Subsection,
  DataQualityEvaluation,
  MonthlyEntry,
  DataElement,
  Evaluation,
} from "../interfaces/new-models.interface";

@Injectable({
  providedIn: "root",
})
export class ChecklistService {
  // Private signal for checklists data
  private _checklists = signal<ChecklistBase[]>([]);

  // Public readonly signals
  public readonly checklists = this._checklists.asReadonly();

  // Computed signals for derived data
  public readonly checklistCount = computed(() => this._checklists().length);

  public readonly checklistStats = computed(() => {
    const checklists = this._checklists();
    let totalSections = 0;
    let totalStandardQuestions = 0;
    let totalDQQuestions = 0;
    const departmentDistribution: { [key: string]: number } = {};
    const healthAreaDistribution: { [key: string]: number } = {};

    checklists.forEach((checklist) => {
      totalSections += checklist.sections.length;

      // Count departments
      departmentDistribution[checklist.department] =
        (departmentDistribution[checklist.department] || 0) + 1;

      // Count health areas
      healthAreaDistribution[checklist.health_area] =
        (healthAreaDistribution[checklist.health_area] || 0) + 1;

      checklist.sections.forEach((section) => {
        if (section.type === "standard") {
          totalStandardQuestions += section.questions.length;
        } else {
          totalDQQuestions += section.questions.length;
        }
      });
    });

    return {
      totalChecklists: checklists.length,
      totalSections,
      totalStandardQuestions,
      totalDQQuestions,
      departmentDistribution,
      healthAreaDistribution,
    };
  });

  constructor() {
    // Initialize with data from storage
    this.loadChecklists();
  }

  /**
   * Load checklists from storage or initialize with empty array
   */
  private loadChecklists(): void {
    const stored = localStorage.getItem("checklists");
    if (stored) {
      try {
        const checklists = JSON.parse(stored);
        this._checklists.set(checklists);
      } catch (error) {
        console.error("Error loading checklists from storage:", error);
        this._checklists.set([]);
      }
    } else {
      this._checklists.set([]);
    }
  }

  /**
   * Save checklists to storage
   */
  private saveChecklists(checklists: ChecklistBase[]): void {
    try {
      localStorage.setItem("checklists", JSON.stringify(checklists));
      this._checklists.set(checklists);
    } catch (error) {
      console.error("Error saving checklists to storage:", error);
    }
  }

  /**
   * Get a specific checklist by ID
   */
  getChecklistById(id: string): ChecklistBase | undefined {
    return this._checklists().find((c) => c.id === id);
  }

  /**
   * Create a new checklist
   */
  createChecklist(checklist: ChecklistBase): void {
    const checklists = this._checklists();

    // Check if ID already exists
    if (checklists.some((c) => c.id === checklist.id)) {
      throw new Error(`Checklist with ID '${checklist.id}' already exists`);
    }

    const newChecklists = [...checklists, checklist];
    this.saveChecklists(newChecklists);
  }

  /**
   * Update an existing checklist
   */
  updateChecklist(id: string, updates: Partial<ChecklistBase>): ChecklistBase {
    const checklists = this._checklists();
    const index = checklists.findIndex((c) => c.id === id);

    if (index === -1) {
      throw new Error(`Checklist with ID '${id}' not found`);
    }

    const updatedChecklist = { ...checklists[index], ...updates };
    const newChecklists = [...checklists];
    newChecklists[index] = updatedChecklist;

    this.saveChecklists(newChecklists);
    return updatedChecklist;
  }

  /**
   * Delete a checklist
   */
  deleteChecklist(id: string): boolean {
    const checklists = this._checklists();
    const filteredChecklists = checklists.filter((c) => c.id !== id);

    if (filteredChecklists.length === checklists.length) {
      throw new Error(`Checklist with ID '${id}' not found`);
    }

    this.saveChecklists(filteredChecklists);
    return true;
  }

  /**
   * Validate checklist data
   */
  validateChecklist(checklist: ChecklistBase): string[] {
    const errors: string[] = [];

    // Basic validation
    if (!checklist.id || checklist.id.trim() === "") {
      errors.push("Checklist ID is required");
    }

    if (!checklist.department || checklist.department.trim() === "") {
      errors.push("Department is required");
    }

    if (!checklist.health_area || checklist.health_area.trim() === "") {
      errors.push("Health area is required");
    }

    if (checklist.ou_level < 0) {
      errors.push("OU level must be >= 0");
    }

    if (!checklist.sections || checklist.sections.length === 0) {
      errors.push("At least one section is required");
    }

    // Section validation
    checklist.sections?.forEach((section, sectionIndex) => {
      if (!section.id || section.id.trim() === "") {
        errors.push(`Section ${sectionIndex + 1}: ID is required`);
      }

      if (!section.title || section.title.trim() === "") {
        errors.push(`Section ${sectionIndex + 1}: Title is required`);
      }

      if (section.maxScore < 0) {
        errors.push(`Section ${sectionIndex + 1}: Max score must be >= 0`);
      }

      if (!section.questions || section.questions.length === 0) {
        errors.push(
          `Section ${sectionIndex + 1}: At least one question is required`,
        );
      }

      // Question validation based on type
      if (section.type === "standard") {
        this.validateStandardQuestions(
          section.questions as StdQuestion[],
          sectionIndex,
          errors,
        );
      } else if (section.type === "dq") {
        this.validateDataQualityQuestions(
          section.questions as DQQuestion[],
          sectionIndex,
          errors,
        );
      }
    });

    return errors;
  }

  /**
   * Validate standard questions
   */
  private validateStandardQuestions(
    questions: StdQuestion[],
    sectionIndex: number,
    errors: string[],
  ): void {
    questions.forEach((question, questionIndex) => {
      const prefix = `Section ${sectionIndex + 1}, Question ${questionIndex + 1}`;

      if (!question.id || question.id.trim() === "") {
        errors.push(`${prefix}: ID is required`);
      }

      if (!question.subject || question.subject.trim() === "") {
        errors.push(`${prefix}: Subject is required`);
      }

      if (!question.parentId || question.parentId.trim() === "") {
        errors.push(`${prefix}: Parent ID is required`);
      }

      if (question.level < 1) {
        errors.push(`${prefix}: Level must be >= 1`);
      }

      if (question.score < 0) {
        errors.push(`${prefix}: Score must be >= 0`);
      }
    });
  }

  /**
   * Validate data quality questions
   */
  private validateDataQualityQuestions(
    questions: DQQuestion[],
    sectionIndex: number,
    errors: string[],
  ): void {
    questions.forEach((question, questionIndex) => {
      const prefix = `Section ${sectionIndex + 1}, DQ Question ${questionIndex + 1}`;

      if (!question.id || question.id.trim() === "") {
        errors.push(`${prefix}: ID is required`);
      }

      if (!question.subsections || question.subsections.length === 0) {
        errors.push(`${prefix}: At least one subsection is required`);
      }

      question.subsections?.forEach((subsection, subsectionIndex) => {
        this.validateSubsection(
          subsection,
          sectionIndex,
          questionIndex,
          subsectionIndex,
          errors,
        );
      });
    });
  }

  /**
   * Validate subsection
   */
  private validateSubsection(
    subsection: Subsection,
    sectionIndex: number,
    questionIndex: number,
    subsectionIndex: number,
    errors: string[],
  ): void {
    const prefix = `Section ${sectionIndex + 1}, DQ Question ${questionIndex + 1}, Subsection ${subsectionIndex + 1}`;

    if (!subsection.id || subsection.id.trim() === "") {
      errors.push(`${prefix}: ID is required`);
    }

    if (!subsection.instruction || subsection.instruction.trim() === "") {
      errors.push(`${prefix}: Instruction is required`);
    }

    if (!subsection.questions || subsection.questions.length === 0) {
      errors.push(`${prefix}: At least one evaluation is required`);
    }

    subsection.questions?.forEach((evaluation, evaluationIndex) => {
      this.validateDataQualityEvaluation(
        evaluation,
        sectionIndex,
        questionIndex,
        subsectionIndex,
        evaluationIndex,
        errors,
      );
    });
  }

  /**
   * Validate data quality evaluation
   */
  private validateDataQualityEvaluation(
    evaluation: DataQualityEvaluation,
    sectionIndex: number,
    questionIndex: number,
    subsectionIndex: number,
    evaluationIndex: number,
    errors: string[],
  ): void {
    const prefix = `Section ${sectionIndex + 1}, DQ Question ${questionIndex + 1}, Subsection ${subsectionIndex + 1}, Evaluation ${evaluationIndex + 1}`;

    if (
      !evaluation.evaluationTopic ||
      evaluation.evaluationTopic.trim() === ""
    ) {
      errors.push(`${prefix}: Evaluation topic is required`);
    }

    evaluation.monthlyEntries?.forEach((entry, entryIndex) => {
      this.validateMonthlyEntry(
        entry,
        sectionIndex,
        questionIndex,
        subsectionIndex,
        evaluationIndex,
        entryIndex,
        errors,
      );
    });
  }

  /**
   * Validate monthly entry
   */
  private validateMonthlyEntry(
    entry: MonthlyEntry,
    sectionIndex: number,
    questionIndex: number,
    subsectionIndex: number,
    evaluationIndex: number,
    entryIndex: number,
    errors: string[],
  ): void {
    const prefix = `Section ${sectionIndex + 1}, DQ Question ${questionIndex + 1}, Subsection ${subsectionIndex + 1}, Evaluation ${evaluationIndex + 1}, Entry ${entryIndex + 1}`;

    if (!entry.id || entry.id.trim() === "") {
      errors.push(`${prefix}: ID is required`);
    }

    if (!entry.month || entry.month.trim() === "") {
      errors.push(`${prefix}: Month is required`);
    }

    if (!entry.answer || entry.answer.trim() === "") {
      errors.push(`${prefix}: Answer is required`);
    }

    entry.elements?.forEach((element, elementIndex) => {
      if (!element.id || element.id.trim() === "") {
        errors.push(`${prefix}, Element ${elementIndex + 1}: ID is required`);
      }

      if (!element.name || element.name.trim() === "") {
        errors.push(`${prefix}, Element ${elementIndex + 1}: Name is required`);
      }

      if (element.data < 0) {
        errors.push(
          `${prefix}, Element ${elementIndex + 1}: Data must be >= 0`,
        );
      }
    });

    entry.evals?.forEach((evaluation, evalIndex) => {
      if (!evaluation.id || evaluation.id.trim() === "") {
        errors.push(`${prefix}, Evaluation ${evalIndex + 1}: ID is required`);
      }

      if (!evaluation.name || evaluation.name.trim() === "") {
        errors.push(`${prefix}, Evaluation ${evalIndex + 1}: Name is required`);
      }

      if (evaluation.score < 0) {
        errors.push(
          `${prefix}, Evaluation ${evalIndex + 1}: Score must be >= 0`,
        );
      }
    });
  }

  /**
   * Generate sample checklist data for testing
   */
  generateSampleChecklist(): ChecklistBase {
    const timestamp = Date.now();
    return {
      id: `checklist_${timestamp}`,
      ou_level: 1,
      department: "Health Department",
      health_area: "Primary Care",
      sections: [
        {
          id: `section_std_${timestamp}`,
          title: "Standard Questions Section",
          maxScore: 100,
          type: "standard",
          questions: [
            {
              id: `std_question_${timestamp}`,
              subject: "Sample Standard Question - Data Quality Assessment",
              level: 1,
              parentId: "parent_1",
              score: 25,
            },
            {
              id: `std_question_2_${timestamp}`,
              subject: "Sample Standard Question - Completeness Check",
              level: 2,
              parentId: "parent_1",
              score: 15,
            },
          ],
        },
        {
          id: `section_dq_${timestamp}`,
          title: "Data Quality Section",
          maxScore: 200,
          type: "dq",
          questions: [
            {
              id: `dq_question_${timestamp}`,
              subsections: [
                {
                  id: `subsection_${timestamp}`,
                  instruction:
                    "Review monthly data completeness and accuracy for the following indicators",
                  questions: [
                    {
                      evaluationTopic: "Patient Registration Data Quality",
                      monthlyEntries: [
                        {
                          id: `entry_jan_${timestamp}`,
                          month: "01/2024",
                          answer: "Data quality is good with 95% completeness",
                          elements: [
                            {
                              id: `element_1_${timestamp}`,
                              name: "Total Registrations",
                              data: 1250,
                            },
                            {
                              id: `element_2_${timestamp}`,
                              name: "Complete Records",
                              data: 1188,
                            },
                          ],
                          evals: [
                            {
                              id: `eval_1_${timestamp}`,
                              name: "Completeness Score",
                              score: 95,
                            },
                            {
                              id: `eval_2_${timestamp}`,
                              name: "Accuracy Score",
                              score: 92,
                            },
                          ],
                        },
                        {
                          id: `entry_feb_${timestamp}`,
                          month: "02/2024",
                          answer:
                            "Improvement needed in data validation processes",
                          elements: [
                            {
                              id: `element_3_${timestamp}`,
                              name: "Total Registrations",
                              data: 1180,
                            },
                            {
                              id: `element_4_${timestamp}`,
                              name: "Complete Records",
                              data: 1062,
                            },
                          ],
                          evals: [
                            {
                              id: `eval_3_${timestamp}`,
                              name: "Completeness Score",
                              score: 90,
                            },
                            {
                              id: `eval_4_${timestamp}`,
                              name: "Accuracy Score",
                              score: 88,
                            },
                          ],
                        },
                      ],
                    },
                    {
                      evaluationTopic: "Laboratory Test Results Accuracy",
                      monthlyEntries: [
                        {
                          id: `entry_lab_${timestamp}`,
                          month: "01/2024",
                          answer:
                            "Laboratory data shows high accuracy with minimal discrepancies",
                          elements: [
                            {
                              id: `element_lab_1_${timestamp}`,
                              name: "Total Tests",
                              data: 2450,
                            },
                            {
                              id: `element_lab_2_${timestamp}`,
                              name: "Valid Results",
                              data: 2401,
                            },
                          ],
                          evals: [
                            {
                              id: `eval_lab_1_${timestamp}`,
                              name: "Accuracy Score",
                              score: 98,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
  }

  /**
   * Export checklists to JSON
   */
  exportChecklists(): string {
    return JSON.stringify(this._checklists(), null, 2);
  }

  /**
   * Import checklists from JSON
   */
  importChecklists(jsonData: string): ChecklistBase[] {
    try {
      const checklists: ChecklistBase[] = JSON.parse(jsonData);

      // Validate each checklist
      for (const checklist of checklists) {
        const errors = this.validateChecklist(checklist);
        if (errors.length > 0) {
          throw new Error(`Invalid checklist data: ${errors.join(", ")}`);
        }
      }

      this.saveChecklists(checklists);
      return checklists;
    } catch (error) {
      throw new Error(`Import failed: ${(error as Error).message}`);
    }
  }

  /**
   * Clear all checklists
   */
  clearAllChecklists(): boolean {
    this._checklists.set([]);
    localStorage.removeItem("checklists");
    return true;
  }
}
