import { apiClient } from './client';
import type { LoginRequest, LoginResponse, CambiarPasswordRequest } from '../types';

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/api/Auth/login', data).then((r) => r.data),

  cambiarPassword: (data: CambiarPasswordRequest) =>
    apiClient.post('/api/Auth/cambiar-password', data).then((r) => r.data),
};
