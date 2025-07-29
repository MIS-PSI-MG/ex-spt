import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  computed,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { MaterialModule } from "../../shared/material.modules";

import { ChecklistService } from "../../services/checklist.service";
import {
  Checklist,
  ChecklistSummary,
  ChecklistUtils,
} from "../../interfaces/chkLst.interface";

@Component({
  selector: "app-checklist-list",
  standalone: true,
  imports: [CommonModule, RouterLink, MaterialModule, ReactiveFormsModule],
  template: `
    <div class="checklist-list-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <mat-icon class="title-icon">checklist</mat-icon>
            Checklists
          </h1>
          <p class="page-description">
            Manage and track health assessment checklists across your
            organization
          </p>
        </div>

        <div class="header-actions">
          <button
            mat-fab
            color="primary"
            class="fab-create mobile-fab"
            [style.display]="isMobile() ? 'flex' : 'none'"
            routerLink="/checklists/new"
            matTooltip="Create new checklist"
            aria-label="Create new checklist"
          >
            <mat-icon>add</mat-icon>
          </button>

          <button
            mat-raised-button
            color="primary"
            class="create-button"
            [style.display]="isMobile() ? 'none' : 'flex'"
            routerLink="/checklists/new"
          >
            <mat-icon>add</mat-icon>
            New Checklist
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon-container primary">
                <mat-icon class="stat-icon">assignment</mat-icon>
              </div>
              <div class="stat-details">
                <div class="stat-value">
                  {{ checklistService.checklists().length }}
                </div>
                <div class="stat-label">Total Checklists</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon-container accent">
                <mat-icon class="stat-icon">trending_up</mat-icon>
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ averageCompletionRate() }}%</div>
                <div class="stat-label">Average Completion</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon-container warn">
                <mat-icon class="stat-icon">business</mat-icon>
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ uniqueDepartments().length }}</div>
                <div class="stat-label">Departments</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon-container success">
                <mat-icon class="stat-icon">local_hospital</mat-icon>
              </div>
              <div class="stat-details">
                <div class="stat-value">{{ uniquePrograms().length }}</div>
                <div class="stat-label">Programs</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Filters Section -->
      <mat-card class="filters-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>filter_list</mat-icon>
            Filters
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="filters-grid">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Search checklists</mat-label>
              <input
                matInput
                [formControl]="searchControl"
                placeholder="Enter keywords..."
              />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Health Program</mat-label>
              <mat-select [formControl]="programFilterControl">
                <mat-option value="">All Programs</mat-option>
                @for (program of uniquePrograms(); track program) {
                  <mat-option [value]="program">{{ program }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Department</mat-label>
              <mat-select [formControl]="departmentFilterControl">
                <mat-option value="">All Departments</mat-option>
                @for (department of uniqueDepartments(); track department) {
                  <mat-option [value]="department">{{ department }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Sort by</mat-label>
              <mat-select [formControl]="sortControl">
                <mat-option value="updatedAt">Last Updated</mat-option>
                <mat-option value="createdAt">Created Date</mat-option>
                <mat-option value="department">Department</mat-option>
                <mat-option value="healthProgram">Program</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          @if (hasActiveFilters()) {
            <div class="filter-actions">
              <button
                mat-button
                color="warn"
                (click)="clearAllFilters()"
                class="clear-filters-btn"
              >
                <mat-icon>clear</mat-icon>
                Clear All Filters
              </button>
            </div>
          }
        </mat-card-content>
      </mat-card>

      <!-- Loading State -->
      @if (checklistService.loading()) {
        <div class="loading-container">
          <mat-progress-spinner
            mode="indeterminate"
            diameter="60"
            color="primary"
          ></mat-progress-spinner>
          <p class="loading-text">Loading checklists...</p>
        </div>
      }

      <!-- Error State -->
      @if (checklistService.error()) {
        <mat-card class="error-card">
          <mat-card-content>
            <div class="error-content">
              <mat-icon class="error-icon">error_outline</mat-icon>
              <h3>Error Loading Checklists</h3>
              <p>{{ checklistService.error() }}</p>
              <button
                mat-raised-button
                color="primary"
                (click)="checklistService.loadChecklists()"
              >
                <mat-icon>refresh</mat-icon>
                Try Again
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      }

      <!-- Checklists Grid/List -->
      @if (!checklistService.loading() && !checklistService.error()) {
        @if (filteredChecklists().length === 0) {
          <!-- Empty State -->
          <mat-card class="empty-state-card">
            <mat-card-content>
              <div class="empty-state">
                <mat-icon class="empty-icon">assignment_late</mat-icon>
                <h2>No Checklists Found</h2>
                <p>
                  @if (hasActiveFilters()) {
                    No checklists match your current filters. Try adjusting your
                    search criteria.
                  } @else {
                    Get started by creating your first health assessment
                    checklist.
                  }
                </p>
                <div class="empty-actions">
                  @if (hasActiveFilters()) {
                    <button
                      mat-raised-button
                      color="primary"
                      (click)="clearAllFilters()"
                    >
                      <mat-icon>clear</mat-icon>
                      Clear Filters
                    </button>
                  }
                  <button
                    mat-raised-button
                    color="primary"
                    routerLink="/checklists/new"
                  >
                    <mat-icon>add</mat-icon>
                    Create Checklist
                  </button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        } @else {
          <!-- Results Header -->
          <div class="results-header">
            <h2 class="results-title">
              Showing {{ filteredChecklists().length }} of
              {{ checklistService.checklists().length }} checklists
            </h2>

            <div class="view-toggle">
              <mat-button-toggle-group
                [formControl]="viewModeControl"
                aria-label="View mode"
              >
                <mat-button-toggle value="grid" matTooltip="Grid view">
                  <mat-icon>grid_view</mat-icon>
                </mat-button-toggle>
                <mat-button-toggle value="list" matTooltip="List view">
                  <mat-icon>list</mat-icon>
                </mat-button-toggle>
              </mat-button-toggle-group>
            </div>
          </div>

          <!-- Grid View -->
          @if (viewModeControl.value === "grid") {
            <div class="checklists-grid">
              @for (checklist of filteredChecklists(); track checklist.id) {
                <mat-card
                  class="checklist-card interactive"
                  [routerLink]="['/assessment', checklist.id]"
                >
                  <mat-card-header>
                    <div mat-card-avatar class="checklist-avatar">
                      <mat-icon>assignment</mat-icon>
                    </div>
                    <mat-card-title class="checklist-title">
                      {{ checklist.healthProgram }}
                    </mat-card-title>
                    <mat-card-subtitle class="checklist-subtitle">
                      {{ checklist.department }} •
                      {{ checklist.organizationalLevel }}
                    </mat-card-subtitle>
                  </mat-card-header>

                  <mat-card-content>
                    <div class="checklist-stats">
                      <div class="stat-item">
                        <mat-icon class="stat-icon-small">quiz</mat-icon>
                        <span
                          >{{ getTotalQuestions(checklist) }} Questions</span
                        >
                      </div>
                      <div class="stat-item">
                        <mat-icon class="stat-icon-small">folder</mat-icon>
                        <span>{{ checklist.sections.length }} Sections</span>
                      </div>
                    </div>

                    <div class="progress-section">
                      <div class="progress-header">
                        <span class="progress-label">Completion</span>
                        <span class="progress-value"
                          >{{ getCompletionPercentage(checklist) }}%</span
                        >
                      </div>
                      <mat-progress-bar
                        mode="determinate"
                        [value]="getCompletionPercentage(checklist)"
                        [color]="
                          getProgressColor(getCompletionPercentage(checklist))
                        "
                      ></mat-progress-bar>
                    </div>

                    <div class="checklist-meta">
                      <span class="meta-item">
                        <mat-icon class="meta-icon">schedule</mat-icon>
                        Updated {{ formatDate(checklist.updatedAt) }}
                      </span>
                    </div>
                  </mat-card-content>

                  <mat-card-actions class="card-actions">
                    <button
                      mat-button
                      color="primary"
                      [routerLink]="['/assessment', checklist.id]"
                      (click)="$event.stopPropagation()"
                    >
                      <mat-icon>play_arrow</mat-icon>
                      Start Assessment
                    </button>

                    <button
                      mat-icon-button
                      [matMenuTriggerFor]="cardMenu"
                      (click)="$event.stopPropagation()"
                      aria-label="More actions"
                    >
                      <mat-icon>more_vert</mat-icon>
                    </button>

                    <mat-menu #cardMenu="matMenu">
                      <button
                        mat-menu-item
                        [routerLink]="['/checklists/edit', checklist.id]"
                      >
                        <mat-icon>edit</mat-icon>
                        <span>Edit</span>
                      </button>
                      <button
                        mat-menu-item
                        (click)="duplicateChecklist(checklist)"
                      >
                        <mat-icon>content_copy</mat-icon>
                        <span>Duplicate</span>
                      </button>
                      <button
                        mat-menu-item
                        (click)="exportChecklist(checklist)"
                      >
                        <mat-icon>download</mat-icon>
                        <span>Export</span>
                      </button>
                      <mat-divider></mat-divider>
                      <button
                        mat-menu-item
                        (click)="deleteChecklist(checklist)"
                        class="delete-action"
                      >
                        <mat-icon>delete</mat-icon>
                        <span>Delete</span>
                      </button>
                    </mat-menu>
                  </mat-card-actions>
                </mat-card>
              }
            </div>
          }

          <!-- List View -->
          @if (viewModeControl.value === "list") {
            <mat-card class="list-view-card">
              <mat-card-content class="list-content">
                @for (checklist of filteredChecklists(); track checklist.id) {
                  <div
                    class="checklist-list-item"
                    [routerLink]="['/assessment', checklist.id]"
                  >
                    <div class="list-item-avatar">
                      <mat-icon>assignment</mat-icon>
                    </div>

                    <div class="list-item-content">
                      <div class="list-item-header">
                        <h3 class="list-item-title">
                          {{ checklist.healthProgram }}
                        </h3>
                        <div class="list-item-actions">
                          <button
                            mat-icon-button
                            [matMenuTriggerFor]="listMenu"
                            (click)="$event.stopPropagation()"
                          >
                            <mat-icon>more_vert</mat-icon>
                          </button>
                        </div>
                      </div>

                      <div class="list-item-meta">
                        <span class="meta-chip department">{{
                          checklist.department
                        }}</span>
                        <span class="meta-chip level">{{
                          checklist.organizationalLevel
                        }}</span>
                        <span class="meta-text"
                          >{{ getTotalQuestions(checklist) }} questions</span
                        >
                      </div>

                      <div class="list-item-progress">
                        <div class="progress-info">
                          <span
                            >{{ getCompletionPercentage(checklist) }}%
                            complete</span
                          >
                          <span class="progress-date"
                            >Updated {{ formatDate(checklist.updatedAt) }}</span
                          >
                        </div>
                        <mat-progress-bar
                          mode="determinate"
                          [value]="getCompletionPercentage(checklist)"
                          [color]="
                            getProgressColor(getCompletionPercentage(checklist))
                          "
                        ></mat-progress-bar>
                      </div>
                    </div>

                    <mat-menu #listMenu="matMenu">
                      <button
                        mat-menu-item
                        [routerLink]="['/assessment', checklist.id]"
                      >
                        <mat-icon>play_arrow</mat-icon>
                        <span>Start Assessment</span>
                      </button>
                      <button
                        mat-menu-item
                        [routerLink]="['/checklists/edit', checklist.id]"
                      >
                        <mat-icon>edit</mat-icon>
                        <span>Edit</span>
                      </button>
                      <button
                        mat-menu-item
                        (click)="duplicateChecklist(checklist)"
                      >
                        <mat-icon>content_copy</mat-icon>
                        <span>Duplicate</span>
                      </button>
                      <button
                        mat-menu-item
                        (click)="exportChecklist(checklist)"
                      >
                        <mat-icon>download</mat-icon>
                        <span>Export</span>
                      </button>
                      <mat-divider></mat-divider>
                      <button
                        mat-menu-item
                        (click)="deleteChecklist(checklist)"
                        class="delete-action"
                      >
                        <mat-icon>delete</mat-icon>
                        <span>Delete</span>
                      </button>
                    </mat-menu>
                  </div>

                  @if (!$last) {
                    <mat-divider></mat-divider>
                  }
                }
              </mat-card-content>
            </mat-card>
          }
        }
      }
    </div>
  `,
  styles: [
    `
      .checklist-list-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0;
      }

      /* Page Header */
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--spacing-xl);
        gap: var(--spacing-lg);
      }

      .header-content {
        flex: 1;
      }

      .page-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin: 0 0 var(--spacing-sm) 0;
        font-size: var(--text-4xl);
        font-weight: 600;
        color: var(--on-surface);
      }

      .title-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: var(--primary-600);
      }

      .page-description {
        margin: 0;
        color: var(--on-surface-variant);
        font-size: var(--text-lg);
        line-height: 1.5;
      }

      .header-actions {
        display: flex;
        gap: var(--spacing-sm);
      }

      .create-button {
        height: 48px;
        padding: 0 var(--spacing-lg);
        font-weight: 600;
        border-radius: var(--border-radius-lg);
      }

      .mobile-fab {
        position: fixed;
        bottom: var(--spacing-lg);
        right: var(--spacing-lg);
        z-index: 100;
        box-shadow: var(--elevation-4);
      }

      /* Stats Grid */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--spacing-lg);
        margin-bottom: var(--spacing-xl);
      }

      .stat-card {
        border-radius: var(--border-radius-lg);
        box-shadow: var(--elevation-2);
        transition: all 0.2s ease;
      }

      .stat-card:hover {
        box-shadow: var(--elevation-3);
        transform: translateY(-2px);
      }

      .stat-content {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
      }

      .stat-icon-container {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .stat-icon-container.primary {
        background-color: var(--primary-100);
        color: var(--primary-700);
      }

      .stat-icon-container.accent {
        background-color: var(--accent-100);
        color: var(--accent-700);
      }

      .stat-icon-container.warn {
        background-color: var(--warn-100);
        color: var(--warn-700);
      }

      .stat-icon-container.success {
        background-color: #e8f5e8;
        color: #2e7d32;
      }

      .stat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .stat-details {
        flex: 1;
      }

      .stat-value {
        font-size: var(--text-3xl);
        font-weight: 700;
        color: var(--on-surface);
        line-height: 1;
        margin-bottom: var(--spacing-xs);
      }

      .stat-label {
        font-size: var(--text-sm);
        color: var(--on-surface-variant);
        font-weight: 500;
      }

      /* Filters Card */
      .filters-card {
        margin-bottom: var(--spacing-xl);
        border-radius: var(--border-radius-lg);
        box-shadow: var(--elevation-2);
      }

      .filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--spacing-md);
      }

      .filter-field {
        width: 100%;
      }

      .filter-actions {
        margin-top: var(--spacing-md);
        padding-top: var(--spacing-md);
        border-top: 1px solid rgba(0, 0, 0, 0.12);
      }

      .clear-filters-btn {
        border-radius: var(--border-radius-md);
      }

      /* Results Header */
      .results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-lg);
        gap: var(--spacing-md);
      }

      .results-title {
        margin: 0;
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--on-surface);
      }

      .view-toggle {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }

      /* Checklists Grid */
      .checklists-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: var(--spacing-lg);
      }

      .checklist-card {
        border-radius: var(--border-radius-lg);
        box-shadow: var(--elevation-2);
        transition: all 0.3s ease;
        cursor: pointer;
      }

      .checklist-card.interactive:hover {
        box-shadow: var(--elevation-4);
        transform: translateY(-4px);
      }

      .checklist-avatar {
        background-color: var(--primary-100);
        color: var(--primary-700);
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }

      .checklist-title {
        font-size: var(--text-lg);
        font-weight: 600;
        margin: 0;
        line-height: 1.3;
      }

      .checklist-subtitle {
        font-size: var(--text-sm);
        color: var(--on-surface-variant);
        margin: var(--spacing-xs) 0 0 0;
      }

      .checklist-stats {
        display: flex;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-md);
      }

      .stat-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--text-sm);
        color: var(--on-surface-variant);
      }

      .stat-icon-small {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .progress-section {
        margin-bottom: var(--spacing-md);
      }

      .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-xs);
      }

      .progress-label {
        font-size: var(--text-sm);
        font-weight: 500;
        color: var(--on-surface);
      }

      .progress-value {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--primary-700);
      }

      .checklist-meta {
        margin-top: var(--spacing-md);
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--text-xs);
        color: var(--on-surface-variant);
      }

      .meta-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      .card-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-md) var(--spacing-lg);
      }

      /* List View */
      .list-view-card {
        border-radius: var(--border-radius-lg);
        box-shadow: var(--elevation-2);
      }

      .list-content {
        padding: 0;
      }

      .checklist-list-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-lg);
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .checklist-list-item:hover {
        background-color: rgba(var(--primary-rgb), 0.04);
      }

      .list-item-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background-color: var(--primary-100);
        color: var(--primary-700);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .list-item-content {
        flex: 1;
        min-width: 0;
      }

      .list-item-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--spacing-xs);
      }

      .list-item-title {
        margin: 0;
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--on-surface);
        line-height: 1.3;
      }

      .list-item-actions {
        flex-shrink: 0;
      }

      .list-item-meta {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-sm);
        flex-wrap: wrap;
      }

      .meta-chip {
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--border-radius-md);
        font-size: var(--text-xs);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .meta-chip.department {
        background-color: var(--primary-100);
        color: var(--primary-800);
      }

      .meta-chip.level {
        background-color: var(--accent-100);
        color: var(--accent-800);
      }

      .meta-text {
        font-size: var(--text-sm);
        color: var(--on-surface-variant);
      }

      .list-item-progress {
        margin-top: var(--spacing-sm);
      }

      .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-xs);
        font-size: var(--text-sm);
      }

      .progress-date {
        color: var(--on-surface-variant);
      }

      /* States */
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-xxl);
        gap: var(--spacing-lg);
      }

      .loading-text {
        color: var(--on-surface-variant);
        font-size: var(--text-lg);
        margin: 0;
      }

      .error-card {
        border-radius: var(--border-radius-lg);
        box-shadow: var(--elevation-2);
      }

      .error-content {
        text-align: center;
        padding: var(--spacing-xl);
      }

      .error-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--warn-500);
        margin-bottom: var(--spacing-md);
      }

      .empty-state-card {
        border-radius: var(--border-radius-lg);
        box-shadow: var(--elevation-2);
      }

      .empty-state {
        text-align: center;
        padding: var(--spacing-xxl);
      }

      .empty-icon {
        font-size: 80px;
        width: 80px;
        height: 80px;
        color: var(--on-surface-variant);
        opacity: 0.5;
        margin-bottom: var(--spacing-lg);
      }

      .empty-actions {
        display: flex;
        gap: var(--spacing-sm);
        justify-content: center;
        margin-top: var(--spacing-lg);
        flex-wrap: wrap;
      }

      .delete-action {
        color: var(--warn-600);
      }

      /* Mobile Responsive */
      @media (max-width: 599px) {
        .page-header {
          flex-direction: column;
          align-items: stretch;
          gap: var(--spacing-md);
        }

        .page-title {
          font-size: var(--text-3xl);
        }

        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-md);
        }

        .filters-grid {
          grid-template-columns: 1fr;
          gap: var(--spacing-sm);
        }

        .results-header {
          flex-direction: column;
          align-items: stretch;
          gap: var(--spacing-sm);
        }

        .checklists-grid {
          grid-template-columns: 1fr;
          gap: var(--spacing-md);
        }

        .checklist-list-item {
          padding: var(--spacing-md);
        }

        .list-item-header {
          flex-direction: column;
          align-items: stretch;
          gap: var(--spacing-xs);
        }

        .list-item-actions {
          align-self: flex-end;
        }
      }

      @media (max-width: 480px) {
        .stats-grid {
          grid-template-columns: 1fr;
        }

        .stat-content {
          flex-direction: column;
          text-align: center;
          gap: var(--spacing-sm);
        }

        .progress-info {
          flex-direction: column;
          align-items: stretch;
          gap: var(--spacing-xs);
        }

        .empty-actions {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class ChecklistList implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  protected readonly checklistService = inject(ChecklistService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  // Form controls for filtering and sorting
  protected readonly searchControl = new FormControl("");
  protected readonly programFilterControl = new FormControl("");
  protected readonly departmentFilterControl = new FormControl("");
  protected readonly sortControl = new FormControl("updatedAt");
  protected readonly viewModeControl = new FormControl("grid");

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

  protected readonly filteredChecklists = computed(() => {
    let checklists = this.checklistService.checklists();

    // Apply search filter
    const searchTerm = this.searchControl.value?.toLowerCase() || "";
    if (searchTerm) {
      checklists = checklists.filter(
        (checklist) =>
          checklist.healthProgram.toLowerCase().includes(searchTerm) ||
          checklist.department.toLowerCase().includes(searchTerm) ||
          checklist.organizationalLevel.toLowerCase().includes(searchTerm),
      );
    }

    // Apply program filter
    const programFilter = this.programFilterControl.value;
    if (programFilter) {
      checklists = checklists.filter(
        (checklist) => checklist.healthProgram === programFilter,
      );
    }

    // Apply department filter
    const departmentFilter = this.departmentFilterControl.value;
    if (departmentFilter) {
      checklists = checklists.filter(
        (checklist) => checklist.department === departmentFilter,
      );
    }

    // Apply sorting
    const sortBy = this.sortControl.value || "updatedAt";
    checklists = [...checklists].sort((a, b) => {
      switch (sortBy) {
        case "createdAt":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case "department":
          return a.department.localeCompare(b.department);
        case "healthProgram":
          return a.healthProgram.localeCompare(b.healthProgram);
        default: // updatedAt
          return (
            new Date(b.updatedAt || 0).getTime() -
            new Date(a.updatedAt || 0).getTime()
          );
      }
    });

    return checklists;
  });

  ngOnInit(): void {
    this.loadChecklists();

    // Set default view mode based on screen size
    if (this.isMobile()) {
      this.viewModeControl.setValue("list");
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected isMobile(): boolean {
    return this.breakpointObserver.isMatched(["(max-width: 599px)"]);
  }

  private async loadChecklists(): Promise<void> {
    try {
      await this.checklistService.loadChecklists();
    } catch (error) {
      console.error("Failed to load checklists:", error);
    }
  }

  protected hasActiveFilters(): boolean {
    return !!(
      this.searchControl.value ||
      this.programFilterControl.value ||
      this.departmentFilterControl.value
    );
  }

  protected clearAllFilters(): void {
    this.searchControl.setValue("");
    this.programFilterControl.setValue("");
    this.departmentFilterControl.setValue("");
  }

  protected async deleteChecklist(checklist: Checklist): Promise<void> {
    const confirmed = confirm(
      `Are you sure you want to delete "${checklist.healthProgram}"? This action cannot be undone.`,
    );

    if (confirmed) {
      try {
        await this.checklistService.deleteChecklist(checklist.id);
      } catch (error) {
        console.error("Failed to delete checklist:", error);
        alert("Failed to delete checklist. Please try again.");
      }
    }
  }

  protected duplicateChecklist(checklist: Checklist): void {
    const duplicatedChecklist = {
      ...checklist,
      id: `${checklist.id}-copy-${Date.now()}`,
      healthProgram: `${checklist.healthProgram} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.checklistService.saveChecklist(duplicatedChecklist);
  }

  protected exportChecklist(checklist: Checklist): void {
    const dataStr = JSON.stringify(checklist, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `checklist-${checklist.healthProgram.replace(/\s+/g, "-").toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  protected formatDate(date: Date | undefined): string {
    if (!date) return "Unknown";

    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      "day",
    );
  }

  protected getProgressColor(
    percentage: number,
  ): "primary" | "accent" | "warn" {
    if (percentage >= 80) return "accent";
    if (percentage >= 50) return "primary";
    return "warn";
  }
}
