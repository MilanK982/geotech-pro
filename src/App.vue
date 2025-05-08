<!-- src/App.vue -->
<template>
  <Toast />
  <div class="app">
    <header class="app-header">
      <div class="header-content">
        <h1>{{ $t('common.appName') }}</h1>
        <LanguageSwitcher />
      </div>
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import LanguageSwitcher from './components/common/LanguageSwitcher.vue';
import Toast from 'primevue/toast';
</script>

<style>
:root {
  --surface-ground: #f8f9fa;
  --surface-section: #ffffff;
  --surface-card: #ffffff;
  --surface-overlay: #ffffff;
  --surface-border: #dee2e6;
  --surface-hover: #f8f9fa;
  --focus-ring: #90caf9;
  --primary-color: #2196f3;
  --primary-color-text: #ffffff;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}

body {
  font-family: var(--font-family);
  margin: 0;
  padding: 0;
  background-color: var(--surface-ground);
  color: var(--text-color);
}

.p-component {
  font-family: var(--font-family);
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: var(--surface-card);
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
</style>
