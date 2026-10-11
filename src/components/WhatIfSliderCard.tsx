import React from 'react';
import {
  Sliders,
  ArrowRight,
  TrendingDown,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  HeartPulse
} from 'lucide-react';
import { CalculationResult } from '../types/finance';
import { formatINR } from '../utils/financeCalculations';

interface WhatIfSliderCardProps {
  sliderExtra: number;
  setSliderExtra: (val: number) => void;
  baseCalc: CalculationResult;
  sliderCalc: CalculationResult;
  onOpenFullSimulator: () => void;
}

const PRESET_AMOUNTS = [300, 750, 1500, 2500];

export const WhatIfSliderCard: React.FC<WhatIfSliderCardProps> = ({
  sliderExtra,
  setSliderExtra,
  baseCalc,
  sliderCalc,
  onOpenFullSimulator,
}) => {
  const isSimActive = sliderExtra > 0;

  return (
    <div className="p-5 rounded-2xl bg-dark-card border border-dark-border hover:border-fintech-amber/30 transition-all duration-200">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-fintech-amber/15 border border-fintech-amber/30 flex items-center justify-center text-fintech-amber">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              What If You Spend...
              {isSimActive && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-fintech-amber/20 text-fintech-amber border border-fintech-amber/40">
                  +{formatINR(sliderExtra)} Live Test
                </span>
              )}
            </h3>
            <p className="text-xs text-dark-muted">
              Slide to simulate an impulsive spend and see its immediate ripple effect
            </p>
          </div>
        </div>

        {isSimActive && (
          <button
            onClick={() => setSliderExtra(0)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-dark-muted hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset slider</span>
          </button>
        )}
      </div>

      {/* Slider Control */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-dark-muted font-mono">₹0</span>
          <span className="text-lg font-bold font-mono text-fintech-amber tabular-nums">
            {formatINR(sliderExtra)}
          </span>
          <span className="text-dark-muted font-mono">₹5,000</span>
        </div>

        <input
          type="range"
          min="0"
          max="5000"
          step="50"
          value={sliderExtra}
          onChange={(e) => setSliderExtra(Number(e.target.value))}
          className="w-full cursor-pointer"
          aria-label="Simulation spending amount slider"
        />

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-dark-muted mr-1">Quick tests:</span>
          {PRESET_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => setSliderExtra(amt)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                sliderExtra === amt
                  ? 'bg-fintech-amber text-black font-semibold'
                  : 'bg-dark-input hover:bg-[#252f2a] text-dark-muted hover:text-white border border-dark-borderSubtle'
              }`}
            >
              +{formatINR(amt)}
            </button>
          ))}
        </div>
      </div>

      {/* Live Before vs After Impact Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#0e1210] border border-dark-borderSubtle">
        {/* 1. Daily Allowance */}
        <div>
          <span className="text-[10px] uppercase font-mono text-dark-muted block mb-1">
            Daily Allowance
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-dark-muted line-through tabular-nums">
              {formatINR(baseCalc.displayDaily)}
            </span>
            <ArrowRight className="w-3 h-3 text-dark-muted shrink-0" />
            <span
              className={`text-sm font-bold tabular-nums ${
                sliderCalc.daily < 0
                  ? 'text-fintech-red'
                  : sliderCalc.daily < baseCalc.daily
                  ? 'text-fintech-amber'
                  : 'text-white'
              }`}
            >
              {sliderCalc.daily < 0
                ? `-₹${Math.abs(Math.round(sliderCalc.daily))}`
                : formatINR(sliderCalc.displayDaily)}
            </span>
          </div>
          <span className="text-[10px] text-dark-muted block mt-0.5">
            {sliderCalc.daily < baseCalc.daily
              ? `-${formatINR(baseCalc.displayDaily - sliderCalc.displayDaily)}/day`
              : 'Unchanged'}
          </span>
        </div>

        {/* 2. Projected Day 30 Balance */}
        <div>
          <span className="text-[10px] uppercase font-mono text-dark-muted block mb-1">
            Projected End
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-dark-muted line-through tabular-nums">
              {formatINR(baseCalc.projected)}
            </span>
            <ArrowRight className="w-3 h-3 text-dark-muted shrink-0" />
            <span
              className={`text-sm font-bold tabular-nums ${
                sliderCalc.projected < 0 ? 'text-fintech-red' : 'text-fintech-violet'
              }`}
            >
              {formatINR(sliderCalc.projected)}
            </span>
          </div>
          <span className="text-[10px] text-dark-muted block mt-0.5">
            {sliderCalc.projected < baseCalc.projected
              ? `-${formatINR(baseCalc.projected - sliderCalc.projected)} diff`
              : 'No impact'}
          </span>
        </div>

        {/* 3. Risk Level */}
        <div>
          <span className="text-[10px] uppercase font-mono text-dark-muted block mb-1">
            Risk Badge
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-dark-muted line-through">{baseCalc.risk}</span>
            <ArrowRight className="w-3 h-3 text-dark-muted shrink-0" />
            <span
              className={`text-sm font-bold uppercase ${
                sliderCalc.risk === 'High'
                  ? 'text-fintech-red'
                  : sliderCalc.risk === 'Medium'
                  ? 'text-fintech-amber'
                  : 'text-fintech-emerald'
              }`}
            >
              {sliderCalc.risk}
            </span>
          </div>
          <span className="text-[10px] text-dark-muted block mt-0.5 truncate">
            {sliderCalc.risk === 'High' ? 'Deficit danger' : 'Acceptable'}
          </span>
        </div>

        {/* 4. Health Score */}
        <div>
          <span className="text-[10px] uppercase font-mono text-dark-muted block mb-1">
            Health Score
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-dark-muted line-through tabular-nums">
              {baseCalc.healthScore}/100
            </span>
            <ArrowRight className="w-3 h-3 text-dark-muted shrink-0" />
            <span
              className={`text-sm font-bold tabular-nums ${
                sliderCalc.healthScore < baseCalc.healthScore
                  ? 'text-fintech-amber'
                  : 'text-fintech-lime'
              }`}
            >
              {sliderCalc.healthScore}/100
            </span>
          </div>
          <span className="text-[10px] text-dark-muted block mt-0.5">
            {sliderCalc.healthScore < baseCalc.healthScore
              ? `-${baseCalc.healthScore - sliderCalc.healthScore} pts loss`
              : 'Stable'}
          </span>
        </div>
      </div>

      {/* Bottom CTA to Full Simulator */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-dark-borderSubtle">
        <div className="flex items-center gap-2 text-xs text-dark-muted">
          <Sparkles className="w-3.5 h-3.5 text-fintech-amber" />
          <span>Simulation is non-destructive. Actual budget is completely untouched.</span>
        </div>
        <button
          onClick={onOpenFullSimulator}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-fintech-amber/15 hover:bg-fintech-amber/25 text-fintech-amber border border-fintech-amber/30 text-xs font-semibold transition-all hover:scale-[1.02]"
        >
          <span>Open Full Purchase Simulator</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
