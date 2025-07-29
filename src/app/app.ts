import { Component, inject } from "@angular/core";
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  Router,
} from "@angular/router";
import { CommonModule } from "@angular/common";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { MaterialModule } from "./shared/material.modules";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MaterialModule,
  ],
  template: `
    <div class="app-container">
      <!-- Mobile/Tablet Navigation -->
      <mat-sidenav-container
        class="sidenav-container"
        [hasBackdrop]="isMobile()"
      >
        <mat-sidenav
          #drawer
          class="sidenav"
          [mode]="isMobile() ? 'over' : 'side'"
          [opened]="!isMobile()"
          [fixedInViewport]="isMobile()"
          fixedTopGap="64"
        >
          <mat-toolbar class="sidenav-header">
            <span class="logo-text">📋 Assessment</span>
          </mat-toolbar>

          <mat-nav-list class="nav-list">
            <a
              mat-list-item
              routerLink="/checklists"
              routerLinkActive="active-nav-item"
              (click)="closeSidenavOnMobile(drawer)"
            >
              <mat-icon matListItemIcon>checklist</mat-icon>
              <span matListItemTitle>Checklists</span>
            </a>

            <a
              mat-list-item
              routerLink="/results"
              routerLinkActive="active-nav-item"
              (click)="closeSidenavOnMobile(drawer)"
            >
              <mat-icon matListItemIcon>analytics</mat-icon>
              <span matListItemTitle>Results</span>
            </a>

            <mat-divider></mat-divider>

            <a
              mat-list-item
              routerLink="/checklists/new"
              routerLinkActive="active-nav-item"
              (click)="closeSidenavOnMobile(drawer)"
            >
              <mat-icon matListItemIcon>add_circle</mat-icon>
              <span matListItemTitle>New Checklist</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content class="main-content">
          <!-- Top App Bar -->
          <mat-toolbar class="app-toolbar" color="primary">
            <button
              type="button"
              mat-icon-button
              [style.display]="isMobile() ? 'block' : 'none'"
              (click)="drawer.toggle()"
              aria-label="Toggle navigation"
            >
              <mat-icon>menu</mat-icon>
            </button>

            <div class="toolbar-title">
              <h1 class="app-title">Health Assessment Portal</h1>
              <span class="app-subtitle">Program Checklist System</span>
            </div>

            <!-- Desktop Navigation -->
            <nav
              class="desktop-nav"
              [style.display]="isMobile() ? 'none' : 'flex'"
            >
              <a
                mat-button
                routerLink="/checklists"
                routerLinkActive="active-nav-button"
                class="nav-button"
              >
                <mat-icon>checklist</mat-icon>
                Checklists
              </a>

              <a
                mat-button
                routerLink="/results"
                routerLinkActive="active-nav-button"
                class="nav-button"
              >
                <mat-icon>analytics</mat-icon>
                Results
              </a>
            </nav>

            <div class="toolbar-spacer"></div>

            <!-- Action Buttons -->
            <div class="toolbar-actions">
              <button
                mat-icon-button
                [matTooltip]="
                  isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
                "
                (click)="toggleTheme()"
                aria-label="Toggle theme"
              >
                <mat-icon>{{
                  isDarkMode ? "light_mode" : "dark_mode"
                }}</mat-icon>
              </button>

              <button
                mat-icon-button
                matTooltip="Settings"
                [matMenuTriggerFor]="settingsMenu"
                aria-label="Settings menu"
              >
                <mat-icon>more_vert</mat-icon>
              </button>

              <mat-menu #settingsMenu="matMenu">
                <button mat-menu-item (click)="refreshApp()">
                  <mat-icon>refresh</mat-icon>
                  <span>Refresh</span>
                </button>
                <button mat-menu-item>
                  <mat-icon>help</mat-icon>
                  <span>Help</span>
                </button>
                <button mat-menu-item>
                  <mat-icon>info</mat-icon>
                  <span>About</span>
                </button>
              </mat-menu>
            </div>
          </mat-toolbar>

          <!-- Main Content Area -->
          <main class="content-area">
            <div class="content-container">
              <router-outlet></router-outlet>
            </div>
          </main>

          <!-- Footer -->
          <footer class="app-footer">
            <div class="footer-content">
              <div class="footer-text">
                <span>&copy; 2024 Health Assessment System</span>
                <span class="footer-separator">•</span>
                <span>Built with Angular & Material Design</span>
              </div>

              <div class="footer-version">
                <mat-chip class="version-chip">v1.0.0</mat-chip>
              </div>
            </div>
          </footer>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [
    `
      .app-container {
        height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .sidenav-container {
        flex: 1;
        background-color: var(--surface);
      }

      .sidenav {
        width: 280px;
        background-color: var(--surface-variant);
        border-right: 1px solid rgba(0, 0, 0, 0.12);
      }

      .sidenav-header {
        background: linear-gradient(
          135deg,
          var(--primary-600) 0%,
          var(--primary-800) 100%
        );
        color: white;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-bottom: none;
      }

      .logo-text {
        font-size: 18px;
        font-weight: 600;
        letter-spacing: 0.5px;
      }

      .nav-list {
        padding-top: var(--spacing-md);
      }

      .nav-list .mat-mdc-list-item {
        margin-bottom: var(--spacing-xs);
        border-radius: 0 24px 24px 0;
        margin-right: var(--spacing-md);
        transition: all 0.2s ease;
      }

      .nav-list .mat-mdc-list-item:hover {
        background-color: rgba(var(--primary-rgb), 0.08);
      }

      .nav-list .mat-mdc-list-item.active-nav-item {
        background-color: rgba(var(--primary-rgb), 0.12);
        color: var(--primary-700);
      }

      .nav-list .mat-mdc-list-item.active-nav-item .mat-icon {
        color: var(--primary-700);
      }

      .main-content {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      .app-toolbar {
        height: 64px;
        box-shadow: var(--elevation-2);
        z-index: 10;
        background: linear-gradient(
          135deg,
          var(--primary-600) 0%,
          var(--primary-800) 100%
        );
      }

      .toolbar-title {
        display: flex;
        flex-direction: column;
        margin-left: var(--spacing-md);
      }

      .app-title {
        font-size: 20px;
        font-weight: 600;
        margin: 0;
        line-height: 1.2;
        color: white;
      }

      .app-subtitle {
        font-size: 12px;
        opacity: 0.8;
        color: white;
        line-height: 1;
      }

      .desktop-nav {
        display: flex;
        gap: var(--spacing-sm);
        margin-left: var(--spacing-xl);
      }

      .nav-button {
        color: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        border-radius: var(--border-radius-md);
        padding: 0 var(--spacing-md);
        transition: all 0.2s ease;
      }

      .nav-button:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
      }

      .nav-button.active-nav-button {
        background-color: rgba(255, 255, 255, 0.15);
        color: white;
        font-weight: 600;
      }

      .toolbar-spacer {
        flex: 1;
      }

      .toolbar-actions {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
      }

      .toolbar-actions .mat-mdc-icon-button {
        color: rgba(255, 255, 255, 0.9);
      }

      .toolbar-actions .mat-mdc-icon-button:hover {
        color: white;
        background-color: rgba(255, 255, 255, 0.1);
      }

      .content-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        background-color: var(--surface);
        overflow-y: auto;
      }

      .content-container {
        flex: 1;
        max-width: 1400px;
        width: 100%;
        margin: 0 auto;
        padding: var(--spacing-lg);
      }

      .app-footer {
        background-color: var(--surface-variant);
        border-top: 1px solid rgba(0, 0, 0, 0.12);
        padding: var(--spacing-md) var(--spacing-lg);
        margin-top: auto;
      }

      .footer-content {
        max-width: 1400px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .footer-text {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        color: var(--on-surface-variant);
        font-size: var(--text-sm);
      }

      .footer-separator {
        opacity: 0.5;
      }

      .version-chip {
        background-color: var(--primary-100);
        color: var(--primary-800);
        font-size: var(--text-xs);
        font-weight: 600;
      }

      /* Mobile Responsive Styles */
      @media (max-width: 599px) {
        .sidenav {
          width: 260px;
        }

        .toolbar-title {
          margin-left: var(--spacing-sm);
        }

        .app-title {
          font-size: 18px;
        }

        .app-subtitle {
          font-size: 11px;
        }

        .content-container {
          padding: var(--spacing-md);
        }

        .footer-content {
          flex-direction: column;
          gap: var(--spacing-sm);
          text-align: center;
        }

        .footer-text {
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .footer-separator {
          display: none;
        }
      }

      @media (max-width: 480px) {
        .app-title {
          font-size: 16px;
        }

        .content-container {
          padding: var(--spacing-sm);
        }

        .footer-text {
          font-size: var(--text-xs);
        }
      }

      /* Tablet Adjustments */
      @media (min-width: 600px) and (max-width: 959px) {
        .sidenav {
          width: 240px;
        }

        .content-container {
          padding: var(--spacing-lg) var(--spacing-md);
        }
      }

      /* Theme Transitions */
      .app-container,
      .sidenav,
      .main-content,
      .app-toolbar,
      .content-area,
      .app-footer {
        transition:
          background-color 0.3s ease,
          color 0.3s ease;
      }

      /* Focus Management */
      .mat-mdc-list-item:focus-visible {
        outline: 2px solid var(--primary-600);
        outline-offset: 2px;
      }

      .nav-button:focus-visible {
        outline: 2px solid rgba(255, 255, 255, 0.8);
        outline-offset: 2px;
      }

      /* Loading State */
      .content-area.loading {
        opacity: 0.7;
        pointer-events: none;
      }

      /* High Contrast Support */
      @media (prefers-contrast: high) {
        .sidenav {
          border-right: 2px solid var(--on-surface);
        }

        .app-footer {
          border-top: 2px solid var(--on-surface);
        }

        .nav-list .mat-mdc-list-item.active-nav-item {
          border: 2px solid var(--primary-700);
        }
      }
    `,
  ],
})
export class App {
  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);

  protected title = "Health Assessment Portal";
  protected isDarkMode = false;

  protected isMobile() {
    return this.breakpointObserver.isMatched([
      Breakpoints.Handset,
      Breakpoints.TabletPortrait,
    ]);
  }

  protected closeSidenavOnMobile(drawer: any) {
    if (this.isMobile()) {
      drawer.close();
    }
  }

  protected toggleTheme() {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }

    // Store theme preference
    localStorage.setItem(
      "theme-preference",
      this.isDarkMode ? "dark" : "light",
    );
  }

  protected refreshApp() {
    window.location.reload();
  }

  ngOnInit() {
    // Load theme preference
    const savedTheme = localStorage.getItem("theme-preference");
    if (savedTheme === "dark") {
      this.isDarkMode = true;
      document.body.classList.add("dark-theme");
    }

    // Handle system theme preference
    if (
      !savedTheme &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      this.isDarkMode = true;
      document.body.classList.add("dark-theme");
    }
  }
}
