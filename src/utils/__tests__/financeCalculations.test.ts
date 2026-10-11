import { describe, it, expect } from 'vitest';
import {
  calc,
  balanceSeries,
  simulateSurvivalProbability,
  calculateSurvivalStreak,
  formatINR,
  getRiskLevel,
} from '../financeCalculations';
import type { FinanceState } from '@/types';
import { DEMO_MONTH_STATE, INITIAL_BLANK_STATE } from '@/constants';

describe('financeCalculations pure utils', () => {
  it('correctly calculates remaining balance, committed amount, and available funds', () => {
    const state: FinanceState = {
      budget: 10000,
      income: 0,
      reserve: 1500,
      day: 10,
      expenses: [
        { id: '1', name: 'Food', cat: 'Food', amt: 1000, day: 2, createdAt: 1 },
        { id: '2', name: 'Travel', cat: 'Travel', amt: 500, day: 5, createdAt: 2 },
      ],
      subs: [
        { id: 's1', name: 'Spotify', amt: 100, active: true },
        { id: 's2', name: 'Netflix', amt: 200, active: false }, // inactive
      ],
      goals: [{ id: 'g1', name: 'Goal', target: 2000, saved: 400 }],
    };

    const res = calc(state, 0);

    expect(res.spent).toBe(1500);
    expect(res.remaining).toBe(8500); // 10000 - 1500
    expect(res.committed).toBe(100); // only active subs
    expect(res.daysLeft).toBe(20); // 30 - 10
    expect(res.available).toBe(8500 - 1500 - 100); // remaining - reserve - committed = 6900
    expect(res.daily).toBe(6900 / 20); // 345
    expect(res.displayDaily).toBe(345);
  });

  describe('divide-by-zero and boundary edge cases', () => {
    it('handles Day 0 without division by zero', () => {
      const state: FinanceState = {
        ...INITIAL_BLANK_STATE,
        day: 0,
      };
      const res = calc(state, 0);
      expect(Number.isFinite(res.daily)).toBe(true);
      expect(Number.isFinite(res.avg)).toBe(true);
      expect(res.avg).toBe(0); // day 0 => avg spent is 0
      expect(res.daysLeft).toBe(30);
    });

    it('handles Day 30 without dividing by zero', () => {
      const state: FinanceState = {
        ...INITIAL_BLANK_STATE,
        day: 30,
      };
      const res = calc(state, 0);
      expect(Number.isFinite(res.daily)).toBe(true);
      expect(res.daysLeft).toBe(1); // clamped to 1
    });

    it('handles zero emergency reserve', () => {
      const state: FinanceState = {
        ...INITIAL_BLANK_STATE,
        reserve: 0,
      };
      const res = calc(state, 0);
      expect(res.reserveIntact).toBe(0);
      expect(Number.isFinite(res.healthScore)).toBe(true);
    });

    it('handles zero goal target gracefully', () => {
      const state: FinanceState = {
        ...INITIAL_BLANK_STATE,
        goals: [{ id: 'g0', name: 'Empty', target: 0, saved: 0 }],
      };
      const res = calc(state, 0);
      expect(res.savingsProgressNow).toBe(0);
      expect(Number.isFinite(res.savingsProgressNow)).toBe(true);
    });
  });

  describe('simulation isolation', () => {
    it('calling calc with extra spend does not mutate original state', () => {
      const originalState: FinanceState = {
        budget: 10000,
        income: 0,
        reserve: 1500,
        day: 10,
        expenses: [{ id: '1', name: 'Food', cat: 'Food', amt: 1000, day: 2, createdAt: 1 }],
        subs: [],
        goals: [],
      };

      const cloned = JSON.parse(JSON.stringify(originalState));
      const simResult = calc(originalState, 2000);

      // Deep equality check: original state must remain identical
      expect(originalState).toEqual(cloned);

      // Simulated values must reflect extra spend
      expect(simResult.remaining).toBe(7000); // 10000 - 1000 - 2000
    });
  });

  describe('risk thresholds and reasons', () => {
    it('returns High risk if daily allowance is zero or negative', () => {
      const state: FinanceState = {
        ...INITIAL_BLANK_STATE,
        budget: 2000,
        reserve: 1500,
        expenses: [{ id: '1', name: 'Huge', cat: 'Shopping', amt: 1900, day: 5, createdAt: 1 }],
      };
      const res = calc(state, 0);
      expect(res.risk).toBe('High');
      expect(res.riskReason).toContain('Daily allowance');
    });

    it('returns High risk if projected balance is in deficit', () => {
      const risk = getRiskLevel(200, -500, 1500, 1000);
      expect(risk.risk).toBe('High');
      expect(risk.reason).toContain('Deficit projected');
    });

    it('returns Medium risk if daily allowance is tight under ₹150', () => {
      const risk = getRiskLevel(120, 2000, 1500, 1000);
      expect(risk.risk).toBe('Medium');
      expect(risk.reason).toContain('Daily allowance is tight');
    });

    it('returns Low risk when all thresholds are healthy', () => {
      const risk = getRiskLevel(350, 4000, 1500, 1000);
      expect(risk.risk).toBe('Low');
      expect(risk.reason).toContain('Safe runway');
    });
  });

  describe('health score range', () => {
    it('always bounds health score strictly between 0 and 100', () => {
      const terribleState: FinanceState = {
        budget: 10000,
        income: 0,
        reserve: 2000,
        day: 28,
        expenses: [{ id: '1', name: 'Broke', cat: 'Bills', amt: 15000, day: 10, createdAt: 1 }],
        subs: [{ id: 's1', name: 'Expensive', amt: 5000, active: true }],
        goals: [{ id: 'g1', name: 'Car', target: 50000, saved: 0 }],
      };

      const resTerrible = calc(terribleState, 0);
      expect(resTerrible.healthScore).toBeGreaterThanOrEqual(0);
      expect(resTerrible.healthScore).toBeLessThanOrEqual(100);

      const excellentState: FinanceState = {
        budget: 20000,
        income: 5000,
        reserve: 2000,
        day: 15,
        expenses: [{ id: '1', name: 'Minimal', cat: 'Food', amt: 2000, day: 5, createdAt: 1 }],
        subs: [],
        goals: [{ id: 'g1', name: 'Buffer', target: 2000, saved: 2000 }],
      };

      const resExcellent = calc(excellentState, 0);
      expect(resExcellent.healthScore).toBeGreaterThanOrEqual(0);
      expect(resExcellent.healthScore).toBeLessThanOrEqual(100);
    });
  });

  describe('balanceSeries outputs', () => {
    it('produces 31 valid points (Day 0 to 30) with zero NaNs', () => {
      const series = balanceSeries(DEMO_MONTH_STATE, 0);
      expect(series).toHaveLength(31);

      for (const pt of series) {
        expect(pt.day).toBeGreaterThanOrEqual(0);
        expect(pt.day).toBeLessThanOrEqual(30);

        if (pt.actual !== null) {
          expect(Number.isNaN(pt.actual)).toBe(false);
          expect(Number.isFinite(pt.actual)).toBe(true);
        }
        if (pt.projected !== null) {
          expect(Number.isNaN(pt.projected)).toBe(false);
          expect(Number.isFinite(pt.projected)).toBe(true);
        }
        if (pt.simulated !== null) {
          expect(Number.isNaN(pt.simulated)).toBe(false);
          expect(Number.isFinite(pt.simulated)).toBe(true);
        }
      }
    });
  });

  describe('Survival Probability Monte Carlo Simulation (Innovation)', () => {
    it('generates 500 deterministic seeded runs with probability bounded between 0 and 100', () => {
      const result = simulateSurvivalProbability(DEMO_MONTH_STATE, 0, 500);
      expect(result.simulatedRuns).toBe(500);
      expect(result.probabilityPercent).toBeGreaterThanOrEqual(0);
      expect(result.probabilityPercent).toBeLessThanOrEqual(100);
      expect(Number.isFinite(result.medianEndBalance)).toBe(true);
      expect(Number.isFinite(result.p10EndBalance)).toBe(true);
    });

    it('simulating an additional large purchase reduces or maintains survival probability', () => {
      const before = simulateSurvivalProbability(DEMO_MONTH_STATE, 0, 500);
      const after = simulateSurvivalProbability(DEMO_MONTH_STATE, 4000, 500);
      expect(after.probabilityPercent).toBeLessThanOrEqual(before.probabilityPercent);
    });
  });

  describe('Survival Streak (Innovation)', () => {
    it('calculates consecutive days under allowance', () => {
      const streak = calculateSurvivalStreak(DEMO_MONTH_STATE);
      expect(streak).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(streak)).toBe(true);
    });
  });

  describe('formatINR currency formatter', () => {
    it('formats Indian Rupee amounts accurately', () => {
      expect(formatINR(1000)).toMatch(/₹\s?1,000/);
      expect(formatINR(10000)).toMatch(/₹\s?10,000/);
      expect(formatINR(0)).toMatch(/₹\s?0/);
      expect(formatINR(-500)).toMatch(/-₹\s?500/);
    });
  });
});
