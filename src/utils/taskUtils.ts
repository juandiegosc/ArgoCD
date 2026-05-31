import type { TaskStatus } from '../types/index';

/**
 * Advances a task's status along the sequence:
 *   "todo" → "in-progress" → "done"
 * "done" is a terminal state and remains "done".
 *
 * Validates: Requirements 3.3
 */
export function advanceStatus(current: TaskStatus): TaskStatus {
  switch (current) {
    case 'todo':
      return 'in-progress';
    case 'in-progress':
      return 'done';
    case 'done':
      return 'done';
  }
}

/**
 * Generates a unique string ID.
 * Uses crypto.randomUUID() when available, with a fallback to
 * Date.now() combined with Math.random() for environments that
 * do not support the Web Crypto API.
 *
 * Validates: Requirements 3.2
 */
export function generateId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + random suffix
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
