import { describe, it, expect } from 'vitest';
import { financeReducer } from '../FinanceContext';
import { INITIAL_BLANK_STATE, DEMO_MONTH_STATE } from '@/constants';
import type { FinanceState, Expense } from '@/types';

describe('financeReducer actions', () => {
  it('ADD_EXPENSE sanitizes inputs and prepends new expense to ledger', () => {
    const initialState = INITIAL_BLANK_STATE;
    const nextState = financeReducer(initialState, {
      type: 'ADD_EXPENSE',
      payload: { name: '  Chai and Samosa  ', amt: 50, cat: 'Food', day: 3 },
    });

    expect(nextState.expenses).toHaveLength(1);
    expect(nextState.expenses[0]?.name).toBe('Chai and Samosa');
    expect(nextState.expenses[0]?.amt).toBe(50);
    expect(nextState.expenses[0]?.cat).toBe('Food');
    expect(nextState.expenses[0]?.day).toBe(3);
  });

  it('ADD_EXPENSE rejects empty name, NaN, or non-positive amounts', () => {
    const initialState = INITIAL_BLANK_STATE;
    const res1 = financeReducer(initialState, {
      type: 'ADD_EXPENSE',
      payload: { name: '   ', amt: 50, cat: 'Food' },
    });
    expect(res1.expenses).toHaveLength(0);

    const res2 = financeReducer(initialState, {
      type: 'ADD_EXPENSE',
      payload: { name: 'Item', amt: -100, cat: 'Food' },
    });
    expect(res2.expenses).toHaveLength(0);

    const res3 = financeReducer(initialState, {
      type: 'ADD_EXPENSE',
      payload: { name: 'Item', amt: NaN, cat: 'Food' },
    });
    expect(res3.expenses).toHaveLength(0);
  });

  it('DELETE_EXPENSE removes targeted item from expenses list', () => {
    const state: FinanceState = {
      ...INITIAL_BLANK_STATE,
      expenses: [
        { id: 'exp-1', name: 'Meal', amt: 200, cat: 'Food', day: 1, createdAt: 1 },
        { id: 'exp-2', name: 'Auto', amt: 100, cat: 'Travel', day: 1, createdAt: 2 },
      ],
    };

    const nextState = financeReducer(state, {
      type: 'DELETE_EXPENSE',
      payload: { id: 'exp-1' },
    });

    expect(nextState.expenses).toHaveLength(1);
    expect(nextState.expenses[0]?.id).toBe('exp-2');
  });

  it('RESTORE_EXPENSE restores previously deleted expense (undo)', () => {
    const deletedExp: Expense = {
      id: 'exp-1',
      name: 'Restored Item',
      amt: 200,
      cat: 'Food',
      day: 1,
      createdAt: 1,
    };
    const nextState = financeReducer(INITIAL_BLANK_STATE, {
      type: 'RESTORE_EXPENSE',
      payload: { expense: deletedExp },
    });

    expect(nextState.expenses).toHaveLength(1);
    expect(nextState.expenses[0]?.name).toBe('Restored Item');
  });

  it('ADD_SAVINGS logs a Savings expense and increments goal saved amount', () => {
    const state: FinanceState = {
      ...INITIAL_BLANK_STATE,
      day: 5,
      goals: [{ id: 'goal-1', name: 'Goa Trip', target: 5000, saved: 1000 }],
    };

    const nextState = financeReducer(state, {
      type: 'ADD_SAVINGS',
      payload: { goalId: 'goal-1', amount: 500 },
    });

    // 1. Goal updated
    const updatedGoal = nextState.goals.find((g) => g.id === 'goal-1');
    expect(updatedGoal?.saved).toBe(1500);

    // 2. Real ledger contains corresponding Savings transaction
    expect(nextState.expenses).toHaveLength(1);
    expect(nextState.expenses[0]?.cat).toBe('Savings');
    expect(nextState.expenses[0]?.amt).toBe(500);
    expect(nextState.expenses[0]?.name).toContain('Goa Trip');
    expect(nextState.expenses[0]?.day).toBe(5);
  });

  it('TOGGLE_SUBSCRIPTION toggles subscription active flag', () => {
    const state: FinanceState = {
      ...INITIAL_BLANK_STATE,
      subs: [{ id: 'sub-1', name: 'Netflix', amt: 199, active: true }],
    };

    const toggledOff = financeReducer(state, {
      type: 'TOGGLE_SUBSCRIPTION',
      payload: { id: 'sub-1' },
    });
    expect(toggledOff.subs[0]?.active).toBe(false);

    const toggledOn = financeReducer(toggledOff, {
      type: 'TOGGLE_SUBSCRIPTION',
      payload: { id: 'sub-1' },
    });
    expect(toggledOn.subs[0]?.active).toBe(true);
  });

  it('UPDATE_SETTINGS clamps and validates day, budget, reserve, and income', () => {
    const state = INITIAL_BLANK_STATE;
    const nextState = financeReducer(state, {
      type: 'UPDATE_SETTINGS',
      payload: { day: 35, budget: 15000, reserve: 2500 },
    });

    expect(nextState.day).toBe(29); // clamped to 29
    expect(nextState.budget).toBe(15000);
    expect(nextState.reserve).toBe(2500);
  });

  it('LOAD_DEMO and RESET_BLANK restore predefined states', () => {
    const state = INITIAL_BLANK_STATE;
    const demo = financeReducer(state, { type: 'LOAD_DEMO' });
    expect(demo.day).toBe(DEMO_MONTH_STATE.day);
    expect(demo.expenses.length).toBeGreaterThan(0);

    const blank = financeReducer(demo, { type: 'RESET_BLANK' });
    expect(blank.expenses).toHaveLength(0);
    expect(blank.day).toBe(1);
  });

  it('EDIT_EXPENSE updates existing expense attributes accurately', () => {
    const state: FinanceState = {
      ...INITIAL_BLANK_STATE,
      expenses: [
        { id: 'exp-1', name: 'Original', amt: 100, cat: 'Food', day: 2, createdAt: 100 },
      ],
    };

    const nextState = financeReducer(state, {
      type: 'EDIT_EXPENSE',
      payload: {
        id: 'exp-1',
        updates: {
          name: 'Updated Groceries',
          amt: 250,
          cat: 'Shopping',
          day: 5,
          description: 'Supermarket purchase',
        },
      },
    });

    expect(nextState.expenses).toHaveLength(1);
    expect(nextState.expenses[0]?.name).toBe('Updated Groceries');
    expect(nextState.expenses[0]?.amt).toBe(250);
    expect(nextState.expenses[0]?.cat).toBe('Shopping');
    expect(nextState.expenses[0]?.day).toBe(5);
    expect(nextState.expenses[0]?.description).toBe('Supermarket purchase');
  });

  it('ADD_INCOME and DELETE_INCOME manage additional income inflows', () => {
    const state = INITIAL_BLANK_STATE;
    const withIncome = financeReducer(state, {
      type: 'ADD_INCOME',
      payload: {
        source: 'Freelance Design',
        amt: 3000,
        day: 10,
        description: 'Logo commission',
      },
    });

    expect(withIncome.incomes).toHaveLength(1);
    expect(withIncome.incomes?.[0]?.source).toBe('Freelance Design');
    expect(withIncome.incomes?.[0]?.amt).toBe(3000);
    expect(withIncome.incomes?.[0]?.day).toBe(10);

    const incomeId = withIncome.incomes![0]!.id;
    const deletedIncome = financeReducer(withIncome, {
      type: 'DELETE_INCOME',
      payload: { id: incomeId },
    });

    expect(deletedIncome.incomes).toHaveLength(0);
  });

  it('ADD_SUBSCRIPTION supports monthly and yearly billing frequencies', () => {
    const state = INITIAL_BLANK_STATE;
    const withAnnualSub = financeReducer(state, {
      type: 'ADD_SUBSCRIPTION',
      payload: {
        name: 'Gym Membership',
        amt: 6000,
        frequency: 'yearly',
        nextPaymentDate: 'Day 28',
      },
    });

    const sub = withAnnualSub.subs.find((s) => s.name === 'Gym Membership');
    expect(sub).toBeDefined();
    expect(sub?.amt).toBe(6000);
    expect(sub?.frequency).toBe('yearly');
    expect(sub?.nextPaymentDate).toBe('Day 28');
    expect(sub?.active).toBe(true);
  });
});
