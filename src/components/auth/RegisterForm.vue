<template>
  <div class="register-form">
    <Card class="register-card">
      <template #title>
        {{ $t('auth.registerTitle') }}
      </template>
      <template #content>
        <form @submit.prevent="handleSubmit" class="p-fluid">
          <div class="field">
            <label for="fullName">{{ $t('common.fullName') }}</label>
            <InputText
              id="fullName"
              v-model="fullName"
              :class="{ 'p-invalid': submitted && !fullName }"
              required
            />
            <small class="p-error" v-if="submitted && !fullName">
              {{ $t('validation.fullNameRequired') }}
            </small>
          </div>

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
            <small class="p-error" v-if="submitted && !isValidEmail">
              {{ $t('validation.emailInvalid') }}
            </small>
          </div>

          <div class="field">
            <label for="password">{{ $t('common.password') }}</label>
            <Password
              id="password"
              v-model="password"
              :class="{ 'p-invalid': submitted && !password }"
              required
              toggleMask
              :feedback="true"
            />
            <small class="p-error" v-if="submitted && !password">
              {{ $t('validation.passwordRequired') }}
            </small>
            <small class="p-error" v-if="submitted && !isValidPassword">
              {{ $t('validation.passwordMinLength') }}
            </small>
          </div>

          <div class="field">
            <label for="confirmPassword">{{ $t('common.confirmPassword') }}</label>
            <Password
              id="confirmPassword"
              v-model="confirmPassword"
              :class="{ 'p-invalid': submitted && !confirmPassword }"
              required
              toggleMask
              :feedback="false"
            />
            <small class="p-error" v-if="submitted && !confirmPassword">
              {{ $t('validation.confirmPasswordRequired') }}
            </small>
            <small class="p-error" v-if="submitted && !passwordsMatch">
              {{ $t('validation.passwordsDoNotMatch') }}
            </small>
          </div>

          <Button
            type="submit"
            :label="$t('common.register')"
            :loading="loading"
            class="p-button-primary"
          />
        </form>
      </template>
      <template #footer>
        <div class="flex justify-content-center">
          <router-link to="/login" class="p-button p-button-text">
            {{ $t('auth.hasAccount') }}
          </router-link>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const fullName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const submitted = ref(false);
const loading = ref(false);

const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.value);
});

const isValidPassword = computed(() => {
  return password.value.length >= 6;
});

const passwordsMatch = computed(() => {
  return password.value === confirmPassword.value;
});

const handleSubmit = async () => {
  submitted.value = true;

  if (
    fullName.value &&
    email.value &&
    isValidEmail.value &&
    password.value &&
    isValidPassword.value &&
    confirmPassword.value &&
    passwordsMatch.value
  ) {
    loading.value = true;
    try {
      await authStore.register(email.value, password.value, fullName.value);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Registration successful',
        life: 3000
      });
      router.push('/login');
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Registration failed',
        life: 3000
      });
    } finally {
      loading.value = false;
    }
  }
};
</script>

<style scoped>
.register-form {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--surface-ground);
}

.register-card {
  width: 100%;
  max-width: 400px;
}

.field {
  margin-bottom: 1.5rem;
}

:deep(.p-card) {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style> 