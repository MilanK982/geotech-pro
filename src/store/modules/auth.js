import { defineStore } from 'pinia';
import { api } from '../../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
  }),
  actions: {
    async login(username, password) {
      const response = await api.post('/login', { username, password });
      this.user = response.data.user;
      this.token = response.data.token;
      localStorage.setItem('token', this.token);
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
    },
  },
});