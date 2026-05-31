// Shared TypeScript types for argocd-demo-dashboard

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: number; // Unix timestamp ms
}

export type CounterOperation = 'increment' | 'decrement' | 'reset';

export interface HistoryEntry {
  operation: CounterOperation;
  result: number;
}

export interface CounterState {
  value: number;
  history: HistoryEntry[]; // máximo 10 entradas, las más recientes
}

export type Theme = 'light' | 'dark';

export interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

export type RouteKey = 'home' | 'tasks' | 'counter' | 'editor';

export interface Route {
  key: RouteKey;
  hash: string;   // e.g. '#/tasks'
  label: string;  // e.g. 'Tareas'
}
