import { Component, OnInit, OnDestroy, inject, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

import { ChecklistService } from "../../services/checklist.service";
import {
  Checklist,
  ChecklistSummary,
  ChecklistUtils,
} from "../../interfaces/chkLst.interface";

@Component({
  selector: "app-checklist-list",
  imports: [CommonModule, RouterLink],
  templateUrl: "./checklist-list.html",
  styleUrl: "./checklist-list.css",
})
export class ChecklistList implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  protected readonly checklistService = inject(ChecklistService);

  // Computed properties
  protected readonly averageCompletionRate = computed(() => {
    const checklists = this.checklistService.checklists();
    if (checklists.length === 0) return 0;

    const totalPercentage = checklists.reduce(
      (sum, checklist) => sum + this.getCompletionPercentage(checklist),
      0,
    );

    return Math.round(totalPercentage / checklists.length);
  });

  protected readonly uniqueDepartments = computed(() => {
    const departments = new Set(
      this.checklistService.checklists().map((c) => c.department),
    );
    return Array.from(departments);
  });

  protected readonly uniquePrograms = computed(() => {
    const programs = new Set(
      this.checklistService.checklists().map((c) => c.healthProgram),
    );
    return Array.from(programs);
  });

  ngOnInit(): void {
    this.loadChecklists();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadChecklists(): Promise<void> {
    try {
      await this.checklistService.loadChecklists();
    } catch (error) {
      console.error("Failed to load checklists:", error);
    }
  }

  protected setCurrentChecklist(checklist: Checklist): void {
    this.checklistService.setCurrentChecklist(checklist);
  }

  protected async deleteChecklist(checklist: Checklist): Promise<void> {
    if (
      confirm(
        `Are you sure you want to delete the checklist "${checklist.healthProgram}"?`,
      )
    ) {
      try {
        await this.checklistService.deleteChecklist(checklist.id);
      } catch (error) {
        console.error("Failed to delete checklist:", error);
      }
    }
  }

  protected viewResults(checklist: Checklist): void {
    this.checklistService.updateFilter({
      department: checklist.department,
      organizationalLevel: checklist.organizationalLevel,
    });
    // Navigate to results would be handled by router
  }

  protected getCompletionPercentage(checklist: Checklist): number {
    const summary = ChecklistUtils.generateSummary(checklist);
    return Math.round(summary.completionPercentage);
  }

  protected getTotalQuestions(checklist: Checklist): number {
    return checklist.sections.reduce(
      (total, section) => total + section.questions.length,
      0,
    );
  }

  protected getTotalScore(checklist: Checklist): number {
    return ChecklistUtils.calculateTotalScore(checklist);
  }

  protected getMaxScore(checklist: Checklist): number {
    return ChecklistUtils.calculateMaxScore(checklist);
  }

  protected getSectionPercentage(section: any): number {
    return section.maxScore > 0
      ? Math.round((section.score / section.maxScore) * 100)
      : 0;
  }

  protected getScoreClass(percentage: number): string {
    if (percentage >= 90) return "excellent";
    if (percentage >= 75) return "good";
    if (percentage >= 60) return "fair";
    return "poor";
  }

  protected getProgressClass(percentage: number): string {
    return this.getScoreClass(percentage);
  }

  protected formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}
