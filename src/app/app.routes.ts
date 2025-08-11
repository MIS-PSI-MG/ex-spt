import {Routes} from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/spotcheks",
    pathMatch: "full",
  },
  {
    path: "spotcheks",
    loadComponent: () =>
      import("./components/checklist-list/checklist-list").then(
        (m) => m.ChecklistList,
      ),
    title: "Spotcheck Checklists",
  },
  {
    path: "spotcheks/new",
    loadComponent: () =>
      import("./components/spotcheck-editor/spotcheck-editor").then(
        (m) => m.SpotchekEditorComponent,
      ),
    title: "Create New Spotcheck",
  },
  {
    path: "spotcheks/edit/:id",
    loadComponent: () =>
      import("./components/spotcheck-editor/spotcheck-editor").then(
        (m) => m.SpotchekEditorComponent,
      ),
    title: "Edit Spotcheck",
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
  // Legacy redirects for backward compatibility
  {
    path: "checklists",
    redirectTo: "/spotcheks",
  },
  {
    path: "checklists/new",
    redirectTo: "/spotcheks/new",
  },
  {
    path: "checklists/edit/:id",
    redirectTo: "/spotcheks/edit/:id",
  },
  {
    path: "**",
    redirectTo: "/spotcheks",
  },
];
