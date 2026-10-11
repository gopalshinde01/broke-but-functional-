import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadFinanceState,
  saveFinanceState,
  isValidFinanceState,
  isValidExpense,
  migrateLegacyState,
  exportStateToJson,
  exportExpensesToCsv,
  importStateFromJson,
} from '../storage';
import { DEMO_MONTH_STATE, STORAGE_KEY } from '@/constants';
import type { FinanceState } from '@/types';

describe('storage and data sanitization utils', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('localStorage corruption safety and graceful fallback', () => {
    it('returns DEMO_MONTH_STATE when localStorage key has corrupted JSON', () => {
      localStorage.setItem(STORAGE_KEY, '{bad json corrupted content');
      const loaded = loadFinanceState();
      expect(loaded).toBeDefined();
      expect(loaded.budget).toBe(DEMO_MONTH_STATE.budget);
      expect(loaded.expenses.length).toBeGreaterThan(0);
    });

    it('returns DEMO_MONTH_STATE when localStorage value is an invalid data shape', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ random: 'data', budget: 'invalid_string' })
      );
      const loaded = loadFinanceState();
      expect(loaded).toBeDefined();
      expect(loaded.budget).toBe(DEMO_MONTH_STATE.budget);
    });

    it('successfully persists and re-reads valid state without loss', () => {
      const stateToSave: FinanceState = {
        budget: 12000,
        income: 2000,
        reserve: 2000,
        day: 5,
        expenses: [{ id: 'e1', name: 'Coffee', cat: 'Food', amt: 120, day: 2, createdAt: 12345 }],
        subs: [],
        goals: [{ id: 'g1', name: 'Trip', target: 5000, saved: 1000 }],
      };

      const saved = saveFinanceState(stateToSave);
      expect(saved).toBe(true);

      const loaded = loadFinanceState();
      expect(loaded.budget).toBe(12000);
      expect(loaded.expenses[0]?.name).toBe('Coffee');
    });
  });

  describe('migration of legacy keys', () => {
    it('migrates from broke_but_functional_v2 legacy key and saves to bbf:v2', () => {
      const legacy = {
        budget: 10000,
        day: 8,
        reserve: 1500,
        income: 0,
        expenses: [],
        subs: [],
        goal: { name: 'Old Goal', target: 2000, saved: 500 }, // legacy single goal format
      };
      localStorage.setItem('broke_but_functional_v2', JSON.stringify(legacy));

      const migrated = loadFinanceState();
      expect(migrated.goals).toHaveLength(1);
      expect(migrated.goals[0]?.name).toBe('Old Goal');
      expect(localStorage.getItem(STORAGE_KEY)).toBeDefined();
    });

    it('directly converts legacy single goal into goals array via migrateLegacyState', () => {
      const legacyRaw = {
        budget: 9000,
        day: 10,
        reserve: 1000,
        income: 0,
        expenses: [],
        subs: [],
        goal: { name: 'Direct Legacy', target: 3000, saved: 1000 },
      };
      const res = migrateLegacyState(legacyRaw);
      expect(res).not.toBeNull();
      expect(res?.goals[0]?.name).toBe('Direct Legacy');
    });
  });

  describe('export and import data', () => {
    it('exports and re-imports valid JSON round-trip', () => {
      const jsonStr = exportStateToJson(DEMO_MONTH_STATE);
      expect(typeof jsonStr).toBe('string');

      const reimported = importStateFromJson(jsonStr);
      expect(reimported).not.toBeNull();
      expect(reimported?.budget).toBe(DEMO_MONTH_STATE.budget);
      expect(reimported?.expenses.length).toBe(DEMO_MONTH_STATE.expenses.length);
    });

    it('rejects corrupt JSON strings during import and returns null', () => {
      const res = importStateFromJson('{"corrupt": true');
      expect(res).toBeNull();
    });

    it('exports CSV spreadsheet string with correct headers', () => {
      const csvStr = exportExpensesToCsv(DEMO_MONTH_STATE);
      expect(csvStr).toContain('id,name,category,amount,day,created_at');
      expect(csvStr).toContain('Mess + canteen');
    });
  });

  describe('runtime type guards', () => {
    it('isValidExpense rejects invalid objects', () => {
      expect(isValidExpense(null)).toBe(false);
      expect(isValidExpense({})).toBe(false);
      expect(isValidExpense({ id: '1', name: 'Test', cat: 'Food', amt: -10, day: 1 })).toBe(false);
      expect(
        isValidExpense({ id: '1', name: 'Test', cat: 'InvalidCategory', amt: 10, day: 1 })
      ).toBe(false);
    });

    it('isValidFinanceState validates conforming state', () => {
      expect(isValidFinanceState(DEMO_MONTH_STATE)).toBe(true);
      expect(isValidFinanceState({ budget: 10000 })).toBe(false);
    });
  });
});
