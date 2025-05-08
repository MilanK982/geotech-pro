import { createI18n } from 'vue-i18n';
import en from './en.json';
import sr from './sr.json';

const i18n = createI18n({
  legacy: false, // Enable Composition API mode
  locale: localStorage.getItem('preferredLanguage') || 'sr', // Default jezik
  fallbackLocale: 'en',
  messages: { en, sr },
  globalInjection: true // Enable global injection of $t
});

export default i18n;