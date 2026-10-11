import React, { useState } from 'react';
import { PiggyBank, Plus } from 'lucide-react';
import type { FinanceState, CalculationResult } from '@/types';
import { Button, Modal } from '@/components/ui';
import { SavingsOverview } from './SavingsOverview';
import { SavingsGoalCard } from './SavingsGoalCard';

export interface SavingsGoalsProps {
  state: FinanceState;
  calc: CalculationResult;
  onAddGoal: (name: string, target: number, initialSaved?: number) => boolean;
  onEditGoal: (id: string, name: string, target: number, saved?: number) => void;
  onDeleteGoal: (id: string) => void;
  onAddSavings: (goalId: string, amount: number) => boolean;
}

export const SavingsGoals: React.FC<SavingsGoalsProps> = ({
  state,
  calc,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onAddSavings,
}) => {
  const goals = state.goals || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [initialSaved, setInitialSaved] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    const numTarget = Number(target);
    if (!trimmed || !Number.isFinite(numTarget) || numTarget <= 0) return;

    const numSaved = Math.max(0, Number(initialSaved) || 0);
    const ok = onAddGoal(trimmed, numTarget, numSaved);
    if (ok) {
      setName('');
      setTarget('');
      setInitialSaved('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-[#131715] border border-[#232b26]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Savings Goals Hub</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                  {goals.length} Goals Active
                </span>
              </div>
              <p className="text-xs text-[#8e9c93]">
                Create multiple milestone buckets to protect your money for long-term targets
              </p>
            </div>
          </div>

          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Create New Goal</span>
          </Button>
        </div>

        <SavingsOverview calc={calc} goalCount={goals.length} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              remainingBalance={calc.remaining}
              onEditGoal={onEditGoal}
              onDeleteGoal={onDeleteGoal}
              onAddSavings={onAddSavings}
            />
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Savings Goal"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label
              htmlFor="goal-name-input"
              className="block text-xs font-mono uppercase text-[#8e9c93] mb-1"
            >
              Goal Name
            </label>
            <input
              type="text"
              id="goal-name-input"
              maxLength={60}
              placeholder="e.g. New Laptop, Goa Trip, Course Fee"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
          </div>

          <div>
            <label
              htmlFor="goal-target-input"
              className="block text-xs font-mono uppercase text-[#8e9c93] mb-1"
            >
              Target Amount (₹)
            </label>
            <input
              type="number"
              id="goal-target-input"
              min="1"
              max="500000"
              placeholder="3000"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
          </div>

          <div>
            <label
              htmlFor="goal-initial-saved"
              className="block text-xs font-mono uppercase text-[#8e9c93] mb-1"
            >
              Already Saved Amount (₹, optional)
            </label>
            <input
              type="number"
              id="goal-initial-saved"
              min="0"
              max="500000"
              placeholder="0"
              value={initialSaved}
              onChange={(e) => setInitialSaved(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Goal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SavingsGoals;
