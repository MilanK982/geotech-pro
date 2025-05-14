import { defineStore } from 'pinia';
import AuthService from '@/services/auth.service';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')),
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user
  },

  actions: {
    async login(username, password) {
      this.loading = true;
      this.error = null;
      try {
        const userData = await AuthService.login(username, password);
        this.user = userData;
        return userData;
      } catch (error) {
        this.error = error.message || 'Login failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async register(email, password, fullName) {
      this.loading = true;
      this.error = null;
      try {
        const userData = await AuthService.register(email, password, fullName);
        this.user = userData;
        return userData;
      } catch (error) {
        this.error = error.message || 'Registration failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      AuthService.logout();
      this.user = null;
    }
  }
});