import { useState, useMemo, useCallback } from 'react';
import type {
  ExpenseCategory,
  CalculationResult,
  BalancePoint,
  ScenarioItem,
  ScenarioComparison,
} from '@/types';
import { useFinanceContext } from '@/context/FinanceContext';
import { calc, balanceSeries } from '@/utils/financeCalculations';

export function useSimulation() {
  const { state, addExpense } = useFinanceContext();

  // Primary simulator state (isolated from real ledger)
  const [simAmount, setSimAmount] = useState<number>(0);
  const [simName, setSimName] = useState<string>('');
  const [simCategory, setSimCategory] = useState<ExpenseCategory>('Shopping');

  // Emergency shock hub simulator state
  const [emergencyAmount, setEmergencyAmount] = useState<number>(0);
  const [emergencyName, setEmergencyName] = useState<string>('Medical Emergency');
  const [emergencyCategory, setEmergencyCategory] = useState<ExpenseCategory>('Bills');

  // Quick slider on dashboard
  const [dashboardSliderExtra, setDashboardSliderExtra] = useState<number>(0);

  // Innovation: Scenario compare list (up to 3 items)
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([
    { id: 'scen-1', name: 'Weekend Trip', amount: 1200, category: 'Travel' },
    { id: 'scen-2', name: 'Smart Watch', amount: 2200, category: 'Shopping' },
    { id: 'scen-3', name: 'Concert Ticket', amount: 800, category: 'Entertainment' },
  ]);

  // Derived pure calculations for simulations
  const simCalc = useMemo<CalculationResult>(() => {
    return calc(state, simAmount);
  }, [state, simAmount]);

  const emergencyCalc = useMemo<CalculationResult>(() => {
    return calc(state, emergencyAmount);
  }, [state, emergencyAmount]);

  const sliderCalc = useMemo<CalculationResult>(() => {
    return calc(state, dashboardSliderExtra);
  }, [state, dashboardSliderExtra]);

  // Dynamic series showing dashed simulated line if any simulation is active
  const chartSeries = useMemo<BalancePoint[]>(() => {
    const effectiveSimExtra =
      simAmount > 0 ? simAmount : emergencyAmount > 0 ? emergencyAmount : dashboardSliderExtra;
    return balanceSeries(state, effectiveSimExtra);
  }, [state, simAmount, emergencyAmount, dashboardSliderExtra]);

  // Comparisons for scenario compare modal
  const scenarioComparisons = useMemo<ScenarioComparison[]>(() => {
    return scenarios.map((scenario) => ({
      scenario,
      calc: calc(state, scenario.amount),
    }));
  }, [state, scenarios]);

  const addScenario = useCallback((scenario: Omit<ScenarioItem, 'id'>) => {
    setScenarios((prev) => {
      if (prev.length >= 3) return prev;
      return [
        ...prev,
        {
          ...scenario,
          id: `scen-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        },
      ];
    });
  }, []);

  const removeScenario = useCallback((id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Confirm simulated purchase into real transactions
  const confirmSimulatedPurchase = useCallback(() => {
    if (simAmount <= 0) return false;
    const name = simName.trim() || 'Simulated Purchase';
    const success = addExpense({
      name,
      amt: simAmount,
      cat: simCategory,
      day: state.day,
    });

    if (success) {
      setSimAmount(0);
      setSimName('');
    }
    return success;
  }, [simAmount, simName, simCategory, state.day, addExpense]);

  // Confirm emergency into real transactions
  const confirmEmergencyExpense = useCallback(() => {
    if (emergencyAmount <= 0) return false;
    const name = emergencyName.trim() || 'Emergency Expense';
    const success = addExpense({
      name: `[EMERGENCY] ${name}`,
      amt: emergencyAmount,
      cat: emergencyCategory,
      day: state.day,
    });

    if (success) {
      setEmergencyAmount(0);
    }
    return success;
  }, [emergencyAmount, emergencyName, emergencyCategory, state.day, addExpense]);

  const clearSimulation = useCallback(() => {
    setSimAmount(0);
    setSimName('');
  }, []);

  const clearEmergency = useCallback(() => {
    setEmergencyAmount(0);
  }, []);

  return {
    simAmount,
    setSimAmount,
    simName,
    setSimName,
    simCategory,
    setSimCategory,
    emergencyAmount,
    setEmergencyAmount,
    emergencyName,
    setEmergencyName,
    emergencyCategory,
    setEmergencyCategory,
    dashboardSliderExtra,
    setDashboardSliderExtra,
    simCalc,
    emergencyCalc,
    sliderCalc,
    chartSeries,
    scenarios,
    scenarioComparisons,
    addScenario,
    removeScenario,
    clearSimulation,
    confirmSimulatedPurchase,
    clearEmergency,
    confirmEmergencyExpense,
  };
}
