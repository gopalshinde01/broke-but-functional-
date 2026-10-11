import React, { type ReactNode } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'danger' | 'warning' | 'emerald';
  id?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  id,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-[#121614] border border-[#232a26] text-[#f0f4f1]',
    elevated: 'bg-[#161c18] border border-[#2c3631] shadow-lg text-[#f0f4f1]',
    danger: 'bg-red-950/20 border border-red-900/40 text-red-100',
    warning: 'bg-amber-950/20 border border-amber-900/40 text-amber-100',
    emerald: 'bg-emerald-950/20 border border-emerald-900/40 text-emerald-100',
  }[variant];

  return (
    <div
      id={id}
      className={`rounded-2xl p-5 transition-all duration-200 ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
