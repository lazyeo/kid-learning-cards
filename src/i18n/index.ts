import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import zh from './locales/zh.json';
import en from './locales/en.json';

// 检测浏览器语言
const getBrowserLanguage = (): string => {
  // 优先使用用户保存的语言设置
  const stored = localStorage.getItem('language');
  if (stored && (stored === 'zh' || stored === 'en')) {
    return stored;
  }

  // 检测浏览器语言
  const browserLang = navigator.language.toLowerCase();
  // zh-CN, zh-TW, zh-HK 等都映射为 zh
  if (browserLang.startsWith('zh')) {
    return 'zh';
  }
  // 其他语言使用英文
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      zh: { translation: zh },
      en: { translation: en }
    },
    lng: getBrowserLanguage(),
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
