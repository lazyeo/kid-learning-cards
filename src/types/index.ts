export * from './generator';
export * from './components';

// 全局应用类型
export interface AppConfig {
  name: string;
  version: string;
  apiBaseUrl: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';
