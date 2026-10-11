import React, { useState, useMemo } from 'react';
import type { Expense, ExpenseCategory, FinanceState } from '@/types';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseList } from './ExpenseList';
import { formatINR } from '@/utils/financeCalculations';
import { ArrowDownLeft, ArrowUpRight, Plus, Trash2, Wallet } from 'lucide-react';
import { Modal, Button } from '@/components/ui';

export interface ExpenseTrackerProps {
  state: FinanceState;
  onAddExpense: (expense: {
    name: string;
    amt: number;
    cat: ExpenseCategory;
    day: number;
    description?: string;
    date?: string;
  }) => boolean;
  onEditExpense?: (id: string, updates: Partial<Expense>) => void;
  onDeleteExpense: (id: string) => void;
  onAddIncome?: (source: string, amt: number, day?: number, description?: string) => boolean;
  onDeleteIncome?: (id: string) => void;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  state,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onAddIncome,
  onDeleteIncome,
}) => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'income'>('expenses');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCat, setSelectedFilterCat] = useState<string>('All');

  // Income modal state
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [incomeSource, setIncomeSource] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeDay, setIncomeDay] = useState(state.day || 1);
  const [incomeNotes, setIncomeNotes] = useState('');

  const filteredExpenses = useMemo(() => {
    let list = [...(state.expenses || [])];

    if (selectedFilterCat !== 'All') {
      list = list.filter((exp) => exp.cat === selectedFilterCat);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (exp) =>
          exp.name.toLowerCase().includes(q) ||
          exp.cat.toLowerCase().includes(q) ||
          (exp.description && exp.description.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => {
      if (b.day !== a.day) {
        return b.day - a.day;
      }
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [state.expenses, selectedFilterCat, searchQuery]);

  const handleAddIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddIncome) return;
    const trimmed = incomeSource.trim().slice(0, 60);
    const numAmt = Number(incomeAmount);
    if (!trimmed || !Number.isFinite(numAmt) || numAmt <= 0) return;

    onAddIncome(trimmed, Math.round(numAmt), Number(incomeDay) || state.day, incomeNotes || undefined);
    setIncomeSource('');
    setIncomeAmount('');
    setIncomeNotes('');
    setIsIncomeModalOpen(false);
  };

  const totalIncome = (state.incomes || []).reduce((sum, i) => sum + i.amt, 0) || state.income || 0;

  return (
    <div className="space-y-6">
      {/* Ledger Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-[#131715] p-1.5 rounded-xl border border-[#232b26] w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'expenses'
                ? 'bg-emerald-400 text-black shadow-md'
                : 'text-[#8e9c93] hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            Expenses Ledger ({state.expenses?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('income')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'income'
                ? 'bg-emerald-400 text-black shadow-md'
                : 'text-[#8e9c93] hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Additional Income ({state.incomes?.length || (state.income > 0 ? 1 : 0)})
          </button>
        </div>

        {activeTab === 'income' && onAddIncome && (
          <Button
            variant="primary"
            onClick={() => setIsIncomeModalOpen(true)}
            className="text-xs h-[38px] font-semibold"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Record Income
          </Button>
        )}
      </div>

      {/* Tab 1: Expenses */}
      {activeTab === 'expenses' && (
        <>
          <ExpenseForm currentDay={state.day} onAddExpense={onAddExpense} />
          <ExpenseList
            expenses={filteredExpenses}
            allExpenses={state.expenses}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedFilterCat={selectedFilterCat}
            setSelectedFilterCat={setSelectedFilterCat}
            onDeleteExpense={onDeleteExpense}
            onEditExpense={onEditExpense}
          />
        </>
      )}

      {/* Tab 2: Additional Income */}
      {activeTab === 'income' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#131715] border border-[#232b26]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-mono">
                    Total Additional Income Recorded
                  </h3>
                  <p className="text-xs text-[#8e9c93]">
                    Increases your spendable cash pool directly above the starting ₹10,000 budget
                  </p>
                </div>
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {formatINR(totalIncome)}
              </div>
            </div>

            {(!state.incomes || state.incomes.length === 0) && state.income === 0 ? (
              <div className="py-12 text-center text-xs text-[#8e9c93] border border-dashed border-[#232b26] rounded-xl">
                No additional income recorded this month. Got a scholarship, stipend, or freelancing gig?
                <div className="mt-3">
                  <Button
                    variant="primary"
                    onClick={() => setIsIncomeModalOpen(true)}
                    className="text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Additional Income
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {(state.incomes || []).map((inc) => (
                  <div
                    key={inc.id}
                    className="p-3.5 rounded-xl bg-[#181f1b] border border-[#232b26] flex items-center justify-between gap-3 hover:border-[#334237] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#101512] border border-[#232b26] text-emerald-400">
                        Day {inc.day}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-white">{inc.source}</div>
                        {inc.description && (
                          <div className="text-xs text-[#8e9c93]">{inc.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                        +{formatINR(inc.amt)}
                      </span>
                      {onDeleteIncome && (
                        <button
                          type="button"
                          onClick={() => onDeleteIncome(inc.id)}
                          className="p-1.5 text-[#8e9c93] hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus:ring-1 focus:ring-red-400"
                          aria-label={`Delete income ${inc.source}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Record Income Modal Dialog */}
      {isIncomeModalOpen && (
        <Modal isOpen={true} onClose={() => setIsIncomeModalOpen(false)} title="Record Additional Income">
          <form onSubmit={handleAddIncomeSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="income-source-input"
                className="block text-xs font-mono uppercase text-[#8e9c93] mb-1"
              >
                Income Source
              </label>
              <input
                type="text"
                id="income-source-input"
                maxLength={60}
                placeholder="e.g. Tutoring stipend, Freelance design, Birthday gift"
                value={incomeSource}
                onChange={(e) => setIncomeSource(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="income-amount-input"
                  className="block text-xs font-mono uppercase text-[#8e9c93] mb-1"
                >
                  Amount (₹)
                </label>
                <input
                  type="number"
                  id="income-amount-input"
                  min="1"
                  max="100000"
                  placeholder="2500"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="income-day-input"
                  className="block text-xs font-mono uppercase text-[#8e9c93] mb-1"
                >
                  Day (1–30)
                </label>
                <input
                  type="number"
                  id="income-day-input"
                  min="1"
                  max="30"
                  value={incomeDay}
                  onChange={(e) => setIncomeDay(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="income-notes-input"
                className="block text-xs font-mono uppercase text-[#8e9c93] mb-1"
              >
                Notes (Optional)
              </label>
              <input
                type="text"
                id="income-notes-input"
                maxLength={120}
                placeholder="e.g. Paid into Google Pay"
                value={incomeNotes}
                onChange={(e) => setIncomeNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#232b26]">
              <Button type="button" variant="ghost" onClick={() => setIsIncomeModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Income
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ExpenseTracker;
