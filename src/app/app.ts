import { Component, OnInit } from "@angular/core";
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { CommonModule } from "@angular/common";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatListModule } from "@angular/material/list";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Observable } from "rxjs";
import { map, shareReplay } from "rxjs/operators";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav
        #drawer
        class="sidenav"
        fixedInViewport
        [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
        [mode]="(isHandset$ | async) ? 'over' : 'side'"
        [opened]="(isHandset$ | async) === false"
      >
        <mat-toolbar class="sidenav-toolbar">📋 Assessment Portal</mat-toolbar>
        <mat-nav-list>
          <a
            mat-list-item
            routerLink="/checklists"
            routerLinkActive="active-link"
          >
            <mat-icon matListItemIcon>checklist</mat-icon>
            <span matListItemTitle>Checklists</span>
          </a>
          <a
            mat-list-item
            routerLink="/assessment-quiz"
            routerLinkActive="active-link"
          >
            <mat-icon matListItemIcon>quiz</mat-icon>
            <span matListItemTitle>Take Assessment</span>
          </a>
          <a mat-list-item routerLink="/results" routerLinkActive="active-link">
            <mat-icon matListItemIcon>analytics</mat-icon>
            <span matListItemTitle>Results</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar color="primary" class="main-toolbar">
          <button
            type="button"
            aria-label="Toggle sidenav"
            mat-icon-button
            (click)="drawer.toggle()"
            *ngIf="isHandset$ | async"
          >
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
          </button>
          <span class="toolbar-title">📋 Assessment Portal</span>
          <span class="toolbar-subtitle">Health Program Checklist System</span>
        </mat-toolbar>

        <main class="main-content">
          <router-outlet></router-outlet>
        </main>

        <footer class="app-footer">
          <mat-toolbar class="footer-toolbar">
            <span
              >&copy; 2024 Health Assessment System. Built with Angular 20 &
              Material Design.</span
            >
          </mat-toolbar>
        </footer>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      /* Mobile-first design approach */
      .sidenav-container {
        height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .sidenav {
        width: 100vw;
        max-width: 280px;
      }

      .sidenav-toolbar {
        background: var(--mat-sys-primary);
        color: var(--mat-sys-on-primary);
        font-weight: 600;
        font-size: 1rem;
        padding: 0 16px;
        display: flex;
        align-items: center;
        min-height: 56px;
      }

      .main-toolbar {
        position: sticky;
        top: 0;
        z-index: 100;
        box-shadow: var(--mat-sys-level2);
        padding: 0 8px;
        min-height: 56px;
      }

      .toolbar-title {
        font-weight: 600;
        font-size: 1.125rem;
        margin-right: 8px;
        line-height: 1.2;
      }

      .toolbar-subtitle {
        font-size: 0.875rem;
        opacity: 0.8;
        font-weight: 400;
        display: none;
      }

      .main-content {
        flex: 1;
        padding: 8px;
        background-color: var(--mat-sys-surface-container-lowest);
        min-height: calc(100vh - 112px);
        overflow-x: hidden;
      }

      .app-footer {
        margin-top: auto;
        flex-shrink: 0;
      }

      .footer-toolbar {
        background-color: var(--mat-sys-surface-variant);
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.75rem;
        min-height: 40px;
        justify-content: center;
        padding: 0 16px;
      }

      .active-link {
        background-color: var(--mat-sys-primary-container) !important;
        color: var(--mat-sys-on-primary-container) !important;
        border-radius: 8px !important;
      }

      /* Navigation list improvements */
      mat-nav-list {
        padding: 8px 0;
      }

      mat-nav-list a {
        margin: 4px 8px;
        border-radius: 8px;
        transition: background-color 0.2s ease;
      }

      mat-nav-list a:hover {
        background-color: var(--mat-sys-surface-container-high);
      }

      /* Icon button improvements */
      .mat-mdc-icon-button {
        width: 40px;
        height: 40px;
        padding: 8px;
      }

      /* Tablet responsive (768px and up) */
      @media (min-width: 768px) {
        .toolbar-subtitle {
          display: inline;
        }

        .toolbar-title {
          font-size: 1.25rem;
          margin-right: 16px;
        }

        .main-content {
          padding: 16px;
        }

        .main-toolbar {
          padding: 0 16px;
          min-height: 64px;
        }

        .sidenav-toolbar {
          font-size: 1.125rem;
          min-height: 64px;
        }

        .footer-toolbar {
          min-height: 48px;
          font-size: 0.875rem;
        }
      }

      /* Desktop responsive (1024px and up) */
      @media (min-width: 1024px) {
        .toolbar-title {
          font-size: 1.375rem;
        }

        .main-content {
          padding: 24px;
        }

        .sidenav {
          width: 280px;
        }
      }

      /* Large desktop (1200px and up) */
      @media (min-width: 1200px) {
        .main-content {
          padding: 32px;
          max-width: 1400px;
          margin: 0 auto;
        }
      }

      /* Accessibility improvements */
      @media (prefers-reduced-motion: reduce) {
        mat-nav-list a {
          transition: none;
        }
      }

      /* Focus visible styles */
      .mat-mdc-button:focus-visible,
      .mat-mdc-icon-button:focus-visible {
        outline: 2px solid var(--mat-sys-primary);
        outline-offset: 2px;
      }

      /* High contrast support */
      @media (prefers-contrast: high) {
        .active-link {
          border: 2px solid var(--mat-sys-primary) !important;
        }
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  isHandset$!: Observable<boolean>;

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit() {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map((result) => result.matches),
      shareReplay(),
    );
  }
}
