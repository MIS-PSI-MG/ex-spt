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
  type: StdSection | DQSection;
}

// SectionType

//
export interface StdSection {}

export interface DQSection {}
