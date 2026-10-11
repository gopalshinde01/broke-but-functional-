import React from 'react';
import type { ExpenseCategory } from '@/types';
import { Stethoscope, Wrench, Compass, Coffee } from 'lucide-react';

interface SimulatorInputsProps {
  simName: string;
  setSimName: (name: string) => void;
  simAmount: number;
  setSimAmount: (amount: number) => void;
  simCategory: ExpenseCategory;
  setSimCategory: (cat: ExpenseCategory) => void;
}

const PRESETS = [
  { name: 'Medical Emergency', amt: 1500, icon: Stethoscope, label: 'Medical ₹1,500' },
  { name: 'Laptop / Phone Repair', amt: 3000, icon: Wrench, label: 'Repair ₹3,000' },
  { name: 'Emergency Travel', amt: 800, icon: Compass, label: 'Travel ₹800' },
  { name: 'Weekend Outing', amt: 600, icon: Coffee, label: 'Outing ₹600' },
];

export const SimulatorInputs: React.FC<SimulatorInputsProps> = ({
  simName,
  setSimName,
  simAmount,
  setSimAmount,
  simCategory,
  setSimCategory,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        <div className="md:col-span-5">
          <label
            htmlFor="sim-name-input"
            className="block text-[11px] font-mono uppercase text-[#8e9c93] mb-1"
          >
            What do you want to buy?
          </label>
          <input
            type="text"
            id="sim-name-input"
            maxLength={60}
            placeholder="e.g. Noise cancelling headphones, Shoes, Swiggy party"
            value={simName}
            onChange={(e) => setSimName(e.target.value.slice(0, 60))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm placeholder:text-[#5a6860] focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors"
          />
        </div>

        <div className="md:col-span-4">
          <label
            htmlFor="sim-amount-input"
            className="block text-[11px] font-mono uppercase text-[#8e9c93] mb-1"
          >
            Purchase Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e9c93] text-sm font-mono">
              ₹
            </span>
            <input
              type="number"
              id="sim-amount-input"
              min="0"
              max="100000"
              step="50"
              placeholder="1500"
              value={simAmount || ''}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSimAmount(Number.isFinite(val) ? Math.max(0, Math.min(100000, val)) : 0);
              }}
              className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm font-mono placeholder:text-[#5a6860] focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors"
            />
          </div>
        </div>

        <div className="md:col-span-3">
          <label
            htmlFor="sim-category-select"
            className="block text-[11px] font-mono uppercase text-[#8e9c93] mb-1"
          >
            Category
          </label>
          <select
            id="sim-category-select"
            value={simCategory}
            onChange={(e) => setSimCategory(e.target.value as ExpenseCategory)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors"
          >
            <option value="Shopping">Shopping</option>
            <option value="Food">Food</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Travel">Travel</option>
            <option value="Bills">Bills</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Presets */}
      <div className="pt-3 border-t border-[#232b26] flex flex-wrap items-center gap-2">
        <span className="text-xs text-[#8e9c93] font-medium mr-1">Stress-test scenarios:</span>
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isSelected = simAmount === preset.amt && simName === preset.name;
          return (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                setSimName(preset.name);
                setSimAmount(preset.amt);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                isSelected
                  ? 'bg-amber-400 text-black font-semibold shadow-sm'
                  : 'bg-[#181f1b] hover:bg-[#202924] text-[#8e9c93] hover:text-white border border-[#26332a]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SimulatorInputs;
