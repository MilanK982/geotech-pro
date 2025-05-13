<template>
  <div class="login-form">
    <Card class="login-card">
      <template #title>
        {{ $t('auth.loginTitle') }}
      </template>
      <template #content>
        <form @submit.prevent="handleSubmit" class="p-fluid">
          <div class="field">
            <label for="username">{{ $t('common.username') }}</label>
            <InputText
              id="username"
              v-model="username"
              :class="{ 'p-invalid': submitted && !username }"
              required
            />
            <small class="p-error" v-if="submitted && !username">
              {{ $t('validation.usernameRequired') }}
            </small>
          </div>

          <div class="field">
            <label for="password">{{ $t('common.password') }}</label>
            <Password
              id="password"
              v-model="password"
              :feedback="false"
              toggleMask
              :class="{ 'p-invalid': submitted && !password }"
              required
            />
            <small class="p-error" v-if="submitted && !password">
              {{ $t('validation.passwordRequired') }}
            </small>
          </div>

          <div class="field-checkbox">
            <Checkbox id="remember" v-model="rememberMe" :binary="true" />
            <label for="remember">{{ $t('auth.rememberMe') }}</label>
          </div>

          <Button
            type="submit"
            :label="$t('common.login')"
            :loading="loading"
            class="p-button-primary"
          />
        </form>
      </template>
      <template #footer>
        <div class="flex justify-content-between">
          <router-link to="/register" class="p-button p-button-text">
            {{ $t('auth.noAccount') }}
          </router-link>
          <router-link to="/forgot-password" class="p-button p-button-text">
            {{ $t('auth.forgotPassword') }}
          </router-link>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from 'primevue/usetoast';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const submitted = ref(false);
const loading = ref(false);

const handleSubmit = async () => {
  submitted.value = true;
  if (username.value && password.value) {
    loading.value = true;
    try {
      await authStore.login(username.value, password.value);
      showSuccessToast(toast, 'Login successful');
      router.push('/dashboard');
    } catch (error) {
      showErrorToast(toast, error, 'Login failed');
    } finally {
      loading.value = false;
    }
  }
};
</script>

<style scoped>
.login-form {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--surface-ground);
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.field {
  margin-bottom: 1.5rem;
}

.field-checkbox {
  margin-bottom: 1.5rem;
}

:deep(.p-card) {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style> 