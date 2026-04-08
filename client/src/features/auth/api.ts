import apiCaller from '@/lib/apiCaller';
import type { LoginCredentials, LoginResponse, RefreshResponse } from './types/types';

export const authApi = {
  loginUser: (credentials: LoginCredentials) => apiCaller.post<LoginResponse>('/auth/login/', credentials),
  getMe: () => apiCaller.get('/auth/me/'),
  logoutUser: () => apiCaller.post('/auth/logout/'),
  refreshToken: () => apiCaller.post<RefreshResponse>('/auth/token/refresh/'),
};
