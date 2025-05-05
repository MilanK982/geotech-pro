<template>
    <Dropdown
      v-model="selectedLanguage"
      :options="languages"
      optionLabel="label"
      optionValue="value"
      @change="changeLanguage"
    />
  </template>
  
  <script>
  import { Dropdown } from 'primevue/dropdown';
  import { useI18n } from 'vue-i18n';
  
  export default {
    components: { Dropdown },
    setup() {
      const { locale } = useI18n();
      const languages = [
        { label: 'Srpski', value: 'sr' },
        { label: 'English', value: 'en' },
      ];
      const selectedLanguage = ref(locale.value);
  
      const changeLanguage = () => {
        locale.value = selectedLanguage.value;
        // Opcionalno: Sačuvaj izbor jezika u localStorage ili na backend
      };
  
      return { languages, selectedLanguage, changeLanguage };
    },
  };
  </script>