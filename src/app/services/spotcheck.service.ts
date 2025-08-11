import {computed, Injectable, signal} from '@angular/core';
import {v4 as uuidv4} from 'uuid';
import {Checklist, ChecklistInput} from '../interfaces/chk-sctst';

export interface SpotchekFilter {
  departement?: string;
  niveau?: number;
  healthProgram?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SpotchekService {
  // State signals
  private readonly _checklists = signal<Checklist[]>([]);
  // Readonly computed signals
  readonly checklists = this._checklists.asReadonly();
  private readonly _loading = signal<boolean>(false);
  readonly loading = this._loading.asReadonly();
  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();
  private readonly _currentChecklist = signal<Checklist | null>(null);
  readonly currentChecklist = this._currentChecklist.asReadonly();
  private readonly _filter = signal<SpotchekFilter>({});
  readonly filter = this._filter.asReadonly();

  // Filtered checklists computed signal
  readonly filteredChecklists = computed(() => {
    const checklists = this._checklists();
    const filter = this._filter();

    if (!filter.departement && !filter.healthProgram && filter.niveau === undefined) {
      return checklists;
    }

    return checklists.filter((checklist) => {
      const matchesDepartement = !filter.departement || checklist.departement === filter.departement;
      const matchesHealthProgram = !filter.healthProgram || checklist.healthProgram === checklist.healthProgram;
      const matchesNiveau = filter.niveau === undefined || checklist.niveau === filter.niveau;

      return matchesDepartement && matchesHealthProgram && matchesNiveau;
    });
  });

  // CRUD Operations

  /**
   * Load all checklists
   */
  async loadChecklists(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      // Simulate API call
      await this.delay(800);
      const checklists = this.getMockData();
      this._checklists.set(checklists);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load checklists';
      this._error.set(errorMessage);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Get checklist by ID
   */
  async getChecklistById(id: string): Promise<Checklist | null> {
    this._loading.set(true);
    this._error.set(null);

    try {
      await this.delay(500);
      const checklists = this._checklists();
      const checklist = checklists.find(c => c.id === id) || null;
      this._currentChecklist.set(checklist);
      return checklist;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get checklist';
      this._error.set(errorMessage);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Create new checklist
   */
  async createChecklist(input: ChecklistInput): Promise<string> {
    this._loading.set(true);
    this._error.set(null);

    try {
      await this.delay(500);

      const newChecklist: Checklist = {
        ...input,
        id: input.id || uuidv4(),
        healthProgram: input.healthProgram || 'Malaria Control',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0'
      };

      const currentChecklists = this._checklists();
      this._checklists.set([...currentChecklists, newChecklist]);

      return newChecklist.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create checklist';
      this._error.set(errorMessage);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Update existing checklist
   */
  async updateChecklist(id: string, input: ChecklistInput): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      await this.delay(500);

      const currentChecklists = this._checklists();
      const index = currentChecklists.findIndex(c => c.id === id);

      if (index === -1) {
        throw new Error('Checklist not found');
      }

      const existingChecklist = currentChecklists[index];
      const updatedChecklist: Checklist = {
        ...input,
        id,
        createdAt: existingChecklist.createdAt,
        updatedAt: new Date(),
        version: this.incrementVersion(existingChecklist.version || '1.0')
      };

      const updatedChecklists = [...currentChecklists];
      updatedChecklists[index] = updatedChecklist;
      this._checklists.set(updatedChecklists);

      // Update current checklist if it's the one being edited
      if (this._currentChecklist()?.id === id) {
        this._currentChecklist.set(updatedChecklist);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update checklist';
      this._error.set(errorMessage);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Delete checklist
   */
  async deleteChecklist(id: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      await this.delay(500);

      const currentChecklists = this._checklists();
      const filteredChecklists = currentChecklists.filter(c => c.id !== id);

      if (filteredChecklists.length === currentChecklists.length) {
        throw new Error('Checklist not found');
      }

      this._checklists.set(filteredChecklists);

      // Clear current checklist if it was deleted
      if (this._currentChecklist()?.id === id) {
        this._currentChecklist.set(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete checklist';
      this._error.set(errorMessage);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Set current checklist
   */
  setCurrentChecklist(checklist: Checklist | null): void {
    this._currentChecklist.set(checklist);
  }

  /**
   * Update filter
   */
  updateFilter(filter: Partial<SpotchekFilter>): void {
    this._filter.update(current => ({...current, ...filter}));
  }

  /**
   * Clear filter
   */
  clearFilter(): void {
    this._filter.set({});
  }

  /**
   * Clear error
   */
  clearError(): void {
    this._error.set(null);
  }

  // Private helper methods
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0', 10) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  /**
   * Mock data based on init.data.ts structure
   */
  private getMockData(): Checklist[] {
    return [
      {
        id: "01",
        departement: "DPAL",
        healthProgram: "Malaria Control Program",
        niveau: 6,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        version: '1.0',
        sections: [
          {
            title: "Ressources humaines",
            maxScore: 6,
            score: Number, // Changed to Number constructor
            questions: [ // Moved questions to the section level
              {
                question: "1. Agent communautaire formé aux protocoles de prise en charge du paludisme",
                score: "NA"
              },
              {
                question: "2. AC formé en test de diagnostic rapide du paludisme",
                score: true
              },
              {
                question: "3. AC formé sur la communication dans la lutte contre paludisme",
                score: true
              },
              {
                subquestion: {
                  q: "4. Est-ce que l'AC est en possession des documents cadres ",
                  sq: [] // Add appropriate subquestions here
                }
              }
            ]
          }
        ]
      }
    ];
  }
}
