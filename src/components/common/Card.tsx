import { type ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  title?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
  active?: boolean;
}

export function Card({
  title,
  footer,
  children,
  className,
  onClick,
  hoverable = false,
  padding = 'medium',
  active = false,
}: CardProps) {
  const paddingStyles = {
    none: 'p-0',
    small: 'p-3',
    medium: 'p-6',
    large: 'p-8',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white rounded-3xl border-2 transition-all duration-300 overflow-hidden',
        hoverable && 'hover:shadow-xl hover:-translate-y-1 cursor-pointer',
        active ? 'border-[var(--color-primary)] shadow-md ring-2 ring-[var(--color-primary)] ring-opacity-20' : 'border-transparent shadow-md',
        className
      )}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
          <h3 className="font-bold text-lg text-gray-800">{title}</h3>
        </div>
      )}

      <div className={paddingStyles[padding]}>
        {children}
      </div>

      {footer && (
        <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/50">
          {footer}
        </div>
      )}
    </div>
  );
}
