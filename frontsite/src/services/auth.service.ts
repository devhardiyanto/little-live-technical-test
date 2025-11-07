import client from '@/lib/client';
import type { LoginCredentials, LoginResponse } from '@/types/auth';
import type { ApiResponse } from '@/types/api';

// Dummy user for testing
const DUMMY_USER = {
  email: 'admin@test.com',
  password: 'admin123',
  user: {
    id: '1',
    email: 'admin@test.com',
    name: 'Admin User'
  },
  token: 'dummy-jwt-token-12345'
};

export const AuthService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check dummy credentials
    if (credentials.email === DUMMY_USER.email && credentials.password === DUMMY_USER.password) {
      return {
        user: DUMMY_USER.user,
        token: DUMMY_USER.token
      };
    }

    // If credentials don't match, throw error
    throw new Error('Invalid email or password');

    // Original API call (commented out for dummy implementation)
    // const { data } = await client.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    // return data.responseObject;
  },
};
