import React from 'react';
import { Trash2, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import type { Subscription } from '@/types';
import { formatINR } from '@/utils/financeCalculations';

interface SubscriptionItemProps {
  sub: Subscription;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const SubscriptionItem: React.FC<SubscriptionItemProps> = ({ sub, onToggle, onDelete }) => {
  const isYearly = sub.frequency === 'yearly';
  const monthlyCost = isYearly ? Math.round(sub.amt / 12) : sub.amt;
  const annualCost = isYearly ? sub.amt : sub.amt * 12;

  return (
    <div
      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        sub.active ? 'bg-[#151a17] border-[#29352e]' : 'bg-[#101412] border-[#1d2520] opacity-60'
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onToggle(sub.id)}
          className={`p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-400 ${
            sub.active
              ? 'text-emerald-400 hover:bg-emerald-950/40'
              : 'text-[#64746b] hover:bg-white/5'
          }`}
          aria-label={sub.active ? `Cancel/Pause ${sub.name}` : `Activate ${sub.name}`}
          title={sub.active ? 'Click to pause/cancel' : 'Click to activate'}
        >
          {sub.active ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{sub.name}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                isYearly
                  ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                  : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
              }`}
            >
              {isYearly ? 'Annual' : 'Monthly'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#8e9c93] mt-0.5">
            <span>{sub.active ? 'Active recurring commitment' : 'Cancelled / Paused (No commitment)'}</span>
            {sub.nextPaymentDate && sub.active && (
              <span className="flex items-center gap-1 text-[11px] text-amber-400/90 font-mono">
                <Calendar className="w-3 h-3" />
                Next: {sub.nextPaymentDate}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 font-mono">
        <div className="text-left sm:text-right">
          <div className="text-sm font-bold text-white">
            {formatINR(sub.amt)}
            <span className="text-xs text-[#8e9c93] font-normal">/{isYearly ? 'yr' : 'mo'}</span>
          </div>
          <div className="text-[10px] text-[#8e9c93]">
            {isYearly ? (
              <span>Monthly eq: <strong className="text-emerald-400 font-mono">{formatINR(monthlyCost)}/mo</strong></span>
            ) : (
              <span>Annual: {formatINR(annualCost)}/yr</span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDelete(sub.id)}
          className="p-1.5 text-[#64746b] hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus:ring-1 focus:ring-red-400"
          aria-label={`Delete subscription ${sub.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SubscriptionItem;
