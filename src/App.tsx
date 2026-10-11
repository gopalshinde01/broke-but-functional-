import React, { useState } from 'react';
import { useFinance } from './hooks/useFinance';
import { ActiveScreen } from './types/finance';
import { SidebarNav } from './components/SidebarNav';
import { DashboardHeader } from './components/DashboardHeader';
import { BudgetCards } from './components/BudgetCards';
import { SpendingChart } from './components/SpendingChart';
import { WhatIfSliderCard } from './components/WhatIfSliderCard';
import { FinancialHealth } from './components/FinancialHealth';
import { ExpenseTracker } from './components/ExpenseTracker';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { EmergencySimulator } from './components/EmergencySimulator';
import { SavingsGoals } from './components/SavingsGoals';
import { SubscriptionManager } from './components/SubscriptionManager';
import { SmartInsights } from './components/SmartInsights';

export function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('dashboard');

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
    deleteExpense,
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

  // Active simulation from simulator, emergency, or quick slider
  const hasActiveSim = simAmount > 0 || emergencyAmount > 0 || dashboardSliderExtra > 0;
  const effectiveSimAmount =
    simAmount > 0 ? simAmount : emergencyAmount > 0 ? emergencyAmount : dashboardSliderExtra;

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
      <main className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <DashboardHeader
            state={state}
            calc={currentCalc}
            hasActiveSim={hasActiveSim}
            simAmount={effectiveSimAmount}
            onUpdateDay={(newDay) => updateSettings({ day: newDay })}
            onResetToBlank={resetToBlank}
            onLoadDemoMonth={loadDemoMonth}
          />

          {/* Screen 1: Dashboard */}
          {activeScreen === 'dashboard' && (
            <div className="space-y-6">
              {/* Primary Metric Cards */}
              <BudgetCards
                state={state}
                calc={currentCalc}
                onOpenSimulator={() => setActiveScreen('simulator')}
              />

              {/* Trajectory & Category Charts */}
              <SpendingChart
                series={chartSeries}
                state={state}
                hasActiveSim={hasActiveSim}
                simAmount={effectiveSimAmount}
              />

              {/* What-If Live Slider & Financial Health Matrix */}
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
            </div>
          )}

          {/* Screen 2: Transactions */}
          {activeScreen === 'transactions' && (
            <ExpenseTracker
              state={state}
              onAddExpense={addExpense}
              onDeleteExpense={deleteExpense}
            />
          )}

          {/* Screen 3: Simulator (Main Attraction) */}
          {activeScreen === 'simulator' && (
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
          )}

          {/* Screen 4: Emergency Shock Hub */}
          {activeScreen === 'emergency' && (
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
          )}

          {/* Screen 5: Savings Goals (Multiple) */}
          {activeScreen === 'savings' && (
            <SavingsGoals
              state={state}
              calc={currentCalc}
              onAddGoal={addGoal}
              onEditGoal={editGoal}
              onDeleteGoal={deleteGoal}
              onAddSavings={addSavings}
            />
          )}

          {/* Screen 6: Subscriptions */}
          {activeScreen === 'subscriptions' && (
            <SubscriptionManager
              state={state}
              onToggleSubscription={toggleSubscription}
              onAddSubscription={addSubscription}
              onDeleteSubscription={deleteSubscription}
            />
          )}

          {/* Screen 7: Insights + Settings */}
          {activeScreen === 'insights' && (
            <SmartInsights
              state={state}
              calc={currentCalc}
              onUpdateSettings={updateSettings}
              onLoadDemoMonth={loadDemoMonth}
              onResetToBlank={resetToBlank}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
