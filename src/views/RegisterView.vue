<template>
  <div class="register-view">
    <RegisterForm />
  </div>
</template>

<script setup>
import RegisterForm from '@/components/auth/RegisterForm.vue';
</script>

<style scoped>
.register-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--surface-ground);
}
</style> 