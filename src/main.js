// src/main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import Aura from '@primeuix/themes/aura';
import App from './App.vue';
import router from './router';
import i18n from './i18n';
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
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';

const app = createApp(App);

// Setup plugins
app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(PrimeVue, { 
  ripple: true,
  inputStyle: 'filled',
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: 'system',
      cssLayer: false
    }
  },
  unstyled: false
});
app.use(ConfirmationService);
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
app.component('ConfirmDialog', ConfirmDialog);
app.component('Toast', Toast);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Tag', Tag);
app.component('Dialog', Dialog);

app.mount('#app');

console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);