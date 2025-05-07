// src/main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import App from './App.vue';
import router from './router';
import i18n from './i18n';
import 'primeicons/primeicons.css';

// Importujte komponente koje koristite
import Button from 'primevue/button';
import Select from 'primevue/select';
import Tabs from 'primevue/tabs';
import TabPanel from 'primevue/tabpanel';
import TabPanels from 'primevue/tabpanels';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: 'system',
      cssLayer: false,
    },
  },
});

// Registrujte komponente globalno
app.component('Button', Button);
app.component('Select', Select);
app.component('Tabs', Tabs);
app.component('TabPanel', TabPanel);
app.component('TabPanels', TabPanels);

app.mount('#app');