import React from 'react';
import { Trash2, CheckCircle2, XCircle } from 'lucide-react';
import type { Subscription } from '@/types';
import { formatINR } from '@/utils/financeCalculations';

interface SubscriptionItemProps {
  sub: Subscription;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const SubscriptionItem: React.FC<SubscriptionItemProps> = ({ sub, onToggle, onDelete }) => {
  return (
    <div
      className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
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
          aria-label={sub.active ? `Pause ${sub.name}` : `Activate ${sub.name}`}
        >
          {sub.active ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
        </button>
        <div>
          <div className="text-sm font-semibold text-white">{sub.name}</div>
          <div className="text-xs text-[#8e9c93]">
            {sub.active ? 'Active monthly commitment' : 'Paused / Cancelled'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 font-mono">
        <div className="text-right">
          <div className="text-sm font-bold text-white">{formatINR(sub.amt)}/mo</div>
          <div className="text-[10px] text-[#8e9c93]">₹{Math.round((sub.amt * 12) / 365)}/d</div>
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
