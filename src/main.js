// src/main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Aura from '@primevue/themes/aura';
import App from './App.vue';
import router from './router';
import i18n from './i18n';

// PrimeVue styles
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

// PrimeVue components
import Button from 'primevue/button';
import Select from 'primevue/select';
import Tabs from 'primevue/tabs';
import TabPanel from 'primevue/tabpanel';
import TabPanels from 'primevue/tabpanels';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';

const app = createApp(App);

// Setup plugins
app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(PrimeVue, { 
  ripple: true,
  inputStyle: 'filled',
  theme: Aura,
  unstyled: false
});
app.use(ToastService);

// Register global components
app.component('Button', Button);
app.component('Select', Select);
app.component('Tabs', Tabs);
app.component('TabPanel', TabPanel);
app.component('TabPanels', TabPanels);
app.component('Card', Card);
app.component('InputText', InputText);
app.component('Password', Password);
app.component('Checkbox', Checkbox);

app.mount('#app');