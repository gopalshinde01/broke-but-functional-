import React, { useState } from 'react';
import { Edit2, Trash2, Check, Sparkles, X } from 'lucide-react';
import type { SavingsGoal } from '@/types';
import { formatINR } from '@/utils/financeCalculations';
import { ProgressBar, Button } from '@/components/ui';

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  remainingBalance: number;
  onEditGoal: (id: string, name: string, target: number, saved?: number) => void;
  onDeleteGoal: (id: string) => void;
  onAddSavings: (goalId: string, amount: number) => boolean;
}

export const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({
  goal,
  remainingBalance,
  onEditGoal,
  onDeleteGoal,
  onAddSavings,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(goal.name);
  const [editTarget, setEditTarget] = useState(String(goal.target));
  const [customDeposit, setCustomDeposit] = useState('');

  const pct = Math.min(100, Math.round(((goal.saved || 0) / (goal.target || 1)) * 100));
  const isCompleted = (goal.saved || 0) >= goal.target;

  const handleSaveEdit = () => {
    const numTarget = Number(editTarget);
    if (!editName.trim() || !Number.isFinite(numTarget) || numTarget <= 0) return;
    onEditGoal(goal.id, editName.trim(), Math.round(numTarget));
    setIsEditing(false);
  };

  const handleDeposit = (amount: number) => {
    if (amount <= 0 || amount > remainingBalance) return;
    onAddSavings(goal.id, amount);
  };

  return (
    <div className="p-5 rounded-2xl bg-[#131715] border border-[#232b26] flex flex-col justify-between space-y-4">
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editName}
            maxLength={60}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-[#181f1b] border border-[#232b26] text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
          <input
            type="number"
            min="1"
            value={editTarget}
            onChange={(e) => setEditTarget(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-[#181f1b] border border-[#232b26] text-white text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
              <X className="w-3.5 h-3.5" />
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveEdit}>
              <Check className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-bold text-white text-sm">{goal.name}</h3>
              <span className="text-xs text-[#8e9c93]">
                {formatINR(goal.saved)} of {formatINR(goal.target)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1 text-[#8e9c93] hover:text-white rounded transition-colors"
                aria-label={`Edit ${goal.name}`}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDeleteGoal(goal.id)}
                className="p-1 text-[#8e9c93] hover:text-red-400 rounded transition-colors"
                aria-label={`Delete ${goal.name}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <ProgressBar
            value={pct}
            max={100}
            color={isCompleted ? 'emerald' : 'emerald'}
            heightClass="h-2"
            label={`${goal.name} Progress`}
          />
          <div className="flex justify-between items-center text-[11px] font-mono text-[#8e9c93] mt-1">
            <span>
              {isCompleted ? 'Goal Fully Achieved!' : `₹${goal.target - goal.saved} needed`}
            </span>
            <span className="font-bold text-emerald-400">{pct}%</span>
          </div>
        </div>
      )}

      {/* Quick Deposit Buttons */}
      <div className="pt-3 border-t border-[#232b26]">
        <div className="text-[11px] font-mono uppercase text-[#8e9c93] mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>Contribute from Balance</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {[100, 250, 500].map((amt) => (
            <button
              key={amt}
              type="button"
              disabled={amt > remainingBalance}
              onClick={() => handleDeposit(amt)}
              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#181f1b] hover:bg-[#222b25] border border-[#232b26] text-[#8e9c93] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              +{amt}
            </button>
          ))}
          <div className="flex items-center gap-1 ml-auto">
            <input
              type="number"
              placeholder="₹"
              value={customDeposit}
              onChange={(e) => setCustomDeposit(e.target.value)}
              className="w-16 px-2 py-1 rounded-lg bg-[#181f1b] border border-[#232b26] text-white text-xs font-mono"
            />
            <Button
              variant="secondary"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => {
                const amt = Number(customDeposit);
                if (amt > 0) {
                  handleDeposit(amt);
                  setCustomDeposit('');
                }
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsGoalCard;
