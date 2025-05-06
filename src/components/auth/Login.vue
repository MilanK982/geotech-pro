<!-- src/components/auth/Login.vue -->
<template>
    <div class="login-container">
      <h2>Prijava</h2>
      <div class="mb-2">
        <label>Korisničko ime: </label>
        <InputText v-model="username" />
      </div>
      <div class="mb-2">
        <label>Lozinka: </label>
        <Password v-model="password" />
      </div>
      <Button label="Prijavi se" icon="pi pi-sign-in" @click="handleLogin" />
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import InputText from 'primevue/inputtext';
  import Password from 'primevue/password';
  import Button from 'primevue/button';
  import { login } from '../../services/api';
  
  const username = ref('');
  const password = ref('');
  const error = ref('');
  const router = useRouter();
  
  const handleLogin = async () => {
    try {
      const response = await login(username.value, password.value);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user_id', response.user_id);
      router.push('/geotechnical/1');
    } catch (err) {
      error.value = 'Neispravni podaci za prijavu';
    }
  };
  </script>
  
  <style scoped>
  .login-container {
    max-width: 400px;
    margin: 50px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  .mb-2 {
    margin-bottom: 1rem;
  }
  .error {
    color: red;
    margin-top: 1rem;
  }
  </style>