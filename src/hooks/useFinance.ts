import { useFinanceContext } from '@/context/FinanceContext';
import { useSimulation } from './useSimulation';

/**
 * High-level facade hook combining financial ledger state, pure calculations,
 * and isolated simulation functionality.
 */
export function useFinance() {
  const financeContext = useFinanceContext();
  const simulation = useSimulation();

  return {
    ...financeContext,
    ...simulation,
    // chartSeries in simulation includes active simulation overlay line
    chartSeries: simulation.chartSeries,
  };
}

export default useFinance;
