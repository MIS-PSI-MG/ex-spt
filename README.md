# Health Assessment Portal - Angular Material Edition

A modern, mobile-first health program checklist assessment system built with Angular 20 and Angular Material Design 3.

## 🚀 Overview

This project has been refactored to use Angular Material components with a default blue/Azure theme, optimized for mobile-first usage. The application provides a comprehensive platform for managing health program checklists, conducting assessments, and viewing results with beautiful Material Design interfaces.

## ✨ Features

### 📱 Mobile-First Design
- **Responsive Layout**: Optimized for mobile devices with progressive enhancement for tablets and desktops
- **Touch-Friendly**: Large touch targets and appropriate spacing for mobile interaction
- **Adaptive Navigation**: Side navigation that transforms based on screen size
- **Material Design 3**: Latest Material Design principles with blue/Azure theme

### 🎨 Angular Material Components
- **Cards**: Content containers with elevation and proper spacing
- **Buttons**: Consistent button styles (raised, outlined, icon buttons)
- **Form Fields**: Material input fields with floating labels
- **Progress Indicators**: Linear and circular progress bars
- **Navigation**: Responsive toolbar and sidenav
- **Data Display**: Grid lists, chips, and expansion panels
- **Feedback**: Snack bars for user notifications

### 📊 Core Functionality
- **Checklist Management**: Create, edit, and manage health program checklists
- **Assessment System**: Interactive quiz interface for conducting assessments
- **Results Dashboard**: Visual analytics with charts and statistics
- **Data Export**: Export results in various formats
- **Responsive Charts**: ApexCharts integration with mobile optimization

## 🛠 Technical Stack

- **Angular 20**: Latest Angular framework with standalone components
- **Angular Material 20**: Material Design component library
- **Angular CDK**: Component Development Kit for layout and accessibility
- **TypeScript**: Type-safe development
- **RxJS**: Reactive programming with observables
- **ApexCharts**: Interactive charts and data visualization
- **Sass**: Enhanced CSS with Material theming

## 📱 Responsive Breakpoints

The application uses a mobile-first approach with the following breakpoints:

- **Mobile**: < 768px (base styles)
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1199px
- **Large Desktop**: ≥ 1200px

## 🎯 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (v20 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ex-spt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   ng serve
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200/`

## 🎨 Material Design Theme

### Default Theme Configuration

The application uses Azure/Blue as the primary color with Material Design 3 tokens:

```scss
// custom-theme.scss
@use "@angular/material" as mat;

html {
  @include mat.theme(
    (
      color: (
        primary: mat.$azure-palette,
        tertiary: mat.$blue-palette,
      ),
      typography: Roboto,
      density: 0,
    )
  );
  color-scheme: light;
}
```

### Available Material Components

The application extensively uses these Material components:

- `MatCardModule` - Content containers
- `MatButtonModule` - Action buttons
- `MatIconModule` - Material icons
- `MatFormFieldModule` - Input containers
- `MatInputModule` - Text inputs
- `MatSelectModule` - Dropdown selectors
- `MatProgressBarModule` - Linear progress
- `MatProgressSpinnerModule` - Loading spinners
- `MatGridListModule` - Responsive grids
- `MatChipsModule` - Tag-like elements
- `MatSnackBarModule` - Toast notifications
- `MatToolbarModule` - App bars
- `MatSidenavModule` - Navigation drawer
- `MatListModule` - Lists and navigation
- `MatExpansionModule` - Collapsible content
- `MatDividerModule` - Content separators

## 📱 Mobile Optimization Features

### Layout Adaptations
- **Flexible Grid Systems**: Cards and lists adapt to screen size
- **Collapsible Navigation**: Side navigation becomes overlay on mobile
- **Responsive Typography**: Font sizes scale appropriately
- **Touch Targets**: Minimum 44px touch targets for accessibility

### Performance Optimizations
- **Lazy Loading**: Route-based code splitting
- **Material Theming**: Efficient CSS custom properties
- **Image Optimization**: Responsive images and icons
- **Bundle Optimization**: Tree-shaking and minimal bundles

## 🏗 Project Structure

```
src/
├── app/
│   ├── components/          # Feature components
│   │   ├── checklist-list/     # Material cards and grids
│   │   ├── checklist-editor/   # Material forms and steppers
│   │   ├── assessment-quiz/    # Material progress and cards
│   │   └── results-dashboard/  # Material charts and expansion panels
│   ├── services/            # Business logic services
│   ├── interfaces/          # TypeScript interfaces
│   ├── app.ts              # Root component with Material nav
│   └── app.routes.ts       # Route configuration
├── custom-theme.scss       # Material Design theme
└── styles.css             # Global mobile-first styles
```

## 🎨 Component Examples

### Material Card Usage
```typescript
// Component with Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title>Assessment</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <!-- Content here -->
      </mat-card-content>
      <mat-card-actions>
        <button mat-raised-button color="primary">
          <mat-icon>assessment</mat-icon>
          Start Assessment
        </button>
      </mat-card-actions>
    </mat-card>
  `
})
```

### Responsive Grid Implementation
```typescript
// Using Material Grid List
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  template: `
    <mat-grid-list 
      [cols]="(isHandset$ | async) ? 2 : 4"
      rowHeight="120px"
      gutterSize="16px">
      <mat-grid-tile *ngFor="let item of items">
        <!-- Grid tile content -->
      </mat-grid-tile>
    </mat-grid-list>
  `
})
```

## 🔧 Development Guidelines

### Material Design Principles
1. **Consistent Spacing**: Use Material spacing tokens (8px grid)
2. **Elevation**: Apply appropriate elevation levels for depth
3. **Color System**: Use theme colors consistently
4. **Typography**: Follow Material typography scale
5. **Interactive States**: Implement hover, focus, and active states

### Mobile-First Development
1. **Start with Mobile**: Design for small screens first
2. **Progressive Enhancement**: Add features for larger screens
3. **Touch Interactions**: Ensure touch-friendly interfaces
4. **Performance**: Optimize for mobile networks and devices

### Code Organization
1. **Standalone Components**: Use Angular standalone components
2. **Material Imports**: Import only required Material modules
3. **Responsive Services**: Use BreakpointObserver for responsiveness
4. **Type Safety**: Leverage TypeScript for better development experience

## 🚀 Building and Deployment

### Development Build
```bash
ng build --configuration development
```

### Production Build
```bash
ng build --configuration production
```

### Testing
```bash
# Unit tests
ng test

# E2E tests (if configured)
ng e2e
```

## 📱 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers**: iOS Safari, Android Chrome
- **Progressive Web App**: PWA capabilities ready

## 🎯 Performance Metrics

- **First Contentful Paint**: Optimized for mobile networks
- **Largest Contentful Paint**: Material components load efficiently
- **Cumulative Layout Shift**: Stable layouts with proper sizing
- **Core Web Vitals**: Meets Google's performance standards

## 🤝 Contributing

1. Follow Material Design guidelines
2. Maintain mobile-first approach
3. Use TypeScript strictly
4. Write tests for new features
5. Document component usage

## 📚 Additional Resources

- [Angular Material Documentation](https://material.angular.io/)
- [Material Design 3](https://m3.material.io/)
- [Angular CDK](https://material.angular.io/cdk/categories)
- [Responsive Design Guidelines](https://web.dev/responsive-web-design-basics/)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using Angular 20 & Material Design 3**