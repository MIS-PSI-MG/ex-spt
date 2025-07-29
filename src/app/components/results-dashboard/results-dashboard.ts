import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

import {
  ChecklistService,
  ResultsGrouping,
  SectionResult,
} from "../../services/checklist.service";
import {
  Checklist,
  ChecklistSummary,
  ChecklistUtils,
} from "../../interfaces/chkLst.interface";

interface FilterOptions {
  healthProgram: string;
  organizationalLevel: string;
  department: string;
}

@Component({
  selector: "app-results-dashboard",
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./results-dashboard.html",
  styleUrl: "./results-dashboard.css",
})
export class ResultsDashboard implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly checklistService = inject(ChecklistService);

  filterForm!: FormGroup;
  private readonly _expandedSections = signal<Set<string>>(new Set());

  protected readonly expandedSections = this._expandedSections.asReadonly();

  // Computed properties for filter options
  protected readonly availableHealthPrograms = computed(() =>
    this.checklistService.availableHealthPrograms(),
  );

  protected readonly availableOrganizationalLevels = computed(() =>
    this.checklistService.availableOrganizationalLevels(),
  );

  protected readonly availableDepartments = computed(() =>
    this.checklistService.availableDepartments(),
  );

  // Filtered results based on form values
  protected readonly filteredResultsGrouping = computed(() => {
    const results = this.checklistService.resultsGrouping();
    const filters = this.filterForm?.value || {};

    if (
      !filters.healthProgram &&
      !filters.organizationalLevel &&
      !filters.department
    ) {
      return results;
    }

    // Since we don't have health program in the grouping, we need to filter differently
    // For now, we'll filter by department and organizational level
    return results.filter((grouping) => {
      const matchesLevel =
        !filters.organizationalLevel ||
        grouping.organizationalLevel === filters.organizationalLevel;
      const matchesDepartment =
        !filters.department || grouping.department === filters.department;

      return matchesLevel && matchesDepartment;
    });
  });

  // Dashboard statistics
  protected readonly totalAssessments = computed(() => {
    return this.checklistService.checklists().length;
  });

  protected readonly completedAssessments = computed(() => {
    return this.filteredResultsGrouping().length;
  });

  protected readonly averageScore = computed(() => {
    const results = this.filteredResultsGrouping();
    if (results.length === 0) return 0;

    const totalPercentage = results.reduce(
      (sum, result) => sum + result.summary.completionPercentage,
      0,
    );

    return Math.round(totalPercentage / results.length);
  });

  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.filterForm = this.formBuilder.group({
      healthProgram: [""],
      organizationalLevel: [""],
      department: [""],
    });
  }

  private async loadData(): Promise<void> {
    try {
      await this.checklistService.loadChecklists();
    } catch (error) {
      console.error("Failed to load checklists:", error);
    }
  }

  private setupFormSubscriptions(): void {
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((filters) => {
        this.checklistService.updateFilter(filters);
      });
  }

  protected clearFilters(): void {
    this.filterForm.reset({
      healthProgram: "",
      organizationalLevel: "",
      department: "",
    });
    this.checklistService.clearFilter();
  }

  protected toggleSectionDetails(sectionKey: string): void {
    const expanded = new Set(this._expandedSections());
    if (expanded.has(sectionKey)) {
      expanded.delete(sectionKey);
    } else {
      expanded.add(sectionKey);
    }
    this._expandedSections.set(expanded);
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

  protected getQuestionTypeLabel(type: string): string {
    switch (type.toLowerCase()) {
      case "standard":
        return "Standard";
      case "data_control":
        return "Data Control";
      default:
        return "Unknown";
    }
  }

  protected formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  protected viewDetailedReport(grouping: ResultsGrouping): void {
    // Navigate to a detailed report view
    this.router.navigate(["/report"], {
      queryParams: {
        department: grouping.department,
        organizationalLevel: grouping.organizationalLevel,
      },
    });
  }

  protected exportGrouping(grouping: ResultsGrouping): void {
    // Export specific grouping data
    const data = {
      department: grouping.department,
      organizationalLevel: grouping.organizationalLevel,
      summary: grouping.summary,
      sections: grouping.sections,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${grouping.department}-${grouping.organizationalLevel}-results.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  protected exportResults(): void {
    // Export all filtered results
    const results = this.filteredResultsGrouping();
    const data = {
      results,
      filters: this.filterForm.value,
      totalAssessments: this.totalAssessments(),
      averageScore: this.averageScore(),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assessment-results-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
