import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  isLoading,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0d0c] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary:
      'bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-sm focus:ring-emerald-400',
    secondary:
      'bg-[#1f2722] hover:bg-[#28322c] text-[#e0e8e3] border border-[#323e37] focus:ring-emerald-400',
    danger: 'bg-red-500 hover:bg-red-600 text-white font-medium focus:ring-red-400 shadow-sm',
    outline:
      'bg-transparent border border-[#37443c] hover:bg-[#1a211d] text-[#e0e8e3] focus:ring-emerald-400',
    ghost:
      'bg-transparent hover:bg-[#1a211d] text-[#a0aba4] hover:text-[#f0f4f1] focus:ring-emerald-400',
  }[variant];

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  }[size];

  return (
    <button
      className={`${base} ${variants} ${sizes} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
