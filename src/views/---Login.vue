<template>
    <div>
      <InputText v-model="username" placeholder="Username" />
      <InputText v-model="password" type="password" placeholder="Password" />
      <Button label="Login" @click="login" />
    </div>
  </template>
  
  <script>
  import { InputText } from 'primevue/inputtext';
  import { Button } from 'primevue/button';
  import { useAuthStore } from '../../store/modules/auth';
  
  export default {
    components: { InputText, Button },
    setup() {
      const authStore = useAuthStore();
      const username = ref('');
      const password = ref('');
  
      const login = async () => {
        await authStore.login(username.value, password.value);
        // Preusmeri na dashboard
      };
  
      return { username, password, login };
    },
  };
  </script>