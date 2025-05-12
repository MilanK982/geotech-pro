import { defineStore } from 'pinia';
import AuthService from '@/services/auth.service';
import { showErrorToast, showSuccessToast } from '@/utils/toast';

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
        showSuccessToast('Login successful');
      } catch (error) {
        this.error = error.message;
        showErrorToast(error, 'Login failed');
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
        showSuccessToast('Registration successful');
      } catch (error) {
        this.error = error.message;
        showErrorToast(error, 'Registration failed');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      AuthService.logout();
      this.user = null;
      showSuccessToast('Logout successful');
    }
  }
}); 