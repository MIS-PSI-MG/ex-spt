import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

export interface IdGeneratorConfig {
  prefix?: string;
  suffix?: string;
  includeTimestamp?: boolean;
  customSeparator?: string;
}

@Injectable({
  providedIn: 'root',
})
export class IdGeneratorService {
  private readonly defaultSeparator = '_';

  /**
   * Generate a UUID v4
   */
  generateUuid(): string {
    return uuidv4();
  }

  /**
   * Generate a checklist ID
   */
  generateChecklistId(): string {
    return this.generateWithPrefix('checklist');
  }

  /**
   * Generate a section ID
   */
  generateSectionId(): string {
    return this.generateWithPrefix('section');
  }

  /**
   * Generate a question ID
   */
  generateQuestionId(): string {
    return this.generateWithPrefix('question');
  }

  /**
   * Generate a sub-question ID
   */
  generateSubQuestionId(): string {
    return this.generateWithPrefix('subquestion');
  }

  /**
   * Generate a data point ID
   */
  generateDataPointId(): string {
    return this.generateWithPrefix('datapoint');
  }

  /**
   * Generate an assessment ID
   */
  generateAssessmentId(): string {
    return this.generateWithPrefix('assessment');
  }

  /**
   * Generate an ID with a specific prefix
   */
  generateWithPrefix(prefix: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}${this.defaultSeparator}${timestamp}${this.defaultSeparator}${random}`;
  }

  /**
   * Generate a custom ID with configuration
   */
  generateCustomId(config: IdGeneratorConfig = {}): string {
    const {
      prefix = '',
      suffix = '',
      includeTimestamp = true,
      customSeparator = this.defaultSeparator,
    } = config;

    const parts: string[] = [];

    if (prefix) {
      parts.push(prefix);
    }

    if (includeTimestamp) {
      parts.push(Date.now().toString(36));
    }

    // Add random component
    parts.push(Math.random().toString(36).substr(2, 8));

    if (suffix) {
      parts.push(suffix);
    }

    return parts.join(customSeparator);
  }

  /**
   * Generate a short ID (8 characters)
   */
  generateShortId(): string {
    return Math.random().toString(36).substr(2, 8);
  }

  /**
   * Generate a numeric ID
   */
  generateNumericId(): string {
    return Date.now().toString() + Math.random().toString().substr(2, 4);
  }

  /**
   * Generate a sequential ID with prefix
   */
  generateSequentialId(prefix: string, counter: number): string {
    const paddedCounter = counter.toString().padStart(4, '0');
    return `${prefix}${this.defaultSeparator}${paddedCounter}`;
  }

  /**
   * Validate ID format
   */
  validateId(id: string, expectedPrefix?: string): boolean {
    if (!id || typeof id !== 'string') {
      return false;
    }

    // Basic validation - ID should not be empty and should contain valid characters
    const validIdPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validIdPattern.test(id)) {
      return false;
    }

    // If prefix is expected, validate it
    if (expectedPrefix) {
      return id.startsWith(expectedPrefix + this.defaultSeparator);
    }

    return true;
  }

  /**
   * Extract prefix from ID
   */
  extractPrefix(id: string): string | null {
    if (!id || typeof id !== 'string') {
      return null;
    }

    const parts = id.split(this.defaultSeparator);
    return parts.length > 1 ? parts[0] : null;
  }

  /**
   * Extract timestamp from ID (if present)
   */
  extractTimestamp(id: string): Date | null {
    if (!id || typeof id !== 'string') {
      return null;
    }

    const parts = id.split(this.defaultSeparator);
    if (parts.length < 2) {
      return null;
    }

    try {
      // Try to parse the second part as a base36 timestamp
      const timestamp = parseInt(parts[1], 36);
      if (isNaN(timestamp)) {
        return null;
      }

      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  /**
   * Check if two IDs have the same prefix
   */
  haveSamePrefix(id1: string, id2: string): boolean {
    const prefix1 = this.extractPrefix(id1);
    const prefix2 = this.extractPrefix(id2);

    return prefix1 !== null && prefix2 !== null && prefix1 === prefix2;
  }

  /**
   * Generate a batch of IDs
   */
  generateBatch(count: number, prefix?: string): string[] {
    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      if (prefix) {
        ids.push(this.generateWithPrefix(prefix));
      } else {
        ids.push(this.generateUuid());
      }
    }
    return ids;
  }

  /**
   * Ensure ID uniqueness within a collection
   */
  ensureUnique(proposedId: string, existingIds: string[]): string {
    let uniqueId = proposedId;
    let counter = 1;

    while (existingIds.includes(uniqueId)) {
      const baseParts = proposedId.split(this.defaultSeparator);
      if (baseParts.length > 1) {
        // Remove the last part and add counter
        baseParts[baseParts.length - 1] = counter.toString().padStart(3, '0');
        uniqueId = baseParts.join(this.defaultSeparator);
      } else {
        uniqueId = `${proposedId}${this.defaultSeparator}${counter.toString().padStart(3, '0')}`;
      }
      counter++;
    }

    return uniqueId;
  }
}
