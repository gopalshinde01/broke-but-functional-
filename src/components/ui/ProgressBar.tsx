import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  color?: 'emerald' | 'amber' | 'red' | 'blue';
  className?: string;
  heightClass?: string;
  showPercent?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label = 'Progress',
  color = 'emerald',
  className = '',
  heightClass = 'h-2',
  showPercent = false,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colors = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
  }[color];

  return (
    <div className={`w-full ${className}`}>
      {showPercent && (
        <div className="flex justify-between text-xs text-[#a0aba4] mb-1">
          <span>{label}</span>
          <span className="font-mono">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={max}
        className={`w-full bg-[#1e2521] rounded-full overflow-hidden ${heightClass}`}
      >
        <div
          className={`${colors} h-full rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
