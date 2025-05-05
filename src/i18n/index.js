import { createI18n } from 'vue-i18n';
import en from './en.json';
import sr from './sr.json';

const i18n = createI18n({
  locale: 'sr', // Default jezik
  fallbackLocale: 'en',
  messages: { en, sr },
});

export default i18n;