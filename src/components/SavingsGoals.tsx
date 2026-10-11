import React, { useState } from 'react';
import {
  PiggyBank,
  Plus,
  Edit2,
  Trash2,
  Check,
  Target,
  Sparkles,
  TrendingUp,
  AlertCircle,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FinanceState, CalculationResult, SavingsGoal } from '../types/finance';
import { formatINR } from '../utils/financeCalculations';

interface SavingsGoalsProps {
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

  // Create Goal Modal / Form state
  const [isCreating, setIsCreating] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalInitialSaved, setNewGoalInitialSaved] = useState('');

  // Edit Goal state
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editTarget, setEditTarget] = useState('');

  // Deposit state
  const [activeDepositGoalId, setActiveDepositGoalId] = useState<string | null>(
    goals.length > 0 ? goals[0].id : null
  );
  const [depositAmount, setDepositAmount] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [errorToast, setErrorToast] = useState('');

  const totalTarget = calc.totalTarget;
  const totalSaved = calc.totalSaved;
  const totalNeed = calc.totalNeed;
  const overallProgress = calc.savingsProgressNow;
  const daysLeft = calc.daysLeft;

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorToast('');
    const trimmed = newGoalName.trim();
    const numTarget = Number(newGoalTarget);
    if (!trimmed || isNaN(numTarget) || numTarget <= 0) {
      setErrorToast('Please enter a valid goal name and target amount.');
      return;
    }

    const numSaved = Math.max(0, Number(newGoalInitialSaved) || 0);
    const ok = onAddGoal(trimmed, numTarget, numSaved);
    if (ok) {
      setNewGoalName('');
      setNewGoalTarget('');
      setNewGoalInitialSaved('');
      setIsCreating(false);
      setSuccessToast(`Created savings goal "${trimmed}"!`);
      setTimeout(() => setSuccessToast(''), 3000);
    }
  };

  const handleSaveEdit = (goalId: string) => {
    const numTarget = Number(editTarget);
    if (!editName.trim() || isNaN(numTarget) || numTarget <= 0) return;
    onEditGoal(goalId, editName.trim(), numTarget);
    setEditingGoalId(null);
  };

  const handleDeposit = (goalId: string, amount: number) => {
    setErrorToast('');
    if (isNaN(amount) || amount <= 0) {
      setErrorToast('Please enter an amount greater than ₹0');
      return;
    }

    if (amount > calc.remaining) {
      setErrorToast(`You only have ${formatINR(calc.remaining)} remaining in your current balance.`);
      return;
    }

    const targetGoal = goals.find((g) => g.id === goalId);
    const ok = onAddSavings(goalId, amount);
    if (ok) {
      setDepositAmount('');
      setSuccessToast(
        `Added ${formatINR(amount)} to "${targetGoal?.name || 'Goal'}". Recorded as a Savings expense in your ledger!`
      );

      // Check if goal reached
      if (targetGoal && (targetGoal.saved + amount >= targetGoal.target)) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#c6ff3d', '#2ee6a0', '#a78bfa'],
        });
      }

      setTimeout(() => setSuccessToast(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview & Add New Goal Header */}
      <div className="p-6 rounded-2xl bg-dark-card border border-dark-border relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-fintech-lime/15 border border-fintech-lime/30 flex items-center justify-center text-fintech-lime shadow-glow-lime">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Savings Goals Hub
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-fintech-lime/20 text-fintech-lime border border-fintech-lime/30">
                  {goals.length} Goals Active
                </span>
              </div>
              <p className="text-xs text-dark-muted">
                Create multiple milestone buckets to protect your money for long-term targets
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-fintech-lime text-black font-semibold text-xs shadow-glow-lime hover:bg-[#d6ff66] transition-all"
          >
            {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isCreating ? 'Cancel' : 'Add New Goal'}</span>
          </button>
        </div>

        {/* Global Progress Metrics */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-center text-xs">
            <span className="text-dark-muted font-medium">Cumulative Savings Progress</span>
            <span className="font-mono font-bold text-fintech-lime">{overallProgress}%</span>
          </div>
          <div className="w-full bg-[#1b221e] rounded-full h-3 p-0.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-fintech-emerald to-fintech-lime h-full rounded-full transition-all duration-700 shadow-glow-lime"
              style={{ width: `${Math.min(100, overallProgress)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white font-bold">Total Saved: {formatINR(totalSaved)}</span>
            <span className="text-dark-muted">Combined Target: {formatINR(totalTarget)}</span>
          </div>
        </div>

        {/* Quick Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-dark-borderSubtle text-xs">
          <div className="p-3 rounded-xl bg-[#0e1210] border border-dark-borderSubtle">
            <span className="text-[10px] font-mono uppercase text-dark-muted block">Total Needed</span>
            <span className="text-base font-bold text-white font-mono mt-0.5 block">{formatINR(totalNeed)}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0e1210] border border-dark-borderSubtle">
            <span className="text-[10px] font-mono uppercase text-dark-muted block">Daily Pace Needed</span>
            <span className="text-base font-bold text-fintech-lime font-mono mt-0.5 block">
              {formatINR(totalNeed > 0 ? Math.ceil(totalNeed / daysLeft) : 0)}/day
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#0e1210] border border-dark-borderSubtle">
            <span className="text-[10px] font-mono uppercase text-dark-muted block">Feasibility Status</span>
            <span className={`text-base font-bold font-mono mt-0.5 block ${calc.onTrack ? 'text-fintech-emerald' : 'text-fintech-amber'}`}>
              {calc.onTrack ? 'On Track' : 'At Risk'}
            </span>
          </div>
        </div>
      </div>

      {/* New Goal Form */}
      {isCreating && (
        <form onSubmit={handleCreateGoal} className="p-5 rounded-2xl bg-dark-card border border-fintech-lime/30 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-fintech-lime" />
            <span>Create New Savings Target</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-dark-muted mb-1">
                Goal Name
              </label>
              <input
                type="text"
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                placeholder="e.g. Goa Trip, New Phone, Cert Exam"
                className="w-full px-3 py-2 rounded-xl bg-dark-input border border-dark-border text-white text-xs focus:outline-none focus:border-fintech-lime"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase text-dark-muted mb-1">
                Target Amount (₹)
              </label>
              <input
                type="number"
                min="100"
                step="100"
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(e.target.value)}
                placeholder="3000"
                className="w-full px-3 py-2 rounded-xl bg-dark-input border border-dark-border text-white text-xs font-mono focus:outline-none focus:border-fintech-lime"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase text-dark-muted mb-1">
                Initial Saved (Optional ₹)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={newGoalInitialSaved}
                onChange={(e) => setNewGoalInitialSaved(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl bg-dark-input border border-dark-border text-white text-xs font-mono focus:outline-none focus:border-fintech-lime"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-dark-muted hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-fintech-lime text-black font-semibold text-xs shadow-glow-lime"
            >
              Create Goal
            </button>
          </div>
        </form>
      )}

      {/* Toast Alerts */}
      {successToast && (
        <div className="p-3 rounded-xl bg-fintech-emerald/15 border border-fintech-emerald/30 text-fintech-emerald text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {errorToast && (
        <div className="p-3 rounded-xl bg-fintech-red/10 border border-fintech-red/30 text-fintech-red text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Individual Goals List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white tracking-tight">Active Savings Goals</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const isEditingThis = editingGoalId === goal.id;
            const goalPct = Math.min(100, Math.round(((goal.saved || 0) / Math.max(1, goal.target)) * 100));
            const goalNeed = Math.max(0, goal.target - goal.saved);

            return (
              <div
                key={goal.id}
                className="p-5 rounded-2xl bg-dark-card border border-dark-border flex flex-col justify-between space-y-4 hover:border-dark-muted/40 transition-colors"
              >
                {/* Goal Top Info */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    {isEditingThis ? (
                      <div className="flex-1 mr-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-2 py-1 rounded bg-dark-input border border-dark-border text-white text-xs w-1/2"
                        />
                        <input
                          type="number"
                          value={editTarget}
                          onChange={(e) => setEditTarget(e.target.value)}
                          className="px-2 py-1 rounded bg-dark-input border border-dark-border text-white text-xs font-mono w-1/3"
                        />
                        <button
                          onClick={() => handleSaveEdit(goal.id)}
                          className="p-1 rounded bg-fintech-lime text-black"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-white text-base">{goal.name}</h4>
                        <span className="text-xs text-dark-muted font-mono">
                          Target: {formatINR(goal.target)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      {!isEditingThis && (
                        <button
                          onClick={() => {
                            setEditingGoalId(goal.id);
                            setEditName(goal.name);
                            setEditTarget(String(goal.target));
                          }}
                          className="p-1.5 rounded-lg text-dark-muted hover:text-white hover:bg-white/5"
                          title="Edit Goal"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteGoal(goal.id)}
                        className="p-1.5 rounded-lg text-dark-muted hover:text-fintech-red hover:bg-fintech-red/10"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5 mt-3">
                    <div className="w-full bg-[#1b221e] rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-fintech-lime h-full rounded-full transition-all duration-500 shadow-glow-lime"
                        style={{ width: `${goalPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-fintech-lime font-bold">{formatINR(goal.saved)} saved</span>
                      <span className="text-dark-muted">{goalPct}% ({formatINR(goalNeed)} to go)</span>
                    </div>
                  </div>
                </div>

                {/* Quick Add Money to this goal */}
                <div className="pt-3 border-t border-dark-borderSubtle">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Add ₹"
                      value={activeDepositGoalId === goal.id ? depositAmount : ''}
                      onFocus={() => setActiveDepositGoalId(goal.id)}
                      onChange={(e) => {
                        setActiveDepositGoalId(goal.id);
                        setDepositAmount(e.target.value);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-dark-input border border-dark-border text-white text-xs font-mono focus:outline-none focus:border-fintech-lime"
                    />
                    <button
                      onClick={() => handleDeposit(goal.id, Number(depositAmount))}
                      className="px-3.5 py-1.5 rounded-xl bg-fintech-lime text-black font-semibold text-xs shadow-glow-lime flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Deposit</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
