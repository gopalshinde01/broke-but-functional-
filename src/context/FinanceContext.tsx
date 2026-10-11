import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  FinanceState,
  Expense,
  ExpenseCategory,
  CalculationResult,
  BalancePoint,
} from '@/types';
import { calc, balanceSeries, calculateSurvivalStreak } from '@/utils/financeCalculations';
import { loadFinanceState, saveFinanceState } from '@/utils/storage';
import { DEMO_MONTH_STATE, INITIAL_BLANK_STATE } from '@/constants';

// Typed Action Definitions
export type FinanceAction =
  | {
      type: 'ADD_EXPENSE';
      payload: { name: string; amt: number; cat: ExpenseCategory; day?: number };
    }
  | { type: 'DELETE_EXPENSE'; payload: { id: string } }
  | { type: 'RESTORE_EXPENSE'; payload: { expense: Expense } }
  | { type: 'ADD_GOAL'; payload: { name: string; target: number; initialSaved?: number } }
  | { type: 'EDIT_GOAL'; payload: { id: string; name: string; target: number; saved?: number } }
  | { type: 'DELETE_GOAL'; payload: { id: string } }
  | { type: 'ADD_SAVINGS'; payload: { goalId: string; amount: number } }
  | { type: 'TOGGLE_SUBSCRIPTION'; payload: { id: string } }
  | { type: 'ADD_SUBSCRIPTION'; payload: { name: string; amt: number } }
  | { type: 'DELETE_SUBSCRIPTION'; payload: { id: string } }
  | {
      type: 'UPDATE_SETTINGS';
      payload: Partial<Pick<FinanceState, 'budget' | 'reserve' | 'day' | 'income'>>;
    }
  | { type: 'LOAD_DEMO' }
  | { type: 'RESET_BLANK' }
  | { type: 'IMPORT_STATE'; payload: FinanceState };

/**
 * Pure Reducer for all financial mutations
 */
export function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case 'ADD_EXPENSE': {
      const trimmedName = action.payload.name.trim().slice(0, 60);
      const numAmt = Number(action.payload.amt);
      if (!trimmedName || !Number.isFinite(numAmt) || numAmt <= 0) {
        return state;
      }
      const newExpense: Expense = {
        id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: trimmedName,
        amt: Math.round(numAmt),
        cat: action.payload.cat,
        day:
          action.payload.day !== undefined
            ? Math.min(30, Math.max(1, Math.round(action.payload.day)))
            : state.day,
        createdAt: Date.now(),
      };
      return {
        ...state,
        expenses: [newExpense, ...state.expenses],
      };
    }

    case 'DELETE_EXPENSE': {
      return {
        ...state,
        expenses: state.expenses.filter((exp) => exp.id !== action.payload.id),
      };
    }

    case 'RESTORE_EXPENSE': {
      return {
        ...state,
        expenses: [action.payload.expense, ...state.expenses],
      };
    }

    case 'ADD_GOAL': {
      const trimmed = action.payload.name.trim().slice(0, 60);
      const numTarget = Math.max(1, Number(action.payload.target) || 1);
      const numSaved = Math.max(0, Number(action.payload.initialSaved) || 0);
      if (!trimmed) return state;

      const newGoal = {
        id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: trimmed,
        target: Math.round(numTarget),
        saved: Math.round(numSaved),
      };
      return {
        ...state,
        goals: [...state.goals, newGoal],
      };
    }

    case 'EDIT_GOAL': {
      const trimmed = action.payload.name.trim().slice(0, 60);
      const numTarget = Math.max(1, Number(action.payload.target) || 1);
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.payload.id
            ? {
                ...g,
                name: trimmed || g.name,
                target: Math.round(numTarget),
                saved:
                  action.payload.saved !== undefined
                    ? Math.max(0, Math.round(Number(action.payload.saved)))
                    : g.saved,
              }
            : g
        ),
      };
    }

    case 'DELETE_GOAL': {
      return {
        ...state,
        goals: state.goals.filter((g) => g.id !== action.payload.id),
      };
    }

    case 'ADD_SAVINGS': {
      const numAmt = Number(action.payload.amount);
      if (!Number.isFinite(numAmt) || numAmt <= 0) return state;
      const roundedAmt = Math.round(numAmt);

      const targetGoal = state.goals.find((g) => g.id === action.payload.goalId);
      const goalTitle = targetGoal ? targetGoal.name : 'Savings Goal';

      const newExpense: Expense = {
        id: `sav-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: `Savings: ${goalTitle}`,
        amt: roundedAmt,
        cat: 'Savings',
        day: state.day,
        createdAt: Date.now(),
      };

      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.payload.goalId ? { ...g, saved: (g.saved || 0) + roundedAmt } : g
        ),
        expenses: [newExpense, ...state.expenses],
      };
    }

    case 'TOGGLE_SUBSCRIPTION': {
      return {
        ...state,
        subs: state.subs.map((s) => (s.id === action.payload.id ? { ...s, active: !s.active } : s)),
      };
    }

    case 'ADD_SUBSCRIPTION': {
      const trimmed = action.payload.name.trim().slice(0, 60);
      const numAmt = Number(action.payload.amt);
      if (!trimmed || !Number.isFinite(numAmt) || numAmt <= 0) return state;

      return {
        ...state,
        subs: [
          ...state.subs,
          {
            id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: trimmed,
            amt: Math.round(numAmt),
            active: true,
          },
        ],
      };
    }

    case 'DELETE_SUBSCRIPTION': {
      return {
        ...state,
        subs: state.subs.filter((s) => s.id !== action.payload.id),
      };
    }

    case 'UPDATE_SETTINGS': {
      const settings = action.payload;
      return {
        ...state,
        budget:
          settings.budget !== undefined && Number.isFinite(settings.budget)
            ? Math.max(100, Math.round(settings.budget))
            : state.budget,
        reserve:
          settings.reserve !== undefined && Number.isFinite(settings.reserve)
            ? Math.max(0, Math.round(settings.reserve))
            : state.reserve,
        day:
          settings.day !== undefined && Number.isFinite(settings.day)
            ? Math.min(29, Math.max(0, Math.round(settings.day)))
            : state.day,
        income:
          settings.income !== undefined && Number.isFinite(settings.income)
            ? Math.max(0, Math.round(settings.income))
            : state.income,
      };
    }

    case 'LOAD_DEMO': {
      return DEMO_MONTH_STATE;
    }

    case 'RESET_BLANK': {
      return INITIAL_BLANK_STATE;
    }

    case 'IMPORT_STATE': {
      return action.payload;
    }

    default:
      return state;
  }
}

// Context Type definition
export interface FinanceContextType {
  state: FinanceState;
  dispatch: React.Dispatch<FinanceAction>;
  currentCalc: CalculationResult;
  chartSeries: BalancePoint[];
  survivalStreak: number;
  lastDeletedExpense: Expense | null;
  undoDeleteExpense: () => boolean;
  addExpense: (expense: {
    name: string;
    amt: number;
    cat: ExpenseCategory;
    day?: number;
  }) => boolean;
  deleteExpense: (id: string) => void;
  addGoal: (name: string, target: number, initialSaved?: number) => boolean;
  editGoal: (id: string, name: string, target: number, saved?: number) => void;
  deleteGoal: (id: string) => void;
  addSavings: (goalId: string, amount: number) => boolean;
  toggleSubscription: (id: string) => void;
  addSubscription: (name: string, amt: number) => boolean;
  deleteSubscription: (id: string) => void;
  updateSettings: (
    settings: Partial<Pick<FinanceState, 'budget' | 'reserve' | 'day' | 'income'>>
  ) => void;
  loadDemoMonth: () => void;
  resetToBlank: () => void;
  importState: (newState: FinanceState) => void;
}

export const FinanceContext = createContext<FinanceContextType | null>(null);

export interface FinanceProviderProps {
  children: ReactNode;
  initialState?: FinanceState;
}

export function FinanceProvider({ children, initialState }: FinanceProviderProps) {
  const [state, dispatch] = useReducer(financeReducer, initialState ?? loadFinanceState());
  const [lastDeletedExpense, setLastDeletedExpense] = useState<Expense | null>(null);

  // Auto-sync state to localStorage with runtime validation & error recovery
  useEffect(() => {
    saveFinanceState(state);
  }, [state]);

  // Pure derived calculations
  const currentCalc = useMemo<CalculationResult>(() => {
    return calc(state, 0);
  }, [state]);

  const chartSeries = useMemo<BalancePoint[]>(() => {
    return balanceSeries(state, 0);
  }, [state]);

  const survivalStreak = useMemo<number>(() => {
    return calculateSurvivalStreak(state);
  }, [state]);

  // Actions
  const addExpense = useCallback(
    (expense: { name: string; amt: number; cat: ExpenseCategory; day?: number }) => {
      const trimmed = expense.name.trim();
      const numAmt = Number(expense.amt);
      if (!trimmed || !Number.isFinite(numAmt) || numAmt <= 0) return false;
      dispatch({ type: 'ADD_EXPENSE', payload: expense });
      return true;
    },
    []
  );

  const deleteExpense = useCallback(
    (id: string) => {
      const exp = state.expenses.find((e) => e.id === id);
      if (exp) {
        setLastDeletedExpense(exp);
      }
      dispatch({ type: 'DELETE_EXPENSE', payload: { id } });
    },
    [state.expenses]
  );

  const undoDeleteExpense = useCallback(() => {
    if (!lastDeletedExpense) return false;
    dispatch({ type: 'RESTORE_EXPENSE', payload: { expense: lastDeletedExpense } });
    setLastDeletedExpense(null);
    return true;
  }, [lastDeletedExpense]);

  const addGoal = useCallback((name: string, target: number, initialSaved: number = 0) => {
    const trimmed = name.trim();
    const numTarget = Number(target);
    if (!trimmed || !Number.isFinite(numTarget) || numTarget <= 0) return false;
    dispatch({ type: 'ADD_GOAL', payload: { name, target: numTarget, initialSaved } });
    return true;
  }, []);

  const editGoal = useCallback((id: string, name: string, target: number, saved?: number) => {
    dispatch({ type: 'EDIT_GOAL', payload: { id, name, target, saved } });
  }, []);

  const deleteGoal = useCallback((id: string) => {
    dispatch({ type: 'DELETE_GOAL', payload: { id } });
  }, []);

  const addSavings = useCallback((goalId: string, amount: number) => {
    const numAmt = Number(amount);
    if (!Number.isFinite(numAmt) || numAmt <= 0) return false;
    dispatch({ type: 'ADD_SAVINGS', payload: { goalId, amount: numAmt } });
    return true;
  }, []);

  const toggleSubscription = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_SUBSCRIPTION', payload: { id } });
  }, []);

  const addSubscription = useCallback((name: string, amt: number) => {
    const trimmed = name.trim();
    const numAmt = Number(amt);
    if (!trimmed || !Number.isFinite(numAmt) || numAmt <= 0) return false;
    dispatch({ type: 'ADD_SUBSCRIPTION', payload: { name, amt: numAmt } });
    return true;
  }, []);

  const deleteSubscription = useCallback((id: string) => {
    dispatch({ type: 'DELETE_SUBSCRIPTION', payload: { id } });
  }, []);

  const updateSettings = useCallback(
    (settings: Partial<Pick<FinanceState, 'budget' | 'reserve' | 'day' | 'income'>>) => {
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    },
    []
  );

  const loadDemoMonth = useCallback(() => {
    dispatch({ type: 'LOAD_DEMO' });
    setLastDeletedExpense(null);
  }, []);

  const resetToBlank = useCallback(() => {
    dispatch({ type: 'RESET_BLANK' });
    setLastDeletedExpense(null);
  }, []);

  const importState = useCallback((newState: FinanceState) => {
    dispatch({ type: 'IMPORT_STATE', payload: newState });
    setLastDeletedExpense(null);
  }, []);

  const contextValue = useMemo<FinanceContextType>(
    () => ({
      state,
      dispatch,
      currentCalc,
      chartSeries,
      survivalStreak,
      lastDeletedExpense,
      undoDeleteExpense,
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
      importState,
    }),
    [
      state,
      currentCalc,
      chartSeries,
      survivalStreak,
      lastDeletedExpense,
      undoDeleteExpense,
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
      importState,
    ]
  );

  return <FinanceContext.Provider value={contextValue}>{children}</FinanceContext.Provider>;
}

export function useFinanceContext(): FinanceContextType {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinanceContext must be used within a FinanceProvider');
  }
  return context;
}
