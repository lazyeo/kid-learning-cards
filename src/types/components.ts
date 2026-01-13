import { type ReactNode } from 'react';

// 通用组件 Props
export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

// 按钮组件
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

// 卡片组件
export interface CardProps extends BaseProps {
  title?: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

// 导航项
export interface NavItem {
  label: string;
  path: string;
  icon?: ReactNode;
}
