import React from 'react';
import { Sliders, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import type { CalculationResult } from '@/types';
import { formatINR } from '@/utils/financeCalculations';

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
    <div className="p-5 rounded-2xl bg-[#131715] border border-[#232b26] hover:border-amber-800/40 transition-all duration-200">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              What If You Spend...
              {isSimActive && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/60">
                  +{formatINR(sliderExtra)} Live Test
                </span>
              )}
            </h3>
            <p className="text-xs text-[#8e9c93]">
              Slide to simulate an impulsive spend and see its immediate ripple effect
            </p>
          </div>
        </div>

        {isSimActive && (
          <button
            type="button"
            onClick={() => setSliderExtra(0)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#8e9c93] hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset slider</span>
          </button>
        )}
      </div>

      {/* Slider Control */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#8e9c93]">₹0</span>
          <span className="text-lg font-bold text-amber-400 tabular-nums">
            {formatINR(sliderExtra)}
          </span>
          <span className="text-[#8e9c93]">₹5,000</span>
        </div>

        <input
          type="range"
          min="0"
          max="5000"
          step="50"
          value={sliderExtra}
          onChange={(e) => setSliderExtra(Number(e.target.value))}
          className="w-full cursor-pointer accent-amber-400"
          aria-label="Simulation spending amount slider"
        />

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-[#8e9c93] mr-1">Quick tests:</span>
          {PRESET_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setSliderExtra(amt)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                sliderExtra === amt
                  ? 'bg-amber-400 text-black font-semibold'
                  : 'bg-[#181f1b] hover:bg-[#232d27] text-[#8e9c93] hover:text-white border border-[#26332a]'
              }`}
            >
              +{formatINR(amt)}
            </button>
          ))}
        </div>
      </div>

      {/* Live Before vs After Impact Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#0e1210] border border-[#232b26]">
        <div>
          <span className="text-[10px] uppercase font-mono text-[#8e9c93] block mb-1">
            Daily Allowance
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-[#8e9c93] line-through tabular-nums">
              {formatINR(baseCalc.displayDaily)}
            </span>
            <ArrowRight className="w-3 h-3 text-[#8e9c93] shrink-0" />
            <span
              className={`text-sm font-bold tabular-nums ${
                sliderCalc.daily < 0
                  ? 'text-red-400'
                  : sliderCalc.daily < baseCalc.daily
                    ? 'text-amber-400'
                    : 'text-white'
              }`}
            >
              {sliderCalc.daily < 0
                ? `-₹${Math.abs(Math.round(sliderCalc.daily))}`
                : formatINR(sliderCalc.displayDaily)}
            </span>
          </div>
          <span className="text-[10px] text-[#8e9c93] block mt-0.5">
            {sliderCalc.daily < baseCalc.daily
              ? `-${formatINR(baseCalc.displayDaily - sliderCalc.displayDaily)}/day`
              : 'Unchanged'}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-mono text-[#8e9c93] block mb-1">
            Projected End
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-[#8e9c93] line-through tabular-nums">
              {formatINR(baseCalc.projected)}
            </span>
            <ArrowRight className="w-3 h-3 text-[#8e9c93] shrink-0" />
            <span
              className={`text-sm font-bold tabular-nums ${
                sliderCalc.projected < 0 ? 'text-red-400' : 'text-purple-400'
              }`}
            >
              {formatINR(sliderCalc.projected)}
            </span>
          </div>
          <span className="text-[10px] text-[#8e9c93] block mt-0.5">
            {sliderCalc.projected < baseCalc.projected
              ? `-${formatINR(baseCalc.projected - sliderCalc.projected)} diff`
              : 'No impact'}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-mono text-[#8e9c93] block mb-1">
            Risk Badge
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-[#8e9c93] line-through">{baseCalc.risk}</span>
            <ArrowRight className="w-3 h-3 text-[#8e9c93] shrink-0" />
            <span
              className={`text-sm font-bold uppercase ${
                sliderCalc.risk === 'High'
                  ? 'text-red-400'
                  : sliderCalc.risk === 'Medium'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
              }`}
            >
              {sliderCalc.risk}
            </span>
          </div>
          <span className="text-[10px] text-[#8e9c93] block mt-0.5 truncate">
            {sliderCalc.risk === 'High' ? 'Deficit danger' : 'Acceptable'}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-mono text-[#8e9c93] block mb-1">
            Health Score
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-[#8e9c93] line-through tabular-nums">
              {baseCalc.healthScore}/100
            </span>
            <ArrowRight className="w-3 h-3 text-[#8e9c93] shrink-0" />
            <span
              className={`text-sm font-bold tabular-nums ${
                sliderCalc.healthScore < baseCalc.healthScore
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {sliderCalc.healthScore}/100
            </span>
          </div>
          <span className="text-[10px] text-[#8e9c93] block mt-0.5">
            {sliderCalc.healthScore < baseCalc.healthScore
              ? `-${baseCalc.healthScore - sliderCalc.healthScore} pts loss`
              : 'Stable'}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#232b26]">
        <div className="flex items-center gap-2 text-xs text-[#8e9c93]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Simulation is non-destructive. Actual budget is completely untouched.</span>
        </div>
        <button
          type="button"
          onClick={onOpenFullSimulator}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-800/40 text-xs font-semibold transition-all focus:outline-none focus:ring-1 focus:ring-amber-400"
        >
          <span>Open Full Purchase Simulator</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default WhatIfSliderCard;
