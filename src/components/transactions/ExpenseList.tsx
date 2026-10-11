import React from 'react';
import { Trash2, Search } from 'lucide-react';
import type { Expense } from '@/types';
import { formatINR } from '@/utils/financeCalculations';

interface ExpenseListProps {
  expenses: Expense[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedFilterCat: string;
  setSelectedFilterCat: (cat: string) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  searchQuery,
  setSearchQuery,
  selectedFilterCat,
  setSelectedFilterCat,
  onDeleteExpense,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-[#131715] border border-[#232b26] space-y-4">
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-[#232b26]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8e9c93] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-xs placeholder:text-[#5a6860] focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['All', 'Food', 'Travel', 'Shopping', 'Entertainment', 'Bills', 'Savings', 'Other'].map(
            (category) => (
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
            )
          )}
        </div>
      </div>

      {/* Expenses Table/List */}
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
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#101512] border border-[#232b26] text-[#8e9c93]">
                  Day {expense.day}
                </span>
                <div>
                  <div className="text-sm font-semibold text-white">{expense.name}</div>
                  <div className="text-[11px] text-[#8e9c93] font-mono">{expense.cat}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold font-mono text-white tabular-nums">
                  {formatINR(expense.amt)}
                </span>
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
  );
};

export default ExpenseList;
