export type ExpenseCategory =
  | 'Food'
  | 'Travel'
  | 'Shopping'
  | 'Entertainment'
  | 'Bills'
  | 'Education'
  | 'Health'
  | 'Subscriptions'
  | 'Emergency'
  | 'Savings'
  | 'Other';

export interface Expense {
  id: string;
  name: string;
  cat: ExpenseCategory;
  amt: number;
  day: number;
  description?: string;
  date?: string;
  createdAt: number;
}

export interface IncomeItem {
  id: string;
  source: string;
  amt: number;
  day: number;
  date?: string;
  description?: string;
  createdAt: number;
}

export type BillingFrequency = 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  name: string;
  amt: number;
  frequency?: BillingFrequency;
  nextPaymentDate?: string;
  active: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  saved: number;
}

export interface FinanceState {
  budget: number;
  income: number;
  reserve: number;
  day: number; // days completed, 0 to 29
  expenses: Expense[];
  incomes?: IncomeItem[];
  subs: Subscription[];
  goals: SavingsGoal[];
}

export interface HealthScoreBreakdown {
  adherence: number; // max 30
  reserve: number; // max 20
  outlook: number; // max 25
  savings: number; // max 15
  commitments: number; // max 10
  score: number; // 0-100
}

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface SurvivalSimulationResult {
  probabilityPercent: number; // 0 to 100
  simulatedRuns: number; // e.g. 500
  successRuns: number;
  medianEndBalance: number;
  p10EndBalance: number; // 10th percentile worst case
  varianceStdDev: number;
}

export interface CalculationResult {
  totalIncome: number;
  totalActualExpenses: number;
  spent: number;
  remaining: number;
  committed: number;
  daysLeft: number;
  available: number;
  daily: number; // raw calculation; if negative, show red
  displayDaily: number; // max(0, daily)
  disc: number;
  avg: number;
  projected: number;
  reserveIntact: number;
  risk: RiskLevel;
  riskReason: string;
  totalNeed: number;
  totalTarget: number;
  totalSaved: number;
  savingsProgressNow: number;
  savingsProjected: number;
  onTrack: boolean;
  health: HealthScoreBreakdown;
  healthScore: number;
  pace: number;
  survival: SurvivalSimulationResult;
}

export interface BalancePoint {
  day: number;
  dayLabel: string;
  actual: number | null;
  projected: number | null;
  simulated: number | null;
}

export interface ScenarioItem {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  isEssential?: boolean;
  purchaseDate?: string;
}

export interface ScenarioComparison {
  scenario: ScenarioItem;
  calc: CalculationResult;
}

export type ActiveScreen =
  | 'dashboard'
  | 'transactions'
  | 'simulator'
  | 'emergency'
  | 'savings'
  | 'subscriptions'
  | 'forecast'
  | 'health'
  | 'insights';
