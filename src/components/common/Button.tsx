import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  icon,
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-2xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const variants = {
    primary: 'bg-[var(--color-primary)] text-white shadow-lg hover:shadow-xl hover:bg-opacity-90',
    secondary: 'bg-[var(--color-secondary)] text-white shadow-lg hover:shadow-xl hover:bg-opacity-90',
    accent: 'bg-[var(--color-accent)] text-gray-800 shadow-lg hover:shadow-xl hover:bg-opacity-90',
    success: 'bg-[var(--color-success)] text-gray-800 shadow-lg hover:shadow-xl hover:bg-opacity-90',
    outline: 'border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-orange-50',
    ghost: 'text-gray-600 hover:bg-gray-100',
  };

  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
