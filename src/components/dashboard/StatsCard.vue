<template>
  <Card class="stats-card">
    <template #header>
      <div class="flex align-items-center justify-content-between">
        <h3 class="m-0">{{ title }}</h3>
        <i :class="icon" class="text-xl"></i>
      </div>
    </template>
    <template #content>
      <div class="text-center">
        <span class="text-4xl font-bold">{{ value }}</span>
        <p class="text-sm text-500 mt-2">{{ description }}</p>
      </div>
    </template>
  </Card>
</template>

<script setup>
import Card from 'primevue/card';

defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
.stats-card {
  height: 100%;
}

:deep(.p-card) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

:deep(.p-card:hover) {
  transform: translateY(-2px);
}
</style> 