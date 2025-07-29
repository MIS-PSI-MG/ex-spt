import { Component, OnInit, OnDestroy, inject, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatChipsModule } from "@angular/material/chips";
import { MatBadgeModule } from "@angular/material/badge";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatDividerModule } from "@angular/material/divider";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { MatDialogModule, MatDialog } from "@angular/material/dialog";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Observable } from "rxjs";
import { map, shareReplay } from "rxjs/operators";

import { ChecklistService } from "../../services/checklist.service";
import {
  Checklist,
  ChecklistSummary,
  ChecklistUtils,
} from "../../interfaces/chkLst.interface";

@Component({
  selector: "app-checklist-list",
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatBadgeModule,
    MatGridListModule,
    MatDividerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: "./checklist-list.html",
  styleUrl: "./checklist-list.css",
})
export class ChecklistList implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  protected readonly checklistService = inject(ChecklistService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly breakpointObserver = inject(BreakpointObserver);

  // Responsive breakpoints
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay(),
    );

  isTablet$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Tablet)
    .pipe(
      map((result) => result.matches),
      shareReplay(),
    );

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
      this.snackBar
        .open("Failed to load checklists", "Retry", {
          duration: 5000,
          horizontalPosition: "center",
          verticalPosition: "bottom",
        })
        .onAction()
        .subscribe(() => {
          this.loadChecklists();
        });
    }
  }

  protected setCurrentChecklist(checklist: Checklist): void {
    this.checklistService.setCurrentChecklist(checklist);
  }

  protected async deleteChecklist(checklist: Checklist): Promise<void> {
    const confirmed = await this.showConfirmDialog(
      "Delete Checklist",
      `Are you sure you want to delete the checklist "${checklist.healthProgram}"? This action cannot be undone.`,
    );

    if (confirmed) {
      try {
        await this.checklistService.deleteChecklist(checklist.id);
        this.snackBar.open("Checklist deleted successfully", "Close", {
          duration: 3000,
          horizontalPosition: "center",
          verticalPosition: "bottom",
        });
      } catch (error) {
        console.error("Failed to delete checklist:", error);
        this.snackBar.open("Failed to delete checklist", "Close", {
          duration: 5000,
          horizontalPosition: "center",
          verticalPosition: "bottom",
        });
      }
    }
  }

  private async showConfirmDialog(
    title: string,
    message: string,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      // For now, use simple confirm. In a full implementation, you'd use MatDialog
      resolve(confirm(message));
    });
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

  protected getProgressColor(percentage: number): string {
    if (percentage >= 90) return "primary";
    if (percentage >= 75) return "accent";
    if (percentage >= 60) return "warn";
    return "warn";
  }
}
