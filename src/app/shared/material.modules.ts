import { NgModule } from '@angular/core';

// Material Core
import { MatRippleModule } from '@angular/material/core';
import { MatCommonModule } from '@angular/material/core';

// Layout
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';

// Navigation
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';

// Form Controls
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// Buttons & Indicators
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';

// Data display
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';

// Popups & Modals
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';

const MaterialModules = [
  // Core
  MatRippleModule,
  MatCommonModule,

  // Layout
  MatToolbarModule,
  MatSidenavModule,
  MatGridListModule,
  MatDividerModule,

  // Navigation
  MatMenuModule,
  MatTabsModule,
  MatStepperModule,

  // Form Controls
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatCheckboxModule,
  MatRadioModule,
  MatSlideToggleModule,
  MatSliderModule,
  MatDatepickerModule,
  MatNativeDateModule,

  // Buttons & Indicators
  MatButtonModule,
  MatButtonToggleModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatBadgeModule,
  MatChipsModule,

  // Data display
  MatCardModule,
  MatListModule,
  MatTableModule,
  MatSortModule,
  MatPaginatorModule,
  MatExpansionModule,

  // Popups & Modals
  MatDialogModule,
  MatSnackBarModule,
  MatTooltipModule,
  MatBottomSheetModule,
];

@NgModule({
  imports: MaterialModules,
  exports: MaterialModules,
})
export class MaterialModule {}
