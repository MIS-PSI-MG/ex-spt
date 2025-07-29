import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import {
  NgApexchartsModule,
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexXAxis,
  ApexLegend,
  ApexResponsive,
  ApexTooltip,
  ApexFill,
  ApexStroke,
} from "ng-apexcharts";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatChipsModule } from "@angular/material/chips";
import { MatDividerModule } from "@angular/material/divider";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Observable } from "rxjs";
import { map, shareReplay } from "rxjs/operators";

import {
  ChecklistService,
  ResultsGrouping,
  SectionResult,
} from "../../services/checklist.service";
import { OrganizationService } from "../../services/organization.service";
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

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  responsive: ApexResponsive[];
};

@Component({
  selector: "app-results-dashboard",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: "./results-dashboard.html",
  styleUrl: "./results-dashboard.css",
})
export class ResultsDashboard implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("chart") chart!: ChartComponent;

  private readonly destroy$ = new Subject<void>();
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly checklistService = inject(ChecklistService);
  private readonly organizationService = inject(OrganizationService);
  private readonly snackBar = inject(MatSnackBar);
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

  filterForm!: FormGroup;
  private readonly _expandedSections = signal<Set<string>>(new Set());
  private readonly _chartOptions = signal<ChartOptions>({
    series: [],
    chart: { type: "bar", height: 400 },
    dataLabels: { enabled: false },
    plotOptions: {},
    yaxis: {},
    xaxis: { categories: [] },
    fill: { opacity: 1 },
    tooltip: {},
    stroke: { show: false },
    legend: { position: "top" },
    responsive: [],
  });

  protected readonly expandedSections = this._expandedSections.asReadonly();
  protected readonly chartOptions = this._chartOptions.asReadonly();

  // Computed properties for filter options from organization service
  protected readonly availableHealthPrograms = computed(() =>
    this.organizationService.healthProgramNames(),
  );

  protected readonly availableOrganizationalLevels = computed(() =>
    this.organizationService.organizationalLevelNames(),
  );

  protected readonly availableDepartments = computed(() =>
    this.organizationService.departmentNames(),
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

  // Chart data computed from filtered results
  protected readonly chartData = computed(() => {
    const results = this.filteredResultsGrouping();
    if (results.length === 0) return null;

    // Prepare histogram data for section scores
    const scoreRanges = ["0-20%", "21-40%", "41-60%", "61-80%", "81-100%"];
    const sectionNames = new Set<string>();
    const scoreData: { [key: string]: number[] } = {};

    // Collect all unique section names
    results.forEach((result) => {
      result.sections.forEach((section) => {
        sectionNames.add(section.sectionTitle);
      });
    });

    // Initialize score data for each section
    Array.from(sectionNames).forEach((sectionName) => {
      scoreData[sectionName] = [0, 0, 0, 0, 0]; // Initialize counts for each range
    });

    // Count scores in each range for each section
    results.forEach((result) => {
      result.sections.forEach((section) => {
        const percentage = section.percentage;
        let rangeIndex = 0;

        if (percentage <= 20) rangeIndex = 0;
        else if (percentage <= 40) rangeIndex = 1;
        else if (percentage <= 60) rangeIndex = 2;
        else if (percentage <= 80) rangeIndex = 3;
        else rangeIndex = 4;

        scoreData[section.sectionTitle][rangeIndex]++;
      });
    });

    return {
      scoreRanges,
      sectionNames: Array.from(sectionNames),
      scoreData,
    };
  });

  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
    this.setupFormSubscriptions();
    this.initializeChart();
  }

  ngAfterViewInit(): void {
    // Update chart when data changes
    setTimeout(() => {
      this.updateChart();
    }, 100);
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
      this.snackBar
        .open("Failed to load results data", "Retry", {
          duration: 5000,
          horizontalPosition: "center",
          verticalPosition: "bottom",
        })
        .onAction()
        .subscribe(() => {
          this.loadData();
        });
    }
  }

  private setupFormSubscriptions(): void {
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((filters) => {
        this.checklistService.updateFilter(filters);
        // Update chart when filters change
        setTimeout(() => {
          this.updateChart();
        }, 100);
      });
  }

  private initializeChart(): void {
    const chartOptions: ChartOptions = {
      series: [],
      chart: {
        type: "bar",
        height: 400,
        stacked: false,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
          },
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "70%",
          dataLabels: {
            position: "top",
          },
        },
      },
      dataLabels: {
        enabled: true,
        offsetY: -20,
        style: {
          fontSize: "12px",
          colors: ["#304758"],
        },
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: ["0-20%", "21-40%", "41-60%", "61-80%", "81-100%"],
        title: {
          text: "Score Ranges",
        },
      },
      yaxis: {
        title: {
          text: "Number of Assessments",
        },
      },
      fill: {
        opacity: 1,
        colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"],
      },
      tooltip: {
        y: {
          formatter: (val: number) => {
            return val + " assessments";
          },
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "left",
        offsetX: 40,
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 300,
            },
            plotOptions: {
              bar: {
                columnWidth: "90%",
              },
            },
          },
        },
      ],
    };

    this._chartOptions.set(chartOptions);
  }

  private updateChart(): void {
    const data = this.chartData();
    if (!data) return;

    const series: ApexAxisChartSeries = data.sectionNames.map(
      (sectionName, index) => ({
        name: sectionName,
        data: data.scoreData[sectionName],
        color: this.getColorForSection(index),
      }),
    );

    this._chartOptions.update((current) => ({
      ...current,
      series,
      chart: { ...current.chart, type: "bar", height: 400 },
    }));
  }

  private getColorForSection(index: number): string {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#D63031",
      "#74B9FF",
      "#A29BFE",
      "#FD79A8",
      "#FDCB6E",
      "#6C5CE7",
      "#55A3FF",
      "#26DE81",
      "#FD79A8",
      "#A0E7E5",
    ];
    return colors[index % colors.length];
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

    this.snackBar.open("Results exported successfully", "Close", {
      duration: 3000,
      horizontalPosition: "center",
      verticalPosition: "bottom",
    });
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

    this.snackBar.open("All results exported successfully", "Close", {
      duration: 3000,
      horizontalPosition: "center",
      verticalPosition: "bottom",
    });
  }

  protected getProgressColor(percentage: number): string {
    if (percentage >= 90) return "primary";
    if (percentage >= 75) return "accent";
    if (percentage >= 60) return "warn";
    return "warn";
  }
}
