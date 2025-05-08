<template>
  <div class="language-switcher">
    <Button
      v-for="lang in availableLanguages"
      :key="lang.code"
      :class="{ active: currentLocale === lang.code }"
      @click="changeLanguage(lang.code)"
      :text="true"
      :severity="currentLocale === lang.code ? 'primary' : 'secondary'"
    >
      {{ lang.name }}
    </Button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';

const { locale } = useI18n();

const availableLanguages = [
  { code: 'sr', name: 'Српски' },
  { code: 'en', name: 'English' }
];

const currentLocale = computed(() => locale.value);

const changeLanguage = (lang) => {
  locale.value = lang;
  localStorage.setItem('preferredLanguage', lang);
};
</script>

<style scoped>
.language-switcher {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.language-switcher button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
}
</style> 