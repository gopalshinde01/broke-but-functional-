import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FinanceState,
  Expense,
  ExpenseCategory,
  CalculationResult,
  BalancePoint
} from '../types/finance';
import { INITIAL_BLANK_STATE, DEMO_MONTH_STATE } from '../data/seedData';
import { calc, balanceSeries } from '../utils/financeCalculations';

const STORAGE_KEY = 'broke_but_functional_v2';

function loadStoredState(): FinanceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEMO_MONTH_STATE; // start with demo or blank
    const parsed = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof parsed.budget === 'number' &&
      Array.isArray(parsed.expenses)
    ) {
      // Graceful migration if old state had single goal
      if (!Array.isArray(parsed.goals)) {
        parsed.goals = parsed.goal
          ? [{ id: 'goal-migrated', name: parsed.goal.name, target: parsed.goal.target, saved: parsed.goal.saved }]
          : DEMO_MONTH_STATE.goals;
      }
      return parsed as FinanceState;
    }
  } catch (err) {
    console.error('Failed to parse state from localStorage, falling back to demo state:', err);
  }
  return DEMO_MONTH_STATE;
}

export function useFinance() {
  const [state, setState] = useState<FinanceState>(loadStoredState);

  // Simulation state (isolated from real balance until Confirm)
  const [simAmount, setSimAmount] = useState<number>(0);
  const [simName, setSimName] = useState<string>('');
  const [simCategory, setSimCategory] = useState<ExpenseCategory>('Shopping');

  // Emergency page separate simulation amount
  const [emergencyAmount, setEmergencyAmount] = useState<number>(0);
  const [emergencyName, setEmergencyName] = useState<string>('Medical Emergency');
  const [emergencyCategory, setEmergencyCategory] = useState<ExpenseCategory>('Bills');

  // Quick slider on Dashboard (₹0 to 5000)
  const [dashboardSliderExtra, setDashboardSliderExtra] = useState<number>(0);

  // Persist state to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to persist state to localStorage:', err);
    }
  }, [state]);

  // Real calculations
  const currentCalc = useMemo<CalculationResult>(() => {
    return calc(state, 0);
  }, [state]);

  // Simulated calculations with active simulator amount
  const simCalc = useMemo<CalculationResult>(() => {
    return calc(state, simAmount);
  }, [state, simAmount]);

  // Emergency calculations with emergency amount
  const emergencyCalc = useMemo<CalculationResult>(() => {
    return calc(state, emergencyAmount);
  }, [state, emergencyAmount]);

  // Dashboard slider calculations
  const sliderCalc = useMemo<CalculationResult>(() => {
    return calc(state, dashboardSliderExtra);
  }, [state, dashboardSliderExtra]);

  // Balance series for chart
  const chartSeries = useMemo<BalancePoint[]>(() => {
    // When simulator or emergency or slider is active, feed extra into chart
    const effectiveSimExtra =
      simAmount > 0
        ? simAmount
        : emergencyAmount > 0
        ? emergencyAmount
        : dashboardSliderExtra;
    return balanceSeries(state, effectiveSimExtra);
  }, [state, simAmount, emergencyAmount, dashboardSliderExtra]);

  // Add real expense
  const addExpense = useCallback(
    (expense: { name: string; amt: number; cat: ExpenseCategory; day?: number }) => {
      const trimmedName = expense.name.trim();
      const numAmt = Number(expense.amt);
      if (!trimmedName || isNaN(numAmt) || numAmt <= 0) return false;

      const newExpense: Expense = {
        id: 'exp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        name: trimmedName,
        amt: Math.round(numAmt),
        cat: expense.cat,
        day: expense.day !== undefined ? Math.min(30, Math.max(1, expense.day)) : state.day,
        createdAt: Date.now(),
      };

      setState((prev) => ({
        ...prev,
        expenses: [newExpense, ...prev.expenses],
      }));
      return true;
    },
    [state.day]
  );

  // Delete real expense
  const deleteExpense = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((exp) => exp.id !== id),
    }));
  }, []);

  // Confirm simulated purchase
  const confirmSimulatedPurchase = useCallback(() => {
    if (simAmount <= 0) return false;
    const name = simName.trim() || 'Simulated Purchase';
    const success = addExpense({
      name,
      amt: simAmount,
      cat: simCategory,
      day: state.day,
    });

    if (success) {
      setSimAmount(0);
      setSimName('');
    }
    return success;
  }, [simAmount, simName, simCategory, state.day, addExpense]);

  // Confirm emergency expense into real ledger
  const confirmEmergencyExpense = useCallback(() => {
    if (emergencyAmount <= 0) return false;
    const name = emergencyName.trim() || 'Emergency Expense';
    const success = addExpense({
      name: `[EMERGENCY] ${name}`,
      amt: emergencyAmount,
      cat: emergencyCategory,
      day: state.day,
    });

    if (success) {
      setEmergencyAmount(0);
    }
    return success;
  }, [emergencyAmount, emergencyName, emergencyCategory, state.day, addExpense]);

  // Clear simulation
  const clearSimulation = useCallback(() => {
    setSimAmount(0);
    setSimName('');
  }, []);

  // Clear emergency
  const clearEmergency = useCallback(() => {
    setEmergencyAmount(0);
  }, []);

  // Multiple Savings Goals Actions
  const addGoal = useCallback((name: string, target: number, initialSaved: number = 0) => {
    const trimmed = name.trim();
    const numTarget = Math.max(1, Number(target) || 1);
    const numSaved = Math.max(0, Number(initialSaved) || 0);
    if (!trimmed) return false;

    const newGoal = {
      id: 'goal-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: trimmed,
      target: numTarget,
      saved: numSaved,
    };

    setState((prev) => ({
      ...prev,
      goals: [...(prev.goals || []), newGoal],
    }));
    return true;
  }, []);

  const editGoal = useCallback((id: string, name: string, target: number, saved?: number) => {
    const trimmed = name.trim();
    const numTarget = Math.max(1, Number(target) || 1);
    setState((prev) => ({
      ...prev,
      goals: (prev.goals || []).map((g) =>
        g.id === id
          ? {
              ...g,
              name: trimmed || g.name,
              target: numTarget,
              saved: saved !== undefined ? Math.max(0, Number(saved) || 0) : g.saved,
            }
          : g
      ),
    }));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      goals: (prev.goals || []).filter((g) => g.id !== id),
    }));
  }, []);

  // Add money to a goal AND log as a "Savings" transaction
  const addSavings = useCallback(
    (goalId: string, amount: number) => {
      const numAmt = Number(amount);
      if (isNaN(numAmt) || numAmt <= 0) return false;
      const roundedAmt = Math.round(numAmt);

      const targetGoal = (state.goals || []).find((g) => g.id === goalId);
      const goalTitle = targetGoal ? targetGoal.name : 'Savings Goal';

      const newExpense: Expense = {
        id: 'sav-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        name: `Savings: ${goalTitle}`,
        amt: roundedAmt,
        cat: 'Savings',
        day: state.day,
        createdAt: Date.now(),
      };

      setState((prev) => ({
        ...prev,
        goals: (prev.goals || []).map((g) =>
          g.id === goalId ? { ...g, saved: (g.saved || 0) + roundedAmt } : g
        ),
        expenses: [newExpense, ...prev.expenses],
      }));
      return true;
    },
    [state.goals, state.day]
  );

  // Subscriptions management
  const toggleSubscription = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      subs: (prev.subs || []).map((s) => (s.id === id ? { ...s, active: !s.active } : s)),
    }));
  }, []);

  const addSubscription = useCallback((name: string, amt: number) => {
    const trimmed = name.trim();
    const numAmt = Number(amt);
    if (!trimmed || isNaN(numAmt) || numAmt <= 0) return false;

    setState((prev) => ({
      ...prev,
      subs: [
        ...(prev.subs || []),
        {
          id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          name: trimmed,
          amt: Math.round(numAmt),
          active: true,
        },
      ],
    }));
    return true;
  }, []);

  const deleteSubscription = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      subs: (prev.subs || []).filter((s) => s.id !== id),
    }));
  }, []);

  // Settings update
  const updateSettings = useCallback(
    (settings: Partial<Pick<FinanceState, 'budget' | 'reserve' | 'day' | 'income'>>) => {
      setState((prev) => ({
        ...prev,
        budget:
          settings.budget !== undefined ? Math.max(100, Math.round(settings.budget)) : prev.budget,
        reserve:
          settings.reserve !== undefined ? Math.max(0, Math.round(settings.reserve)) : prev.reserve,
        day:
          settings.day !== undefined
            ? Math.min(29, Math.max(0, Math.round(settings.day)))
            : prev.day,
        income:
          settings.income !== undefined ? Math.max(0, Math.round(settings.income)) : prev.income,
      }));
    },
    []
  );

  // Load demo month
  const loadDemoMonth = useCallback(() => {
    setState(DEMO_MONTH_STATE);
    setSimAmount(0);
    setSimName('');
    setEmergencyAmount(0);
    setDashboardSliderExtra(0);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_MONTH_STATE));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Reset to initial blank state (Day 1, 0 expenses)
  const resetToBlank = useCallback(() => {
    setState(INITIAL_BLANK_STATE);
    setSimAmount(0);
    setSimName('');
    setEmergencyAmount(0);
    setDashboardSliderExtra(0);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BLANK_STATE));
    } catch (e) {
      console.error(e);
    }
  }, []);

  return {
    state,
    currentCalc,
    simCalc,
    emergencyCalc,
    sliderCalc,
    chartSeries,
    // Simulator
    simAmount,
    setSimAmount,
    simName,
    setSimName,
    simCategory,
    setSimCategory,
    clearSimulation,
    confirmSimulatedPurchase,
    // Emergency
    emergencyAmount,
    setEmergencyAmount,
    emergencyName,
    setEmergencyName,
    emergencyCategory,
    setEmergencyCategory,
    clearEmergency,
    confirmEmergencyExpense,
    // Dashboard slider
    dashboardSliderExtra,
    setDashboardSliderExtra,
    // Actions
    addExpense,
    deleteExpense,
    addGoal,
    editGoal,
    deleteGoal,
    addSavings,
    toggleSubscription,
    addSubscription,
    deleteSubscription,
    updateSettings,
    loadDemoMonth,
    resetToBlank,
  };
}
