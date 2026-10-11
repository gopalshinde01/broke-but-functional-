import type {
  FinanceState,
  CalculationResult,
  BalancePoint,
  HealthScoreBreakdown,
  RiskLevel,
  SurvivalSimulationResult,
} from '../types';
import { CYCLE_DAYS, HEALTH_WEIGHTS } from '../constants';

/**
 * Format a number into Indian Rupee (INR) currency representation using Intl en-IN.
 *
 * @param val The numerical monetary value to format.
 * @param options Formatting options including decimal places, explicit plus sign, and compact units.
 * @returns Formatted currency string with ₹ symbol.
 */
export function formatINR(
  val: number,
  options?: {
    decimals?: number;
    showSign?: boolean;
    compact?: boolean;
  }
): string {
  if (isNaN(val) || !isFinite(val)) {
    return '₹0';
  }

  const decimals = options?.decimals ?? 0;
  const isNegative = val < 0;
  const absVal = Math.abs(val);

  if (options?.compact && absVal >= 100000) {
    const lakhs = absVal / 100000;
    return `${isNegative ? '-' : ''}₹${lakhs.toFixed(1)}L`;
  }

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(absVal);

  if (isNegative) {
    return `-${formatted}`;
  }
  if (options?.showSign && val > 0) {
    return `+${formatted}`;
  }
  return formatted;
}

/**
 * Clamp a numerical value between a minimum of 0 and a maximum of 1.
 *
 * @param x Input numerical value.
 * @returns Clamped value in [0, 1].
 */
export function clamp(x: number): number {
  if (isNaN(x) || !isFinite(x)) return 0;
  return Math.min(1, Math.max(0, x));
}

/**
 * Calculate the count of consecutive days up to the current day where daily spending was within allowable pace.
 *
 * @param state Current FinanceState.
 * @returns Streak count (number of days).
 */
export function calculateSurvivalStreak(state: FinanceState): number {
  const currentDay = Math.min(CYCLE_DAYS - 1, Math.max(0, state.day || 0));
  if (currentDay === 0) return 0;

  const baseCalc = calc(state, 0);
  const benchmarkDaily = baseCalc.available > 0 ? baseCalc.available / baseCalc.daysLeft : 0;
  if (benchmarkDaily <= 0) return 0;

  let streak = 0;
  for (let d = currentDay; d >= 1; d--) {
    const dayExpenses = (state.expenses || [])
      .filter((e) => e.day === d && e.cat !== 'Savings')
      .reduce((sum, e) => sum + (Number(e.amt) || 0), 0);

    if (dayExpenses <= benchmarkDaily * 1.15) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Pseudo-random number generator with deterministic seed (Mulberry32).
 * Enables reproducible Monte Carlo simulations across renders and tests.
 *
 * @param seed Seed integer.
 * @returns Pseudo-random number generator producing floats in [0, 1).
 */
function createSeededRandom(seed: number) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Run a deterministic 500-run Monte Carlo variance simulation to calculate
 * the probability that the user completes Day 30 with a non-negative balance.
 *
 * @param remaining Current remaining balance.
 * @param committed Total recurring subscription commitments.
 * @param daysLeft Number of days left in cycle.
 * @param avgDailySpend Discretionary average spend per day.
 * @param expenses List of recorded expenses to measure historical daily variance.
 * @param seed Optional seed for reproducible results.
 * @returns Survival simulation metrics including percentage chance and worst-case scenario.
 */
/**
 * Exported risk level evaluator with standardized threshold checks.
 */
export function getRiskLevel(
  daily: number,
  projected: number,
  reserve: number,
  _budget: number = 10000
): { risk: RiskLevel; reason: string } {
  if (daily <= 0) {
    return {
      risk: 'High',
      reason: `Daily allowance depleted. Deficit of ${formatINR(Math.abs(Math.round(projected)))} projected.`,
    };
  }
  if (projected < 0) {
    return {
      risk: 'High',
      reason: `Deficit projected: ${formatINR(Math.abs(Math.round(projected)))} short by Day 30.`,
    };
  }
  if (daily < 150) {
    return {
      risk: 'Medium',
      reason: `Daily allowance is tight (${formatINR(Math.round(daily))}/day). Caution advised.`,
    };
  }
  if (projected < reserve) {
    return {
      risk: 'Medium',
      reason: `Projected balance (${formatINR(Math.round(projected))}) breaches emergency reserve floor.`,
    };
  }
  return {
    risk: 'Low',
    reason: 'Safe runway with healthy projected month-end balance.',
  };
}

export function simulateSurvivalProbability(
  arg1: number | FinanceState,
  arg2: number = 0,
  arg3: number = 30,
  arg4: number = 0,
  arg5: readonly { amt: number; cat: string; day: number }[] = [],
  arg6 = 42
): SurvivalSimulationResult {
  let remaining: number;
  let committed: number;
  let daysLeft: number;
  let avgDailySpend: number;
  let expenses: readonly { amt: number; cat: string; day: number }[];
  let seed: number;

  if (typeof arg1 === 'object' && arg1 !== null) {
    const state = arg1 as FinanceState;
    const extra = arg2;
    const currentDay = Math.min(CYCLE_DAYS - 1, Math.max(0, state.day || 0));
    daysLeft = Math.max(1, CYCLE_DAYS - currentDay);
    const spent = (state.expenses || []).reduce((acc, e) => acc + (Number(e.amt) || 0), 0) + extra;
    const totalRecordedIncome = (state.incomes || []).reduce((acc, inc) => acc + (Number(inc.amt) || 0), 0);
    remaining = (state.budget || 0) + (state.income || 0) + totalRecordedIncome - spent;
    committed = (state.subs || []).reduce(
      (acc, s) => {
        if (!s.active) return acc;
        return acc + (s.frequency === 'yearly' ? Math.round((Number(s.amt) || 0) / 12) : (Number(s.amt) || 0));
      },
      0
    );
    const disc =
      (state.expenses || []).reduce(
        (acc, e) => (e.cat !== 'Savings' ? acc + (Number(e.amt) || 0) : acc),
        0
      ) + extra;
    avgDailySpend = disc / Math.max(1, currentDay);
    expenses = state.expenses || [];
    seed = arg6;
  } else {
    remaining = arg1;
    committed = arg2;
    daysLeft = arg3;
    avgDailySpend = arg4;
    expenses = arg5;
    seed = arg6;
  }

  const SIMULATED_RUNS = 500;
  const rng = createSeededRandom(seed + Math.round(remaining));

  // Calculate empirical standard deviation of daily spending
  const nonSavings = (expenses || []).filter((e) => e.cat !== 'Savings');
  const amounts = nonSavings.map((e) => Number(e.amt) || 0);

  let stdDev = avgDailySpend * 0.35; // Default assumption if low variance
  if (amounts.length >= 3) {
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / amounts.length;
    stdDev = Math.max(20, Math.sqrt(variance));
  }

  let successCount = 0;
  const finalBalances: number[] = [];

  for (let r = 0; r < SIMULATED_RUNS; r++) {
    let balance = remaining - committed;
    for (let d = 0; d < daysLeft; d++) {
      // Box-Muller transform for normal distribution
      const u1 = Math.max(0.0001, rng());
      const u2 = rng();
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const simulatedDaySpend = Math.max(0, avgDailySpend + z * stdDev);
      balance -= simulatedDaySpend;
    }

    finalBalances.push(Math.round(balance));
    if (balance >= 0) {
      successCount++;
    }
  }

  finalBalances.sort((a, b) => a - b);
  const p10Index = Math.floor(SIMULATED_RUNS * 0.1);
  const medianIndex = Math.floor(SIMULATED_RUNS * 0.5);

  const probabilityPercent = Math.round((successCount / SIMULATED_RUNS) * 100);

  return {
    probabilityPercent,
    simulatedRuns: SIMULATED_RUNS,
    successRuns: successCount,
    medianEndBalance: finalBalances[medianIndex] ?? 0,
    p10EndBalance: finalBalances[p10Index] ?? 0,
    varianceStdDev: Math.round(stdDev),
  };
}

/**
 * Single source of truth financial calculations engine.
 * Pure function: takes immutable state and an optional simulated extra amount,
 * and returns all derived metrics, risk levels, and health score components.
 *
 * @param state Current FinanceState.
 * @param extra Simulated additional discretionary purchase amount (defaults to 0).
 * @returns Fully computed CalculationResult.
 */
export function calc(state: FinanceState, extra: number = 0): CalculationResult {
  const safeBudget = Math.max(1, state.budget || 0);
  const safeReserve = Math.max(1, state.reserve || 0);
  const recordedIncomes = (state.incomes || []).reduce((acc, inc) => acc + (Number(inc.amt) || 0), 0);
  const safeIncome = (state.income || 0) + recordedIncomes;
  const currentDay = Math.min(CYCLE_DAYS - 1, Math.max(0, state.day || 0));

  // 1. Total spent: sum of all recorded expenses + optional simulated purchase
  const totalBaseExpenses = (state.expenses || []).reduce(
    (acc, exp) => acc + (Number(exp.amt) || 0),
    0
  );
  const spent = totalBaseExpenses + (Number(extra) || 0);

  // 2. Remaining balance: budget + income - spent
  const remaining = safeBudget + safeIncome - spent;

  // 3. Committed upcoming expenses: active subscriptions reserved from balance (monthly equivalent)
  const committed = (state.subs || []).reduce((acc, sub) => {
    if (!sub.active) return acc;
    const monthlyAmt =
      sub.frequency === 'yearly' ? Math.round((Number(sub.amt) || 0) / 12) : Number(sub.amt) || 0;
    return acc + monthlyAmt;
  }, 0);

  // 4. Days remaining in cycle: guarded against divide-by-zero
  const daysLeft = Math.max(1, CYCLE_DAYS - currentDay);

  // 5. Available spendable runway: remaining - emergency reserve - committed subscriptions
  const available = remaining - safeReserve - committed;

  // 6. Daily allowance: spendable runway divided by remaining days
  const daily = available / daysLeft;
  const displayDaily = Math.max(0, daily);

  // 7. Discretionary pace & projected end balance
  const disc =
    (state.expenses || []).reduce(
      (acc, exp) => (exp.cat !== 'Savings' ? acc + (Number(exp.amt) || 0) : acc),
      0
    ) + (Number(extra) || 0);
  const avg = disc / Math.max(1, currentDay);

  const projected = remaining - committed - avg * daysLeft;

  // 8. Emergency reserve buffer intact
  const reserveIntact =
    state.reserve === 0 ? 0 : Math.min(safeReserve, Math.max(0, remaining - committed));

  // 9. Financial risk level with descriptive one-line reasoning
  let risk: RiskLevel = 'Low';
  let riskReason = 'Runway is stable with projected balance above emergency reserve.';
  if (daily <= 0) {
    risk = 'High';
    riskReason = `Daily allowance depleted. Deficit of ${formatINR(Math.abs(Math.round(projected)))} projected.`;
  } else if (projected < 0) {
    risk = 'High';
    riskReason = `Projected deficit of ${formatINR(Math.abs(Math.round(projected)))} by day 30 at current burn rate.`;
  } else if (daily < 150) {
    risk = 'Medium';
    riskReason = `Daily allowance is tight (${formatINR(Math.round(daily))}/day). Caution advised.`;
  } else if (projected < safeReserve) {
    risk = 'Medium';
    riskReason = `Projected balance (${formatINR(Math.round(projected))}) breaches emergency reserve floor of ${formatINR(safeReserve)}.`;
  }

  // 10. Multiple savings goals aggregations
  const goals = state.goals || [];
  const totalTarget = goals.reduce((acc, g) => acc + (Number(g.target) || 0), 0);
  const totalSaved = goals.reduce((acc, g) => acc + (Number(g.saved) || 0), 0);
  const totalNeed = goals.reduce(
    (acc, g) => acc + Math.max(0, (Number(g.target) || 0) - (Number(g.saved) || 0)),
    0
  );

  const safeTotalTarget = Math.max(1, totalTarget);
  const savingsProgressNow = totalTarget > 0 ? (totalSaved / safeTotalTarget) * 100 : 0;

  // Savings projected progress factoring in month-end surplus
  const projectedSurplusForSavings = Math.max(0, projected - safeReserve);
  const projectedAddable = Math.min(totalNeed, projectedSurplusForSavings);
  const savingsProjected =
    totalTarget > 0 ? ((totalSaved + projectedAddable) / safeTotalTarget) * 100 : 0;

  const onTrack = totalNeed === 0 || projected - safeReserve >= totalNeed;

  // 11. Holistic Financial Health score (0–100)
  const pace = (safeBudget * currentDay) / CYCLE_DAYS;

  const adherence =
    HEALTH_WEIGHTS.ADHERENCE_MAX *
    clamp(1 - Math.max(0, spent - pace) / (HEALTH_WEIGHTS.ADHERENCE_TOLERANCE_PCT * safeBudget));

  const reserveComponent =
    HEALTH_WEIGHTS.RESERVE_MAX * clamp((remaining - committed) / safeReserve);

  const outlook =
    HEALTH_WEIGHTS.OUTLOOK_MAX *
    clamp(projected / (HEALTH_WEIGHTS.OUTLOOK_THRESHOLD_PCT * safeBudget));

  const savingsComponent =
    totalTarget > 0
      ? HEALTH_WEIGHTS.SAVINGS_MAX * clamp(totalSaved / safeTotalTarget)
      : HEALTH_WEIGHTS.SAVINGS_MAX;

  const commitmentsComponent =
    HEALTH_WEIGHTS.COMMITMENTS_MAX *
    clamp(1 - committed / (HEALTH_WEIGHTS.COMMITMENTS_CAP_PCT * safeBudget));

  const score = Math.round(
    adherence + reserveComponent + outlook + savingsComponent + commitmentsComponent
  );

  const healthBreakdown: HealthScoreBreakdown = {
    adherence: Math.round(adherence * 10) / 10,
    reserve: Math.round(reserveComponent * 10) / 10,
    outlook: Math.round(outlook * 10) / 10,
    savings: Math.round(savingsComponent * 10) / 10,
    commitments: Math.round(commitmentsComponent * 10) / 10,
    score: Math.min(100, Math.max(0, score)),
  };

  // 12. Innovation: Survival probability Monte Carlo simulation
  const survival = simulateSurvivalProbability(
    remaining,
    committed,
    daysLeft,
    avg,
    state.expenses || [],
    42
  );

  return {
    totalIncome: safeIncome,
    totalActualExpenses: totalBaseExpenses,
    spent,
    remaining,
    committed,
    daysLeft,
    available,
    daily,
    displayDaily,
    disc,
    avg,
    projected,
    reserveIntact,
    risk,
    riskReason,
    totalNeed,
    totalTarget,
    totalSaved,
    savingsProgressNow: Math.round(savingsProgressNow * 10) / 10,
    savingsProjected: Math.round(savingsProjected * 10) / 10,
    onTrack,
    health: healthBreakdown,
    healthScore: healthBreakdown.score,
    pace,
    survival,
  };
}

/**
 * Generate 31 data points (Days 0 to 30) for chart balance trajectory visualization.
 * Actual balance is plotted for d <= day.
 * Projected balance is plotted for d >= day.
 * Simulated balance is plotted for d >= day when simExtra > 0.
 *
 * @param state Current FinanceState.
 * @param simExtra Extra simulated purchase amount.
 * @returns Array of BalancePoint objects guaranteed to have no NaN values.
 */
export function balanceSeries(state: FinanceState, simExtra: number = 0): BalancePoint[] {
  const safeBudget = state.budget || 0;
  const safeIncome = state.income || 0;
  const currentDay = Math.min(CYCLE_DAYS - 1, Math.max(0, state.day || 0));

  const baseCalc = calc(state, 0);
  const baseAvgBurn = baseCalc.avg + baseCalc.committed / baseCalc.daysLeft;

  const simCalc = simExtra > 0 ? calc(state, simExtra) : null;
  const simAvgBurn = simCalc ? simCalc.avg + simCalc.committed / simCalc.daysLeft : 0;

  const points: BalancePoint[] = [];

  for (let d = 0; d <= CYCLE_DAYS; d++) {
    let actual: number | null = null;
    let projected: number | null = null;
    let simulated: number | null = null;

    if (d <= currentDay) {
      const expensesUpToD = (state.expenses || [])
        .filter((exp) => exp.day <= d)
        .reduce((sum, exp) => sum + (Number(exp.amt) || 0), 0);
      actual = Math.round(safeBudget + safeIncome - expensesUpToD);
      if (isNaN(actual) || !isFinite(actual)) actual = 0;
    }

    if (d >= currentDay) {
      const daysFromNow = d - currentDay;
      const projVal = baseCalc.remaining - baseAvgBurn * daysFromNow;
      projected = isNaN(projVal) || !isFinite(projVal) ? 0 : Math.round(projVal);

      if (simExtra > 0 && simCalc) {
        const simVal = simCalc.remaining - simAvgBurn * daysFromNow;
        simulated = isNaN(simVal) || !isFinite(simVal) ? 0 : Math.round(simVal);
      }
    }

    points.push({
      day: d,
      dayLabel: `D${d}`,
      actual,
      projected,
      simulated,
    });
  }

  return points;
}
