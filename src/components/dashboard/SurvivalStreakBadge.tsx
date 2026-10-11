import React from 'react';
import { Flame, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui';

interface SurvivalStreakBadgeProps {
  streak: number;
  className?: string;
}

export const SurvivalStreakBadge: React.FC<SurvivalStreakBadgeProps> = ({
  streak,
  className = '',
}) => {
  if (streak <= 0) return null;

  return (
    <Badge
      variant="amber"
      className={`px-3 py-1 text-xs font-semibold tracking-wide flex items-center gap-1.5 ${className}`}
      title={`${streak} consecutive days with daily expenses under target allowance`}
    >
      <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
      <span>{streak} Day Survival Streak</span>
      <ShieldCheck className="w-3 h-3 text-emerald-400 ml-0.5" />
    </Badge>
  );
};

export default SurvivalStreakBadge;
