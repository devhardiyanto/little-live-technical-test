import { defineStore } from 'pinia';
import type { User, LoginCredentials, AuthState } from '@/types/auth';
import { AuthService } from '@/services/auth.service';
import { toast } from 'sonner';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
  },

  actions: {
    async login(credentials: LoginCredentials) {
      try {
        const response = await AuthService.login(credentials);
        this.user = response.user;
        this.token = response.token;
        this.isAuthenticated = true;
        toast.success('Login successful!');
        return true;
      } catch (error: any) {
        toast.error(error.message || 'Login failed');
        return false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      toast.success('Logged out successfully');
    },

    setUser(user: User, token: string) {
      this.user = user;
      this.token = token;
      this.isAuthenticated = true;
    },
  },

  persist: {
    key: 'auth',
    pick: ['user', 'token', 'isAuthenticated'],
  },
});
