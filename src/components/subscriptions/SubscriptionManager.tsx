import React, { useState } from 'react';
import { Repeat, Plus, AlertCircle } from 'lucide-react';
import type { FinanceState } from '@/types';
import { Button } from '@/components/ui';
import { SubscriptionMetrics } from './SubscriptionMetrics';
import { SubscriptionItem } from './SubscriptionItem';

export interface SubscriptionManagerProps {
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
  const [name, setName] = useState('');
  const [amt, setAmt] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const subscriptions = state.subs || [];
  const safeBudget = Math.max(1, state.budget);
  const daysLeft = Math.max(1, 30 - state.day);

  const activeMonthlyTotal = subscriptions
    .filter((s) => s.active)
    .reduce((sum, s) => sum + (Number(s.amt) || 0), 0);

  const activeAnnualTotal = activeMonthlyTotal * 12;
  const activeBudgetPct = Math.round((activeMonthlyTotal / safeBudget) * 100);
  const totalDailyDrain = Math.ceil(activeMonthlyTotal / daysLeft);

  const savedMonthly = subscriptions
    .filter((s) => !s.active)
    .reduce((sum, s) => sum + (Number(s.amt) || 0), 0);
  const savedAnnual = savedMonthly * 12;

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

    const ok = onAddSubscription(trimmed, numAmt);
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
              Auto-renewing charges that lower your daily allowance every single day of the month
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

        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-6">
          <div className="sm:col-span-6">
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
              placeholder="e.g. Spotify, Netflix, Hotstar, Gym"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div className="sm:col-span-4">
            <label
              htmlFor="sub-amount"
              className="block text-[11px] font-mono uppercase text-[#8e9c93] mb-1"
            >
              Monthly Cost (₹)
            </label>
            <input
              type="number"
              id="sub-amount"
              min="1"
              max="50000"
              placeholder="199"
              value={amt}
              onChange={(e) => setAmt(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div className="sm:col-span-2 flex items-end">
            <Button variant="primary" type="submit" className="w-full h-[42px] text-xs">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </form>

        <SubscriptionMetrics
          activeMonthlyTotal={activeMonthlyTotal}
          activeAnnualTotal={activeAnnualTotal}
          totalDailyDrain={totalDailyDrain}
          savedAnnual={savedAnnual}
          activeBudgetPct={activeBudgetPct}
        />

        <div className="space-y-2.5">
          {subscriptions.map((sub) => (
            <SubscriptionItem
              key={sub.id}
              sub={sub}
              onToggle={onToggleSubscription}
              onDelete={onDeleteSubscription}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;
