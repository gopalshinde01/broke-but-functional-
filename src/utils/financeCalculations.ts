import {
  FinanceState,
  CalculationResult,
  BalancePoint,
  HealthScoreBreakdown,
  RiskLevel
} from '../types/finance';

/**
 * Format a number into Indian Rupee currency string using Intl en-IN
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
 * Clamp a number between 0 and 1
 */
function clamp(x: number): number {
  if (isNaN(x) || !isFinite(x)) return 0;
  return Math.min(1, Math.max(0, x));
}

/**
 * Single source of truth calculation for all components
 * @param state Current FinanceState
 * @param extra Simulated additional spend (defaults to 0)
 */
export function calc(state: FinanceState, extra: number = 0): CalculationResult {
  const safeBudget = Math.max(1, state.budget || 0);
  const safeReserve = Math.max(1, state.reserve || 0);
  const safeIncome = state.income || 0;
  const currentDay = Math.min(29, Math.max(0, state.day || 0));

  // spent = sum(expenses.amt) + extra
  const totalBaseExpenses = (state.expenses || []).reduce(
    (acc, exp) => acc + (Number(exp.amt) || 0),
    0
  );
  const spent = totalBaseExpenses + (Number(extra) || 0);

  // remaining = budget + income − spent
  const remaining = safeBudget + safeIncome - spent;

  // committed = sum of active subscription amounts
  const committed = (state.subs || []).reduce(
    (acc, sub) => (sub.active ? acc + (Number(sub.amt) || 0) : acc),
    0
  );

  // daysLeft = max(1, 30 − day)
  const daysLeft = Math.max(1, 30 - currentDay);

  // available = remaining − reserve − committed
  const available = remaining - safeReserve - committed;

  // daily = available ÷ daysLeft (display max(0, daily); show red if negative)
  const daily = available / daysLeft;
  const displayDaily = Math.max(0, daily);

  // disc = sum of non-"Savings" expenses + extra; avg = disc ÷ max(1, day)
  const disc =
    (state.expenses || []).reduce(
      (acc, exp) => (exp.cat !== 'Savings' ? acc + (Number(exp.amt) || 0) : acc),
      0
    ) + (Number(extra) || 0);
  const avg = disc / Math.max(1, currentDay);

  // projected = remaining − committed − avg × daysLeft
  const projected = remaining - committed - avg * daysLeft;

  // reserveIntact = min(reserve, max(0, remaining − committed))
  const reserveIntact = Math.min(safeReserve, Math.max(0, remaining - committed));

  // risk = projected < 0 ? "High" : projected < reserve ? "Medium" : "Low"
  let risk: RiskLevel = 'Low';
  let riskReason = 'Runway is stable with projected balance above emergency reserve.';
  if (projected < 0) {
    risk = 'High';
    riskReason = `Projected deficit of ${formatINR(Math.abs(Math.round(projected)))} by day 30 at current burn rate.`;
  } else if (projected < safeReserve) {
    risk = 'Medium';
    riskReason = `Projected balance (${formatINR(Math.round(projected))}) breaches emergency reserve floor of ${formatINR(safeReserve)}.`;
  }

  // Multiple savings goals aggregations
  const goals = state.goals || [];
  const totalTarget = goals.reduce((acc, g) => acc + (Number(g.target) || 0), 0);
  const totalSaved = goals.reduce((acc, g) => acc + (Number(g.saved) || 0), 0);
  const totalNeed = goals.reduce((acc, g) => acc + Math.max(0, (Number(g.target) || 0) - (Number(g.saved) || 0)), 0);

  const safeTotalTarget = Math.max(1, totalTarget);
  const savingsProgressNow = totalTarget > 0 ? (totalSaved / safeTotalTarget) * 100 : 0;

  // savingsProjected = (totalSaved + min(totalNeed, max(0, projected − reserve))) ÷ totalTarget × 100
  const projectedSurplusForSavings = Math.max(0, projected - safeReserve);
  const projectedAddable = Math.min(totalNeed, projectedSurplusForSavings);
  const savingsProjected = totalTarget > 0 ? ((totalSaved + projectedAddable) / safeTotalTarget) * 100 : 0;

  // onTrack = projected − reserve ≥ totalNeed
  const onTrack = totalNeed === 0 || (projected - safeReserve >= totalNeed);

  // Health score (0–100, label it "app-generated indicator, not professional financial advice")
  // clamp(x) = min(1, max(0, x)); pace = budget × day ÷ 30
  const pace = (safeBudget * currentDay) / 30;

  // adherence = 30 × clamp(1 − max(0, spent − pace) ÷ (0.25 × budget))
  const adherence = 30 * clamp(1 - Math.max(0, spent - pace) / (0.25 * safeBudget));

  // reserve = 20 × clamp((remaining − committed) ÷ reserve)
  const reserveComponent = 20 * clamp((remaining - committed) / safeReserve);

  // outlook = 25 × clamp(projected ÷ (0.15 × budget))
  const outlook = 25 * clamp(projected / (0.15 * safeBudget));

  // savings = 15 × clamp(totalSaved ÷ totalTarget)
  const savingsComponent = totalTarget > 0 ? 15 * clamp(totalSaved / safeTotalTarget) : 15;

  // commitments = 10 × clamp(1 − committed ÷ (0.2 × budget))
  const commitmentsComponent = 10 * clamp(1 - committed / (0.2 * safeBudget));

  // score = round(sum)
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

  return {
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
  };
}

/**
 * Export balance series for chart:
 * Returning arrays for days 0–30.
 * Actual: bal(d) = budget + income − sum(expenses with day ≤ d), for d ≤ day.
 * Projected for d ≥ day: remaining − (avg + committed ÷ daysLeft) × (d − day).
 * Simulated: same with the extra applied.
 */
export function balanceSeries(
  state: FinanceState,
  simExtra: number = 0
): BalancePoint[] {
  const safeBudget = state.budget || 0;
  const safeIncome = state.income || 0;
  const currentDay = Math.min(29, Math.max(0, state.day || 0));

  // Base state calculations
  const baseCalc = calc(state, 0);
  const baseAvgBurn = baseCalc.avg + baseCalc.committed / baseCalc.daysLeft;

  // Simulated calculations if simExtra > 0
  const simCalc = simExtra > 0 ? calc(state, simExtra) : null;
  const simAvgBurn = simCalc
    ? simCalc.avg + simCalc.committed / simCalc.daysLeft
    : 0;

  const points: BalancePoint[] = [];

  for (let d = 0; d <= 30; d++) {
    let actual: number | null = null;
    let projected: number | null = null;
    let simulated: number | null = null;

    // Actual balance for d <= day
    if (d <= currentDay) {
      const expensesUpToD = (state.expenses || [])
        .filter((exp) => exp.day <= d)
        .reduce((sum, exp) => sum + (Number(exp.amt) || 0), 0);
      actual = Math.round(safeBudget + safeIncome - expensesUpToD);
    }

    // Projected balance for d >= day
    if (d >= currentDay) {
      const daysFromNow = d - currentDay;
      const projVal = baseCalc.remaining - baseAvgBurn * daysFromNow;
      projected = Math.round(projVal);

      if (simExtra > 0 && simCalc) {
        const simVal = simCalc.remaining - simAvgBurn * daysFromNow;
        simulated = Math.round(simVal);
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
