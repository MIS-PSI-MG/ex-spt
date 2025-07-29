import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/checklists",
    pathMatch: "full",
  },
  {
    path: "checklists",
    loadComponent: () =>
      import("./components/checklist-list/checklist-list").then(
        (m) => m.ChecklistList,
      ),
    title: "Checklists",
  },
  {
    path: "checklists/new",
    loadComponent: () =>
      import("./components/checklist-editor/checklist-editor").then(
        (m) => m.ChecklistEditor,
      ),
    title: "Create New Checklist",
  },
  {
    path: "checklists/edit/:id",
    loadComponent: () =>
      import("./components/checklist-editor/checklist-editor").then(
        (m) => m.ChecklistEditor,
      ),
    title: "Edit Checklist",
  },
  {
    path: "assessment/:id",
    loadComponent: () =>
      import("./components/assessment/assessment").then((m) => m.Assessment),
    title: "Assessment",
  },
  {
    path: "assessment-quiz",
    loadComponent: () =>
      import("./components/assessment-quiz/assessment-quiz").then(
        (m) => m.AssessmentQuiz,
      ),
    title: "New Assessment",
  },
  {
    path: "assessment-quiz/:id",
    loadComponent: () =>
      import("./components/assessment-quiz/assessment-quiz").then(
        (m) => m.AssessmentQuiz,
      ),
    title: "Take Assessment",
  },
  {
    path: "results",
    loadComponent: () =>
      import("./components/results-dashboard/results-dashboard").then(
        (m) => m.ResultsDashboard,
      ),
    title: "Results Dashboard",
  },
  {
    path: "report",
    loadComponent: () =>
      import("./components/results-dashboard/results-dashboard").then(
        (m) => m.ResultsDashboard,
      ),
    title: "Detailed Report",
  },
  {
    path: "**",
    redirectTo: "/checklists",
  },
];
