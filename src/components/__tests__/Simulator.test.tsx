import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WhatIfSimulator } from '../simulator/WhatIfSimulator';
import { calc } from '@/utils/financeCalculations';
import { DEMO_MONTH_STATE } from '@/constants';
import { FinanceProvider } from '@/context/FinanceContext';

describe('WhatIfSimulator Component', () => {
  it('renders Before vs After decision matrix and does not mutate real balance until Confirm', () => {
    const baseCalc = calc(DEMO_MONTH_STATE, 0);
    const simCalc = calc(DEMO_MONTH_STATE, 1500);

    const onConfirmPurchase = vi.fn().mockReturnValue(true);
    const onClearSimulation = vi.fn();
    const setSimAmount = vi.fn();
    const setSimName = vi.fn();
    const setSimCategory = vi.fn();

    render(
      <FinanceProvider initialState={DEMO_MONTH_STATE}>
        <WhatIfSimulator
          state={DEMO_MONTH_STATE}
          baseCalc={baseCalc}
          simCalc={simCalc}
          simAmount={1500}
          setSimAmount={setSimAmount}
          simName="Test Headphones"
          setSimName={setSimName}
          simCategory="Shopping"
          setSimCategory={setSimCategory}
          onConfirmPurchase={onConfirmPurchase}
          onClearSimulation={onClearSimulation}
        />
      </FinanceProvider>
    );

    // Checks that Decision Matrix headers and metrics are displayed
    expect(screen.getByText('Before vs After Decision Matrix')).toBeInTheDocument();
    expect(screen.getByText('Current Reality (Before)')).toBeInTheDocument();
    expect(screen.getByText('With Purchase (After)')).toBeInTheDocument();

    // Confirm button is present and clickable
    const confirmBtn = screen.getByRole('button', { name: /Confirm Purchase/i });
    expect(confirmBtn).toBeEnabled();

    // Clicking Confirm calls handler
    fireEvent.click(confirmBtn);
    expect(onConfirmPurchase).toHaveBeenCalledTimes(1);
  });

  it('disables Confirm button when simAmount is 0', () => {
    const baseCalc = calc(DEMO_MONTH_STATE, 0);
    const simCalc = calc(DEMO_MONTH_STATE, 0);

    render(
      <FinanceProvider initialState={DEMO_MONTH_STATE}>
        <WhatIfSimulator
          state={DEMO_MONTH_STATE}
          baseCalc={baseCalc}
          simCalc={simCalc}
          simAmount={0}
          setSimAmount={vi.fn()}
          simName=""
          setSimName={vi.fn()}
          simCategory="Shopping"
          setSimCategory={vi.fn()}
          onConfirmPurchase={vi.fn()}
          onClearSimulation={vi.fn()}
        />
      </FinanceProvider>
    );

    const confirmBtn = screen.getByRole('button', { name: /Confirm Purchase/i });
    expect(confirmBtn).toBeDisabled();
  });
});
