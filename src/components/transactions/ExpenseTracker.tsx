import React, { useState, useMemo } from 'react';
import type { ExpenseCategory, FinanceState } from '@/types';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseList } from './ExpenseList';

export interface ExpenseTrackerProps {
  state: FinanceState;
  onAddExpense: (expense: {
    name: string;
    amt: number;
    cat: ExpenseCategory;
    day: number;
  }) => boolean;
  onDeleteExpense: (id: string) => void;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  state,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCat, setSelectedFilterCat] = useState<string>('All');

  const filteredExpenses = useMemo(() => {
    let list = [...(state.expenses || [])];

    if (selectedFilterCat !== 'All') {
      list = list.filter((exp) => exp.cat === selectedFilterCat);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (exp) => exp.name.toLowerCase().includes(q) || exp.cat.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => {
      if (b.day !== a.day) {
        return b.day - a.day;
      }
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [state.expenses, selectedFilterCat, searchQuery]);

  return (
    <div className="space-y-6">
      <ExpenseForm currentDay={state.day} onAddExpense={onAddExpense} />
      <ExpenseList
        expenses={filteredExpenses}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedFilterCat={selectedFilterCat}
        setSelectedFilterCat={setSelectedFilterCat}
        onDeleteExpense={onDeleteExpense}
      />
    </div>
  );
};

export default ExpenseTracker;
