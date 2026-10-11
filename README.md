# Broke But Functional: Survive the Month 💸

> **"30 days. ₹10,000. Make every rupee count."**  
> A high-impact financial survival engine and decision simulator built for students and Gen Z navigating a tight monthly budget.

---

## 🎯 What It Is

**Broke But Functional: Survive the Month** is not just an expense tracker—it is an **active consequence simulator**. It gives students and young adults living on a ₹10,000 budget a sandbox where they can experiment with purchases before spending a single rupee and immediately see the ripple effects on:
- Their **daily allowance** for the rest of the month
- Their **projected day 30 balance** and shortfall risks
- Their **emergency reserve buffer**
- Their **multiple savings goals trajectory**
- Their **holistic financial health score**

All numbers are formatted in Indian Rupee (**INR / ₹**) using `Intl.NumberFormat('en-IN')`. Everything runs entirely in the browser with zero backend, zero paid APIs, and persistent `localStorage` wrapped in try/catch.

---

## 🧭 The 12 Compulsory Features

1. **Budget Management**: Starts with ₹10,000 for a 30-day period (fully editable in Settings).
2. **Balance Tracking**: Total budget, total spent, remaining balance, and locked commitments.
3. **Expense Tracker**: Add and delete expenses across 7 categories (Food, Travel, Shopping, Entertainment, Bills, Savings, Other) with instant search and category filter pills.
4. **Daily Allowance**: Spendable amount per remaining day (`available ÷ daysLeft`), alerting in red if negative or tight.
5. **Multiple Savings Goals**: Create, edit, and delete multiple goals (name, target, saved). "Deposit Money" flow increments goal progress while automatically logging a real "Savings" expense in the ledger.
6. **Subscription Manager**: Add, toggle (Cancel/Keep), and delete recurring payments; displays monthly cost, annual cost (×12), saved-if-cancelled, % of budget, and exact daily allowance reduction (`-₹X/day`).
7. **Unexpected Expenses (Emergency Hub)**: Dedicated Emergency shock hub with presets (₹1,500 medical, ₹3,000 repair, ₹800 travel) plus custom amounts. Shows before/after impact and lets users apply it as a real expense after confirmation.
8. **Monthly Forecast**: Projected balance at day 30, plus an interactive Recharts line chart (actual solid emerald, projected dashed violet, simulated amber dashed).
9. **Financial Risk**: Low / Medium / High badge with an explicit, one-line explanation.
10. **Financial Health**: 0 to 100 holistic score with a 5-component breakdown, transparently labeled *"app-generated indicator, not professional financial advice"*.
11. **Decision Simulator (The Main Attraction)**: Test any prospective purchase before spending, featuring:
    - **Buy Now**: Consequence breakdown + "Confirm purchase" button.
    - **Wait 7 Days**: 7-Day cooling rule calculations preserving current allowance for 7 days.
    - **Skip**: Quantifies money kept and comparative day 30 balances.
12. **Connected Calculations**: Any modification anywhere immediately updates balance, allowance, savings, forecast, risk, and health across all components.

---

## 🧮 Mathematical Engine (`src/utils/financeCalculations.ts`)

Every component reads from a single pure calculation function: `calc(state, extra = 0)`.

```typescript
// 1. Core aggregates
spent = sum(expenses.amt) + extra
remaining = budget + income - spent
committed = sum(active subscription amounts)
daysLeft = max(1, 30 - day)
available = remaining - reserve - committed

// 2. Daily burn rate
daily = available / daysLeft   // Display max(0, daily); highlighted red if <= 0

// 3. Discretionary pace & end projection
disc = sum(expenses where cat != 'Savings') + extra
avg = disc / max(1, day)
projected = remaining - committed - (avg * daysLeft)

// 4. Reserve buffer intact
reserveIntact = min(reserve, max(0, remaining - committed))

// 5. Financial risk rating & reason
risk = projected < 0 ? "High" : projected < reserve ? "Medium" : "Low"

// 6. Multiple savings goals aggregations
totalNeed = sum(max(0, target - saved))
totalTarget = sum(target)
totalSaved = sum(saved)
savingsProgressNow = (totalSaved / totalTarget) * 100
savingsProjected = (totalSaved + min(totalNeed, max(0, projected - reserve))) / totalTarget * 100
onTrack = (projected - reserve) >= totalNeed

// 7. Holistic Financial Health Score (0-100)
// Using pace = budget * day / 30 and clamp(x) = min(1, max(0, x))
adherence   = 30 * clamp(1 - max(0, spent - pace) / (0.25 * budget))
reserve     = 20 * clamp((remaining - committed) / reserve)
outlook     = 25 * clamp(projected / (0.15 * budget))
savings     = 15 * clamp(totalSaved / totalTarget)
commitments = 10 * clamp(1 - committed / (0.20 * budget))
score       = round(adherence + reserve + outlook + savings + commitments)
```

### "Wait 7 Days" Calculation
```typescript
if (daysLeft > 7) {
  newAllowance = (available - (daily * 7) - amount) / (daysLeft - 7);
} else {
  // Rolls cleanly into the subsequent month's budget
}
```

---

## 🛠️ Tech Stack

- **React 19** + **TypeScript**
- **Vite 6** (Fast HMR & production bundler)
- **Tailwind CSS v3** (Custom dark fintech palette, borders, glows)
- **Recharts 2** (Dual-line forecast & category doughnut)
- **Lucide React** (Consistent icons)
- **Canvas Confetti** (Milestone celebration)
- **State Architecture**: `useFinance` hook backed by `localStorage` persistence and fallback seed data.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Create production build
npm run build
```
Access the application locally at: **http://localhost:5173/**
