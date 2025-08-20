// Checklist base
export interface ChecklistBase {
  id: string;
  ou_level: number;
  department: string;
  health_area: string;
  sections: Section[];
}

// Section
export interface Section {
  id: string;
  title: string;
  maxScore: number;
  type: "standard" | "dq";
  questions: StdQuestion[] | DQQuestion[];
}

// SectionType
// Standard
export interface StdQuestion {
  id: string;
  subject: string;
  level: number;
  parentId: string;
  score: number;
}

// Data quality question

export interface DQQuestion {
  id: string;
  subsections: Subsection[];
}

export interface Subsection {
  id: string;
  instruction: string;
  questions: DataQualityEvaluation[];
}

export interface DataQualityEvaluation {
  evaluationTopic: string;
  monthlyEntries: MonthlyEntry[];
}
export interface MonthlyEntry {
  id: string;
  month: string;
  answer: string;
  elements: DataElement[];
  evals: Evaluation[];
}

export interface DataElement {
  id: string;
  name: string;
  data: number;
}

export interface Evaluation {
  id: string;
  name: string;
  score: number;
}
