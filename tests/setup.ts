import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zh from '../src/i18n/locales/zh.json';
import en from '../src/i18n/locales/en.json';

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
  },
  lng: 'zh',
  fallbackLng: 'zh',
  interpolation: { escapeValue: false },
});

// 每个测试后清理
afterEach(() => {
  cleanup();
});
