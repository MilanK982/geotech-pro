// src/main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura'; // Ispravljeno sa @primeuix na @primevue
import App from './App.vue';
import router from './router';
import i18n from './i18n';
import 'primeicons/primeicons.css'; // Ikonice su i dalje potrebne

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: 'system', // Ili '.my-dark' za custom dark mode
      cssLayer: false,
    },
  },
});
app.mount('#app');