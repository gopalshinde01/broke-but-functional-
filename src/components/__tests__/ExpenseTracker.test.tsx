import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpenseTracker } from '../transactions/ExpenseTracker';
import { DEMO_MONTH_STATE } from '@/constants';

describe('ExpenseTracker Component', () => {
  it('rejects submission with empty name', () => {
    const onAddExpense = vi.fn();
    const onDeleteExpense = vi.fn();

    render(
      <ExpenseTracker
        state={DEMO_MONTH_STATE}
        onAddExpense={onAddExpense}
        onDeleteExpense={onDeleteExpense}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Add Expense/i });
    fireEvent.click(submitBtn);

    expect(onAddExpense).not.toHaveBeenCalled();
    expect(screen.getByText(/Please enter an expense name/i)).toBeInTheDocument();
  });

  it('rejects submission with negative amount', () => {
    const onAddExpense = vi.fn();
    const onDeleteExpense = vi.fn();

    render(
      <ExpenseTracker
        state={DEMO_MONTH_STATE}
        onAddExpense={onAddExpense}
        onDeleteExpense={onDeleteExpense}
      />
    );

    const nameInput = screen.getByLabelText(/Expense Name/i);
    const amountInput = screen.getByLabelText(/Amount/i);

    fireEvent.change(nameInput, { target: { value: 'Coffee' } });
    fireEvent.change(amountInput, { target: { value: '-50' } });
    fireEvent.submit(nameInput.closest('form')!);

    expect(onAddExpense).not.toHaveBeenCalled();
    expect(screen.getByText(/Please enter a valid amount greater than ₹0/i)).toBeInTheDocument();
  });

  it('submits successfully with valid data', () => {
    const onAddExpense = vi.fn().mockReturnValue(true);
    const onDeleteExpense = vi.fn();

    render(
      <ExpenseTracker
        state={DEMO_MONTH_STATE}
        onAddExpense={onAddExpense}
        onDeleteExpense={onDeleteExpense}
      />
    );

    const nameInput = screen.getByLabelText(/Expense Name/i);
    const amountInput = screen.getByLabelText(/Amount/i);
    const submitBtn = screen.getByRole('button', { name: /Add Expense/i });

    fireEvent.change(nameInput, { target: { value: 'Books' } });
    fireEvent.change(amountInput, { target: { value: '450' } });
    fireEvent.click(submitBtn);

    expect(onAddExpense).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Books',
        amt: 450,
        cat: 'Food',
      })
    );
  });

  it('triggers delete button', () => {
    const onDeleteExpense = vi.fn();

    render(
      <ExpenseTracker
        state={DEMO_MONTH_STATE}
        onAddExpense={vi.fn()}
        onDeleteExpense={onDeleteExpense}
      />
    );

    const deleteButtons = screen.getAllByLabelText(/Delete expense/i);
    expect(deleteButtons.length).toBeGreaterThan(0);

    fireEvent.click(deleteButtons[0]!);
    expect(onDeleteExpense).toHaveBeenCalledTimes(1);
  });
});
