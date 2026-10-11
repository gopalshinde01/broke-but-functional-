import React, { useState, Suspense, lazy } from 'react';
import type { ActiveScreen } from '@/types';
import { FinanceProvider } from '@/context/FinanceContext';
import { useFinance } from '@/hooks/useFinance';
import { SidebarNav, DashboardHeader } from '@/components/layout';
import { BudgetCards, WhatIfSliderCard, FinancialHealth } from '@/components/dashboard';
import { ErrorBoundary, Skeleton, Toast } from '@/components/ui';

// Code-split heavy chart and feature screens using React.lazy for optimal chunking and initial load
const SpendingChart = lazy(() => import('@/components/dashboard/SpendingChart'));
const ExpenseTracker = lazy(() => import('@/components/transactions/ExpenseTracker'));
const WhatIfSimulator = lazy(() => import('@/components/simulator/WhatIfSimulator'));
const EmergencySimulator = lazy(() => import('@/components/emergency/EmergencySimulator'));
const SavingsGoals = lazy(() => import('@/components/savings/SavingsGoals'));
const SubscriptionManager = lazy(() => import('@/components/subscriptions/SubscriptionManager'));
const SmartInsights = lazy(() => import('@/components/insights/SmartInsights'));
const FinancialForecastScreen = lazy(() => import('@/components/forecast/FinancialForecastScreen'));
const FinancialHealthScreen = lazy(() => import('@/components/health/FinancialHealthScreen'));

function ScreenSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading content">
      <Skeleton height="140px" className="w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton height="260px" className="rounded-2xl" />
        <Skeleton height="260px" className="rounded-2xl" />
      </div>
    </div>
  );
}

export function AppContent() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('dashboard');
  const [showUndoToast, setShowUndoToast] = useState(false);

  const {
    state,
    currentCalc,
    simCalc,
    emergencyCalc,
    sliderCalc,
    chartSeries,
    simAmount,
    setSimAmount,
    simName,
    setSimName,
    simCategory,
    setSimCategory,
    clearSimulation,
    confirmSimulatedPurchase,
    emergencyAmount,
    setEmergencyAmount,
    emergencyName,
    setEmergencyName,
    emergencyCategory,
    setEmergencyCategory,
    clearEmergency,
    confirmEmergencyExpense,
    dashboardSliderExtra,
    setDashboardSliderExtra,
    addExpense,
    editExpense,
    deleteExpense,
    addIncome,
    deleteIncome,
    lastDeletedExpense,
    undoDeleteExpense,
    survivalStreak,
    addGoal,
    editGoal,
    deleteGoal,
    addSavings,
    toggleSubscription,
    addSubscription,
    deleteSubscription,
    updateSettings,
    loadDemoMonth,
    resetToBlank,
  } = useFinance();

  const hasActiveSim = simAmount > 0 || emergencyAmount > 0 || dashboardSliderExtra > 0;
  const effectiveSimAmount =
    simAmount > 0 ? simAmount : emergencyAmount > 0 ? emergencyAmount : dashboardSliderExtra;

  const handleDeleteWithUndo = (id: string) => {
    deleteExpense(id);
    setShowUndoToast(true);
  };

  const handleUndo = () => {
    undoDeleteExpense();
    setShowUndoToast(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0d0c] text-[#f0f4f1] flex flex-col lg:flex-row antialiased">
      {/* Sidebar on desktop / Tabs on mobile */}
      <SidebarNav
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        day={state.day}
        remaining={currentCalc.remaining}
        risk={currentCalc.risk}
      />

      {/* Main Content Area */}
      <main
        id="main-content"
        className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden focus:outline-none"
        tabIndex={-1}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <DashboardHeader
            state={state}
            calc={currentCalc}
            hasActiveSim={hasActiveSim}
            simAmount={effectiveSimAmount}
            survivalStreak={survivalStreak}
            onUpdateDay={(newDay) => updateSettings({ day: newDay })}
            onResetToBlank={resetToBlank}
            onLoadDemoMonth={loadDemoMonth}
          />

          {/* Screen 1: Dashboard */}
          {activeScreen === 'dashboard' && (
            <section aria-labelledby="dashboard-heading" className="space-y-6">
              <h2 id="dashboard-heading" className="sr-only">
                Financial Dashboard Overview
              </h2>

              <BudgetCards
                state={state}
                calc={currentCalc}
                onOpenSimulator={() => setActiveScreen('simulator')}
                onNavigateTab={(tab) => setActiveScreen(tab as ActiveScreen)}
              />

              <Suspense fallback={<Skeleton height="320px" className="w-full rounded-2xl" />}>
                <SpendingChart
                  series={chartSeries}
                  state={state}
                  hasActiveSim={hasActiveSim}
                  simAmount={effectiveSimAmount}
                />
              </Suspense>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-6">
                  <WhatIfSliderCard
                    sliderExtra={dashboardSliderExtra}
                    setSliderExtra={setDashboardSliderExtra}
                    baseCalc={currentCalc}
                    sliderCalc={sliderCalc}
                    onOpenFullSimulator={() => {
                      if (dashboardSliderExtra > 0) {
                        setSimAmount(dashboardSliderExtra);
                        setSimName('Quick Slider Test');
                      }
                      setActiveScreen('simulator');
                    }}
                  />
                </div>

                <div className="lg:col-span-6">
                  <FinancialHealth calc={currentCalc} />
                </div>
              </div>
            </section>
          )}

          {/* Screen 2: Transactions */}
          {activeScreen === 'transactions' && (
            <section aria-labelledby="transactions-heading">
              <h2 id="transactions-heading" className="sr-only">
                Transaction Ledger
              </h2>
              <Suspense fallback={<ScreenSkeleton />}>
                <ExpenseTracker
                  state={state}
                  onAddExpense={addExpense}
                  onEditExpense={editExpense}
                  onDeleteExpense={handleDeleteWithUndo}
                  onAddIncome={addIncome}
                  onDeleteIncome={deleteIncome}
                />
              </Suspense>
            </section>
          )}

          {/* Screen 3: Simulator */}
          {activeScreen === 'simulator' && (
            <section aria-labelledby="simulator-heading">
              <h2 id="simulator-heading" className="sr-only">
                Purchase Impact Simulator
              </h2>
              <Suspense fallback={<ScreenSkeleton />}>
                <WhatIfSimulator
                  state={state}
                  baseCalc={currentCalc}
                  simCalc={simCalc}
                  simAmount={simAmount}
                  setSimAmount={setSimAmount}
                  simName={simName}
                  setSimName={setSimName}
                  simCategory={simCategory}
                  setSimCategory={setSimCategory}
                  onConfirmPurchase={confirmSimulatedPurchase}
                  onClearSimulation={clearSimulation}
                />
              </Suspense>
            </section>
          )}

          {/* Screen 4: Emergency Shock Hub */}
          {activeScreen === 'emergency' && (
            <section aria-labelledby="emergency-heading">
              <h2 id="emergency-heading" className="sr-only">
                Emergency Shock Hub
              </h2>
              <Suspense fallback={<ScreenSkeleton />}>
                <EmergencySimulator
                  state={state}
                  baseCalc={currentCalc}
                  emergencyCalc={emergencyCalc}
                  emergencyAmount={emergencyAmount}
                  setEmergencyAmount={setEmergencyAmount}
                  emergencyName={emergencyName}
                  setEmergencyName={setEmergencyName}
                  emergencyCategory={emergencyCategory}
                  setEmergencyCategory={setEmergencyCategory}
                  onConfirmEmergency={confirmEmergencyExpense}
                  onClearEmergency={clearEmergency}
                />
              </Suspense>
            </section>
          )}

          {/* Screen 5: Savings Goals */}
          {activeScreen === 'savings' && (
            <section aria-labelledby="savings-heading">
              <h2 id="savings-heading" className="sr-only">
                Savings Goals
              </h2>
              <Suspense fallback={<ScreenSkeleton />}>
                <SavingsGoals
                  state={state}
                  calc={currentCalc}
                  onAddGoal={addGoal}
                  onEditGoal={editGoal}
                  onDeleteGoal={deleteGoal}
                  onAddSavings={addSavings}
                />
              </Suspense>
            </section>
          )}

          {/* Screen 6: Subscriptions */}
          {activeScreen === 'subscriptions' && (
            <section aria-labelledby="subscriptions-heading">
              <h2 id="subscriptions-heading" className="sr-only">
                Subscription Manager
              </h2>
              <Suspense fallback={<ScreenSkeleton />}>
                <SubscriptionManager
                  state={state}
                  onToggleSubscription={toggleSubscription}
                  onAddSubscription={addSubscription}
                  onDeleteSubscription={deleteSubscription}
                />
              </Suspense>
            </section>
          )}

          {/* Screen 7: Insights + Settings */}
          {activeScreen === 'insights' && (
            <section aria-labelledby="insights-heading">
              <h2 id="insights-heading" className="sr-only">
                Insights & Settings
              </h2>
              <Suspense fallback={<ScreenSkeleton />}>
                <SmartInsights
                  state={state}
                  calc={currentCalc}
                  onUpdateSettings={updateSettings}
                  onLoadDemoMonth={loadDemoMonth}
                  onResetToBlank={resetToBlank}
                />
              </Suspense>
            </section>
          )}

          {/* Screen 8: Financial Forecast */}
          {activeScreen === 'forecast' && (
            <section aria-labelledby="forecast-heading">
              <h2 id="forecast-heading" className="sr-only">
                30-Day Monthly Financial Forecast
              </h2>
              <Suspense fallback={<ScreenSkeleton />}>
                <FinancialForecastScreen
                  state={state}
                  calc={currentCalc}
                  chartSeries={chartSeries}
                />
              </Suspense>
            </section>
          )}

          {/* Screen 9: Financial Health */}
          {activeScreen === 'health' && (
            <section aria-labelledby="health-heading">
              <h2 id="health-heading" className="sr-only">
                Financial Health Diagnostic
              </h2>
              <Suspense fallback={<ScreenSkeleton />}>
                <FinancialHealthScreen
                  state={state}
                  calc={currentCalc}
                />
              </Suspense>
            </section>
          )}
        </div>
      </main>

      {/* Innovation: Deleted Expense Undo Toast */}
      {showUndoToast && lastDeletedExpense && (
        <Toast
          message={`Deleted "${lastDeletedExpense.name}".`}
          onUndo={handleUndo}
          onClose={() => setShowUndoToast(false)}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <FinanceProvider>
        <AppContent />
      </FinanceProvider>
    </ErrorBoundary>
  );
}

export default App;
