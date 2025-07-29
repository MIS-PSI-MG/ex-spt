import { Injectable, signal, computed } from '@angular/core';

export interface OrganizationData {
  healthPrograms: string[];
  organizationalLevels: string[];
  departments: string[];
}

export interface HealthProgram {
  id: string;
  name: string;
  description?: string;
}

export interface OrganizationalLevel {
  id: string;
  name: string;
  hierarchy: number;
}

export interface Department {
  id: string;
  name: string;
  category: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  // State signals
  private readonly _healthPrograms = signal<HealthProgram[]>([
    { id: 'primary-care', name: 'Primary Care', description: 'General healthcare services' },
    { id: 'specialized-care', name: 'Specialized Care', description: 'Specialized medical services' },
    { id: 'emergency-care', name: 'Emergency Care', description: 'Emergency medical services' },
    { id: 'mental-health', name: 'Mental Health', description: 'Mental health and wellness services' },
    { id: 'preventive-care', name: 'Preventive Care', description: 'Preventive healthcare services' },
    { id: 'rehabilitation', name: 'Rehabilitation', description: 'Physical and occupational therapy' },
    { id: 'geriatric-care', name: 'Geriatric Care', description: 'Healthcare for elderly patients' },
    { id: 'pediatric-care', name: 'Pediatric Care', description: 'Healthcare for children' }
  ]);

  private readonly _organizationalLevels = signal<OrganizationalLevel[]>([
    { id: 'local', name: 'Local', hierarchy: 1 },
    { id: 'regional', name: 'Regional', hierarchy: 2 },
    { id: 'national', name: 'National', hierarchy: 3 },
    { id: 'international', name: 'International', hierarchy: 4 }
  ]);

  private readonly _departments = signal<Department[]>([
    { id: 'emergency', name: 'Emergency', category: 'critical-care' },
    { id: 'surgery', name: 'Surgery', category: 'surgical' },
    { id: 'pediatrics', name: 'Pediatrics', category: 'specialized' },
    { id: 'cardiology', name: 'Cardiology', category: 'specialized' },
    { id: 'neurology', name: 'Neurology', category: 'specialized' },
    { id: 'oncology', name: 'Oncology', category: 'specialized' },
    { id: 'orthopedics', name: 'Orthopedics', category: 'surgical' },
    { id: 'radiology', name: 'Radiology', category: 'diagnostic' },
    { id: 'laboratory', name: 'Laboratory', category: 'diagnostic' },
    { id: 'pharmacy', name: 'Pharmacy', category: 'support' },
    { id: 'nursing', name: 'Nursing', category: 'care' },
    { id: 'administration', name: 'Administration', category: 'management' },
    { id: 'it', name: 'Information Technology', category: 'support' },
    { id: 'human-resources', name: 'Human Resources', category: 'management' },
    { id: 'finance', name: 'Finance', category: 'management' },
    { id: 'maintenance', name: 'Maintenance', category: 'support' }
  ]);

  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Read-only computed properties
  readonly healthPrograms = computed(() => this._healthPrograms());
  readonly organizationalLevels = computed(() => this._organizationalLevels().sort((a, b) => a.hierarchy - b.hierarchy));
  readonly departments = computed(() => this._departments().sort((a, b) => a.name.localeCompare(b.name)));
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed properties for names only (for backward compatibility)
  readonly healthProgramNames = computed(() =>
    this._healthPrograms().map(program => program.name)
  );

  readonly organizationalLevelNames = computed(() =>
    this._organizationalLevels()
      .sort((a, b) => a.hierarchy - b.hierarchy)
      .map(level => level.name)
  );

  readonly departmentNames = computed(() =>
    this._departments()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(dept => dept.name)
  );

  // Departments grouped by category
  readonly departmentsByCategory = computed(() => {
    const departments = this._departments();
    const categories = new Map<string, Department[]>();

    departments.forEach(dept => {
      if (!categories.has(dept.category)) {
        categories.set(dept.category, []);
      }
      categories.get(dept.category)!.push(dept);
    });

    // Sort departments within each category
    categories.forEach(depts => {
      depts.sort((a, b) => a.name.localeCompare(b.name));
    });

    return categories;
  });

  /**
   * Get health program by ID
   */
  getHealthProgramById(id: string): HealthProgram | undefined {
    return this._healthPrograms().find(program => program.id === id);
  }

  /**
   * Get health program by name
   */
  getHealthProgramByName(name: string): HealthProgram | undefined {
    return this._healthPrograms().find(program => program.name === name);
  }

  /**
   * Get organizational level by ID
   */
  getOrganizationalLevelById(id: string): OrganizationalLevel | undefined {
    return this._organizationalLevels().find(level => level.id === id);
  }

  /**
   * Get organizational level by name
   */
  getOrganizationalLevelByName(name: string): OrganizationalLevel | undefined {
    return this._organizationalLevels().find(level => level.name === name);
  }

  /**
   * Get department by ID
   */
  getDepartmentById(id: string): Department | undefined {
    return this._departments().find(dept => dept.id === id);
  }

  /**
   * Get department by name
   */
  getDepartmentByName(name: string): Department | undefined {
    return this._departments().find(dept => dept.name === name);
  }

  /**
   * Get departments by category
   */
  getDepartmentsByCategory(category: string): Department[] {
    return this._departments().filter(dept => dept.category === category);
  }

  /**
   * Add a new health program
   */
  addHealthProgram(program: Omit<HealthProgram, 'id'> & { id?: string }): string {
    const id = program.id || this.generateId();
    const newProgram: HealthProgram = { ...program, id };

    this._healthPrograms.update(programs => [...programs, newProgram]);
    return id;
  }

  /**
   * Update an existing health program
   */
  updateHealthProgram(id: string, updates: Partial<Omit<HealthProgram, 'id'>>): boolean {
    const programs = this._healthPrograms();
    const index = programs.findIndex(program => program.id === id);

    if (index === -1) return false;

    const updatedPrograms = [...programs];
    updatedPrograms[index] = { ...updatedPrograms[index], ...updates };
    this._healthPrograms.set(updatedPrograms);

    return true;
  }

  /**
   * Remove a health program
   */
  removeHealthProgram(id: string): boolean {
    const programs = this._healthPrograms();
    const filteredPrograms = programs.filter(program => program.id !== id);

    if (filteredPrograms.length === programs.length) return false;

    this._healthPrograms.set(filteredPrograms);
    return true;
  }

  /**
   * Add a new organizational level
   */
  addOrganizationalLevel(level: Omit<OrganizationalLevel, 'id'> & { id?: string }): string {
    const id = level.id || this.generateId();
    const newLevel: OrganizationalLevel = { ...level, id };

    this._organizationalLevels.update(levels => [...levels, newLevel]);
    return id;
  }

  /**
   * Update an existing organizational level
   */
  updateOrganizationalLevel(id: string, updates: Partial<Omit<OrganizationalLevel, 'id'>>): boolean {
    const levels = this._organizationalLevels();
    const index = levels.findIndex(level => level.id === id);

    if (index === -1) return false;

    const updatedLevels = [...levels];
    updatedLevels[index] = { ...updatedLevels[index], ...updates };
    this._organizationalLevels.set(updatedLevels);

    return true;
  }

  /**
   * Remove an organizational level
   */
  removeOrganizationalLevel(id: string): boolean {
    const levels = this._organizationalLevels();
    const filteredLevels = levels.filter(level => level.id !== id);

    if (filteredLevels.length === levels.length) return false;

    this._organizationalLevels.set(filteredLevels);
    return true;
  }

  /**
   * Add a new department
   */
  addDepartment(department: Omit<Department, 'id'> & { id?: string }): string {
    const id = department.id || this.generateId();
    const newDepartment: Department = { ...department, id };

    this._departments.update(departments => [...departments, newDepartment]);
    return id;
  }

  /**
   * Update an existing department
   */
  updateDepartment(id: string, updates: Partial<Omit<Department, 'id'>>): boolean {
    const departments = this._departments();
    const index = departments.findIndex(dept => dept.id === id);

    if (index === -1) return false;

    const updatedDepartments = [...departments];
    updatedDepartments[index] = { ...updatedDepartments[index], ...updates };
    this._departments.set(updatedDepartments);

    return true;
  }

  /**
   * Remove a department
   */
  removeDepartment(id: string): boolean {
    const departments = this._departments();
    const filteredDepartments = departments.filter(dept => dept.id !== id);

    if (filteredDepartments.length === departments.length) return false;

    this._departments.set(filteredDepartments);
    return true;
  }

  /**
   * Load organization data from external source
   */
  async loadOrganizationData(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      // Simulate API call - replace with actual HTTP request
      await this.delay(1000);

      // In a real implementation, you would fetch data from an API
      // const response = await this.http.get<OrganizationData>('/api/organization').toPromise();
      // this.updateFromExternalData(response);

    } catch (error) {
      this._error.set(
        error instanceof Error ? error.message : 'Failed to load organization data',
      );
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Update organization data from external source
   */
  updateFromExternalData(data: {
    healthPrograms?: HealthProgram[];
    organizationalLevels?: OrganizationalLevel[];
    departments?: Department[];
  }): void {
    if (data.healthPrograms) {
      this._healthPrograms.set(data.healthPrograms);
    }

    if (data.organizationalLevels) {
      this._organizationalLevels.set(data.organizationalLevels);
    }

    if (data.departments) {
      this._departments.set(data.departments);
    }
  }

  /**
   * Reset to default values
   */
  resetToDefaults(): void {
    // Reset to initial values - you might want to store these separately
    this.loadDefaultData();
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this._error.set(null);
  }

  // Private helper methods
  private generateId(): string {
    return 'org_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private loadDefaultData(): void {
    // This method would reset to the initial default data
    // Implementation depends on how you want to handle defaults
  }
}
