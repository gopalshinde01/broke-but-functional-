import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Search,
  Filter,
  IndianRupee,
  Utensils,
  Car,
  ShoppingBag,
  Film,
  FileText,
  PiggyBank,
  MoreHorizontal,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Expense, ExpenseCategory, FinanceState } from '../types/finance';
import { formatINR } from '../utils/financeCalculations';

interface ExpenseTrackerProps {
  state: FinanceState;
  onAddExpense: (expense: {
    name: string;
    amt: number;
    cat: ExpenseCategory;
    day: number;
  }) => boolean;
  onDeleteExpense: (id: string) => void;
}

const CATEGORIES: { label: ExpenseCategory; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { label: 'Food', icon: Utensils, color: 'text-fintech-emerald bg-fintech-emerald/10 border-fintech-emerald/30' },
  { label: 'Travel', icon: Car, color: 'text-sky-400 bg-sky-400/10 border-sky-400/30' },
  { label: 'Shopping', icon: ShoppingBag, color: 'text-pink-400 bg-pink-400/10 border-pink-400/30' },
  { label: 'Entertainment', icon: Film, color: 'text-fintech-violet bg-fintech-violet/10 border-fintech-violet/30' },
  { label: 'Bills', icon: FileText, color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  { label: 'Savings', icon: PiggyBank, color: 'text-fintech-lime bg-fintech-lime/10 border-fintech-lime/30' },
  { label: 'Other', icon: MoreHorizontal, color: 'text-gray-400 bg-gray-400/10 border-gray-400/30' },
];

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  state,
  onAddExpense,
  onDeleteExpense,
}) => {
  // Form state
  const [name, setName] = useState('');
  const [amt, setAmt] = useState('');
  const [cat, setCat] = useState<ExpenseCategory>('Food');
  const [day, setDay] = useState<number>(state.day || 1);
  const [errorMsg, setErrorMsg] = useState('');

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCat, setSelectedFilterCat] = useState<string>('All');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg('Please enter an expense name');
      return;
    }

    const numAmt = Number(amt);
    if (isNaN(numAmt) || numAmt <= 0) {
      setErrorMsg('Please enter a valid amount greater than ₹0');
      return;
    }

    const safeDay = Math.min(30, Math.max(1, Number(day) || state.day));

    const ok = onAddExpense({
      name: trimmed,
      amt: numAmt,
      cat,
      day: safeDay,
    });

    if (ok) {
      setName('');
      setAmt('');
      setErrorMsg('');
    }
  };

  // Sorted and filtered expenses
  const filteredExpenses = useMemo(() => {
    let list = [...(state.expenses || [])];

    // Filter by category
    if (selectedFilterCat !== 'All') {
      list = list.filter((exp) => exp.cat === selectedFilterCat);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (exp) =>
          exp.name.toLowerCase().includes(q) ||
          exp.cat.toLowerCase().includes(q)
      );
    }

    // Sort by day desc, then createdAt desc
    return list.sort((a, b) => {
      if (b.day !== a.day) {
        return b.day - a.day;
      }
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [state.expenses, selectedFilterCat, searchQuery]);

  const totalFilteredSum = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + (Number(item.amt) || 0), 0);
  }, [filteredExpenses]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Add Form */}
      <div className="p-5 rounded-2xl bg-dark-card border border-dark-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-fintech-lime/10 border border-fintech-lime/20 flex items-center justify-center text-fintech-lime">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Record Expense</h2>
            <p className="text-xs text-dark-muted">
              Add every single rupee spent to keep your 30-day forecast accurate
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-fintech-red/10 border border-fintech-red/30 flex items-center gap-2 text-xs text-fintech-red">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Name */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-mono uppercase text-dark-muted mb-1">
              Expense Name
            </label>
            <input
              type="text"
              id="expense-name-input"
              placeholder="e.g. Chai + Samosa, Metro ticket"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-input border border-dark-border text-white text-sm placeholder:text-dark-muted/50 focus:outline-none focus:border-fintech-lime transition-colors"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-dark-muted mb-1">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted text-sm">
                ₹
              </span>
              <input
                type="number"
                id="expense-amount-input"
                placeholder="250"
                min="1"
                step="1"
                value={amt}
                onChange={(e) => setAmt(e.target.value)}
                className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-dark-input border border-dark-border text-white text-sm placeholder:text-dark-muted/50 focus:outline-none focus:border-fintech-lime transition-colors font-mono"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-dark-muted mb-1">
              Category
            </label>
            <select
              id="expense-category-select"
              value={cat}
              onChange={(e) => setCat(e.target.value as ExpenseCategory)}
              className="w-full px-3 py-2.5 rounded-xl bg-dark-input border border-dark-border text-white text-sm focus:outline-none focus:border-fintech-lime transition-colors"
            >
              {CATEGORIES.map((c) => (
                <option key={c.label} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Day & Submit */}
          <div className="flex items-end gap-2">
            <div className="w-24">
              <label className="block text-[11px] font-mono uppercase text-dark-muted mb-1">
                Day
              </label>
              <input
                type="number"
                id="expense-day-input"
                min="1"
                max="30"
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full px-2.5 py-2.5 rounded-xl bg-dark-input border border-dark-border text-white text-sm text-center font-mono focus:outline-none focus:border-fintech-lime"
              />
            </div>

            <button
              type="submit"
              id="expense-submit-btn"
              className="flex-1 py-2.5 px-4 rounded-xl bg-fintech-lime hover:bg-[#d6ff66] text-black font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-1.5 shadow-glow-lime hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter and List Section */}
      <div className="p-5 rounded-2xl bg-dark-card border border-dark-border space-y-4">
        {/* Filters Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
            <input
              type="text"
              id="expense-search-input"
              placeholder="Search expenses by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-dark-input border border-dark-border text-white text-xs placeholder:text-dark-muted/50 focus:outline-none focus:border-dark-muted transition-colors"
            />
          </div>

          {/* Summary totals */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-dark-muted">
              Showing <span className="text-white font-mono">{filteredExpenses.length}</span> items
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-dark-border text-white font-mono font-semibold">
              Total: {formatINR(totalFilteredSum)}
            </span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedFilterCat('All')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedFilterCat === 'All'
                ? 'bg-fintech-lime text-black font-semibold'
                : 'bg-dark-input text-dark-muted hover:text-white border border-dark-borderSubtle'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((c) => {
            const isSelected = selectedFilterCat === c.label;
            return (
              <button
                key={c.label}
                onClick={() => setSelectedFilterCat(c.label)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-white text-black font-semibold'
                    : 'bg-dark-input text-dark-muted hover:text-white border border-dark-borderSubtle'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Transaction Table / List */}
        <div className="overflow-x-auto rounded-xl border border-dark-border">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-dark-border bg-[#0e1210] text-[11px] font-mono uppercase text-dark-muted">
                <th className="py-3 px-4">Day</th>
                <th className="py-3 px-4">Expense</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-borderSubtle">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => {
                  const catInfo =
                    CATEGORIES.find((c) => c.label === expense.cat) || CATEGORIES[0];
                  const Icon = catInfo.icon;

                  return (
                    <tr
                      key={expense.id}
                      className="hover:bg-dark-cardHover transition-colors group"
                    >
                      {/* Day */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-dark-muted">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 font-semibold text-white">
                          Day {expense.day}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{expense.name}</div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${catInfo.color}`}
                        >
                          <Icon className="w-3 h-3" />
                          {expense.cat}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-white text-sm tabular-nums whitespace-nowrap">
                        {formatINR(expense.amt)}
                      </td>

                      {/* Delete Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          id={`delete-expense-${expense.id}`}
                          onClick={() => onDeleteExpense(expense.id)}
                          className="p-1.5 text-dark-muted hover:text-fintech-red hover:bg-fintech-red/10 rounded-lg transition-colors"
                          title="Delete transaction"
                          aria-label={`Delete ${expense.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-dark-muted">
                    No transactions found matching your criteria.
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
