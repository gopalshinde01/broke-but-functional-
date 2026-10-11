import type { ExpenseCategory, FinanceState } from '../types';

/**
 * Standard cycle length in days
 */
export const CYCLE_DAYS = 30;

/**
 * Default budget and reserve values
 */
export const DEFAULT_BUDGET = 10000;
export const DEFAULT_RESERVE = 1500;
export const DEFAULT_DAY = 1;

/**
 * Versioned LocalStorage key with legacy fallback keys for migration
 */
export const STORAGE_KEY = 'bbf:v2';
export const LEGACY_STORAGE_KEYS = [
  'broke_but_functional_v2',
  'broke_but_functional_state_v1',
] as const;

/**
 * Financial Health score constants and component weights
 * Total max score is 100 points
 */
export const HEALTH_WEIGHTS = {
  ADHERENCE_MAX: 30,
  ADHERENCE_TOLERANCE_PCT: 0.25, // 25% of budget
  RESERVE_MAX: 20,
  OUTLOOK_MAX: 25,
  OUTLOOK_THRESHOLD_PCT: 0.15, // 15% of budget
  SAVINGS_MAX: 15,
  COMMITMENTS_MAX: 10,
  COMMITMENTS_CAP_PCT: 0.2, // 20% of budget
} as const;

/**
 * Expense categories supported across the application
 */
export const EXPENSE_CATEGORIES: readonly ExpenseCategory[] = [
  'Food',
  'Travel',
  'Shopping',
  'Entertainment',
  'Bills',
  'Education',
  'Health',
  'Subscriptions',
  'Emergency',
  'Savings',
  'Other',
] as const;

/**
 * Emergency scenario presets
 */
export const EMERGENCY_PRESETS = [
  {
    name: 'Medical Emergency',
    amt: 1500,
    cat: 'Health' as ExpenseCategory,
    label: 'Medical ₹1,500',
    description: 'Clinic consultation, prescribed medicines & tests',
  },
  {
    name: 'Laptop / Phone Repair',
    amt: 3000,
    cat: 'Bills' as ExpenseCategory,
    label: 'Device Repair ₹3,000',
    description: 'Screen replacement or charger/battery failure',
  },
  {
    name: 'Emergency Travel Home',
    amt: 800,
    cat: 'Travel' as ExpenseCategory,
    label: 'Urgent Travel ₹800',
    description: 'Last-minute bus/train ticket for family emergency',
  },
] as const;

/**
 * Initial pristine blank month state
 */
export const INITIAL_BLANK_STATE: FinanceState = {
  budget: DEFAULT_BUDGET,
  income: 0,
  reserve: DEFAULT_RESERVE,
  day: DEFAULT_DAY,
  expenses: [],
  incomes: [],
  subs: [],
  goals: [
    {
      id: 'goal-initial',
      name: 'Emergency Buffer',
      target: 2000,
      saved: 0,
    },
  ],
};

/**
 * Realistic Day 10 demo scenario with pre-configured student expenses
 */
export const DEMO_MONTH_STATE: FinanceState = {
  budget: DEFAULT_BUDGET,
  income: 0,
  reserve: DEFAULT_RESERVE,
  day: 10,
  expenses: [
    {
      id: 'exp-1',
      name: 'Mess + canteen',
      cat: 'Food',
      amt: 900,
      day: 2,
      createdAt: 1710000000000,
    },
    {
      id: 'exp-2',
      name: 'Metro pass',
      cat: 'Travel',
      amt: 450,
      day: 3,
      createdAt: 1710086400000,
    },
    {
      id: 'exp-3',
      name: 'Phone recharge',
      cat: 'Bills',
      amt: 299,
      day: 4,
      createdAt: 1710172800000,
    },
    {
      id: 'exp-4',
      name: 'T-shirt',
      cat: 'Shopping',
      amt: 499,
      day: 5,
      createdAt: 1710259200000,
    },
    {
      id: 'exp-5',
      name: 'Movie',
      cat: 'Entertainment',
      amt: 250,
      day: 6,
      createdAt: 1710345600000,
    },
    {
      id: 'exp-6',
      name: 'Snacks',
      cat: 'Food',
      amt: 400,
      day: 7,
      createdAt: 1710432000000,
    },
    {
      id: 'exp-7',
      name: 'Stationery',
      cat: 'Other',
      amt: 160,
      day: 8,
      createdAt: 1710518400000,
    },
    {
      id: 'exp-8',
      name: 'Lunch out',
      cat: 'Food',
      amt: 320,
      day: 9,
      createdAt: 1710604800000,
    },
    {
      id: 'exp-9',
      name: 'Auto Travel',
      cat: 'Travel',
      amt: 180,
      day: 9,
      createdAt: 1710604850000,
    },
  ],
  incomes: [],
  subs: [
    { id: 'sub-1', name: 'Music', amt: 119, frequency: 'monthly', nextPaymentDate: 'Day 15', active: true },
    { id: 'sub-2', name: 'Video streaming', amt: 299, frequency: 'monthly', nextPaymentDate: 'Day 18', active: true },
    { id: 'sub-3', name: 'Gaming pass', amt: 149, frequency: 'monthly', nextPaymentDate: 'Day 22', active: true },
  ],
  goals: [
    {
      id: 'goal-1',
      name: 'New headphones',
      target: 2000,
      saved: 400,
    },
  ],
};
