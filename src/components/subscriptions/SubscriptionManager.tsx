import React, { useState } from 'react';
import { Repeat, Plus, AlertCircle } from 'lucide-react';
import type { FinanceState, BillingFrequency } from '@/types';
import { Button } from '@/components/ui';
import { SubscriptionMetrics } from './SubscriptionMetrics';
import { SubscriptionItem } from './SubscriptionItem';

export interface SubscriptionManagerProps {
  state: FinanceState;
  onToggleSubscription: (id: string) => void;
  onAddSubscription: (name: string, amt: number, frequency?: BillingFrequency, nextPaymentDate?: string) => boolean;
  onDeleteSubscription: (id: string) => void;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  state,
  onToggleSubscription,
  onAddSubscription,
  onDeleteSubscription,
}) => {
  const [name, setName] = useState('');
  const [amt, setAmt] = useState('');
  const [frequency, setFrequency] = useState<BillingFrequency>('monthly');
  const [nextPaymentDate, setNextPaymentDate] = useState('Day 25');
  const [errorMsg, setErrorMsg] = useState('');

  const subscriptions = state.subs || [];
  const safeBudget = Math.max(1, state.budget);
  const daysLeft = Math.max(1, 30 - state.day);

  // Accounting engine: convert annual subscriptions to monthly-equivalent costs
  const getMonthlyCost = (s: { amt: number; frequency?: BillingFrequency }) =>
    s.frequency === 'yearly' ? Math.round(s.amt / 12) : s.amt;

  const activeMonthlyTotal = subscriptions
    .filter((s) => s.active)
    .reduce((sum, s) => sum + (getMonthlyCost(s) || 0), 0);

  const activeAnnualTotal = subscriptions
    .filter((s) => s.active)
    .reduce((sum, s) => sum + (s.frequency === 'yearly' ? s.amt : s.amt * 12), 0);

  const activeBudgetPct = Math.round((activeMonthlyTotal / safeBudget) * 100);
  const totalDailyDrain = Math.ceil(activeMonthlyTotal / daysLeft);

  const savedAnnual = subscriptions
    .filter((s) => !s.active)
    .reduce((sum, s) => sum + (s.frequency === 'yearly' ? s.amt : s.amt * 12), 0);

  const activeCount = subscriptions.filter((s) => s.active).length;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const trimmed = name.trim().slice(0, 60);
    const numAmt = Number(amt);
    if (!trimmed) {
      setErrorMsg('Please enter a subscription name');
      return;
    }
    if (!Number.isFinite(numAmt) || numAmt <= 0) {
      setErrorMsg('Please enter a valid amount');
      return;
    }

    const ok = onAddSubscription(trimmed, numAmt, frequency, nextPaymentDate.trim() || undefined);
    if (ok) {
      setName('');
      setAmt('');
      setErrorMsg('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-[#131715] border border-[#232b26]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Repeat className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Subscription & Recurring Commitments
            </h2>
            <p className="text-xs text-[#8e9c93]">
              Auto-renewing monthly and annual commitments that affect your available spending allowance and future projections
            </p>
          </div>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-900/60 flex items-center gap-2 text-xs text-red-300"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-6 bg-[#0e1210] p-4 rounded-xl border border-[#1f2823]">
          <div className="sm:col-span-4">
            <label
              htmlFor="sub-name"
              className="block text-[11px] font-mono uppercase text-[#8e9c93] mb-1"
            >
              Subscription Name
            </label>
            <input
              type="text"
              id="sub-name"
              maxLength={60}
              placeholder="e.g. Spotify, Netflix, Gym"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="sub-frequency"
              className="block text-[11px] font-mono uppercase text-[#8e9c93] mb-1"
            >
              Billing Frequency
            </label>
            <select
              id="sub-frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as BillingFrequency)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="monthly">Monthly Recurring</option>
              <option value="yearly">Yearly / Annual</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="sub-amount"
              className="block text-[11px] font-mono uppercase text-[#8e9c93] mb-1"
            >
              {frequency === 'yearly' ? 'Annual (₹)' : 'Monthly (₹)'}
            </label>
            <input
              type="number"
              id="sub-amount"
              min="1"
              max="50000"
              placeholder={frequency === 'yearly' ? '1199' : '199'}
              value={amt}
              onChange={(e) => setAmt(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="sub-date"
              className="block text-[11px] font-mono uppercase text-[#8e9c93] mb-1"
            >
              Next Due Date
            </label>
            <input
              type="text"
              id="sub-date"
              placeholder="e.g. Day 25"
              value={nextPaymentDate}
              onChange={(e) => setNextPaymentDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div className="sm:col-span-1 flex items-end">
            <Button variant="primary" type="submit" className="w-full h-[42px] text-xs">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </form>

        <SubscriptionMetrics
          activeMonthlyTotal={activeMonthlyTotal}
          activeAnnualTotal={activeAnnualTotal}
          totalDailyDrain={totalDailyDrain}
          savedAnnual={savedAnnual}
          activeBudgetPct={activeBudgetPct}
          upcomingCount={activeCount}
        />

        <div className="space-y-2.5">
          {subscriptions.length === 0 ? (
            <div className="text-center py-8 text-sm text-[#8e9c93] bg-[#0e1210] rounded-xl border border-dashed border-[#232b26]">
              No subscriptions added yet. Add regular commitments above to protect your daily budget.
            </div>
          ) : (
            subscriptions.map((sub) => (
              <SubscriptionItem
                key={sub.id}
                sub={sub}
                onToggle={onToggleSubscription}
                onDelete={onDeleteSubscription}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;
