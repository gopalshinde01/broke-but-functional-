import React, { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import type { ExpenseCategory } from '@/types';
import { Button } from '@/components/ui';

interface ExpenseFormProps {
  currentDay: number;
  onAddExpense: (expense: {
    name: string;
    amt: number;
    cat: ExpenseCategory;
    day: number;
    description?: string;
    date?: string;
  }) => boolean;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ currentDay, onAddExpense }) => {
  const [name, setName] = useState('');
  const [amt, setAmt] = useState('');
  const [cat, setCat] = useState<ExpenseCategory>('Food');
  const [day, setDay] = useState<number>(currentDay || 1);
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmed = name.trim().slice(0, 60);
    if (!trimmed) {
      setErrorMsg('Please enter an expense name');
      return;
    }

    const numAmt = Number(amt);
    if (!Number.isFinite(numAmt) || numAmt <= 0) {
      setErrorMsg('Please enter a valid amount greater than ₹0');
      return;
    }

    const safeDay = Math.min(30, Math.max(1, Number(day) || currentDay || 1));
    const ok = onAddExpense({
      name: trimmed,
      amt: Math.round(numAmt),
      cat,
      day: safeDay,
      description: description.trim().slice(0, 120) || undefined,
      date: `Day ${safeDay}`,
    });

    if (ok) {
      setName('');
      setAmt('');
      setDescription('');
      setErrorMsg('');
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-[#131715] border border-[#232b26]">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Plus className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Record Expense</h2>
          <p className="text-xs text-[#8e9c93]">
            Add every single rupee spent to keep your 30-day forecast accurate
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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-4">
          <label
            htmlFor="expense-name"
            className="block text-[11px] font-mono uppercase text-[#8e9c93] mb-1"
          >
            Expense Name
          </label>
          <input
            type="text"
            id="expense-name"
            maxLength={60}
            placeholder="e.g. Swiggy lunch, Bus ticket, Chai"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div className="sm:col-span-3">
          <label
            htmlFor="expense-amount"
            className="block text-[11px] font-mono uppercase text-[#8e9c93] mb-1"
          >
            Amount (₹)
          </label>
          <input
            type="number"
            id="expense-amount"
            min="1"
            max="100000"
            step="1"
            placeholder="150"
            value={amt}
            onChange={(e) => setAmt(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div className="sm:col-span-3">
          <label
            htmlFor="expense-category"
            className="block text-[11px] font-mono uppercase text-[#8e9c93] mb-1"
          >
            Category
          </label>
          <select
            id="expense-category"
            value={cat}
            onChange={(e) => setCat(e.target.value as ExpenseCategory)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Shopping">Shopping</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Bills">Bills</option>
            <option value="Education">Education</option>
            <option value="Health">Health</option>
            <option value="Subscriptions">Subscriptions</option>
            <option value="Emergency">Emergency</option>
            <option value="Savings">Savings</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="expense-day"
            className="block text-[11px] font-mono uppercase text-[#8e9c93] mb-1"
          >
            Day (1–30)
          </label>
          <input
            type="number"
            id="expense-day"
            min="1"
            max="30"
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div className="sm:col-span-9">
          <label
            htmlFor="expense-description"
            className="block text-[11px] font-mono uppercase text-[#8e9c93] mb-1"
          >
            Description / Notes (Optional)
          </label>
          <input
            type="text"
            id="expense-description"
            maxLength={120}
            placeholder="e.g. Shared with roommates, Urgent college book, Semester exam fee"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div className="sm:col-span-3 flex items-end">
          <Button
            variant="primary"
            type="submit"
            id="add-expense-btn"
            className="w-full h-[42px] text-xs font-semibold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Expense
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
