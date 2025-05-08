<!-- src/views/ForgotPasswordView.vue -->
<template>
  <div class="forgot-password-container">
    <Card class="forgot-password-card">
      <template #title>
        <h2>{{ $t('auth.forgotPasswordTitle') }}</h2>
      </template>
      <template #content>
        <form @submit.prevent="handleSubmit" class="p-fluid">
          <div class="field">
            <label for="email">{{ $t('common.email') }}</label>
            <InputText
              id="email"
              v-model="email"
              type="email"
              :class="{ 'p-invalid': submitted && !email }"
              required
            />
            <small class="p-error" v-if="submitted && !email">
              {{ $t('validation.emailRequired') }}
            </small>
            <small class="p-error" v-if="submitted && email && !isValidEmail">
              {{ $t('validation.emailInvalid') }}
            </small>
          </div>

          <Button
            type="submit"
            :label="$t('auth.resetPassword')"
            :loading="loading"
            class="p-button-primary"
          />
        </form>
      </template>
      <template #footer>
        <div class="flex justify-content-center">
          <router-link to="/login" class="p-button p-button-text">
            {{ $t('auth.backToLogin') }}
          </router-link>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const toast = useToast();
const email = ref('');
const submitted = ref(false);
const loading = ref(false);

const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.value);
});

const handleSubmit = async () => {
  submitted.value = true;

  if (email.value && isValidEmail.value) {
    loading.value = true;
    try {
      // TODO: Implement password reset logic
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Password reset instructions have been sent to your email',
        life: 3000
      });
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to process password reset request',
        life: 3000
      });
    } finally {
      loading.value = false;
    }
  }
};
</script>

<style scoped>
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--surface-ground);
  padding: 2rem;
}

.forgot-password-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.field {
  margin-bottom: 1.5rem;
}

:deep(.p-card) {
  background: var(--surface-card);
  border-radius: 8px;
}

:deep(.p-card-title) {
  text-align: center;
  margin-bottom: 2rem;
}

:deep(.p-card-content) {
  padding: 2rem;
}

:deep(.p-card-footer) {
  padding: 1rem 2rem;
  border-top: 1px solid var(--surface-border);
}
</style> 