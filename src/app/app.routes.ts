import { Routes } from "@angular/router";
import { ChecklistEdit } from "./components/checklist-edit/checklist-edit";

export const routes: Routes = [
  {
    path: "",
    component: ChecklistEdit,
  },

  {
    path: "checklists/new",
    loadComponent: () =>
      import("./components/checklist-edit/checklist-edit").then(
        (m) => m.ChecklistEdit,
      ),
    title: "Create New Checklist",
  },
];
