import type { CounterState, CounterOperation, HistoryEntry } from '../types/index';

const MAX_HISTORY = 10;

/**
 * Applies a counter operation to the given state and returns a new state.
 * Never mutates the previous state — always returns a new object.
 *
 * - 'increment' → value + 1
 * - 'decrement' → value - 1
 * - 'reset'     → value = 0
 *
 * Appends a HistoryEntry for the operation and keeps at most 10 entries
 * (oldest entries are discarded when the limit is exceeded).
 */
export function applyOperation(
  state: CounterState,
  op: CounterOperation
): CounterState {
  let newValue: number;

  switch (op) {
    case 'increment':
      newValue = state.value + 1;
      break;
    case 'decrement':
      newValue = state.value - 1;
      break;
    case 'reset':
      newValue = 0;
      break;
  }

  const newEntry: HistoryEntry = { operation: op, result: newValue };

  // Build new history: append entry, then keep only the last MAX_HISTORY entries.
  // Use slice to avoid mutating the original array.
  const newHistory = [...state.history, newEntry].slice(-MAX_HISTORY);

  return {
    value: newValue,
    history: newHistory,
  };
}
