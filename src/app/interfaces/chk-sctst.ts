// Common base interfaces
export interface BaseItem {
  id: string;
  departement: string;
  healthProgram: string;
  niveau: number;
  sections: Section[];
}

// Base section interface with common properties
export interface BaseSection {
  title: string;
  maxScore?: number;
  score?: NumberConstructor;
}

// Standard section type (for initScstd)
export interface StandardSection extends BaseSection {
  subsection?: StandardSubsection | StandardSubsection[];
  questions?: StandardQuestion[];
}

// Data control section type (for initScdq)
export interface DataControlSection extends BaseSection {
  subsection: DataControlSubsection;
}

// Different types of subsections
export interface StandardSubsection {
  title?: string;
  maxScore?: number;
  score?: NumberConstructor;
  questions: StandardQuestion[];
}

export interface DataControlSubsection {
  title: string;
  instruction?: string;
  questions: DataControlQuestion[];
}

// Different types of questions
export interface StandardQuestion {
  question?: string;
  score?: boolean | "NA" | number;
  subquestion?: StandardSubQuestionGroup;
}

export interface DataControlQuestion {
  subquestion: DataControlSubQuestionGroup;
}

// Different types of subquestion groups
export interface StandardSubQuestionGroup {
  q: string;
  sq: (StandardSubQuestion | string)[];
}

export interface DataControlSubQuestionGroup {
  q: string;
  sq: MonthData[];
}

export interface StandardSubQuestion {
  question: string;
  score: boolean | "NA" | number;
}

export interface MonthData {
  mois: string;
  element1: Element;
  element2: Element;
  element3: Element;
  eval: Evaluation;
}

export interface Element {
  name: string;
  number: NumberConstructor;
}

export interface Evaluation {
  name: string;
  score: number;
}

// Type unions for the two different checklist types
export type Section = StandardSection | DataControlSection;

// Remove the old Checklist interface and replace with:
export interface Checklist extends BaseItem {
  createdAt?: Date;
  updatedAt?: Date;
  version?: string;
}

// Update ChecklistInput type to:
export type ChecklistInput = Omit<BaseItem, "id"> & {
  id?: string;  // Make id optional for new checklists
  createdAt?: Date;
  updatedAt?: Date;
  version?: string;
};
