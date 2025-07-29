import { Component } from "@angular/core";
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <!-- Navigation Header -->
      <header class="app-header">
        <div class="header-content">
          <div class="logo">
            <h1>📋 Assessment Portal</h1>
            <span class="tagline">Health Program Checklist System</span>
          </div>

          <nav class="main-nav">
            <a
              routerLink="/checklists"
              routerLinkActive="active"
              class="nav-link"
            >
              📝 Checklists
            </a>
            <a routerLink="/results" routerLinkActive="active" class="nav-link">
              📊 Results
            </a>
          </nav>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="app-footer">
        <div class="footer-content">
          <p>&copy; 2024 Health Assessment System. Built with Angular 20.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background-color: #f5f7fa;
      }

      .app-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 0;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        position: sticky;
        top: 0;
        z-index: 1000;
      }

      .header-content {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 80px;
      }

      .logo h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .tagline {
        font-size: 12px;
        opacity: 0.8;
        display: block;
        margin-top: 2px;
      }

      .main-nav {
        display: flex;
        gap: 8px;
      }

      .nav-link {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 12px 20px;
        color: rgba(255, 255, 255, 0.9);
        text-decoration: none;
        border-radius: 8px;
        font-weight: 500;
        font-size: 14px;
        transition: all 0.2s ease;
        position: relative;
      }

      .nav-link:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        transform: translateY(-1px);
      }

      .nav-link.active {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        font-weight: 600;
      }

      .nav-link.active::after {
        content: "";
        position: absolute;
        bottom: -2px;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 2px;
        background: white;
        border-radius: 1px;
      }

      .main-content {
        flex: 1;
        min-height: calc(100vh - 140px);
        padding: 0;
      }

      .app-footer {
        background: #2c3e50;
        color: #bdc3c7;
        margin-top: auto;
      }

      .footer-content {
        max-width: 1400px;
        margin: 0 auto;
        padding: 20px;
        text-align: center;
      }

      .footer-content p {
        margin: 0;
        font-size: 14px;
      }

      /* Global styles for the app */
      :host {
        font-family:
          -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          "Helvetica Neue", Arial, sans-serif;
        line-height: 1.6;
        color: #333;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .header-content {
          flex-direction: column;
          height: auto;
          padding: 15px 20px;
          gap: 15px;
        }

        .logo h1 {
          font-size: 20px;
        }

        .tagline {
          font-size: 11px;
        }

        .main-nav {
          width: 100%;
          justify-content: center;
        }

        .nav-link {
          flex: 1;
          justify-content: center;
          font-size: 13px;
          padding: 10px 16px;
        }

        .main-content {
          min-height: calc(100vh - 180px);
        }
      }

      @media (max-width: 480px) {
        .header-content {
          padding: 12px 15px;
        }

        .logo h1 {
          font-size: 18px;
        }

        .nav-link {
          font-size: 12px;
          padding: 8px 12px;
        }
      }
    `,
  ],
})
export class App {
  protected title = "Health Assessment Portal";
}
