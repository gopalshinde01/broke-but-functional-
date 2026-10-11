import React, { type ReactNode } from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'emerald' | 'amber' | 'red' | 'neutral' | 'blue';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  ...props
}) => {
  const variants = {
    emerald: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    amber: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
    red: 'bg-red-950/60 text-red-300 border-red-800/60',
    neutral: 'bg-[#1b221e] text-[#a0aba4] border-[#2e3a33]',
    blue: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
  }[variant];

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${variants} ${sizes} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
