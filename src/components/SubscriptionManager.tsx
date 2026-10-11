import React, { useState } from 'react';
import {
  Repeat,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Percent,
  TrendingDown,
  CalendarDays
} from 'lucide-react';
import { FinanceState, Subscription } from '../types/finance';
import { formatINR } from '../utils/financeCalculations';

interface SubscriptionManagerProps {
  state: FinanceState;
  onToggleSubscription: (id: string) => void;
  onAddSubscription: (name: string, amt: number) => boolean;
  onDeleteSubscription: (id: string) => void;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  state,
  onToggleSubscription,
  onAddSubscription,
  onDeleteSubscription,
}) => {
  const [subName, setSubName] = useState('');
  const [subAmt, setSubAmt] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const subscriptions = state.subs || [];
  const safeBudget = Math.max(1, state.budget);
  const daysLeft = Math.max(1, 30 - state.day);

  // Active total monthly commitment
  const activeMonthlyTotal = subscriptions
    .filter((s) => s.active)
    .reduce((sum, s) => sum + (Number(s.amt) || 0), 0);

  const activeAnnualTotal = activeMonthlyTotal * 12;
  const activeBudgetPct = Math.round((activeMonthlyTotal / safeBudget) * 100);
  const totalDailyDrain = Math.ceil(activeMonthlyTotal / daysLeft);

  // Inactive / Cancelled savings
  const savedMonthly = subscriptions
    .filter((s) => !s.active)
    .reduce((sum, s) => sum + (Number(s.amt) || 0), 0);
  const savedAnnual = savedMonthly * 12;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmed = subName.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a service or subscription name');
      return;
    }

    const numAmt = Number(subAmt);
    if (isNaN(numAmt) || numAmt <= 0) {
      setErrorMsg('Please enter a valid monthly cost in ₹');
      return;
    }

    const ok = onAddSubscription(trimmed, numAmt);
    if (ok) {
      setSubName('');
      setSubAmt('');
      setErrorMsg('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Add Subscription */}
      <div className="p-5 rounded-2xl bg-dark-card border border-dark-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-fintech-violet/10 border border-fintech-violet/20 flex items-center justify-center text-fintech-violet">
            <Repeat className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Subscription & Recurring Commitments
            </h2>
            <p className="text-xs text-dark-muted">
              Auto-renewing charges that lower your daily allowance every single day of the month
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-fintech-red/10 border border-fintech-red/30 flex items-center gap-2 text-xs text-fintech-red">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <label className="block text-[11px] font-mono uppercase text-dark-muted mb-1">
              Subscription Name
            </label>
            <input
              type="text"
              id="sub-name-input"
              placeholder="e.g. Spotify, Netflix, Hotstar, Gym, iCloud"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-input border border-dark-border text-white text-sm placeholder:text-dark-muted/50 focus:outline-none focus:border-fintech-violet transition-colors"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-[11px] font-mono uppercase text-dark-muted mb-1">
              Monthly Cost (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted text-sm font-mono">
                ₹
              </span>
              <input
                type="number"
                id="sub-amount-input"
                min="1"
                step="1"
                placeholder="199"
                value={subAmt}
                onChange={(e) => setSubAmt(e.target.value)}
                className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-dark-input border border-dark-border text-white text-sm font-mono placeholder:text-dark-muted/50 focus:outline-none focus:border-fintech-violet transition-colors"
              />
            </div>
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              id="add-subscription-btn"
              className="w-full py-2.5 px-4 rounded-xl bg-fintech-violet hover:bg-[#b89eff] text-black font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-1.5 shadow-glow-violet"
            >
              <Plus className="w-4 h-4" />
              <span>Add Sub</span>
            </button>
          </div>
        </form>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-dark-card border border-dark-border">
          <span className="text-[10px] uppercase font-mono text-dark-muted block">
            Active Monthly Total
          </span>
          <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
            {formatINR(activeMonthlyTotal)}
            <span className="text-xs font-normal text-dark-muted ml-1">/mo</span>
          </div>
          <span className="text-[11px] text-dark-muted mt-1 block">
            {activeBudgetPct}% of total ₹{state.budget} budget
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-dark-card border border-dark-border">
          <span className="text-[10px] uppercase font-mono text-dark-muted block">
            Daily Allowance Penalty
          </span>
          <div className="text-2xl font-bold text-fintech-amber font-mono tabular-nums mt-1">
            -{formatINR(totalDailyDrain)}
            <span className="text-xs font-normal text-dark-muted ml-1">/day</span>
          </div>
          <span className="text-[11px] text-dark-muted mt-1 block">
            Lowers your spendable allowance each day
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-dark-card border border-dark-border">
          <span className="text-[10px] uppercase font-mono text-dark-muted block">
            Annual Cumulative Drain
          </span>
          <div className="text-2xl font-bold text-fintech-violet font-mono tabular-nums mt-1">
            {formatINR(activeAnnualTotal)}
            <span className="text-xs font-normal text-dark-muted ml-1">/yr</span>
          </div>
          <span className="text-[11px] text-dark-muted mt-1 block">
            12 × active monthly subscriptions
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-dark-card border border-dark-border">
          <span className="text-[10px] uppercase font-mono text-dark-muted block">
            Annual Money Reclaimed
          </span>
          <div className="text-2xl font-bold text-fintech-emerald font-mono tabular-nums mt-1">
            +{formatINR(savedAnnual)}
            <span className="text-xs font-normal text-dark-muted ml-1">/yr</span>
          </div>
          <span className="text-[11px] text-dark-muted mt-1 block">
            Saved by toggling off inactive subscriptions
          </span>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="p-5 rounded-2xl bg-dark-card border border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Active & Paused Subscriptions</h3>
            <p className="text-xs text-dark-muted">
              Toggle any item off to see your daily allowance immediately increase
            </p>
          </div>
          <span className="text-xs font-mono text-dark-muted">
            {subscriptions.length} items registered
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-dark-border">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-dark-border bg-[#0e1210] font-mono uppercase text-[11px] text-dark-muted">
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Monthly Cost</th>
                <th className="py-3 px-4">Annual (x12)</th>
                <th className="py-3 px-4">% of Budget</th>
                <th className="py-3 px-4">Lowers Daily By</th>
                <th className="py-3 px-4">Status & Toggle</th>
                <th className="py-3 px-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-borderSubtle">
              {subscriptions.length > 0 ? (
                subscriptions.map((sub) => {
                  const annualAmt = sub.amt * 12;
                  const pctOfBudget = ((sub.amt / safeBudget) * 100).toFixed(1);
                  const dailyHit = Math.ceil(sub.amt / daysLeft);

                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-dark-cardHover transition-colors group"
                    >
                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{sub.name}</div>
                      </td>

                      {/* Monthly */}
                      <td className="py-3 px-4 font-mono font-bold text-white tabular-nums">
                        {formatINR(sub.amt)}
                      </td>

                      {/* Annual */}
                      <td className="py-3 px-4 font-mono text-dark-muted tabular-nums">
                        {formatINR(annualAmt)}
                      </td>

                      {/* % of Budget */}
                      <td className="py-3 px-4 font-mono text-white tabular-nums">
                        {pctOfBudget}%
                      </td>

                      {/* Lowers Daily Allowance by */}
                      <td className="py-3 px-4 font-mono text-fintech-amber tabular-nums">
                        {sub.active ? `-${formatINR(dailyHit)}/day` : '₹0 (Paused)'}
                      </td>

                      {/* Toggle Active Status */}
                      <td className="py-3 px-4">
                        <button
                          id={`toggle-sub-${sub.id}`}
                          onClick={() => onToggleSubscription(sub.id)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                            sub.active
                              ? 'bg-fintech-emerald/15 hover:bg-fintech-red/20 text-fintech-emerald hover:text-fintech-red border border-fintech-emerald/30 hover:border-fintech-red/30'
                              : 'bg-white/5 hover:bg-fintech-emerald/20 text-dark-muted hover:text-fintech-emerald border border-dark-borderSubtle'
                          }`}
                        >
                          {sub.active ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-fintech-emerald" />
                              <span>Active (Cancel)</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-dark-muted" />
                              <span>Paused (Keep)</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Delete */}
                      <td className="py-3 px-4 text-right">
                        <button
                          id={`delete-sub-${sub.id}`}
                          onClick={() => onDeleteSubscription(sub.id)}
                          className="p-1.5 text-dark-muted hover:text-fintech-red hover:bg-fintech-red/10 rounded-lg transition-colors"
                          title="Delete subscription"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-dark-muted">
                    No subscriptions added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
