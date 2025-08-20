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

export interface StdQuestion {
  id: string;
  subject: string;
  level: number;
  parent: string;
  score: number;
}

export interface DQQuestion {
  id: string;
  subsections: Subsection[];
}

export interface Subsection {
  id: string;
  instruction: string;
  questions: SubQuestion[];
}

export interface SubQuestion {
  quiz: string;
  sq: SQ[];
}
export interface SQ {
  id: string;
  month: string;
  answer: string;
  elements: Element[];
  evals: Eval[];
}

export interface Element {
  id: string;
  name: string;
  data: number;
}

export interface Eval {
  id: string;
  name: string;
  score: number;
}
