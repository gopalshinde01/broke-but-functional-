export type ExpenseCategory =
  | 'Food'
  | 'Travel'
  | 'Shopping'
  | 'Entertainment'
  | 'Bills'
  | 'Savings'
  | 'Other';

export interface Expense {
  id: string;
  name: string;
  cat: ExpenseCategory;
  amt: number;
  day: number;
  createdAt: number;
}

export interface Subscription {
  id: string;
  name: string;
  amt: number;
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
  subs: Subscription[];
  goals: SavingsGoal[];
}

export interface HealthScoreBreakdown {
  adherence: number; // max 30
  reserve: number;   // max 20
  outlook: number;   // max 25
  savings: number;   // max 15
  commitments: number; // max 10
  score: number;     // 0-100
}

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface CalculationResult {
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
}

export interface BalancePoint {
  day: number;
  dayLabel: string;
  actual: number | null;
  projected: number | null;
  simulated: number | null;
}

export type ActiveScreen =
  | 'dashboard'
  | 'transactions'
  | 'simulator'
  | 'emergency'
  | 'savings'
  | 'subscriptions'
  | 'insights';
