import type { Expense, ExpenseCategory, FinanceState, Subscription, SavingsGoal } from '../types';
import {
  STORAGE_KEY,
  LEGACY_STORAGE_KEYS,
  DEMO_MONTH_STATE,
  EXPENSE_CATEGORIES,
} from '../constants';

const VALID_CATEGORIES = new Set<ExpenseCategory>(EXPENSE_CATEGORIES);

/**
 * Type guard to check if an unknown value is a valid ExpenseCategory.
 */
export function isValidCategory(val: unknown): val is ExpenseCategory {
  return typeof val === 'string' && VALID_CATEGORIES.has(val as ExpenseCategory);
}

/**
 * Validate and sanitize an Expense object.
 */
export function isValidExpense(val: unknown): val is Expense {
  if (typeof val !== 'object' || val === null) return false;
  const e = val as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.name === 'string' &&
    isValidCategory(e.cat) &&
    typeof e.amt === 'number' &&
    Number.isFinite(e.amt) &&
    e.amt > 0 &&
    typeof e.day === 'number' &&
    Number.isFinite(e.day)
  );
}

/**
 * Validate and sanitize a Subscription object.
 */
export function isValidSubscription(val: unknown): val is Subscription {
  if (typeof val !== 'object' || val === null) return false;
  const s = val as Record<string, unknown>;
  return (
    typeof s.id === 'string' &&
    typeof s.name === 'string' &&
    typeof s.amt === 'number' &&
    Number.isFinite(s.amt) &&
    s.amt > 0 &&
    typeof s.active === 'boolean'
  );
}

/**
 * Validate and sanitize a SavingsGoal object.
 */
export function isValidSavingsGoal(val: unknown): val is SavingsGoal {
  if (typeof val !== 'object' || val === null) return false;
  const g = val as Record<string, unknown>;
  return (
    typeof g.id === 'string' &&
    typeof g.name === 'string' &&
    typeof g.target === 'number' &&
    Number.isFinite(g.target) &&
    g.target > 0 &&
    typeof g.saved === 'number' &&
    Number.isFinite(g.saved)
  );
}

/**
 * Robust runtime type guard validating the shape of FinanceState.
 */
export function isValidFinanceState(val: unknown): val is FinanceState {
  if (typeof val !== 'object' || val === null) return false;
  const s = val as Record<string, unknown>;

  const hasNumbers =
    typeof s.budget === 'number' &&
    Number.isFinite(s.budget) &&
    s.budget > 0 &&
    typeof s.reserve === 'number' &&
    Number.isFinite(s.reserve) &&
    typeof s.day === 'number' &&
    Number.isFinite(s.day);

  if (!hasNumbers) return false;

  const hasExpenses = Array.isArray(s.expenses) && s.expenses.every(isValidExpense);
  const hasSubs = Array.isArray(s.subs) && s.subs.every(isValidSubscription);
  const hasGoals = Array.isArray(s.goals) && s.goals.every(isValidSavingsGoal);

  return hasExpenses && hasSubs && hasGoals;
}

/**
 * Migrate legacy stored data into modern valid FinanceState.
 */
export function migrateLegacyState(raw: unknown): FinanceState | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;

  if (typeof r.budget !== 'number' || !Number.isFinite(r.budget)) return null;

  const budget = Math.max(100, Math.round(Number(r.budget)));
  const income =
    typeof r.income === 'number' && Number.isFinite(r.income) ? Math.max(0, r.income) : 0;
  const reserve =
    typeof r.reserve === 'number' && Number.isFinite(r.reserve) ? Math.max(0, r.reserve) : 1500;
  const day =
    typeof r.day === 'number' && Number.isFinite(r.day) ? Math.min(29, Math.max(0, r.day)) : 1;

  const expenses: Expense[] = Array.isArray(r.expenses) ? r.expenses.filter(isValidExpense) : [];

  const subs: Subscription[] = Array.isArray(r.subs) ? r.subs.filter(isValidSubscription) : [];

  let goals: SavingsGoal[] = [];
  if (Array.isArray(r.goals)) {
    goals = r.goals.filter(isValidSavingsGoal);
  } else if (typeof r.goal === 'object' && r.goal !== null) {
    const singleGoal = r.goal as Record<string, unknown>;
    goals = [
      {
        id: 'goal-migrated',
        name: typeof singleGoal.name === 'string' ? singleGoal.name : 'Emergency Buffer',
        target: typeof singleGoal.target === 'number' ? Math.max(1, singleGoal.target) : 2000,
        saved: typeof singleGoal.saved === 'number' ? Math.max(0, singleGoal.saved) : 0,
      },
    ];
  }

  if (goals.length === 0) {
    goals = DEMO_MONTH_STATE.goals;
  }

  return { budget, income, reserve, day, expenses, subs, goals };
}

/**
 * Load and validate state from LocalStorage with versioning, legacy migration,
 * and corrupt-data protection.
 */
export function loadFinanceState(): FinanceState {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEMO_MONTH_STATE;
  }

  try {
    // 1. Try modern versioned key
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValidFinanceState(parsed)) {
        return parsed;
      }
      const migrated = migrateLegacyState(parsed);
      if (migrated) return migrated;
    }

    // 2. Try legacy keys
    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      const legacyRaw = localStorage.getItem(legacyKey);
      if (legacyRaw) {
        try {
          const parsed = JSON.parse(legacyRaw);
          const migrated = migrateLegacyState(parsed);
          if (migrated) {
            // Persist migrated format to new versioned key
            saveFinanceState(migrated);
            return migrated;
          }
        } catch {
          // Ignore legacy corrupt json
        }
      }
    }
  } catch (err) {
    console.warn('LocalStorage parse failed gracefully. Falling back to demo data:', err);
  }

  return DEMO_MONTH_STATE;
}

/**
 * Save FinanceState to LocalStorage safely.
 */
export function saveFinanceState(state: FinanceState): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
    return false;
  }
}

/**
 * Export finance state to JSON string.
 */
export function exportStateToJson(state: FinanceState): string {
  return JSON.stringify(state, null, 2);
}

/**
 * Export expenses to CSV string.
 */
export function exportExpensesToCsv(state: FinanceState): string {
  const headers = ['id', 'name', 'category', 'amount', 'day', 'created_at'];
  const rows = (state.expenses || []).map((e) => [
    `"${e.id}"`,
    `"${e.name.replace(/"/g, '""')}"`,
    `"${e.cat}"`,
    e.amt,
    e.day,
    e.createdAt || 0,
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Parse and validate an imported JSON string into FinanceState.
 */
export function importStateFromJson(jsonStr: string): FinanceState | null {
  try {
    const parsed = JSON.parse(jsonStr);
    if (isValidFinanceState(parsed)) {
      return parsed;
    }
    return migrateLegacyState(parsed);
  } catch {
    return null;
  }
}

/**
 * Convenience alias for importStateFromJson
 */
export const importFromJSON = importStateFromJson;

/**
 * Triggers a browser download of the finance state as JSON file.
 */
export function exportToJSON(state: FinanceState): void {
  const jsonStr = exportStateToJson(state);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bbf-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Triggers a browser download of the expenses as a CSV file.
 */
export function exportToCSV(expenses: Expense[]): void {
  const headers = ['id', 'name', 'category', 'amount', 'day', 'created_at'];
  const rows = expenses.map((e) => [
    `"${e.id}"`,
    `"${e.name.replace(/"/g, '""')}"`,
    `"${e.cat}"`,
    e.amt,
    e.day,
    e.createdAt || 0,
  ]);
  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bbf-expenses-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
