import React, { useState, useMemo } from 'react';
import { Trash2, Search, Edit2, Check, X, Tag } from 'lucide-react';
import type { Expense, ExpenseCategory } from '@/types';
import { formatINR } from '@/utils/financeCalculations';
import { EXPENSE_CATEGORIES } from '@/constants';
import { Modal, Button } from '@/components/ui';

interface ExpenseListProps {
  expenses: Expense[];
  allExpenses?: Expense[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedFilterCat: string;
  setSelectedFilterCat: (cat: string) => void;
  onDeleteExpense: (id: string) => void;
  onEditExpense?: (id: string, updates: Partial<Expense>) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  allExpenses = expenses,
  searchQuery,
  setSearchQuery,
  selectedFilterCat,
  setSelectedFilterCat,
  onDeleteExpense,
  onEditExpense,
}) => {
  // Edit modal state
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmt, setEditAmt] = useState('');
  const [editCat, setEditCat] = useState<ExpenseCategory>('Food');
  const [editDay, setEditDay] = useState(1);
  const [editDescription, setEditDescription] = useState('');

  // Category breakdown calculation for "View total spending by category"
  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    allExpenses.forEach((exp) => {
      map[exp.cat] = (map[exp.cat] || 0) + (Number(exp.amt) || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [allExpenses]);

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setEditName(exp.name);
    setEditAmt(exp.amt.toString());
    setEditCat(exp.cat);
    setEditDay(exp.day);
    setEditDescription(exp.description || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !onEditExpense) return;
    const trimmed = editName.trim().slice(0, 60);
    const numAmt = Number(editAmt);
    if (!trimmed || !Number.isFinite(numAmt) || numAmt <= 0) return;

    onEditExpense(editingExpense.id, {
      name: trimmed,
      amt: Math.round(numAmt),
      cat: editCat,
      day: Math.min(30, Math.max(1, Number(editDay) || 1)),
      description: editDescription.trim().slice(0, 120) || undefined,
    });
    setEditingExpense(null);
  };

  return (
    <div className="space-y-4">
      {/* 1. Category Spending Summary Breakdown */}
      {categoryTotals.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#131715] border border-[#232b26]">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-white">
              Total Spending by Category
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {categoryTotals.map(([cat, total]) => (
              <div
                key={cat}
                onClick={() => setSelectedFilterCat(selectedFilterCat === cat ? 'All' : cat)}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                  selectedFilterCat === cat
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                    : 'bg-[#181f1b] border-[#232b26] hover:border-[#38473c] text-white'
                }`}
              >
                <div className="text-[11px] text-[#8e9c93] font-mono truncate">{cat}</div>
                <div className="text-sm font-bold font-mono mt-0.5">{formatINR(total)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Main Transaction Ledger Table */}
      <div className="p-5 rounded-2xl bg-[#131715] border border-[#232b26] space-y-4">
        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-[#232b26]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8e9c93] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Search expenses"
              placeholder="Search by name, category, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-xs placeholder:text-[#5a6860] focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {['All', ...EXPENSE_CATEGORIES].map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedFilterCat(category)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-400 ${
                  selectedFilterCat === category
                    ? 'bg-emerald-400 text-black font-semibold'
                    : 'bg-[#181f1b] text-[#8e9c93] hover:text-white border border-[#232b26]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Expenses List */}
        {expenses.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#8e9c93]">
            No matching expenses found. Add your first expense above!
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="p-3.5 rounded-xl bg-[#181f1b] border border-[#232b26] flex items-center justify-between gap-3 hover:border-[#334237] transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#101512] border border-[#232b26] text-[#8e9c93] shrink-0">
                    Day {expense.day}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{expense.name}</div>
                    <div className="text-[11px] text-[#8e9c93] font-mono flex items-center gap-2">
                      <span>{expense.cat}</span>
                      {expense.description && (
                        <span className="text-[#64746b] truncate">· {expense.description}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold font-mono text-white tabular-nums mr-1">
                    {formatINR(expense.amt)}
                  </span>
                  {onEditExpense && (
                    <button
                      type="button"
                      onClick={() => openEditModal(expense)}
                      className="p-1.5 text-[#8e9c93] hover:text-emerald-400 rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      aria-label={`Edit expense ${expense.name}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDeleteExpense(expense.id)}
                    className="p-1.5 text-[#8e9c93] hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus:ring-1 focus:ring-red-400"
                    aria-label={`Delete expense ${expense.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Expense Modal Dialog */}
      {editingExpense && (
        <Modal isOpen={true} onClose={() => setEditingExpense(null)} title="Edit Expense">
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label
                htmlFor="edit-exp-name"
                className="block text-xs font-mono uppercase text-[#8e9c93] mb-1"
              >
                Expense Name
              </label>
              <input
                type="text"
                id="edit-exp-name"
                maxLength={60}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="edit-exp-amt"
                  className="block text-xs font-mono uppercase text-[#8e9c93] mb-1"
                >
                  Amount (₹)
                </label>
                <input
                  type="number"
                  id="edit-exp-amt"
                  min="1"
                  max="100000"
                  value={editAmt}
                  onChange={(e) => setEditAmt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="edit-exp-day"
                  className="block text-xs font-mono uppercase text-[#8e9c93] mb-1"
                >
                  Day (1–30)
                </label>
                <input
                  type="number"
                  id="edit-exp-day"
                  min="1"
                  max="30"
                  value={editDay}
                  onChange={(e) => setEditDay(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="edit-exp-cat"
                className="block text-xs font-mono uppercase text-[#8e9c93] mb-1"
              >
                Category
              </label>
              <select
                id="edit-exp-cat"
                value={editCat}
                onChange={(e) => setEditCat(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {EXPENSE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="edit-exp-description"
                className="block text-xs font-mono uppercase text-[#8e9c93] mb-1"
              >
                Description / Notes
              </label>
              <input
                type="text"
                id="edit-exp-description"
                maxLength={120}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#232b26]">
              <Button type="button" variant="ghost" onClick={() => setEditingExpense(null)}>
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
              <Button type="submit" variant="primary">
                <Check className="w-4 h-4 mr-1" /> Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ExpenseList;
